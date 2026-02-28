import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UploadIntentDto, GetPhotosQueryDto, GetStoryQueryDto } from './dto';
import { randomBytes } from 'crypto';
import { Queue } from 'bullmq';
import { PHOTO_QUEUE } from '../queue/queue.module';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  private publicBaseUrl: string;

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    @Inject(PHOTO_QUEUE) private photoQueue: Queue,
    private config: ConfigService,
  ) {
    this.publicBaseUrl = this.config.get('R2_PUBLIC_BASE_URL') || '';
  }

  async createUploadIntent(dto: UploadIntentDto) {
    // 1. Find event by code
    const event = await this.prisma.event.findUnique({
      where: { code: dto.eventCode },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 2. Check rate limits if configured
    if (event.maxUploadsTotal) {
      const totalPhotos = await this.prisma.photo.count({
        where: { eventId: event.id },
      });
      if (totalPhotos >= event.maxUploadsTotal) {
        throw new BadRequestException('Event upload limit reached');
      }
    }

    if (event.maxUploadsPerGuest && dto.uploaderHash) {
      const guestPhotos = await this.prisma.photo.count({
        where: {
          eventId: event.id,
          uploaderHash: dto.uploaderHash,
        },
      });
      if (guestPhotos >= event.maxUploadsPerGuest) {
        throw new BadRequestException('Guest upload limit reached');
      }
    }

    // 3. Create photo record
    const photoId = randomBytes(16).toString('hex');
    const mediaType = dto.mediaType || 'IMAGE';
    
    // Determine file extension
    let ext: string;
    if (mediaType === 'VIDEO') {
      ext = 'mp4';
    } else {
      ext = dto.contentType === 'image/png' ? 'png' : 'jpg';
    }
    
    const storageKey = `events/${event.id}/originals/${photoId}.${ext}`;

    const photo = await this.prisma.photo.create({
      data: {
        id: photoId,
        eventId: event.id,
        status: 'PENDING_UPLOAD',
        mediaType,
        mimeType: dto.contentType,
        caption: dto.caption,
        uploaderHash: dto.uploaderHash,
        originalKey: storageKey,
        approved: !event.approvalRequired,
      },
    });

    // 4. Generate pre-signed upload URL
    const { uploadUrl } = await this.storage.signUploadPut({
      key: storageKey,
      contentType: dto.contentType,
      expiresInSeconds: 300,
    });

    return {
      photoId: photo.id,
      uploadUrl,
    };
  }

  async completeUpload(photoId: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Update status to UPLOADED
    await this.prisma.photo.update({
      where: { id: photoId },
      data: { status: 'UPLOADED' },
    });

    // Queue photo processing job
    await this.photoQueue.add(
      'PROCESS_PHOTO',
      { photoId: photo.id },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    );

    return { success: true, photoId };
  }

  async getEventPhotos(eventCode: string, query: GetPhotosQueryDto) {
    const event = await this.prisma.event.findUnique({
      where: { code: eventCode },
      select: { id: true, approvalRequired: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const { page, limit, cursor, status, approved, mediaType } = query;

    const where: any = { eventId: event.id };
    
    // If approval required, only show approved photos to guests
    if (event.approvalRequired && approved === undefined) {
      where.approved = true;
    } else if (approved !== undefined) {
      where.approved = approved;
    }
    
    if (status) where.status = status;
    if (mediaType) where.mediaType = mediaType;

    // Cursor-based pagination (if cursor provided)
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
      
      const photos = await this.prisma.photo.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          caption: true,
          status: true,
          approved: true,
          mediaType: true,
          mimeType: true,
          width: true,
          height: true,
          largeKey: true,
          thumbKey: true,
          playbackKey: true,
          posterKey: true,
          durationSec: true,
          createdAt: true,
        },
      });

      const nextCursor = photos.length === limit 
        ? photos[photos.length - 1].createdAt.toISOString() 
        : null;

      return {
        data: photos.map((p) => this.mapPhotoToResponse(p)),
        nextCursor,
      };
    }

    // Offset-based pagination (default)
    const skip = (page - 1) * limit;

    const [photos, total] = await Promise.all([
      this.prisma.photo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          caption: true,
          status: true,
          approved: true,
          mediaType: true,
          mimeType: true,
          width: true,
          height: true,
          largeKey: true,
          thumbKey: true,
          playbackKey: true,
          posterKey: true,
          durationSec: true,
          createdAt: true,
        },
      }),
      this.prisma.photo.count({ where }),
    ]);

    return {
      data: photos.map((p) => this.mapPhotoToResponse(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private mapPhotoToResponse(photo: any) {
    const base = {
      id: photo.id,
      caption: photo.caption,
      status: photo.status,
      approved: photo.approved,
      mediaType: photo.mediaType,
      mimeType: photo.mimeType,
      width: photo.width,
      height: photo.height,
      createdAt: photo.createdAt,
    };

    if (photo.mediaType === 'VIDEO') {
      return {
        ...base,
        playbackUrl: photo.playbackKey ? this.storage.publicUrl(photo.playbackKey) : null,
        posterUrl: photo.posterKey ? this.storage.publicUrl(photo.posterKey) : null,
        durationSec: photo.durationSec,
      };
    }

    // IMAGE
    return {
      ...base,
      largeUrl: photo.largeKey ? this.storage.publicUrl(photo.largeKey) : null,
      thumbUrl: photo.thumbKey ? this.storage.publicUrl(photo.thumbKey) : null,
    };
  }

  async getPhoto(photoId: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      select: {
        id: true,
        caption: true,
        status: true,
        approved: true,
        width: true,
        height: true,
        largeKey: true,
        thumbKey: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    return {
      ...photo,
      largeUrl: photo.largeKey ? this.storage.publicUrl(photo.largeKey) : null,
      thumbUrl: photo.thumbKey ? this.storage.publicUrl(photo.thumbKey) : null,
    };
  }

  async approvePhoto(photoId: string, approved: boolean) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: { event: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (!photo.event.approvalRequired) {
      throw new BadRequestException('Event does not require approval');
    }

    await this.prisma.photo.update({
      where: { id: photoId },
      data: { approved },
    });

    return { success: true, photoId, approved };
  }

  async getEventStory(eventCode: string, query: GetStoryQueryDto) {
    const event = await this.prisma.event.findUnique({
      where: { code: eventCode },
      select: { id: true, approvalRequired: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const { limit, cursor } = query;

    const where: any = {
      eventId: event.id,
      status: 'PROCESSED',
    };

    // Only show approved media for guests
    if (event.approvalRequired) {
      where.approved = true;
    }

    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const media = await this.prisma.photo.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        caption: true,
        mediaType: true,
        mimeType: true,
        width: true,
        height: true,
        largeKey: true,
        thumbKey: true,
        playbackKey: true,
        posterKey: true,
        durationSec: true,
        createdAt: true,
      },
    });

    const nextCursor =
      media.length === limit ? media[media.length - 1].createdAt.toISOString() : null;

    return {
      data: media.map((m) => this.mapPhotoToResponse(m)),
      nextCursor,
    };
  }
}

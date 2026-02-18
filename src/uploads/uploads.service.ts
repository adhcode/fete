import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UploadIntentDto } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

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
    const storageKey = `events/${event.id}/originals/${photoId}`;

    const photo = await this.prisma.photo.create({
      data: {
        id: photoId,
        eventId: event.id,
        status: 'PENDING_UPLOAD',
        caption: dto.caption,
        uploaderHash: dto.uploaderHash,
        originalKey: storageKey,
        approved: !event.approvalRequired, // auto-approve if not required
      },
    });

    // 4. Generate pre-signed upload URL
    const { uploadUrl } = await this.storage.signUploadPut({
      key: storageKey,
      contentType: dto.contentType,
      expiresInSeconds: 300, // 5 minutes
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

    // TODO: Queue photo processing job here
    // await this.photoQueue.add('process', { photoId });

    return { success: true, photoId };
  }
}

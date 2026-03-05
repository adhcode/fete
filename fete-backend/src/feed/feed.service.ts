import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { GetFeedQueryDto } from './dto';

@Injectable()
export class FeedService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getEventFeed(
    eventCode: string,
    query: GetFeedQueryDto,
    guestId?: string,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { code: eventCode },
      select: { id: true, approvalRequired: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const { sort, cursor, limit } = query;

    const where: any = {
      eventId: event.id,
      status: 'PROCESSED',
    };

    // Only show approved media if event requires approval
    if (event.approvalRequired) {
      where.approved = true;
    }

    // Cursor-based pagination
    if (cursor) {
      try {
        const [createdAt, id] = cursor.split('_');
        where.OR = [
          { createdAt: { lt: new Date(createdAt) } },
          {
            createdAt: new Date(createdAt),
            id: { lt: id },
          },
        ];
      } catch (err) {
        // Invalid cursor, ignore
      }
    }

    // Determine sort order
    const orderBy: any[] =
      sort === 'trending'
        ? [{ likeCount: 'desc' }, { createdAt: 'desc' }]
        : [{ createdAt: 'desc' }];

    const photos = await this.prisma.photo.findMany({
      where,
      take: limit,
      orderBy,
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
        likeCount: true,
        createdAt: true,
      },
    });

    // Compute likedByMe for each photo
    let likedPhotoIds: Set<string> = new Set();
    if (guestId && photos.length > 0) {
      const likes = await this.prisma.like.findMany({
        where: {
          guestId,
          photoId: { in: photos.map((p) => p.id) },
        },
        select: { photoId: true },
      });
      likedPhotoIds = new Set(likes.map((l) => l.photoId));
    }

    const items = photos.map((photo) => {
      const base = {
        id: photo.id,
        caption: photo.caption,
        mediaType: photo.mediaType,
        mimeType: photo.mimeType,
        width: photo.width,
        height: photo.height,
        likeCount: photo.likeCount,
        likedByMe: likedPhotoIds.has(photo.id),
        createdAt: photo.createdAt,
      };

      if (photo.mediaType === 'VIDEO') {
        return {
          ...base,
          playUrl: photo.playbackKey
            ? this.storage.publicUrl(photo.playbackKey)
            : null,
          posterUrl: photo.posterKey
            ? this.storage.publicUrl(photo.posterKey)
            : null,
          durationSec: photo.durationSec,
        };
      }

      // IMAGE
      return {
        ...base,
        largeUrl: photo.largeKey
          ? this.storage.publicUrl(photo.largeKey)
          : null,
        thumbUrl: photo.thumbKey
          ? this.storage.publicUrl(photo.thumbKey)
          : null,
      };
    });

    // Generate next cursor
    const nextCursor =
      photos.length === limit
        ? `${photos[photos.length - 1].createdAt.toISOString()}_${photos[photos.length - 1].id}`
        : null;

    return {
      items,
      nextCursor,
    };
  }
}

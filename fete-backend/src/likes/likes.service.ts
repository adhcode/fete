import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async likePhoto(photoId: string, guestId: string) {
    if (!guestId) {
      throw new BadRequestException('Guest ID is required');
    }

    // Check if photo exists
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      select: { id: true, likeCount: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Try to create like (idempotent - will fail silently if exists)
      const like = await tx.like.upsert({
        where: {
          photoId_guestId: {
            photoId,
            guestId,
          },
        },
        create: {
          photoId,
          guestId,
        },
        update: {},
      });

      // Check if this is a new like
      const isNewLike = like.createdAt.getTime() > Date.now() - 1000;

      // Increment like count only if it's a new like
      if (isNewLike) {
        const updatedPhoto = await tx.photo.update({
          where: { id: photoId },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true },
        });
        return { likeCount: updatedPhoto.likeCount, likedByMe: true };
      }

      return { likeCount: photo.likeCount, likedByMe: true };
    });

    return result;
  }

  async unlikePhoto(photoId: string, guestId: string) {
    if (!guestId) {
      throw new BadRequestException('Guest ID is required');
    }

    // Check if photo exists
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      select: { id: true, likeCount: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Try to delete like
      const deleted = await tx.like.deleteMany({
        where: {
          photoId,
          guestId,
        },
      });

      // Decrement like count only if a like was actually deleted
      if (deleted.count > 0) {
        const updatedPhoto = await tx.photo.update({
          where: { id: photoId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
          select: { likeCount: true },
        });

        // Ensure likeCount never goes negative
        if (updatedPhoto.likeCount < 0) {
          await tx.photo.update({
            where: { id: photoId },
            data: { likeCount: 0 },
          });
          return { likeCount: 0, likedByMe: false };
        }

        return { likeCount: updatedPhoto.likeCount, likedByMe: false };
      }

      return { likeCount: photo.likeCount, likedByMe: false };
    });

    return result;
  }
}

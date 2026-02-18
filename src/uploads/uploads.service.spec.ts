import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PHOTO_QUEUE_TOKEN } from '../queue/queue.module';
import { Queue } from 'bullmq';
import { PhotoStatus } from '@prisma/client';

@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    @Inject(PHOTO_QUEUE_TOKEN) private photoQueue: Queue,
  ) { }

  async createUploadIntent(input: {
    eventCode: string;
    contentType: string;
    caption?: string;
    uploaderHash?: string;
  }) {
    const event = await this.prisma.event.findUnique({
      where: { code: input.eventCode },
    });

    if (!event) throw new NotFoundException('Event not found');

    // Basic content-type check
    if (!input.contentType.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are allowed');
    }

    // Create photo record first
    const photo = await this.prisma.photo.create({
      data: {
        eventId: event.id,
        status: PhotoStatus.PENDING_UPLOAD,
        approved: event.approvalRequired ? false : true,
        caption: input.caption,
        uploaderHash: input.uploaderHash,
      },
    });

    const ext = input.contentType === 'image/png' ? 'png' : 'jpg';
    const originalKey = `events/${event.id}/original/${photo.id}.${ext}`;

    // Store originalKey now so worker knows where to find it
    await this.prisma.photo.update({
      where: { id: photo.id },
      data: { originalKey },
    });

    const signed = await this.storage.signUploadPut({
      key: originalKey,
      contentType: input.contentType,
      expiresInSeconds: 90,
    });

    return {
      photoId: photo.id,
      uploadUrl: signed.uploadUrl,
      originalKey,
    };
  }

  async completeUpload(photoId: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: { event: true },
    });

    if (!photo) throw new NotFoundException('Photo not found');

    // Mark uploaded
    await this.prisma.photo.update({
      where: { id: photoId },
      data: { status: PhotoStatus.UPLOADED },
    });

    // Enqueue processing job
    await this.photoQueue.add(
      'PROCESS_PHOTO',
      { photoId },
      { attempts: 3, backoff: { type: 'exponential', delay: 3000 } },
    );

    return { ok: true };
  }
}

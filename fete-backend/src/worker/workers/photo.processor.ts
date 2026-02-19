import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import * as sharp from 'sharp';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { PHOTO_QUEUE_NAME, REDIS_CONN } from '../../queue/queue.module';
import { PhotoStatus } from '@prisma/client';

@Injectable()
export class PhotoProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PhotoProcessor.name);
  private worker?: Worker;

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    @Inject(REDIS_CONN) private redis: IORedis,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      PHOTO_QUEUE_NAME,
      async (job) => {
        if (job.name !== 'PROCESS_PHOTO') return;

        const { photoId } = job.data as { photoId: string };
        if (!photoId) return;

        await this.processPhoto(photoId);
      },
      {
        connection: this.redis as any,
        concurrency: 3,
      },
    );

    this.worker.on('completed', (job) =>
      this.logger.log(`Completed job ${job.id}`),
    );
    this.worker.on('failed', (job, err) =>
      this.logger.error(`Failed job ${job?.id}: ${err.message}`),
    );
    this.logger.log('PhotoProcessor worker started');
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  private async processPhoto(photoId: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      select: {
        id: true,
        eventId: true,
        status: true,
        originalKey: true,
        largeKey: true,
        thumbKey: true,
      },
    });

    if (!photo) throw new Error('Photo not found');
    if (!photo.originalKey) throw new Error('Photo missing originalKey');

    // Idempotency: if already processed, skip
    if (
      photo.status === PhotoStatus.PROCESSED &&
      photo.largeKey &&
      photo.thumbKey
    ) {
      this.logger.log(`Photo ${photoId} already processed, skipping`);
      return;
    }

    this.logger.log(`Processing photo ${photoId}`);

    // Download original from R2
    const { body } = await this.storage.getObjectBuffer(photo.originalKey);

    // Validate image and get metadata
    let base: sharp.Sharp;
    let originalMeta: sharp.Metadata;
    
    try {
      base = sharp(body).rotate();
      originalMeta = await base.metadata();
      
      // Validate dimensions
      const width = originalMeta.width ?? 0;
      const height = originalMeta.height ?? 0;
      
      if (width < 200 || height < 200) {
        throw new Error(`Image too small: ${width}x${height}px (min 200px)`);
      }
      
      if (width > 12000 || height > 12000) {
        throw new Error(`Image too large: ${width}x${height}px (max 12000px)`);
      }
    } catch (err) {
      this.logger.error(`Failed to decode image ${photoId}: ${err.message}`);
      await this.prisma.photo.update({
        where: { id: photo.id },
        data: { status: PhotoStatus.FAILED },
      });
      throw err;
    }

    // Create JPEG variants (keeps everything consistent)
    const largeBuf = await base
      .clone()
      .resize({
        width: 2000,
        height: 2000,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    const thumbBuf = await base
      .clone()
      .resize({
        width: 400,
        height: 400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    // Match folder structure
    const largeKey = `events/${photo.eventId}/large/${photo.id}.jpg`;
    const thumbKey = `events/${photo.eventId}/thumb/${photo.id}.jpg`;

    // Upload variants to R2
    await this.storage.putObjectBuffer({
      key: largeKey,
      contentType: 'image/jpeg',
      body: largeBuf,
    });
    await this.storage.putObjectBuffer({
      key: thumbKey,
      contentType: 'image/jpeg',
      body: thumbBuf,
    });

    // Get dimensions from large
    const meta = await sharp(largeBuf).metadata();

    // Update DB
    await this.prisma.photo.update({
      where: { id: photo.id },
      data: {
        status: PhotoStatus.PROCESSED,
        largeKey,
        thumbKey,
        width: meta.width ?? undefined,
        height: meta.height ?? undefined,
      },
    });

    this.logger.log(`Successfully processed photo ${photoId}`);
  }
}

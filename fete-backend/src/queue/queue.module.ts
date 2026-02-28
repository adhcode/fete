import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export const PHOTO_QUEUE_NAME = 'photo-processing';
export const PHOTO_QUEUE = Symbol('PHOTO_QUEUE');
export const REDIS_CONN = Symbol('REDIS_CONN');

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CONN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow('REDIS_URL');
        return new IORedis(url, { maxRetriesPerRequest: null });
      },
    },
    {
      provide: PHOTO_QUEUE,
      inject: [REDIS_CONN],
      useFactory: (redis: IORedis) =>
        new Queue(PHOTO_QUEUE_NAME, { connection: redis as any }),
    },
  ],
  exports: [REDIS_CONN, PHOTO_QUEUE],
})
export class QueueModule {}

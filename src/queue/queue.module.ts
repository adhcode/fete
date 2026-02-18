import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

export const PHOTO_QUEUE = 'photo-processing';
export const PHOTO_QUEUE_TOKEN = 'PHOTO_QUEUE';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: PHOTO_QUEUE_TOKEN,
            inject: [ConfigService],
            useFactory: (config: ConfigService) =>
                new Queue(PHOTO_QUEUE, {
                    connection: {
                        host: config.get('REDIS_HOST', 'localhost'),
                        port: config.get('REDIS_PORT', 6379),
                    },
                }),
        },
    ],
    exports: [PHOTO_QUEUE_TOKEN],
})
export class QueueModule { }

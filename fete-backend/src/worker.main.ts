import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Keep process alive - BullMQ Worker runs as long as process is alive
  process.on('SIGTERM', async () => {
    await app.close();
  });

  process.on('SIGINT', async () => {
    await app.close();
  });
}

bootstrap();

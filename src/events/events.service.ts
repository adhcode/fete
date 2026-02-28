import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { generateEventCode } from './event-code.util';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async createEvent(data: {
    name: string;
    date?: Date;
    venue?: string;
    organizerId: string;
    templateId?: string;
  }) {
    let code: string;
    let exists = true;

    // ensure unique code
    while (exists) {
      code = generateEventCode();
      const found = await this.prisma.event.findUnique({
        where: { code },
      });
      if (!found) exists = false;
    }

    return this.prisma.event.create({
      data: {
        code: code!,
        name: data.name,
        date: data.date,
        venue: data.venue,
        organizerId: data.organizerId,
        templateId: data.templateId,
      },
    });
  }

  async getEventByCode(code: string) {
    const event = await this.prisma.event.findUnique({
      where: { code },
      include: {
        template: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Map template with proper overlayUrl
    if (event.template) {
      return {
        ...event,
        template: {
          ...event.template,
          overlayUrl: event.template.overlayKey
            ? this.storage.publicUrl(event.template.overlayKey)
            : null,
        },
      };
    }

    return event;
  }
}

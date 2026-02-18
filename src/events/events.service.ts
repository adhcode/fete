import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateEventCode } from './event-code.util';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

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

    return event;
  }
}

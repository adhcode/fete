import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() body: any) {
    return this.eventsService.createEvent({
      name: body.name,
      date: body.date ? new Date(body.date) : undefined,
      venue: body.venue,
      organizerId: body.organizerId,
      templateId: body.templateId,
    });
  }

  @Get(':code')
  async getEvent(@Param('code') code: string) {
    return this.eventsService.getEventByCode(code);
  }
}

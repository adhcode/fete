import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createEvent(
    @Body() body: any,
    @CurrentUser() user: { id: string },
  ) {
    return this.eventsService.createEvent({
      name: body.name,
      date: body.date ? new Date(body.date) : undefined,
      venue: body.venue,
      organizerId: user.id, // Get from auth token
      templateId: body.templateId,
      hashtag: body.hashtag,
      approvalRequired: body.approvalRequired,
      publicGallery: body.publicGallery,
      allowShareLinks: body.allowShareLinks,
      maxUploadsPerGuest: body.maxUploadsPerGuest,
      maxUploadsTotal: body.maxUploadsTotal,
    });
  }

  @Public()
  @Get(':code')
  async getEvent(@Param('code') code: string) {
    return this.eventsService.getEventByCode(code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('organizer/my-events')
  async getMyEvents(@CurrentUser() user: { id: string }) {
    return this.eventsService.getOrganizerEvents(user.id);
  }
}

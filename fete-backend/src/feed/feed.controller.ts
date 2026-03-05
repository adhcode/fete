import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { FeedService } from './feed.service';
import { GetFeedQuerySchema } from './dto';
import { Public } from '../auth/public.decorator';

@Public()
@Controller('api/events')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get(':code/feed')
  async getEventFeed(
    @Param('code') code: string,
    @Query() query: any,
    @Headers('x-fete-guest') guestId?: string,
  ) {
    const dto = GetFeedQuerySchema.parse(query);
    return this.feedService.getEventFeed(code, dto, guestId);
  }
}

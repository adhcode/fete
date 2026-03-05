import {
  Controller,
  Post,
  Delete,
  Param,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { Public } from '../auth/public.decorator';

@Public()
@Controller('api/photos')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post(':id/like')
  async likePhoto(
    @Param('id') photoId: string,
    @Headers('x-fete-guest') guestId?: string,
  ) {
    if (!guestId) {
      throw new BadRequestException(
        'X-Fete-Guest header is required for liking photos',
      );
    }
    return this.likesService.likePhoto(photoId, guestId);
  }

  @Delete(':id/like')
  async unlikePhoto(
    @Param('id') photoId: string,
    @Headers('x-fete-guest') guestId?: string,
  ) {
    if (!guestId) {
      throw new BadRequestException(
        'X-Fete-Guest header is required for unliking photos',
      );
    }
    return this.likesService.unlikePhoto(photoId, guestId);
  }
}

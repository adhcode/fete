import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';
import {
  UploadIntentSchema,
  CompleteUploadSchema,
  GetPhotosQuerySchema,
  GetStoryQuerySchema,
  ApprovePhotoSchema,
} from './dto';

@Controller('api')
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  // Client calls this before upload
  @Post('upload-intent')
  async uploadIntent(@Body() body: any) {
    const dto = UploadIntentSchema.parse(body);
    return this.uploads.createUploadIntent(dto);
  }

  // Client calls after uploading to R2
  @Post('upload-complete')
  async uploadComplete(@Body() body: any) {
    const dto = CompleteUploadSchema.parse(body);
    return this.uploads.completeUpload(dto.photoId);
  }

  // Get photos for an event with pagination
  @Get('events/:eventCode/photos')
  async getEventPhotos(
    @Param('eventCode') eventCode: string,
    @Query() query: any,
  ) {
    const dto = GetPhotosQuerySchema.parse(query);
    return this.uploads.getEventPhotos(eventCode, dto);
  }

  // Get single photo details
  @Get('photos/:photoId')
  async getPhoto(@Param('photoId') photoId: string) {
    return this.uploads.getPhoto(photoId);
  }

  // Approve/reject photo (admin only - add auth later)
  @Patch('photos/:photoId/approve')
  async approvePhoto(@Param('photoId') photoId: string, @Body() body: any) {
    const dto = ApprovePhotoSchema.parse(body);
    return this.uploads.approvePhoto(photoId, dto.approved);
  }

  // Get story feed for an event (mixed images + videos)
  @Get('events/:eventCode/story')
  async getEventStory(
    @Param('eventCode') eventCode: string,
    @Query() query: any,
  ) {
    const dto = GetStoryQuerySchema.parse(query);
    return this.uploads.getEventStory(eventCode, dto);
  }

  // Alias for media approval (can use either photos or media)
  @Patch('media/:mediaId/approve')
  async approveMedia(@Param('mediaId') mediaId: string, @Body() body: any) {
    const dto = ApprovePhotoSchema.parse(body);
    return this.uploads.approvePhoto(mediaId, dto.approved);
  }
}

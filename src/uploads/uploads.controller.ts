import { Body, Controller, Post } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadIntentSchema, CompleteUploadSchema } from './dto';

@Controller()
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
}

import { z } from 'zod';

// Validation: max 40MB for videos, 10MB for images
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 40 * 1024 * 1024; // 40MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_VIDEO_TYPES = ['video/mp4'];

export const UploadIntentSchema = z
  .object({
    eventCode: z.string().min(4),
    mediaType: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
    contentType: z.string().min(3),
    fileSizeBytes: z.number().int().positive().optional(),
    caption: z.string().max(140).optional(),
    uploaderHash: z.string().max(200).optional(),
  })
  .refine(
    (data) => {
      // Validate contentType matches mediaType
      if (data.mediaType === 'IMAGE') {
        return ALLOWED_IMAGE_TYPES.includes(data.contentType);
      }
      if (data.mediaType === 'VIDEO') {
        return ALLOWED_VIDEO_TYPES.includes(data.contentType);
      }
      return false;
    },
    {
      message: 'Invalid content type for media type. Images: JPEG/PNG, Videos: MP4 only',
      path: ['contentType'],
    },
  )
  .refine(
    (data) => {
      if (!data.fileSizeBytes) return true;
      const maxSize = data.mediaType === 'VIDEO' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      return data.fileSizeBytes <= maxSize;
    },
    {
      message: 'File size exceeds maximum. Images: 10MB, Videos: 40MB',
      path: ['fileSizeBytes'],
    },
  );

export type UploadIntentDto = z.infer<typeof UploadIntentSchema>;

export const CompleteUploadSchema = z.object({
  photoId: z.string().min(5),
});

export type CompleteUploadDto = z.infer<typeof CompleteUploadSchema>;

export const GetPhotosQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().optional(), // ISO date string for cursor-based pagination
  status: z.enum(['PROCESSED', 'UPLOADED', 'PENDING_UPLOAD', 'FAILED']).optional(),
  approved: z.coerce.boolean().optional(),
  mediaType: z.enum(['IMAGE', 'VIDEO']).optional(),
});

export type GetPhotosQueryDto = z.infer<typeof GetPhotosQuerySchema>;

export const GetStoryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(30),
  cursor: z.string().optional(), // ISO date string for cursor-based pagination
});

export type GetStoryQueryDto = z.infer<typeof GetStoryQuerySchema>;

export const ApprovePhotoSchema = z.object({
  photoId: z.string().min(5),
  approved: z.boolean(),
});

export type ApprovePhotoDto = z.infer<typeof ApprovePhotoSchema>;

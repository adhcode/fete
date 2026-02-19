import { z } from 'zod';

// Validation: max 10MB, only jpeg/png
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png'];

export const UploadIntentSchema = z
  .object({
    eventCode: z.string().min(4),
    contentType: z.string().min(3),
    fileSizeBytes: z.number().int().positive().optional(),
    caption: z.string().max(140).optional(),
    uploaderHash: z.string().max(200).optional(),
  })
  .refine((data) => ALLOWED_CONTENT_TYPES.includes(data.contentType), {
    message: 'Only JPEG and PNG images are allowed',
    path: ['contentType'],
  })
  .refine(
    (data) => !data.fileSizeBytes || data.fileSizeBytes <= MAX_FILE_SIZE,
    {
      message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
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
});

export type GetPhotosQueryDto = z.infer<typeof GetPhotosQuerySchema>;

export const ApprovePhotoSchema = z.object({
  photoId: z.string().min(5),
  approved: z.boolean(),
});

export type ApprovePhotoDto = z.infer<typeof ApprovePhotoSchema>;

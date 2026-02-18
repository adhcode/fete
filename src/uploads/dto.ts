import { z } from 'zod';

export const UploadIntentSchema = z.object({
  eventCode: z.string().min(4),
  contentType: z.string().min(3), // "image/jpeg"
  // optional: guest caption
  caption: z.string().max(140).optional(),
  uploaderHash: z.string().max(200).optional(),
});

export type UploadIntentDto = z.infer<typeof UploadIntentSchema>;

export const CompleteUploadSchema = z.object({
  photoId: z.string().min(5),
});

export type CompleteUploadDto = z.infer<typeof CompleteUploadSchema>;

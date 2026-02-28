import { z } from 'zod';

// Template config schema
const TextFieldSchema = z.object({
  id: z.string(),
  defaultValue: z.string(),
  x: z.number().min(0).max(100), // Percentage
  y: z.number().min(0).max(100), // Percentage
  maxWidth: z.number().positive().optional(),
  fontFamily: z.string().default('Arial'),
  fontSize: z.number().positive(),
  fontWeight: z.enum(['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']).default('normal'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // Hex color
  align: z.enum(['left', 'center', 'right']).default('center'),
  shadow: z.object({
    offsetX: z.number(),
    offsetY: z.number(),
    blur: z.number(),
    color: z.string(),
  }).optional(),
});

const OverlaySchema = z.object({
  url: z.string().url().optional(),
  opacity: z.number().min(0).max(1).default(1),
  blendMode: z.enum(['normal', 'multiply', 'screen', 'overlay']).default('normal'),
});

const SafeAreaSchema = z.object({
  top: z.number().min(0).max(100),
  bottom: z.number().min(0).max(100),
  left: z.number().min(0).max(100),
  right: z.number().min(0).max(100),
}).optional();

export const TemplateConfigSchema = z.object({
  version: z.string().default('1.0'),
  overlay: OverlaySchema,
  textFields: z.array(TextFieldSchema),
  safeArea: SafeAreaSchema,
});

export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;
export type TextField = z.infer<typeof TextFieldSchema>;

// Create template DTO
export const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  config: TemplateConfigSchema,
  overlayUrl: z.string().url().optional(), // Direct URL or will be uploaded
});

export type CreateTemplateDto = z.infer<typeof CreateTemplateSchema>;

// Update template DTO
export const UpdateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: TemplateConfigSchema.optional(),
  overlayUrl: z.string().url().optional(),
});

export type UpdateTemplateDto = z.infer<typeof UpdateTemplateSchema>;

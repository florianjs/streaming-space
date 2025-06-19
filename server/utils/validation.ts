import { z } from 'zod';

// Authentication validation schemas
export const loginSchema = z.object({
  identity: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email too long')
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
});

// Video validation schemas
export const videoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title too long')
    .trim()
    .refine(
      (val) => !/<script|javascript:|data:/i.test(val),
      'Invalid characters in title'
    ),
  description: z
    .string()
    .max(1000, 'Description too long')
    .optional()
    .transform((val) => val?.trim()),
  url: z
    .string()
    .url('Invalid URL format')
    .max(2000, 'URL too long')
    .optional()
    .refine(
      (val) => !val || /^https?:\/\//.test(val),
      'Only HTTP/HTTPS URLs allowed'
    ),
  iframe: z
    .string()
    .max(2000, 'Iframe code too long')
    .optional()
    .refine(
      (val) => !val || !/<script/i.test(val),
      'Script tags not allowed in iframe'
    ),
  type: z.enum(['stream', 'torrent', 'iframe'], {
    errorMap: () => ({ message: 'Type must be stream, torrent, or iframe' }),
  }),
  imdb: z
    .string()
    .max(20, 'IMDB ID too long')
    .optional()
    .refine((val) => !val || /^tt\d{7,}$/.test(val), 'Invalid IMDB ID format'),
  categories: z.array(z.string().uuid('Invalid category ID')).optional(),
});

// Media validation schemas
export const mediaSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title too long')
    .trim()
    .refine(
      (val) => !/<script|javascript:|data:/i.test(val),
      'Invalid characters in title'
    ),
  type: z.enum(['stream', 'torrent', 'iframe']),
  description: z
    .string()
    .max(1000, 'Description too long')
    .optional()
    .transform((val) => val?.trim()),
  media_url: z
    .string()
    .url('Invalid media URL')
    .max(2000, 'URL too long')
    .optional()
    .refine(
      (val) => !val || /^https?:\/\//.test(val),
      'Only HTTP/HTTPS URLs allowed'
    ),
  iframe: z
    .string()
    .max(2000, 'Iframe code too long')
    .optional()
    .refine(
      (val) => !val || !/<script/i.test(val),
      'Script tags not allowed in iframe'
    ),
  imdb: z
    .string()
    .max(20, 'IMDB ID too long')
    .optional()
    .refine((val) => !val || /^tt\d{7,}$/.test(val), 'Invalid IMDB ID format'),
  categories: z.array(z.string().uuid('Invalid category ID')).optional(),
});

// Category validation schemas
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .trim()
    .refine(
      (val) => !/<script|javascript:|data:/i.test(val),
      'Invalid characters in name'
    ),
  description: z
    .string()
    .max(500, 'Description too long')
    .optional()
    .transform((val) => val?.trim()),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    )
    .trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (must be hex color)')
    .optional(),
  sort_order: z
    .number()
    .int('Sort order must be an integer')
    .min(0, 'Sort order must be non-negative')
    .max(9999, 'Sort order too large')
    .optional(),
  active: z.boolean().optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  size: z.number().max(100 * 1024 * 1024, 'File size must be less than 100MB'),
  type: z
    .string()
    .refine(
      (val) =>
        /^(image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|webm|ogg)|application\/x-bittorrent)$/i.test(
          val
        ),
      'Invalid file type. Only images, videos, and torrent files allowed'
    ),
});

// Validation helper function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages.join(', ')}`,
      });
    }
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input data',
    });
  }
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

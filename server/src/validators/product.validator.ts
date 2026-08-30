import { z } from 'zod';

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
  isActive: z
    .enum(['true', 'false', 'all'])
    .optional()
    .transform((val) => {
      if (val === 'all') return undefined;
      if (val === 'false') return false;
      return true;
    }),
});

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Product name is required' })
    .trim()
    .min(3, 'Product name must be at least 3 characters')
    .max(120, 'Product name cannot exceed 120 characters'),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase alphanumeric characters and hyphens')
    .optional(),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  price: z.coerce
    .number({ required_error: 'Price is required' })
    .positive('Price must be greater than zero')
    .max(1000000, 'Price exceeds maximum allowed limit'),
  stock: z.coerce
    .number({ required_error: 'Stock is required' })
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  categoryId: z.string({ required_error: 'Category ID is required' }).uuid('Invalid category ID'),
  isActive: z.boolean().default(true),
  images: z
    .array(
      z.object({
        url: z.string().url('Must be a valid image URL'),
        isPrimary: z.boolean().default(false),
        displayOrder: z.number().int().default(0),
      })
    )
    .optional()
    .default([]),
});

export const updateProductSchema = createProductSchema.partial();

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

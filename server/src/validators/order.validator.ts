import { z } from 'zod';

export const shippingAddressSchema = z.object({
  street: z.string({ required_error: 'Street address is required' }).trim().min(3).max(100),
  city: z.string({ required_error: 'City is required' }).trim().min(2).max(50),
  state: z.string({ required_error: 'State/Province is required' }).trim().min(2).max(50),
  postalCode: z.string({ required_error: 'Postal code is required' }).trim().min(2).max(20),
  country: z.string({ required_error: 'Country is required' }).trim().min(2).max(50),
  phone: z.string().trim().max(25).optional(),
});

export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    required_error: 'Status is required',
  }),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;

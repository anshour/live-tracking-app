import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters long')
      .max(20, 'Name cannot exceed 20 characters'),
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  })
  .required();

export type RegisterDto = z.infer<typeof registerSchema>;

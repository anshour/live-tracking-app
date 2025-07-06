import { z } from 'zod';

export const registerTrackerSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  })
  .required();

export type RegisterTrackerDto = z.infer<typeof registerTrackerSchema>;

import { z } from 'zod';

export const subscribeByAccessCodeSchema = z
  .object({
    accessCode: z.string().min(1, 'Access code is required'),
  })
  .required();

export type SubscribeByAccessCodeDto = z.infer<
  typeof subscribeByAccessCodeSchema
>;

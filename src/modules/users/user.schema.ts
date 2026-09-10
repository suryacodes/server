import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phoneCode: z.string().min(1).optional(),
  phoneNumber: z.string().min(6).max(15).optional(),
  password: z.string().min(8),
});

export type UserCreateDto = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = userCreateSchema.partial().extend({
  id: z.uuid(),
});

export type UserUpdateDto = z.infer<typeof userUpdateSchema>;

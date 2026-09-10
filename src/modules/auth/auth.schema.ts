import { z } from "zod";

export const loginSchema = z.union([
  z.object({
    email: z.email(),
    password: z.string().min(8),
  }),

  z.object({
    phoneCode: z.string().min(1),
    phoneNumber: z.string().min(6).max(15),
    password: z.string().min(8),
  }),
]);

export type LoginSchema = z.infer<typeof loginSchema>;

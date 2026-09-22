import z from "zod";

export const productListQuerySchema = z.object({
  limit: z.number().min(10).max(20),
  cursor: z.string().optional(),
});

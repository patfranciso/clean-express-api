import { z } from "zod";
import { EditProductInput } from "./editProduct.usecase";
import { validateInput } from "@/utils/validate";

export const editProductSchema = z
  .object({
    productId: z
      .string({ required_error: "ProductId is required" })
      .min(1, "ProductId must be at least 1 character long"),
    title: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    image: z.string().optional(),
    price: z.coerce.number().optional(),
    salePrice: z.coerce.number().optional(),
    totalStock: z.coerce.number().optional(),
    averageReview: z.coerce.number().optional(),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: "Nothing to edit or update",
    path: ["countUpdatedFields"],
  });

export const validateEditProduct =
  validateInput<EditProductInput>(editProductSchema);

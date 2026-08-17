import { z } from "zod";
import { validateInput } from "@/utils/validate";
import { DeleteProductInput } from "./deleteProduct.usecase";

export const deleteProductSchema = z.object({
  productId: z
    .string({ required_error: "Product ID is required" })
    .min(4, "Product ID must be at least 4 character long"),
});

export const validateDeleteProductInput =
  validateInput<DeleteProductInput>(deleteProductSchema);

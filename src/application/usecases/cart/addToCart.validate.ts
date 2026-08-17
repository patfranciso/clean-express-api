import { z } from "zod";
import { validateInput } from "@/utils/validate";
import { AddToCartInput } from "./addToCart.usecase";

/**
 * Zod schema for validating the AddToCartInput.
 */
export const addToCartSchema = z.object({
  userId: z
    .string({ required_error: "User ID is required" })
    .min(1, "User ID cannot be empty"),
  productId: z
    .string({ required_error: "Product ID is required" })
    .min(1, "Product ID cannot be empty"),
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be an integer")
    .positive("Quantity must be positive"),
  userAgent: z.string().optional(), // Optional, consistent with other use cases
});

/**
 * Validation function for AddToCartInput, using the addToCartSchema.
 */
export const validateAddToCart = validateInput<AddToCartInput>(addToCartSchema);

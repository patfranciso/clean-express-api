import { z } from "zod";

import { AddProductInput } from "./addProduct.usecase";
import { validateInput } from "@/utils/validate";

export const addProductSchema = z
  .object({
    image: z
      .string({
        required_error: "Image is required",
      })
      .url("Image must be a valid URL"),
    title: z
      .string({ required_error: "Title is required" })
      .min(3, "Title must be at least 3 characters"),
    description: z
      .string({ required_error: "Description is required" })
      .min(10, "Description must be at least 10 characters"),
    category: z.string({ required_error: "Category is required" }),
    brand: z.string({ required_error: "Brand is required" }),
    price: z
      .number({ required_error: "Price is required" })
      .min(1, { message: "Price must be greater than 0" }),
    salePrice: z
      .number({ required_error: "Sale Price is required" })
      .min(1, { message: "Sale Price must be greater than 0" }),
    totalStock: z
      .number({ required_error: "Total Stock is required" })
      .min(0, { message: "Total stock must be greater than or equal to 0" }),
    averageReview: z
      .number({ required_error: "Average Review is required" })
      .min(1, { message: "Average review must be greater than 0" })
      .max(5, { message: "Average review must be less than or equal to 5" }),
  })
  .refine((data) => data.salePrice <= data.price, {
    message: "Sale price must be less than or equal to regular price",
    path: ["salePrice"],
  });

export const validateAddProductInput =
  validateInput<AddProductInput>(addProductSchema);

import mongoose, { InferSchemaType } from "mongoose";

import { Product } from "@/application/entities/product";
import { assertType } from "@/utils/assertType";
const ProductSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    totalStock: { type: Number, required: true },
    averageReview: { type: Number, required: true },
  },
  { timestamps: true }
);

const ProductModel =
  mongoose.models["Product"] ||
  mongoose.model<Product>("Product", ProductSchema);

export default ProductModel;
export type ProductDocType = InferSchemaType<typeof ProductSchema>;

assertType<
  Omit<Product, "id">,
  Omit<ProductDocType, "_id">,
  Omit<Product, "id">
>();

import mongoose, { InferSchemaType, Model } from "mongoose";

import { assertType } from "@/utils/assertType";
import CartRecordType from "@/impl/mongoose/record-types/cart.record-type";
import DocumentToRecord from "../documentToRecord";

const CartSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      // unique: true,
    },
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: String,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const CartModel: Model<CartRecordType> =
  mongoose.models["Cart"] || mongoose.model<CartRecordType>("Cart", CartSchema);

export default CartModel;
export type CartDocType = InferSchemaType<typeof CartSchema>;

assertType<
  Omit<CartRecordType, "id">,
  DocumentToRecord<Omit<CartDocType, "_id">>,
  Omit<CartRecordType, "id">
>();

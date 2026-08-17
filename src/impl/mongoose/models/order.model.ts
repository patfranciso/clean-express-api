import mongoose, { HydratedDocument, InferSchemaType } from "mongoose";

import Order from "@/application/entities/order";
import { assertType } from "@/utils/assertType";
import DocumentToRecord from "../documentToRecord";

const OrderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    cartId: {
      type: String,
      required: true,
    },
    cartItems: [
      {
        productId: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        price: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    orderInfo: {
      type: {
        order: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        pincode: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        notes: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
    orderStatus: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderDate: {
      type: Date,
      required: true,
    },
    paymentId: String,
    payerId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const OrderModel =
  mongoose.models["Order"] || mongoose.model<Order>("Order", OrderSchema);

export default OrderModel;
type OrderDocType = InferSchemaType<typeof OrderSchema>;

// assertType<Omit<Order, "id">, Omit<OrderDocType, "_id">, Omit<Order, "id">>();
// assertType<Omit<Order, "id">, OrderDocType, Omit<Order, "id">>();
// assertType<Omit<Order, "id">, Omit<OrderDocType, "_id">, Omit<Order, "id">>();
assertType<
  Omit<Order, "id">,
  DocumentToRecord<Omit<OrderDocType, "_id">>,
  Omit<Order, "id">
>();
// assertType<
//   Omit<Order, "id">,
//   DocumentToRecord<OrderDocType>,
//   Omit<Order, "id">
// >();

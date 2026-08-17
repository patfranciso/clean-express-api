import mongoose, { InferSchemaType } from "mongoose";

import Address from "@/application/entities/address";
import { assertType } from "@/utils/assertType";
const AddressSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    userId: {
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
      required: false,
    },
  },
  { timestamps: true }
);
const AddressModel =
  mongoose.models["Address"] ||
  mongoose.model<Address>("Address", AddressSchema);

export default AddressModel;
export type AddressDocType = InferSchemaType<typeof AddressSchema>;

assertType<
  Omit<Address, "id">,
  Omit<AddressDocType, "_id">,
  Omit<Address, "id">
>();

import mongoose, { InferSchemaType } from "mongoose";

import { User } from "@/application/entities/user";
import { assertType } from "@/utils/assertType";

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    handle: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    role: {
      type: String,
      enum: ["ADMIN", "CUSTOMER", "VENDOR"],
      default: "CUSTOMER",
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  {
    timestamps: true,
  }
);

const UserModel =
  mongoose.models["User"] || mongoose.model<User>("User", UserSchema);

export default UserModel;
export type UserDocType = InferSchemaType<typeof UserSchema>;

assertType<Omit<User, "id">, Omit<UserDocType, "_id">, Omit<User, "id">>();

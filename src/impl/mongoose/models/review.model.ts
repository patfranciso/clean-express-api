import mongoose, { InferSchemaType } from "mongoose";

import { Review } from "@/application/entities/review";
import { assertType } from "@/utils/assertType";
const ReviewSchema = new mongoose.Schema(
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
    userName: {
      type: String,
      required: true,
    },
    reviewMessage: {
      type: String,
      required: true,
    },
    reviewValue: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);
const ReviewModel =
  mongoose.models["Review"] || mongoose.model<Review>("Review", ReviewSchema);

export default ReviewModel;
export type ReviewDocType = InferSchemaType<typeof ReviewSchema>;

assertType<
  Omit<Review, "id">,
  Omit<ReviewDocType, "_id">,
  Omit<Review, "id">
>();

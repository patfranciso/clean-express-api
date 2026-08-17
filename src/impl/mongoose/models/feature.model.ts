import Feature from "@/application/entities/feature";
import { assertType } from "@/utils/assertType";
import mongoose, { InferSchemaType } from "mongoose";

const FeatureSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      //   unique: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const FeatureModel =
  mongoose.models["Feature"] ||
  mongoose.model<Feature>("Feature", FeatureSchema);

export default FeatureModel;

type FeatureType = InferSchemaType<typeof FeatureSchema>;
// assertType<Omit<Feature, "id">, FeatureType, Omit<Feature, "id">>();
assertType<
  Omit<Feature, "id">,
  Omit<FeatureType, "_id">,
  Omit<Feature, "id">
>();

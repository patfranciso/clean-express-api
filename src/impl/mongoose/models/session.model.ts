import mongoose, { InferSchemaType } from "mongoose";

import { Session } from "@/application/entities/session";
import { assertType } from "@/utils/assertType";

const SessionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      // unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SessionModel =
  mongoose.models["Session"] ||
  mongoose.model<Session>("Session", SessionSchema);

export default SessionModel;
type SessionType = InferSchemaType<typeof SessionSchema>;

// assertType<Omit<Session, "id">, SessionType, Omit<Session, "id">>();
assertType<
  Omit<Session, "id">,
  Omit<SessionType, "_id">,
  Omit<Session, "id">
>();

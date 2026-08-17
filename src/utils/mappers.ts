import _ from "lodash";
import mongoose from "mongoose";

export type MongoDbDoc = { _id?: string | mongoose.ObjectId | undefined };
export function docToEntity<T>(doc: MongoDbDoc & T): T {
  const id = doc._id;
  const data = _.omit(doc, ["__v", "_id"]);

  return { id, ...data } as T;
}

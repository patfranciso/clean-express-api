// https://github.com/Automattic/mongoose/issues/13772
// InferSchemaType produces DocumentArray instead of a simple Array
import mongoose from "mongoose";

type DocumentToRecord<T> = {
  [P in keyof T]: T[P] extends mongoose.Types.DocumentArray<infer U>
    ? Array<U>
    : T[P];
};

export default DocumentToRecord;

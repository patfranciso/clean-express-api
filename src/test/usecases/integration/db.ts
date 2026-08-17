import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export const connectDb = async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  console.log("Connected to test DB");
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
};

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

import mongoose from "mongoose";
import { env } from "@/env";
import chalk from "chalk";

async function connectToDb() {
  const dbUri = env.MONGO_URL;

  try {
    await mongoose.connect(dbUri);
    console.info(chalk.greenBright("Connected to DB"));
  } catch (e) {
    console.error(chalk.redBright("Could not connect to DB"));
    process.exit(1);
  }
}

export default connectToDb;

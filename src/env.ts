import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envTypes> {}
  }
}
const envTypes = z.object({
  PORT: z.number({ coerce: true }),
  MONGO_URL: z.string().url(),
  ACCESS_TOKEN_PRIVATE_KEY: z.string(),
  ACCESS_TOKEN_PUBLIC_KEY: z.string(),
  REFRESH_PRIVATE_KEY: z.string(),
  REFRESH_PUBLIC_KEY: z.string(),
  ACCESS_TOKEN_TTL: z.string(),
  REFRESH_TOKEN_TTL: z.string(),
  UPLOAD_PATH: z.string(),
  NODE_ENV: z.enum(["test", "production"]).optional(),
});
export const env = envTypes.parse(process.env);

// console.log({ env });

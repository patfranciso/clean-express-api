import { validateInput } from "@/utils/validate";
import { z } from "zod";
import { LoginInput } from "./login.usecase";

export const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must contain at least 8 character(s)"),
  userAgent: z.string({ required_error: "UserAgent is required" }),
});

export const validateLogin = validateInput<LoginInput>(loginSchema);

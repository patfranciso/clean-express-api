import { z } from "zod";

import { SignupInput } from "@/application/usecases/auth/signup.usecase";
import { validateInput } from "@/utils/validate";

export const registerSchema = z
  .object({
    handle: z
      .string({
        required_error: "Handle is required",
      })
      .min(3, "Handle must contain at least 3 character(s)")
      .max(32),
    name: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
      })
      .min(3, "Your Name must contain at least 3 character(s)")
      .max(32),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email(),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "Password must contain at least 8 character(s)"),
    confirmPassword: z
      .string({
        required_error: "ConfirmPassword is required",
      })
      .min(8, "Confirm Password must contain at least 8 character(s)"),
    role: z.enum(["ADMIN", "CUSTOMER", "VENDOR"], {
      required_error: "Role is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export const validateSignup = validateInput<SignupInput>(registerSchema);

import { LogoutInput } from "./logout.usecase";
import { validateInput } from "@/utils/validate";
import { z } from "zod";

export const logoutSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required" })
    .min(1, "Refresh token must not be empty"),
  userAgent: z
    .string({ required_error: "User agent is required" })
    .min(1, "user agent must not be empty"),
});

export const validateLogoutInput = validateInput<LogoutInput>(logoutSchema);

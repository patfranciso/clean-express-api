import { RefreshAccessTokenInput } from "./refreshAccessToken.usecase";
import { validateInput } from "@/utils/validate";
import { z } from "zod";

export const refreshAccessTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required" })
    .min(1, "Refresh token must not be empty"),
  userAgent: z
    .string({ required_error: "User agent is required" })
    .min(1, "user agent must not be empty"),
});

export const validateRefreshAccessTokenInput =
  validateInput<RefreshAccessTokenInput>(refreshAccessTokenSchema);

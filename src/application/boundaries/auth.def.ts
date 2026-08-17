import { User } from "@/application/entities/user";
import { CanFail } from "@/utils/canFail";

// Assuming these error types are defined elsewhere, or define them here
// e.g., in a shared error type file if they are common across auth
export type CheckCredentialsError =
  | "InvalidAccessTokenError"
  | "AccessTokenWithWrongSessionKeyError"
  | "InvalidSessionKeyError"
  | "InvalidUserAgentError";

export type Credentials = {
  sessionId: string;
  accessToken: string;
  userAgent: string;
};

// Checks credentials and returns the userId if valid, or an error
export type CheckCredentials = ({
  sessionId,
  accessToken,
  userAgent,
}: Credentials) => Promise<CanFail<CheckCredentialsError, User["id"]>>;

// You might add other auth boundary types here later, e.g., Token generators
// export type CreateAccessToken = (user: { userId: string; key: string }) => string;
// export type CreateRefreshToken = (user: { userId: string; key: string }) => string;

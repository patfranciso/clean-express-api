export const INVALID_USER_AGENT_ERROR = {
  status: "failed",
  meta: "InvalidUserAgentError",
  errors: { message: "Invalid user agent" },
};

export const INVALID_REFRESH_TOKEN_ERROR = {
  status: "failed",
  meta: "InvalidRefreshTokenError",
  errors: { message: "The provided refresh token is invalid" },
};

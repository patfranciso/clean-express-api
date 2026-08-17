import { verifyAccessToken } from "@/impl/services/cryptography.impl";

export const authCheck = (token?: string) => {
  if (!token) {
    return {
      error: {
        status: 401,
        message: "Unauthorised user",
      },
      user: null,
    };
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return {
      error: {
        status: 401,
        message: "Unauthorised user",
      },
      user: null,
    };
  }

  return {
    error: null,
    user: decoded,
  };
};

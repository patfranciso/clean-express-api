import { LoginResult } from "@/application/usecases/auth/login.usecase";
import {
  createAccessToken,
  createRefreshToken,
} from "@/impl/services/cryptography.impl";

const presentLoginResult = (result: LoginResult) => {
  if (result.status === "success") {
    // Create tokens for the successful login
    const accessToken = createAccessToken(result.data.user);
    const refreshToken = createRefreshToken(result.data.user);

    return {
      statusCode: 200,
      data: {
        user: result.data.user,
        accessToken,
        refreshToken,
      },
    };
  } else {
    // For failed cases, return the error as-is
    return {
      statusCode: 400,
      errors: result.errors,
    };
  }
};

export default presentLoginResult;

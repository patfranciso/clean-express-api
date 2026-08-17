import { makeRefreshAccessTokenUseCase } from "@/application/usecases/auth/refreshAccessToken.usecase";
import { validateRefreshAccessTokenInput } from "@/application/usecases/auth/refreshAccessToken.validate";
import {
  createAccessToken,
  verifyRefreshToken,
} from "@/impl/services/cryptography.impl";
import { getActiveSessionData } from "@/impl/services/repo/session.repo";
import { findUserById } from "@/impl/services/repo/user.repo";

export const refreshAccessTokenCommand = makeRefreshAccessTokenUseCase({
  validate: validateRefreshAccessTokenInput,
  decodeRefreshToken: verifyRefreshToken,
  findSessionByKey: getActiveSessionData,
  findUserById: findUserById,
  createAccessToken,
});

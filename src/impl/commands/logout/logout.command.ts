import { makeLogoutUseCase } from "@/application/usecases/auth/logout.usecase";
import { validateLogoutInput } from "@/application/usecases/auth/logout.validate";
import { verifyRefreshToken } from "@/impl/services/cryptography.impl";
import {
  deactivateSession,
  findSessionByKey,
} from "@/impl/services/repo/session.repo";

export const logoutCommand = makeLogoutUseCase({
  validate: validateLogoutInput,
  decodeRefreshToken: verifyRefreshToken,
  deactivateSession,
  findSessionByKey,
});

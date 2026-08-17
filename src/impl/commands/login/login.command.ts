import { findUserByEmail } from "@/impl/services/repo/user.repo";
import {
  createAccessToken,
  createRefreshToken,
  passwordChecker,
} from "@/impl/services/cryptography.impl";
import { makeLoginUseCase } from "@/application/usecases/auth/login.usecase";
import { validateLogin } from "@/application/usecases/auth/login.validate";
import { createSession } from "@/impl/services/repo/session.repo";

export const loginCommand = makeLoginUseCase({
  validate: validateLogin,
  findUserByEmail,
  passwordChecker,
  createAccessToken,
  createRefreshToken,
  createSession,
});

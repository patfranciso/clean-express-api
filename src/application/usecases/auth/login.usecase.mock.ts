import { validateLogin } from "./login.validate";
import { createSession } from "@/test/mocks/service/createSession.mock";
import { defaultMockUser } from "@/test/mocks/entities/user.entity.mock";
import { makeLoginUseCase } from "@/application/usecases/auth/login.usecase";

export const newValidUserDataLoginUseCase = makeLoginUseCase({
  validate: validateLogin,
  findUserByEmail: async (x) => defaultMockUser,
  passwordChecker: async (pass, hash) => true,
  createAccessToken: (user) => `accessToken-${user.userId}`,
  createRefreshToken: (user) => `refreshToken-${user.userId}`,
  createSession,
});

export const unknownUserAgentLoginUseCase = makeLoginUseCase({
  validate: validateLogin,
  findUserByEmail: async (x) => defaultMockUser,
  passwordChecker: async (pass, hash) => true,
  createAccessToken: (user) => `accessToken-${user.userId}`,
  createRefreshToken: (user) => `refreshToken-${user.userId}`,
  createSession,
});

export const unknownUserEmailLoginUseCase = makeLoginUseCase({
  validate: validateLogin,
  findUserByEmail: async (x) => null,
  passwordChecker: async (pass, hash) => true,
  createAccessToken: (user) => `accessToken-${user.userId}`,
  createRefreshToken: (user) => `refreshToken-${user.userId}`,
  createSession,
});

export const invalidUserPasswordLoginUseCase = makeLoginUseCase({
  validate: validateLogin,
  findUserByEmail: async (x) => defaultMockUser,
  passwordChecker: async (pass, hash) => false,
  createAccessToken: (user) => `accessToken-${user.userId}`,
  createRefreshToken: (user) => `refreshToken-${user.userId}`,
  createSession,
});

export const throwingLoginUseCase = makeLoginUseCase({
  validate: validateLogin,
  findUserByEmail: async (x) => {
    throw new Error("Cannot findUserByEmail");
  },
  passwordChecker: async (pass, hash) => false,
  createAccessToken: (user) => `accessToken-${user.userId}`,
  createRefreshToken: (user) => `refreshToken-${user.userId}`,
  createSession,
});

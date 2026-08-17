import expect from "expect";

import {
  makeLogoutUseCase,
  LogoutInput,
  InputValidationError,
  InvalidRefreshTokenError,
  SessionDeactivationFailedError,
  SessionNotFoundError,
  InvalidUserAgentError,
} from "./logout.usecase";
import {
  createRefreshToken,
  verifyRefreshToken,
} from "@/impl/services/cryptography.impl";

import { validateLogoutInput } from "./logout.validate";

import { defaultSessionMock } from "@/test/mocks/entities/session.entity.mock";

describe("logout unit tests", () => {
  context("for a valid session", () => {
    it("should succeed", async () => {
      const useCase = makeLogoutUseCase({
        validate: validateLogoutInput,
        decodeRefreshToken: verifyRefreshToken,
        deactivateSession: async (x) => true,
        findSessionByKey: async (k) => defaultSessionMock,
      });

      const result = await useCase({
        userAgent: "supertestAgent",
        refreshToken: createRefreshToken(
          {
            userId: "user01",
            key: "session01",
          },
          "15m"
        ),
      });
      expect(result).toEqual({
        status: "success",
        meta: "LogoutSuccess",
        data: { message: "success" },
      });
    });
  });
  context("fail cases", () => {
    it("should fail for empty input", async () => {
      const useCase = makeLogoutUseCase({
        validate: validateLogoutInput,
        decodeRefreshToken: verifyRefreshToken,
        deactivateSession: async (x) => true,
        findSessionByKey: async (k) => defaultSessionMock,
      });

      const result = await useCase({} as LogoutInput);
      expect(result).toEqual(InputValidationError);
    });
    it("should fail for empty params", async () => {
      const useCase = makeLogoutUseCase({
        validate: validateLogoutInput,
        decodeRefreshToken: verifyRefreshToken,
        deactivateSession: async (x) => true,
        findSessionByKey: async (k) => defaultSessionMock,
      });

      const result = await useCase({
        userAgent: "",
        refreshToken: "",
      } satisfies LogoutInput);
      expect(result).toEqual(InputValidationError);
    });
    it("should fail for expired session", async () => {
      const useCase = makeLogoutUseCase({
        validate: validateLogoutInput,
        decodeRefreshToken: verifyRefreshToken,
        deactivateSession: async (x) => true,
        findSessionByKey: async (k) => defaultSessionMock,
      });

      const result = await useCase({
        userAgent: "supertestAgent",
        refreshToken: createRefreshToken(
          {
            userId: "user01",
            key: "session01",
          },
          "-1"
        ),
      } satisfies LogoutInput);
      expect(result).toEqual(InvalidRefreshTokenError);
    });
    it("should fail for deactivated session", async () => {
      const useCase = makeLogoutUseCase({
        validate: validateLogoutInput,
        decodeRefreshToken: verifyRefreshToken,
        deactivateSession: async (x) => false,
        findSessionByKey: async (k) => defaultSessionMock,
      });

      const result = await useCase({
        userAgent: "supertestAgent",
        refreshToken: createRefreshToken(
          {
            userId: "user01",
            key: "session01",
          },
          "15m"
        ),
      } satisfies LogoutInput);
      expect(result).toEqual(SessionDeactivationFailedError);
    });
    it("should fail for invalid session", async () => {
      const useCase = makeLogoutUseCase({
        validate: validateLogoutInput,
        decodeRefreshToken: verifyRefreshToken,
        deactivateSession: async (x) => true,
        findSessionByKey: async (k) => null,
      });

      const result = await useCase({
        userAgent: "supertestAgent",
        refreshToken: createRefreshToken(
          {
            userId: "user01",
            key: "session01",
          },
          "15m"
        ),
      } satisfies LogoutInput);
      expect(result).toEqual(SessionNotFoundError);
    });
    it("should fail for invalid userAgent", async () => {
      const useCase = makeLogoutUseCase({
        validate: validateLogoutInput,
        decodeRefreshToken: verifyRefreshToken,
        deactivateSession: async (x) => true,
        findSessionByKey: async (k) => defaultSessionMock,
      });

      const result = await useCase({
        userAgent: "unknownUserAgent",
        refreshToken: createRefreshToken(
          {
            userId: "user01",
            key: "session01",
          },
          "15m"
        ),
      } satisfies LogoutInput);
      expect(result).toEqual(InvalidUserAgentError);
    });
  });
});

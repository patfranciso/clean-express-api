import expect from "expect";

import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "@/impl/services/cryptography.impl";
import { defaultMockUser } from "@/test/mocks/entities/user.entity.mock";
import { defaultSessionMock } from "@/test/mocks/entities/session.entity.mock";
import { makeRefreshAccessTokenUseCase } from "./refreshAccessToken.usecase";
import { validateRefreshAccessTokenInput } from "./refreshAccessToken.validate";

describe("refreshAccessToken unit tests", () => {
  context("Valid refresh token", () => {
    it("should succeed", async () => {
      const uc = makeRefreshAccessTokenUseCase({
        validate: validateRefreshAccessTokenInput,
        decodeRefreshToken: verifyRefreshToken,
        findSessionByKey: async (id: string) => defaultSessionMock,
        findUserById: async (id: string) => defaultMockUser,
        createAccessToken,
      });
      const result = await uc({
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
        meta: "RefreshAccessTokenSuccess",
        data: {
          accessToken: expect.any(String),
        },
      });
    });
  });

  context("Fail cases", () => {
    context("for validation errors", () => {
      it("should fail for missing params", async () => {
        const uc = makeRefreshAccessTokenUseCase({
          validate: validateRefreshAccessTokenInput,
          decodeRefreshToken: verifyRefreshToken,
          findSessionByKey: async (id: string) => defaultSessionMock,
          findUserById: async (id: string) => defaultMockUser,
          createAccessToken,
        });
        const result = await uc({ userAgent: "", refreshToken: "" });
        expect(result).toEqual({
          status: "failed",
          meta: "RefreshAccessTokenValidationError",
          errors: {
            message: "RefreshAccessTokenValidationError",
          },
        });
      });
      it("should fail for empty params", async () => {
        const uc = makeRefreshAccessTokenUseCase({
          validate: validateRefreshAccessTokenInput,
          decodeRefreshToken: verifyRefreshToken,
          findSessionByKey: async (id: string) => defaultSessionMock,
          findUserById: async (id: string) => defaultMockUser,
          createAccessToken,
        });
        const result = await uc({
          userAgent: "",
          refreshToken: "",
        });
        expect(result).toEqual({
          status: "failed",
          meta: "RefreshAccessTokenValidationError",
          errors: {
            message: "RefreshAccessTokenValidationError",
          },
        });
      });
    });
    context("for invalid params", () => {
      it("should fail if the session was not found", async () => {
        const uc = makeRefreshAccessTokenUseCase({
          validate: validateRefreshAccessTokenInput,
          decodeRefreshToken: verifyRefreshToken,
          findSessionByKey: async (id: string) => null,
          findUserById: async (id: string) => defaultMockUser,
          createAccessToken,
        });
        const result = await uc({
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
          status: "failed",
          meta: "SessionNotFoundError",
          errors: {
            message: "The provided refresh token is invalid",
          },
        });
      });
      it("should fail if the user agent is not matched", async () => {
        const uc = makeRefreshAccessTokenUseCase({
          validate: validateRefreshAccessTokenInput,
          decodeRefreshToken: verifyRefreshToken,
          findSessionByKey: async (id: string) => defaultSessionMock,
          findUserById: async (id: string) => defaultMockUser,
          createAccessToken,
        });
        const result = await uc({
          userAgent: "unknownUserAgent",
          refreshToken: createRefreshToken(
            {
              userId: "user01",
              key: "session01",
            },
            "15m"
          ),
        });
        expect(result).toEqual({
          status: "failed",
          meta: "InvalidUserAgentError",
          errors: {
            message: "Invalid user agent",
          },
        });
      });
    });
  });
});

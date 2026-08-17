import expect from "expect";

import { createAccessToken } from "@/impl/services/cryptography.impl";
// import { makeGetCurrentUserDetailsUseCase } from "@/application/useCases/getCurrentUserDetails";
import { existingMockUser } from "@/test/mocks/entities/user.entity.mock";
import { transformUser } from "@/impl/utils/user.transformer";
import { makeGetCurrentUserDetailsUseCase } from "./getCurrentDetails.usecase";
import {
  passingCheckCredentials,
  invalidAccessTokenCheckCredentialsUseCase,
  wrongSessionKeyCheckCredentialsUseCase,
  invalidSessionKeyCheckCredentialsUseCase,
} from "./checkCredentialsUseCase.mock";
// import {
//   invalidAccessTokenCheckCredentialsUseCase,
//   invalidSessionKeyCheckCredentialsUseCase,
//   passingCheckCredentials,
//   wrongSessionKeyCheckCredentialsUseCase,
// } from "@/test/mocks/useCases/checkCredentialsUseCase.mock";
// import { transformUser } from "@/utils/transformers/user.transformers";

describe("GetCurrentDetails unit tests", () => {
  context("Currently logged in user", () => {
    it("should be able to get their details", async () => {
      const getUserDetailsUseCase = makeGetCurrentUserDetailsUseCase({
        checkCredentials: passingCheckCredentials,
        getUserData: async (_userId: string) => existingMockUser,
        transformUser,
      });

      const result = await getUserDetailsUseCase({
        accessToken: createAccessToken({
          sessionId: "session01",
          userId: "user01",
        }),
        sessionId: "session01",
        userAgent: "supertestAgent",
      });
      expect(result).toEqual({
        status: "success",
        meta: "GetCurrentUserDetailsSuccess",
        data: {
          user: {
            id: "a9fa940c-02d1-4e78-823d-9c982fea7e7a",
            handle: "existingHandle",
            name: "Existing User",
            email: "existing@example.com",
            role: "CUSTOMER",
          },
        },
      });
    });
  });
  context("Fail for invalid credentials", () => {
    it("should fail for an invalid access token", async () => {
      const getUserDetailsUseCase = makeGetCurrentUserDetailsUseCase({
        checkCredentials: invalidAccessTokenCheckCredentialsUseCase,
        getUserData: async (_userId: string) => existingMockUser,
        transformUser,
      });

      const result = await getUserDetailsUseCase({
        accessToken: createAccessToken({
          sessionId: "session01",
          userId: "user01",
        }),
        sessionId: "session01",
        userAgent: "supertestAgent",
      });
      expect(result).toEqual({
        status: "failed",
        meta: "InvalidAccessTokenError",
        errors: {
          message: "Invalid access token",
        },
      });
    });
    it("should fail for an expired access token", async () => {
      const getUserDetailsUseCase = makeGetCurrentUserDetailsUseCase({
        checkCredentials: invalidAccessTokenCheckCredentialsUseCase,
        getUserData: async (_userId: string) => existingMockUser,
        transformUser,
      });

      const result = await getUserDetailsUseCase({
        accessToken: createAccessToken(
          {
            sessionId: "session01",
            userId: "user01",
          },
          "-1"
        ),
        sessionId: "session01",
        userAgent: "supertestAgent",
      });
      expect(result).toEqual({
        status: "failed",
        meta: "InvalidAccessTokenError",
        errors: {
          message: "Invalid access token",
        },
      });
    });
    it("should fail for access token with wrong session key", async () => {
      const getUserDetailsUseCase = makeGetCurrentUserDetailsUseCase({
        checkCredentials: wrongSessionKeyCheckCredentialsUseCase,
        getUserData: async (_userId: string) => existingMockUser,
        transformUser,
      });

      const result = await getUserDetailsUseCase({
        accessToken: createAccessToken({
          key: "session01",
          userId: "user01",
        }),
        sessionId: "session02",
        userAgent: "supertestAgent",
      });
      expect(result).toEqual({
        status: "failed",
        meta: "AccessTokenWithWrongSessionKeyError",
        errors: {
          message: "Access token with wrong key",
        },
      });
    });
    it("should fail for invalid session key", async () => {
      const getUserDetailsUseCase = makeGetCurrentUserDetailsUseCase({
        checkCredentials: invalidSessionKeyCheckCredentialsUseCase,
        getUserData: async (_userId: string) => existingMockUser,
        transformUser,
      });

      const result = await getUserDetailsUseCase({
        accessToken: createAccessToken({
          key: "session01",
          userId: "user01",
        }),
        sessionId: "session01",
        userAgent: "supertestAgent",
      });
      expect(result).toEqual({
        status: "failed",
        meta: "InvalidSessionKeyError",
        errors: {
          message: "Invalid session key",
        },
      });
    });
    it("should fail for invalid user agent", async () => {
      const getUserDetailsUseCase = makeGetCurrentUserDetailsUseCase({
        checkCredentials: passingCheckCredentials,
        getUserData: async (_userId: string) => existingMockUser,
        transformUser,
      });

      const result = await getUserDetailsUseCase({
        accessToken: createAccessToken({
          key: "session01",
          userId: "user01",
        }),
        sessionId: "session01",
        userAgent: "superDomAgent",
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

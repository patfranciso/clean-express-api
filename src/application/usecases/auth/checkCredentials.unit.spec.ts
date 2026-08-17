import expect from "expect";

import { createAccessToken } from "@/impl/services/cryptography.impl";
import {
  passingCheckCredentials,
  invalidAccessTokenCheckCredentialsUseCase,
  expiredAccessTokenCheckCredentials,
  wrongSessionKeyCheckCredentialsUseCase,
  invalidSessionKeyCheckCredentialsUseCase,
  invalidUserAgentCheckCredentialsUseCase,
} from "./checkCredentialsUseCase.mock";

describe("checkCredentials unit tests", () => {
  context("Valid credentials", () => {
    it("should pass the check", async () => {
      const result = await passingCheckCredentials({
        sessionId: "session01",
        accessToken: createAccessToken({
          userId: "user01",
          key: "session01",
          userAgent: "supertestAgent",
        }),
        userAgent: "supertestAgent",
      });
      expect(result).toEqual({ tag: "ok", value: "user01" });
    });
  });
  context("Invalid credentials", () => {
    it("should fail for an invalid access token", async () => {
      const result = await invalidAccessTokenCheckCredentialsUseCase({
        sessionId: "session01",
        accessToken: createAccessToken({
          userId: "user01",
          key: "session01",
          userAgent: "supertestAgent",
        }),
        userAgent: "supertestAgent",
      });
      expect(result).toEqual({ tag: "er", err: "InvalidAccessTokenError" });
    });
    it("should fail for an expired access token", async () => {
      const result = await expiredAccessTokenCheckCredentials({
        sessionId: "session01",
        accessToken: createAccessToken(
          {
            userId: "user01",
            key: "session01",
            userAgent: "supertestAgent",
          },
          "-1"
        ),
        userAgent: "supertestAgent",
      });
      expect(result).toEqual({ tag: "er", err: "InvalidAccessTokenError" });
    });
    it("should fail for access token with wrong session key", async () => {
      const result = await wrongSessionKeyCheckCredentialsUseCase({
        sessionId: "session01",
        accessToken: createAccessToken({
          userId: "user01",
          key: "session02",
          userAgent: "supertestAgent",
        }),
        userAgent: "supertestAgent",
      });
      expect(result).toEqual({
        tag: "er",
        err: "AccessTokenWithWrongSessionKeyError",
      });
    });
    it("should fail for invalid session key", async () => {
      const result = await invalidSessionKeyCheckCredentialsUseCase({
        sessionId: "session01",
        accessToken: createAccessToken({
          userId: "user01",
          key: "session01",
          userAgent: "supertestAgent",
        }),
        userAgent: "supertestAgent",
      });
      expect(result).toEqual({
        tag: "er",
        err: "InvalidSessionKeyError",
      });
    });
    it("should fail for invalid user agent", async () => {
      const result = await invalidUserAgentCheckCredentialsUseCase({
        sessionId: "session01",
        accessToken: createAccessToken({
          userId: "user01",
          key: "session01",
          userAgent: "superDom",
        }),
        userAgent: "superDom",
      });
      expect(result).toEqual({
        tag: "er",
        err: "InvalidUserAgentError",
      });
    });
  });
});

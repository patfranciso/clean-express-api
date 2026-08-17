import expect from "expect";

import { LoginInput, LoginResult, mapLoginError } from "./login.usecase";
import {
  invalidUserPasswordLoginUseCase,
  newValidUserDataLoginUseCase,
  unknownUserAgentLoginUseCase,
  unknownUserEmailLoginUseCase,
} from "./login.usecase.mock";
import { defaultMockUser } from "@/test/mocks/entities/user.entity.mock";

describe("LoginUseCase Unit Tests", () => {
  context("Successful login", () => {
    it("should return success result for valid input data", async () => {
      const payload: LoginInput = {
        email: "pat@example.com",
        password: "password",
        userAgent: "supertestAgent",
      };

      const result: LoginResult = await newValidUserDataLoginUseCase(payload);
      expect(result.status).toEqual("success");
      expect(result.meta).toBe("LoginSuccess");
      expect(result).toEqual({
        status: "success",
        meta: "LoginSuccess",
        data: {
          user: {
            key: "session01",
            role: "CUSTOMER",
            username: "pat",
            userId: defaultMockUser.id,
          },
          accessToken: `accessToken-${defaultMockUser.id}`,
          refreshToken: `refreshToken-${defaultMockUser.id}`,
        },
      });
    });
  });
  context("Failed login", () => {
    context("Validation errors", () => {
      it("should fail when all fields are empty", async () => {
        const payload: LoginInput = {
          email: "",
          password: "",
          userAgent: "supertestAgent",
        };

        const result = await newValidUserDataLoginUseCase(payload);
        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "LoginValidationError",
          errors: {
            email: ["Invalid email"],
            password: ["Password must contain at least 8 character(s)"],
          },
        });
      });
    });

    context("Checking for an unknown user", () => {
      it("should fail for an unknown email", async () => {
        const input: LoginInput = {
          email: "pat@example.com",
          password: "password",
          userAgent: "supertestAgent",
        };
        const result = await unknownUserEmailLoginUseCase(input);
        expect(result).toEqual(mapLoginError("InvalidEmailError"));
      });

      it("should fail for an unknown password", async () => {
        const input: LoginInput = {
          email: "pat@example.com",
          password: "password2",
          userAgent: "supertestAgent",
        };
        const result = await invalidUserPasswordLoginUseCase(input);
        expect(result).toEqual(mapLoginError("InvalidPasswordError"));
      });
    });

    context("Unknown User Agent", async () => {
      it("should return unknown user agent error", async () => {
        const input: LoginInput = {
          email: "pat@example.com",
          password: "password2",
          userAgent: "",
        };
        const result = await unknownUserAgentLoginUseCase(input);
        expect(result).toEqual(mapLoginError("UnknownUserAgentError"));
      });
    });
  });
});

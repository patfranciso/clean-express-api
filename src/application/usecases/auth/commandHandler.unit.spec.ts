import commandHandler from "@/impl/commands/commandHandler";
import expect from "expect";
import { SignupInput, SignupResult } from "./signup.usecase";
import { throwingSignupUseCase } from "./signup.usecase.mock";
import { LoginInput } from "./login.usecase";
import { throwingLoginUseCase } from "./login.usecase.mock";
import {
  verifyRefreshToken,
  createRefreshToken,
} from "@/impl/services/cryptography.impl";
import { defaultSessionMock } from "@/test/mocks/entities/session.entity.mock";
import { makeLogoutUseCase } from "./logout.usecase";
import { validateLogoutInput } from "./logout.validate";

describe("Command Handler function", async () => {
  context("Unexpected signup Errors", () => {
    it("should handle unexpected errors gracefully", async () => {
      const input: SignupInput = {
        handle: "xpat",
        name: "XPat Example",
        email: "xpat@example.com",
        password: "password",
        confirmPassword: "password",
        role: "CUSTOMER",
      };
      const holla = commandHandler(throwingSignupUseCase, "Signup");
      const result = await holla(input);
      expect(result.meta).toBe("SignupUnexpectedError");
      if (result.meta === "SignupUnexpectedError") {
        expect(result).toEqual({
          status: "error",
          meta: "SignupUnexpectedError",
          errors: { message: expect.any(String) },
        });
      }
    });
    it("should handle unexpected errors with a custom function", async () => {
      const input: SignupInput = {
        handle: "xpat",
        name: "XPat Example",
        email: "xpat@example.com",
        password: "password",
        confirmPassword: "password",
        role: "CUSTOMER",
      };
      const expected = {
        status: "error",
        meta: "SignupUnexpectedError",
        errors: { message: "Signup Error" },
      } as SignupResult;
      const holla = commandHandler(throwingSignupUseCase, (x: unknown) => {
        return expected;
      });
      const result = await holla(input);
      expect(result).toEqual(expected);
    });
  });
  context("Unexpected Login Errors", () => {
    it("should handle unexpected login errors gracefully", async () => {
      const input: LoginInput = {
        email: "pat@example.com",
        password: "password2",
        userAgent: "superTest",
      };
      const holla = commandHandler(throwingLoginUseCase, "Login");
      const result = await holla(input);
      expect(result.meta).toEqual("LoginUnexpectedError");
      if (result.meta === "LoginUnexpectedError") {
        expect(result).toEqual({
          status: "error",
          meta: "LoginUnexpectedError",
          errors: { message: expect.any(String) },
        });
      }
    });
  });
  context("Unexpected Logout Errors", async () => {
    it("should handle unexpected errors gracefully", async () => {
      const useCase = makeLogoutUseCase({
        validate: validateLogoutInput,
        decodeRefreshToken: verifyRefreshToken,
        deactivateSession: async (x) => {
          throw new Error("Unexpected Logout Error");
        },
        findSessionByKey: async (k) => defaultSessionMock,
      });
      const holla = commandHandler(useCase, "Logout");
      const result = await holla({
        userAgent: "supertestAgent",
        refreshToken: createRefreshToken(
          {
            userId: "user01",
            key: "session01",
          },
          "15m"
        ),
      });
      expect(result.meta).toEqual("LogoutUnexpectedError");
      if (result.meta === "LogoutUnexpectedError") {
        expect(result).toEqual({
          status: "error",
          meta: "LogoutUnexpectedError",
          errors: { message: expect.any(String) },
        });
      }
    });
  });
});

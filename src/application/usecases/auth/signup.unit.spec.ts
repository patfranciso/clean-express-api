import expect from "expect";

import {
  mapSignupError,
  SignupInput,
} from "@/application/usecases/auth/signup.usecase";
import {
  existingUserSignupUseCase,
  newValidUserDataSignupUseCase,
  throwingSignupUseCase,
} from "@/application/usecases/auth/signup.usecase.mock";
import {
  existingHandle,
  existingEmail,
} from "@/test/mocks/entities/user.entity.mock";

describe("SignupUseCase Unit Tests", () => {
  context("Successful signup", () => {
    it("should return success result for valid input data", async () => {
      const payload: SignupInput = {
        handle: "pat",
        name: "Pat Example",
        email: "pat@example.com",
        password: "password",
        confirmPassword: "password",
        role: "CUSTOMER",
      };

      const result = await newValidUserDataSignupUseCase(payload);
      expect(result.status).toEqual("success");
      expect(result.meta).toEqual("SignupSuccess");
      expect(result.status).toEqual("success");
      if (result.status === "success") {
        expect(result.data.user.email).toEqual("pat@example.com");
        expect(result.data.user.handle).toEqual("pat");
      }
    });
  });

  context("Failed signup", () => {
    context("Validation errors", () => {
      it("should fail when all fields are empty", async () => {
        const payload: SignupInput = {
          handle: "",
          email: "",
          name: "",
          password: "",
          confirmPassword: "",
          role: "CUSTOMER",
        };

        const result = await newValidUserDataSignupUseCase(payload);
        expect(result.status).toEqual("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "SignupValidationError",
          errors: {
            handle: ["Handle must contain at least 3 character(s)"],
            name: ["Your Name must contain at least 3 character(s)"],
            email: ["Invalid email"],
            password: ["Password must contain at least 8 character(s)"],
            confirmPassword: [
              "Confirm Password must contain at least 8 character(s)",
            ],
          },
        });
      });

      it("should fail when handle is blank", async () => {
        const payload: SignupInput = {
          handle: "",
          email: "pat@example.com",
          name: "Pat Example",
          password: "password",
          confirmPassword: "password",
          role: "CUSTOMER",
        };

        const result = await newValidUserDataSignupUseCase(payload);
        expect(result.status).toEqual("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "SignupValidationError",
          errors: {
            handle: ["Handle must contain at least 3 character(s)"],
          },
        });
      });
    });

    context("Checking for an existing user", () => {
      it("should fail for an existing handle", async () => {
        const input: SignupInput = {
          handle: existingHandle,
          email: "pat@example.com",
          name: "Pat Example",
          password: "password",
          confirmPassword: "password",
          role: "CUSTOMER",
        };
        const result = await existingUserSignupUseCase(input);
        expect(result).toEqual(mapSignupError("UniqueFieldError"));
      });

      it("should fail for an existing email", async () => {
        const input: SignupInput = {
          handle: "pat",
          email: existingEmail,
          name: "Existing User",
          password: "password",
          confirmPassword: "password",
          role: "CUSTOMER",
        };
        const result = await existingUserSignupUseCase(input);
        expect(result).toEqual(mapSignupError("UniqueFieldError"));
      });

      it("but should pass for a new handle and email", async () => {
        const input: SignupInput = {
          handle: "pat",
          name: "Pat Example",
          email: "pat@example.com",
          password: "password",
          confirmPassword: "password",
          role: "CUSTOMER",
        };
        const result = await existingUserSignupUseCase(input);
        expect(result.status).toEqual("success");
        expect(result.meta).toEqual("SignupSuccess");
        expect(result.status).toEqual("success");
        if (result.status === "success") {
          expect(result.data.user.email).toEqual("pat@example.com");
          expect(result.data.user.handle).toEqual("pat");
        }
      });
    });
  });
});

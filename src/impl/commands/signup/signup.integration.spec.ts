import expect from "expect";
import supertest from "supertest";

import { defaultMockUser } from "@/test/mocks/entities/user.entity.mock";
import {
  mapSignupError,
  SignupInput,
} from "@/application/usecases/auth/signup.usecase";
import createServer from "@/server";
import "@/test/setup";
import { getExistingUserInput } from "@/impl/commands/signup/signup.request.mock";

const app = createServer();

describe("SignupUseCase Integration Tests", () => {
  beforeEach(async () => {
    const existingUserInput = getExistingUserInput();
    await supertest(app).post("/signup").send(existingUserInput);
  });

  context("Successful signup", () => {
    it("should return success result for valid input data", async () => {
      const input: SignupInput = {
        handle: "pat1",
        email: "pat1@example.com",
        name: "Pat1 Example",
        password: "password",
        confirmPassword: "password",
        role: "CUSTOMER",
      };
      const response = await supertest(app).post(`/signup`).send(input);
      expect(response.status).toEqual(200);
      expect(response.body.data.email).toEqual(input.email);
      expect(response.body.data.handle).toEqual(input.handle);
      expect(response.body.data.name).toEqual(input.name);
    });
  });

  context("Failed signup", () => {
    context("Validation errors", () => {
      it("should fail when all fields are empty", async () => {
        const response = await supertest(app).post(`/signup`);
        const output = {
          errors: {
            handle: ["Handle is required"],
            name: ["Name is required"],
            email: ["Email is required"],
            password: ["Password is required"],
            confirmPassword: ["ConfirmPassword is required"],
            role: ["Role is required"],
          },
        };
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(output);
      });

      it("should fail when handle is blank", async () => {
        const input: SignupInput = {
          handle: "",
          email: "pat@example.com",
          name: "Pat Example",
          password: "password",
          confirmPassword: "password",
          role: "CUSTOMER",
        };
        const output = {
          errors: {
            handle: ["Handle must contain at least 3 character(s)"],
          },
        };
        const response = await supertest(app).post(`/signup`).send(input);

        expect(response.status).toEqual(400);
        expect(response.body).toEqual(output);
      });
    });

    context("Checking for an existing user", () => {
      const uniqueFieldError = mapSignupError("UniqueFieldError");
      const failedSignupResult = {
        errors: (uniqueFieldError as { status: "failed"; errors: any }).errors,
      };

      it("should fail for an existing handle", async () => {
        const existingUserInput = getExistingUserInput();
        const response = await supertest(app)
          .post(`/signup`)
          .send(existingUserInput);

        expect(response.status).toEqual(400);
        expect(response.body).toEqual(failedSignupResult);
      });

      it("should fail for an existing email", async () => {
        const existingUserInput = getExistingUserInput();
        const response = await supertest(app)
          .post(`/signup`)
          .send({ ...existingUserInput, handle: "pat" });

        expect(response.status).toEqual(400);
        expect(response.body).toEqual(failedSignupResult);
      });

      it("but should pass for a new handle and email", async () => {
        const response = await supertest(app).post(`/signup`).send({
          email: defaultMockUser.email,
          handle: defaultMockUser.handle,
          name: defaultMockUser.name,
          password: defaultMockUser.password,
          confirmPassword: defaultMockUser.password,
          role: defaultMockUser.role,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data.email).toEqual(defaultMockUser.email);
        expect(response.body.data.handle).toEqual(defaultMockUser.handle);
        expect(response.body.data.name).toEqual(defaultMockUser.name);
      });
    });
  });
});

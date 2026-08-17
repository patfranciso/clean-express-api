import expect from "expect";
import supertest from "supertest";

import createServer from "@/server";
import "@/test/setup";
import { getExistingUserInput } from "@/impl/commands/signup/signup.request.mock";
import { LoginInput } from "@/application/usecases/auth/login.usecase";
import getCookieValue from "@/utils/getCookieValue";

const app = createServer();

describe("LoginUseCase Integration Tests", () => {
  const existingUserInput = getExistingUserInput();
  beforeEach(async () => {
    await supertest(app).post("/signup").send(existingUserInput);
  });
  context("Successful login", () => {
    it("should return success result for valid input data", async function () {
      const input: LoginInput = {
        email: existingUserInput.email,
        password: existingUserInput.password,
        userAgent: "supertestAgent",
      };
      const response = await supertest(app)
        .post("/login")
        .send(input)
        .set("user-agent", "supertestAgent");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: {
          user: {
            userId: expect.any(String),
            role: expect.any(String),
            username: expect.any(String),
            key: undefined,
          },
          accessToken: expect.any(String),
          refreshToken: undefined,
        },
      });
      const setCookieHeaders = response.headers["set-cookie"];

      const refreshToken = getCookieValue(setCookieHeaders, "refreshToken");
      const key = getCookieValue(setCookieHeaders, "key");

      // Assert that the cookie was set and has the expected value
      expect(refreshToken).toBeDefined();
      expect(key).toBeDefined();
    });
  });

  context("Failed login", () => {
    context("Validation errors", () => {
      it("should fail when all fields are empty", async () => {
        const result = {
          errors: {
            email: ["Email is required"],
            password: ["Password is required"],
          },
        };
        const response = await supertest(app).post(`/login`);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(result);
      });
    });
    context("Checking for an unknown user", () => {
      const unknownUserError = {
        errors: {
          message: "Wrong email or password",
        },
      };
      it("should fail for an unknown email", async () => {
        const input: LoginInput = {
          email: "pat2@example.com",
          password: "password",
          userAgent: "supertestAgent",
        };
        const response = await supertest(app).post(`/login`).send(input);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(unknownUserError);
      });

      it("should fail for an unknown password", async () => {
        const input: LoginInput = {
          email: "existing@example.com",
          password: "wrong_password",
          userAgent: "supertestAgent",
        };
        const response = await supertest(app).post(`/login`).send(input);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(unknownUserError);
      });
    });
    context("Unknown User Agent", () => {
      it("should return unknown user agent message", async () => {
        const unknownUserError = {
          errors: {
            message: "Unknown user agent",
          },
        };
        const input: LoginInput = {
          email: "existing@example.com",
          password: "hashedPass",
          userAgent: "",
        };
        const response = await supertest(app).post("/login").send(input);
        expect(response.body).toEqual(unknownUserError);
      });
    });
  });
});

import expect from "expect";
import supertest from "supertest";

import "@/test/setup";
import createServer from "@/server";
import { createAccessToken } from "@/impl/services/cryptography.impl";
import { getExistingUserInput } from "@/impl/commands/signup/signup.request.mock";
import SessionModel from "@/impl/mongoose/models/session.model";
import { InvalidAccessTokenError } from "@/application/usecases/auth/getCurrentDetails.usecase";
import getCookieValue from "@/utils/getCookieValue";

const app = createServer();
describe("GetCurrentDetails integration tests", () => {
  const existingUserInput = getExistingUserInput();
  let key: string | undefined;
  let accessToken: string | undefined;
  beforeEach(async () => {
    await supertest(app).post("/signup").send(existingUserInput);
    const loginResult = await supertest(app)
      .post("/login")
      .send({
        email: existingUserInput.email,
        password: existingUserInput.password,
      })
      .set("user-agent", "supertestAgent");

    const cookieHeaders = loginResult.headers["set-cookie"];
    key = getCookieValue(cookieHeaders, "key");
    accessToken = loginResult.body.data.accessToken;
    // console.log({ key });
  });
  context("Currently logged in user", () => {
    it("should be able to get their details", async () => {
      const response = await supertest(app)
        .get("/me")
        .set("user-agent", "supertestAgent")
        .set("Authorization", `Bearer ${accessToken}`)
        .set("Cookie", ["key=" + key]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        data: {
          user: {
            id: expect.any(String),
            email: expect.any(String),
            handle: expect.any(String),
            name: expect.any(String),
            role: "CUSTOMER",
          },
        },
      });
    });
  });
  context("Fail for invalid credentials", () => {
    it("should fail for an invalid access token", async () => {
      const accessToken = "invalidAccessToken";
      const response = await supertest(app)
        .get("/me")
        .set("user-agent", "supertestAgent")
        .set("Authorization", `Bearer ${accessToken}`)
        .set("Cookie", ["key=session01"]);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: "failed",
        errors: {
          message: InvalidAccessTokenError.errors.message,
        },
      });
    });
    it("should fail for an expired access token", async () => {
      const accessToken = createAccessToken({}, "-1");
      const response = await supertest(app)
        .get("/me")
        .set("user-agent", "supertestAgent")
        .set("Authorization", `Bearer ${accessToken}`)
        .set("Cookie", ["key=session01"]);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: "failed",
        errors: {
          message: "Invalid access token",
        },
      });
    });
    it("should fail for access token with wrong session key", async () => {
      const response = await supertest(app)
        .get("/me")
        .set("user-agent", "supertestAgent")
        .set("Authorization", `Bearer ${accessToken}`)
        .set("Cookie", "key=wrongSessionKey");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: "failed",
        errors: { message: "Access token with wrong key" },
      });
    });
    it("\x1b[45m should fail for inactive session \x1b[0m", async () => {
      await SessionModel.updateOne({ _id: key }, { isActive: false });
      const response = await supertest(app)
        .get("/me")
        .set("user-agent", "wrongUserAgent")
        .set("Authorization", `Bearer ${accessToken}`)
        .set("Cookie", "key=" + key);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: "failed",
        errors: { message: "Invalid session key" },
      });
    });
    it("should fail for invalid session key", async () => {
      await SessionModel.deleteOne({ _id: key });

      const response = await supertest(app)
        .get("/me")
        .set("user-agent", "supertestAgent")
        .set("Authorization", `Bearer ${accessToken}`)
        .set("Cookie", "key=" + key);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: "failed",
        errors: { message: "Invalid session key" },
      });
    });

    it("should fail for invalid user agent", async () => {
      const response = await supertest(app)
        .get("/me")
        .set("user-agent", "wrongUserAgent")
        .set("Authorization", `Bearer ${accessToken}`)
        .set("Cookie", "key=" + key);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: "failed",
        errors: { message: "Invalid user agent" },
      });
    });
  });
});

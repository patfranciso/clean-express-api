import expect from "expect";
import supertest from "supertest";

import createServer from "@/server";
import "@/test/setup";
import { createRefreshToken } from "@/impl/services/cryptography.impl";
import {
  loginExistingUser,
  signupExistingUser,
} from "@/test/usecases/integration/actions";

const app = createServer();

describe("refreshAccessToken integration tests", () => {
  let refreshToken: string;
  const failedResponse = {
    errors: { message: "Could not renew token" },
  };
  before(async () => {
    await signupExistingUser(app);

    const tokens = await loginExistingUser(app);
    refreshToken = tokens.refreshToken || "";
  });
  context("Valid refresh token", () => {
    it("should succeed", async () => {
      const response = await supertest(app)
        .get("/refresh")
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .set("user-agent", "supertestAgent");

      expect(response.body).toEqual({
        data: { accessToken: expect.any(String) },
      });
    });
  });

  context("Fail cases", () => {
    context("for validation errors", () => {
      it("should fail for missing params", async () => {
        const response = await supertest(app).get("/refresh").set("Cookie", []);

        expect(response.body).toEqual(failedResponse);
      });
      it("should fail for empty params", async () => {
        const response = await supertest(app)
          .get("/refresh")
          .set("Cookie", [`refreshToken=xxx`])
          .set("user-agent", "");

        expect(response.body).toEqual(failedResponse);
      });
    });
    context("for invalid params", () => {
      it("should fail if the session was not found", async () => {
        const response = await supertest(app)
          .get("/refresh")
          .set("Cookie", [`refreshToken=${createRefreshToken({})}`])
          .set("user-agent", "supertestAgent");

        expect(response.body).toEqual(failedResponse);
      });
      it("should fail if the user agent is not matched", async () => {
        const response = await supertest(app)
          .get("/refresh")
          .set("Cookie", [`refreshToken=${refreshToken}`])
          .set("user-agent", "unknownClient");

        expect(response.body).toEqual(failedResponse);
      });
    });
  });
});

import expect from "expect";
import supertest from "supertest";
import _ from "lodash";

import createServer from "@/server";
import "@/test/setup";
import {
  createRefreshToken,
  verifyRefreshToken,
} from "@/impl/services/cryptography.impl";
import { Session } from "@/application/entities/session";
import SessionModel from "@/impl/mongoose/models/session.model";
import {
  loginExistingUser,
  signupExistingUser,
} from "@/test/usecases/integration/actions";
import { deactivateSession } from "@/impl/services/repo/session.repo";
import {
  SessionDeactivationFailedError,
  SessionNotFoundError,
} from "@/application/usecases/auth/logout.usecase";

const app = createServer();
async function getSessionFromRefreshToken(
  refreshToken: string
): Promise<Session> {
  const tokenData = verifyRefreshToken(refreshToken);
  const { key } = tokenData as { key: string };
  const sessionDoc:
    | null
    | ({ _id: string; __v: number } & Omit<Session, "id">) =
    await SessionModel.findById(key);
  const id = sessionDoc!._id;
  const data = _.omit(sessionDoc, ["__v", "_id"]);
  return { id, ...data } as Session;
}
describe("logout integration tests", () => {
  let refreshToken: string;
  // let key: string | undefined;
  beforeEach(async () => {
    await signupExistingUser(app);
    const tokens = await loginExistingUser(app);
    refreshToken = tokens.refreshToken || "";
    // key = tokens.key;
  });
  context("for a valid session", () => {
    it("should succeed", async () => {
      const response = await supertest(app)
        .post("/api/auth/logout")
        .set("Cookie", [`refreshToken=${refreshToken}`])
        // .set("Cookie", [`key=${key}`])
        .set("user-agent", "supertestAgent");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: { message: expect.any(String) },
      });
    });
  });
  context("fail cases", () => {
    it("should fail for empty input", async () => {
      const response = await supertest(app)
        .post("/api/auth/logout")
        .set("Cookie", [`refreshToken=  `])
        .set("user-agent", "");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: { message: expect.any(String) },
      });
    });
    it("should fail for empty params", async () => {
      const response = await supertest(app).post("/api/auth/logout");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: { message: expect.any(String) },
      });
    });
    it("should fail for expired token", async () => {
      const tokenData = verifyRefreshToken(refreshToken);
      const { userId, key } = tokenData as { userId: string; key: string };
      const newRefreshToken = createRefreshToken({ userId, key }, "-1");

      const response = await supertest(app)
        .post("/api/auth/logout")
        // .set("x-refresh", newRefreshToken)
        .set("Cookie", [`refreshToken=${newRefreshToken}`])
        .set("user-agent", "supertestAgent");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: { message: SessionNotFoundError.errors.message },
      });
    });
    it("should fail for deactivated session", async () => {
      const session = await getSessionFromRefreshToken(refreshToken);
      await deactivateSession(session.id);
      const response = await supertest(app)
        .post("/api/auth/logout")
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .set("user-agent", "supertestAgent");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: { message: SessionDeactivationFailedError.errors.message },
      });
    });
    it("should fail for invalid session", async () => {
      const response = await supertest(app)
        .post("/api/auth/logout")
        .set("Cookie", ["refreshToken=unknown token"])
        .set("user-agent", "supertestAgent");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: { message: expect.any(String) },
      });
    });
    it("should fail for invalid userAgent", async () => {
      const response = await supertest(app)
        .post("/api/auth/logout")
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .set("user-agent", "unknownAgent");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: { message: expect.any(String) },
      });
    });
  });
});

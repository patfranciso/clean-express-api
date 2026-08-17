import expect from "expect";
import { authCheck } from "@/application/usecases/middleware/authCheck";
import { createAccessToken } from "@/impl/services/cryptography.impl";

describe("authCheck Unit Tests", () => {
  context("When a valid token is provided", () => {
    it("should return the decoded user", () => {
      const userPayload = { id: "123", role: "user" };
      const token = createAccessToken(userPayload);
      const { user, error } = authCheck(token);
      expect(error).toBeNull();
      expect(user).toMatchObject(userPayload);
    });
  });

  context("When an invalid token is provided", () => {
    it("should return an error", () => {
      const { user, error } = authCheck("invalid-token");
      expect(user).toBeNull();
      expect(error).toEqual({
        status: 401,
        message: "Unauthorised user",
      });
    });
  });

  context("When no token is provided", () => {
    it("should return an error", () => {
      const { user, error } = authCheck();
      expect(user).toBeNull();
      expect(error).toEqual({
        status: 401,
        message: "Unauthorised user",
      });
    });
  });
});

import { Express } from "express";
import supertest from "supertest";

import { getExistingUserInput } from "@/impl/commands/signup/signup.request.mock";
import getCookieValue from "@/utils/getCookieValue";

export const signupExistingUser = async (app: Express) => {
  const existingUserInput = getExistingUserInput();
  await supertest(app).post("/signup").send(existingUserInput);
};

export const loginExistingUser = async (app: Express) => {
  const existingUserInput = getExistingUserInput();
  const response = await supertest(app)
    .post("/login")
    .send(existingUserInput)
    .set("user-agent", "supertestAgent");
  const accessToken = response.body.data.accessToken;
  // const refreshToken = response.body.data.refreshToken;

  const cookieHeaders = response.headers["set-cookie"];

  const refreshToken = getCookieValue(cookieHeaders, "refreshToken");
  const key = getCookieValue(cookieHeaders, "key");

  return { accessToken, refreshToken, key };
};

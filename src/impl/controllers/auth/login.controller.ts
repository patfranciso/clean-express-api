import { Request, Response } from "express";

import _ from "lodash";
import { logger } from "@/utils/logger";

import { LoginInput } from "@/application/usecases/auth/login.usecase";

import {
  TypedRequestBody,
  TypedResponse,
} from "@/infrastructure/types/express";
import getUserAgent from "../common/getUserAgent";
import { loginCommand } from "@/impl/commands/login/login.command";
import presentLoginResult from "./login.presenter";
import commandHandler from "@/impl/commands/commandHandler";

export async function loginController(
  req: TypedRequestBody<LoginInput>,
  res: TypedResponse<any>
) {
  const input = req.body;
  input.userAgent = getUserAgent(req as Request);

  const handler = commandHandler(loginCommand, "Login");
  const result = await handler(input);

  // Log the result for auditing and debugging
  logger.info({
    type: "Login attempt result",
    status: result.status,
    meta: result.meta,
    email: input.email,
    ip: req.ip,
    userAgent: input.userAgent,
    // Don't log sensitive data
    ...(result.status === "failed" && { errors: result.errors }),
  });

  const output = presentLoginResult(result);
  const prodMode = process.env.NODE_ENV === "production";

  // Set secure cookies with additional security options
  const cookieOptions = {
    httpOnly: true,
    secure: prodMode,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "strict" as const,
    // Add additional security in production
    ...(prodMode && {
      domain: process.env.COOKIE_DOMAIN,
      path: "/",
    }),
  };

  if (output.data?.refreshToken) {
    res.cookie("refreshToken", output.data.refreshToken, cookieOptions);
  }
  if (output.data?.user?.key) {
    res.cookie("key", output.data.user.key, cookieOptions);
  }

  // Omit sensitive information before sending the response
  const responseData = output.data
    ? {
        user: _.omit(output.data.user, ["key"]),
        accessToken: output.data.accessToken,
      }
    : null;

  return res
    .status(output.statusCode)
    .json(
      output.statusCode === 200
        ? { data: responseData }
        : { errors: output.errors }
    );
}

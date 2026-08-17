import { logger } from "@/utils/logger";
import { User } from "@/application/entities/user";
import { SignupInput } from "@/application/usecases/auth/signup.usecase";
import { signupCommand } from "@/impl/commands/signup/signup.command";

import {
  TypedRequestBody,
  TypedResponse,
} from "@/infrastructure/types/express";
import presentSignupResult from "./signup.presenter";
import commandHandler from "@/impl/commands/commandHandler";

export type SignupResponse =
  | { data: Partial<User> }
  | { errors: Record<string, any> };

export async function signupController(
  req: TypedRequestBody<SignupInput>,
  res: TypedResponse<SignupResponse>
) {
  const signupInput: SignupInput = req.body;

  // Log the incoming request
  logger.info({
    type: "Signup attempt input",
    email: signupInput.email,
    ip: req.ip,
    handle: signupInput.handle,
  });

  const handler = commandHandler(signupCommand, "Signup");
  const result = await handler(signupInput);

  // Log the result for auditing and debugging
  logger.info({
    type: "Signup attempt result",
    status: result.status,
    meta: result.meta,
    email: signupInput.email,
    ip: req.ip,
    // Don't log sensitive data
    ...(result.status === "failed" && { errors: result.errors }),
  });

  const response = presentSignupResult(result);
  return res
    .status(response.statusCode)
    .json(
      response.statusCode === 200
        ? { data: response.data! }
        : { errors: response.errors! }
    );
}

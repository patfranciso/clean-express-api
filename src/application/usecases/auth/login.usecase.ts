import { isEr, CanFail } from "@/utils/canFail";
import { HashComparer } from "@/application/boundaries/cryptography.def";
import { Session } from "@/application/entities/session";
import { FindUserByEmail } from "@/application/boundaries/entity-gateway/user.gateway";
import { CreateSession } from "@/application/boundaries/entity-gateway/session.gateway";
import { User } from "@/application/entities/user";

/**
 * Result of a login attempt.
 * Discriminated union to ensure type safety for success/failure handling.
 */
export type LoginResult =
  | { status: "success"; meta: "LoginSuccess"; data: LoginSuccessData }
  | {
      status: "failed";
      meta: LoginFailure;
      errors: LoginErrors;
    }
  | { status: "error"; meta: "LoginUnexpectedError"; errors: any };

/**
 * Possible failure reasons for login.
 * Add new cases here if needed, and update messageMap accordingly.
 */
export type LoginFailure =
  | "LoginValidationError"
  | "InvalidEmailError"
  | "InvalidPasswordError"
  | "UnknownUserAgentError";

/**
 * Maps a login failure reason to a structured error result.
 * @param error The specific failure type.
 * @returns A failed LoginResult with the corresponding error message(s).
 * @throws Error if the error type is unmapped (for safety).
 */
export const mapLoginError = (
  error: LoginFailure,
  payload: Record<string, any> = {}
): LoginResult => {
  const messageMap: Record<LoginFailure, string | string[]> = {
    InvalidEmailError: "Wrong email or password",
    InvalidPasswordError: "Wrong email or password",
    UnknownUserAgentError: "Unknown user agent",
    LoginValidationError: [
      "Validation failed.",
      "Please check your input fields.",
    ],
  };

  const message = messageMap[error];
  if (!message) {
    throw new Error(`Unhandled LoginFailure: ${error}`);
  }

  if (error === "LoginValidationError") {
    return {
      status: "failed",
      meta: "LoginValidationError",
      errors: payload,
    };
  }

  return {
    status: "failed",
    meta: error,
    errors: { message },
  };
};

export const makeLoginUseCase =
  ({
    validate,
    findUserByEmail,
    passwordChecker,
    createAccessToken,
    createRefreshToken,
    createSession,
  }: MakeLoginUseCaseProps) =>
  async (input: LoginInput): Promise<LoginResult> => {
    const result = validate(input);

    if (isEr(result)) {
      return mapLoginError("LoginValidationError", result.err);
    }

    const existingUser = await findUserByEmail(input.email);

    if (!existingUser) {
      return mapLoginError("InvalidEmailError");
    }

    const isCorrectPassword: boolean = await passwordChecker(
      input.password,
      existingUser.password
    );

    if (!isCorrectPassword) {
      return mapLoginError("InvalidPasswordError");
    }

    const { userAgent } = input;
    if (userAgent.length === 0) {
      return mapLoginError("UnknownUserAgentError");
    }
    const session: Session = await createSession(existingUser.id, userAgent);

    const userData: LoginSuccessData["user"] = {
      userId: existingUser.id,
      key: session.id,
      role: existingUser.role as User["role"],
      username: existingUser.handle,
    };

    return {
      status: "success",
      meta: "LoginSuccess",
      data: {
        user: userData,
        accessToken: createAccessToken(userData),
        refreshToken: createRefreshToken(userData),
      },
    };
  };

export interface LoginInput {
  email: string;
  password: string;
  userAgent: string;
}

export type LoginOutput = { data: LoginSuccessData } | { errors: LoginErrors };

export type LoginSuccessData = {
  user: {
    userId: string;
    key: string;
    role?: User["role"];
    username?: User["handle"];
  };
  accessToken: string;
  refreshToken: string;
};

export type LoginSuccessResponse = {
  data: {
    user: {
      userId: string;
      // key: string;
      role?: User["role"];
      username?: User["handle"];
    };
    accessToken: string;
  };
  // refreshToken: string;
};

type LoginErrors = Record<string, any>;
type ValidateLoginInput = (
  data: LoginInput
) => CanFail<LoginErrors, LoginInput>;

export type LoginUnexpectedError = {
  status: "error";
  meta: "LoginUnexpectedError";
  errors: LoginErrors;
};

export type MakeLoginUseCaseProps = {
  validate: ValidateLoginInput;
  findUserByEmail: FindUserByEmail;
  passwordChecker: HashComparer;
  createAccessToken: (user: LoginSuccessData["user"]) => string;
  createRefreshToken: (user: LoginSuccessData["user"]) => string;
  createSession: CreateSession;
};

import { CanFail } from "@/utils/canFail";
import { DecodeRefreshToken } from "./refreshAccessToken.usecase";
import { isEr } from "@/utils/canFail";
import {
  INVALID_REFRESH_TOKEN_ERROR,
  INVALID_USER_AGENT_ERROR,
} from "../common/constants";
import {
  DeactivateSession,
  FindSessionByKey,
} from "@/application/boundaries/entity-gateway/session.gateway";

export const makeLogoutUseCase =
  ({
    validate,
    decodeRefreshToken,
    findSessionByKey,
    deactivateSession,
  }: MakeLogoutUseCaseProps) =>
  async (input: LogoutInput): Promise<LogoutResult> => {
    const result = validate(input);
    if (isEr(result)) {
      return InputValidationError;
    }
    const decodedToken = decodeRefreshToken(input.refreshToken);
    if (decodedToken === null) return InvalidRefreshTokenError as LogoutFailure;
    const { key } = decodedToken;
    const session = await findSessionByKey(key);
    if (session === null) return SessionNotFoundError;
    if (session.userAgent !== input.userAgent) {
      return InvalidUserAgentError as LogoutFailure;
    }
    const disabledSession = await deactivateSession(key);
    if (!disabledSession) {
      return SessionDeactivationFailedError;
    }
    return LogoutSuccessResult;
  };

export interface LogoutInput {
  refreshToken: string;
  userAgent: string;
}

type LogoutErrors = Record<string, any>;
type ValidateLogoutInput = (
  data: LogoutInput
) => CanFail<LogoutErrors, LogoutInput>;

export type LogoutSuccess = {
  status: "success";
  meta: "LogoutSuccess";
  data: Record<string, any>;
};
export const LogoutSuccessResult: LogoutSuccess = {
  status: "success",
  meta: "LogoutSuccess",
  data: { message: "success" },
};
export type LogoutFailure = {
  status: "failed";
  meta:
    | "InputValidationError"
    | "InvalidRefreshTokenError"
    | "SessionDeactivationFailedError"
    | "SessionNotFoundError"
    | "InvalidUserAgentError";
  errors: LogoutErrors;
};
export const InvalidUserAgentError = INVALID_USER_AGENT_ERROR as LogoutFailure;
export const InvalidRefreshTokenError =
  INVALID_REFRESH_TOKEN_ERROR as LogoutFailure;

export type LogoutUnexpectedError = {
  status: "error";
  meta: "LogoutUnexpectedError";
  errors: LogoutErrors;
};
export type LogoutResult =
  | LogoutSuccess
  | LogoutFailure
  | LogoutUnexpectedError;

export type LogoutOutput =
  | { data: LogoutSuccess["data"] }
  | { errors: LogoutErrors };

export const InputValidationError: LogoutResult = {
  status: "failed",
  meta: "InputValidationError",
  errors: { message: "Input validation error" },
};

export const SessionNotFoundError: LogoutFailure = {
  status: "failed",
  meta: "SessionNotFoundError",
  errors: { message: "The provided refresh token is invalid" },
};

export const SessionDeactivationFailedError: LogoutFailure = {
  status: "failed",
  meta: "SessionDeactivationFailedError",
  errors: { message: "Session could not be deactivated" },
};

export type LogoutUseCase = (input: LogoutInput) => Promise<LogoutResult>;

export type MakeLogoutUseCaseProps = {
  validate: ValidateLogoutInput;
  decodeRefreshToken: DecodeRefreshToken;
  findSessionByKey: FindSessionByKey;
  deactivateSession: DeactivateSession;
};

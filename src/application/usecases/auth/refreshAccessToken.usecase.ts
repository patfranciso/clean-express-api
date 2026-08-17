import { CanFail, isEr } from "@/utils/canFail";
import { DecodeAccessToken } from "../common/checkCredentials.service";
import { LoginSuccessData } from "./login.usecase";
import { INVALID_REFRESH_TOKEN_ERROR } from "../common/constants";
import { FindUserById } from "@/application/boundaries/entity-gateway/user.gateway";
import { FindSessionByKey } from "@/application/boundaries/entity-gateway/session.gateway";
import chalk from "chalk";

export const makeRefreshAccessTokenUseCase =
  ({
    validate,
    decodeRefreshToken,
    findSessionByKey,
    createAccessToken,
  }: MakeRefreshAccessTokenUseCaseProps) =>
  async (input: RefreshAccessTokenInput): Promise<RefreshAccessTokenResult> => {
    const result = validate(input);
    if (isEr(result)) {
      // console.log(chalk.redBright(JSON.stringify(result, null, 2)));

      return RefreshAccessTokenValidationError;
    }
    const decodedToken = decodeRefreshToken(input.refreshToken);
    if (decodedToken === null)
      return InvalidRefreshTokenError as RefreshAccessTokenFailure;
    const { userId, key } = decodedToken;
    const session = await findSessionByKey(key);
    if (session == null)
      return {
        status: "failed",
        meta: "SessionNotFoundError",
        errors: { message: "The provided refresh token is invalid" },
      };
    if (session.userAgent !== input.userAgent) {
      return {
        status: "failed",
        meta: "InvalidUserAgentError",
        errors: { message: "Invalid user agent" },
      };
    }
    const accessToken = createAccessToken({ userId, key });
    return {
      status: "success",
      meta: "RefreshAccessTokenSuccess",
      data: { accessToken },
    };
  };

export type RefreshAccessTokenOutput =
  | { data: RefreshAccessTokenSuccess["data"] }
  | { errors: RefreshAccessTokenErrors };

export type RefreshAccessTokenUnexpectedError = {
  status: "error";
  meta: "RefreshAccessTokenUnexpectedError";
  errors: RefreshAccessTokenErrors;
};
export interface RefreshAccessTokenInput {
  refreshToken: string;
  userAgent: string;
}

type RefreshAccessTokenErrors = Record<string, any>;
type ValidateRefreshAccessTokenInput = (
  data: RefreshAccessTokenInput
) => CanFail<RefreshAccessTokenErrors, RefreshAccessTokenInput>;

export type RefreshAccessTokenSuccess = {
  status: "success";
  meta: "RefreshAccessTokenSuccess";
  data: Record<string, any>;
};
type RefreshAccessTokenFailure = {
  status: "failed";
  meta:
    | "RefreshAccessTokenValidationError"
    | "InvalidRefreshTokenError"
    | Exclude<CheckSessionValidityResult, "ok">;
  errors: RefreshAccessTokenErrors;
};

export type RefreshAccessTokenResult =
  | RefreshAccessTokenSuccess
  | RefreshAccessTokenFailure
  | RefreshAccessTokenUnexpectedError;

export type DecodeRefreshToken = DecodeAccessToken;

export type CheckSessionValidityResult =
  | "ok"
  | "InvalidUserAgentError"
  | "SessionNotFoundError";

export type MakeRefreshAccessTokenUseCaseProps = {
  validate: ValidateRefreshAccessTokenInput;
  decodeRefreshToken: DecodeRefreshToken;
  findSessionByKey: FindSessionByKey;
  findUserById: FindUserById;
  createAccessToken: (u: LoginSuccessData["user"]) => string;
};

export const RefreshAccessTokenValidationError: RefreshAccessTokenFailure = {
  status: "failed",
  meta: "RefreshAccessTokenValidationError",
  errors: { message: "RefreshAccessTokenValidationError" },
};

export const InvalidRefreshTokenError =
  INVALID_REFRESH_TOKEN_ERROR as RefreshAccessTokenFailure;

export type RefreshAccessTokenUseCase = (
  input: RefreshAccessTokenInput
) => Promise<RefreshAccessTokenResult>;

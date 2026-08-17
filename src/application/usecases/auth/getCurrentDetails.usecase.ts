import { User } from "@/application/entities/user";
import { CanFail } from "@/utils/canFail";
import { isEr } from "@/utils/canFail";

export const makeGetCurrentUserDetailsUseCase =
  ({
    checkCredentials,
    getUserData,
    transformUser,
  }: MakeGetMyDetailsUseCaseProps) =>
  async (input: Credentials) => {
    const checkCredResult = await checkCredentials(input);
    if (isEr(checkCredResult)) {
      const messageMap: Record<typeof checkCredResult.err, any> = {
        InvalidAccessTokenError: (
          InvalidAccessTokenError as GetCurrentUserDetailsFailure
        ).errors.message,
        AccessTokenWithWrongSessionKeyError: (
          AccessTokenWithWrongSessionKeyError as GetCurrentUserDetailsFailure
        ).errors.message,
        InvalidSessionKeyError: (
          InvalidSessionKeyError as GetCurrentUserDetailsFailure
        ).errors.message,
        InvalidUserAgentError: (
          InvalidUserAgentError as GetCurrentUserDetailsFailure
        ).errors.message,
      };
      return {
        status: "failed",
        meta: checkCredResult.err,
        errors: { message: messageMap[checkCredResult.err] },
      };
    }

    const userData = await getUserData(checkCredResult.value);
    if (!userData) {
      return UserNotFoundError;
    }
    return {
      status: "success",
      meta: "GetCurrentUserDetailsSuccess",
      data: { user: transformUser(userData) },
    };
  };
export type UserDetailInfo = {
  id: string;
  email: string;
  handle: string;
  name: string;
};
export type Credentials = {
  sessionId: string;
  accessToken: string;
  userAgent: string;
};
export type CheckCredentialsError =
  | "InvalidAccessTokenError"
  // | "ExpiredAccessTokenError"
  | "AccessTokenWithWrongSessionKeyError"
  | "InvalidSessionKeyError"
  | "InvalidUserAgentError";
export type CheckCredentials = ({
  sessionId,
  accessToken,
  userAgent,
}: Credentials) => Promise<CanFail<CheckCredentialsError, User["id"]>>;

export type UserDetailOutput =
  | { data: GetCurrentUserDetailsSuccess["data"] }
  | { errors: Record<string, any> };

export type GetCurrentUserDetailsResult =
  | GetCurrentUserDetailsSuccess
  | GetCurrentUserDetailsFailure
  | GetCurrentUserDetailsUnexpectedError;
export type GetCurrentUserDetailsSuccess = {
  status: "success";
  meta: "GetCurrentUserDetailsSuccess";
  data: { user: UserDetailInfo };
};
export type GetCurrentUserDetailsFailure = {
  status: "failed";
  meta: CheckCredentialsError | "UserNotFoundError";
  errors: Record<string, any>;
};
export type GetCurrentUserDetailsUnexpectedError = {
  status: "error";
  meta: "GetCurrentUserDetailsUnexpectedError";
  errors: Record<string, any>;
};
export const UserNotFoundError: GetCurrentUserDetailsFailure = {
  status: "failed",
  meta: "UserNotFoundError",
  errors: { message: "User not found" },
};
export const InvalidAccessTokenError: GetCurrentUserDetailsFailure = {
  status: "failed",
  meta: "InvalidAccessTokenError",
  errors: { message: "Invalid access token" },
};
export const AccessTokenWithWrongSessionKeyError: GetCurrentUserDetailsFailure =
  {
    status: "failed",
    meta: "AccessTokenWithWrongSessionKeyError",
    errors: { message: "Access token with wrong key" },
  };
export const InvalidSessionKeyError: GetCurrentUserDetailsFailure = {
  status: "failed",
  meta: "InvalidSessionKeyError",
  errors: { message: "Invalid session key" },
};
export const InvalidUserAgentError: GetCurrentUserDetailsFailure = {
  status: "failed",
  meta: "InvalidUserAgentError",
  errors: { message: "Invalid user agent" },
};
export type GetUserData = (userId: string) => Promise<Partial<User> | null>;

export type MakeGetMyDetailsUseCaseProps = {
  checkCredentials: CheckCredentials;
  getUserData: GetUserData;
  transformUser: (user: Partial<User>) => Partial<User>;
};

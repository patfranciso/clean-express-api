import { CanFail, ok, er } from "@/utils/canFail";
import { User } from "@/application/entities/user";
import { Session } from "@/application/entities/session";
import { LoginSuccessData } from "../auth/login.usecase";
import {
  CheckCredentials,
  CheckCredentialsError,
  Credentials,
} from "../auth/getCurrentDetails.usecase";
import { GetActiveSessionData } from "@/application/boundaries/entity-gateway/session.gateway";

export type DecodeAccessToken = (
  token: string
) => ({ exp: number } & LoginSuccessData["user"]) | null;

export type CheckCredentialsProps = {
  decodeAccessToken: DecodeAccessToken;
  getActiveSessionData: GetActiveSessionData;
};
export const makeCheckCredentials =
  ({
    decodeAccessToken,
    getActiveSessionData,
  }: CheckCredentialsProps): CheckCredentials =>
  async (
    cred: Credentials
  ): Promise<CanFail<CheckCredentialsError, string>> => {
    const { sessionId, accessToken } = cred;
    const userData = decodeAccessToken(accessToken);
    if (!userData) {
      return er("InvalidAccessTokenError");
    }
    if (sessionId !== userData.key) {
      return er("AccessTokenWithWrongSessionKeyError");
    }
    const session: Session | null = await getActiveSessionData(sessionId);
    if (!session) {
      return er("InvalidSessionKeyError");
    }
    if (session.userAgent !== cred.userAgent) {
      return er("InvalidUserAgentError");
    }
    return ok(userData.userId as User["id"]);
  };

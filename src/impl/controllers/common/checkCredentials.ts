import { CheckCredentials } from "@/application/usecases/auth/getCurrentDetails.usecase";
import { makeCheckCredentials } from "@/application/usecases/common/checkCredentials.service";
import { verifyAccessToken } from "@/impl/services/cryptography.impl";
import { getActiveSessionData } from "@/impl/services/repo/session.repo";

export const checkCredentials: CheckCredentials = makeCheckCredentials({
  decodeAccessToken: verifyAccessToken,
  getActiveSessionData,
});

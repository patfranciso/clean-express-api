import { verifyAccessToken } from "@/impl/services/cryptography.impl";
import { getActiveSessionData } from "@/impl/services/repo/session.repo";
import { CheckCredentials } from "../auth/getCurrentDetails.usecase";
import { makeCheckCredentials } from "./checkCredentials.service";

export const checkCredentials: CheckCredentials = makeCheckCredentials({
  decodeAccessToken: verifyAccessToken,
  getActiveSessionData,
});

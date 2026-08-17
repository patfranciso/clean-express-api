import { env } from "@/env";
import jwt from "jsonwebtoken";

export type PrivateTokenType =
  | "accessTokenPrivateKey"
  | "refreshTokenPrivateKey";
export type PublicTokenType = "accessTokenPublicKey" | "refreshTokenPublicKey";
export function signJwt(
  object: any,
  keyName: PrivateTokenType,
  options?: jwt.SignOptions | undefined
) {
  const key = getPrivateKey(keyName);
  // console.log({ key });
  const signingKey = Buffer.from(key, "base64").toString("utf-8");

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: "RS256", //RS256, PS256, RS384, PS384, RS512, PS512.
  });
}

export function verifyJwt<T>(
  token: string,
  keyName: PublicTokenType
): T | null {
  const publicKey = Buffer.from(getPublicKey(keyName), "base64").toString(
    "utf-8"
  );

  try {
    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (e) {
    return null;
  }
}
function getPrivateKey(keyName: PrivateTokenType): string {
  return keyName === "accessTokenPrivateKey"
    ? env.ACCESS_TOKEN_PRIVATE_KEY
    : env.REFRESH_PRIVATE_KEY;
}
function getPublicKey(keyName: PublicTokenType): string {
  return keyName === "accessTokenPublicKey"
    ? env.ACCESS_TOKEN_PUBLIC_KEY
    : env.REFRESH_PUBLIC_KEY;
}

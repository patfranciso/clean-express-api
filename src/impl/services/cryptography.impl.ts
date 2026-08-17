import argon2 from "argon2";

import {
  Hash,
  HashComparer,
  Hasher,
} from "@/application/boundaries/cryptography.def";
import { signJwt, verifyJwt } from "@/utils/jwt";
import { User } from "@/application/entities/user";
import { env } from "@/env";

export const hasher: Hasher = async (password: string) => {
  const hash = await argon2.hash(password);
  return hash;
};

export const passwordChecker: HashComparer = async (password, hash) => {
  try {
    return await argon2.verify(hash, password);
  } catch (e: any) {
    return false;
  }
};

export const createAccessToken: Hash = (
  user: Partial<User>,
  expiry?: string | undefined
) =>
  signJwt(user, "accessTokenPrivateKey", {
    expiresIn: expiry || env.ACCESS_TOKEN_TTL,
    allowInsecureKeySizes: true,
  });

export const createRefreshToken: Hash = (
  user: Partial<User>,
  expiry?: string | undefined
) =>
  signJwt(user, "refreshTokenPrivateKey", {
    expiresIn: expiry || env.REFRESH_TOKEN_TTL,
    allowInsecureKeySizes: true,
  });

export const verifyAccessToken = (token: string) => {
  const payload = verifyJwt<{
    userId: string;
    key: string;
    userAgent: string;
    exp: number;
  }>(token, "accessTokenPublicKey");
  return payload;
};

export const verifyRefreshToken = (token: string) => {
  const payload = verifyJwt<{
    userId: string;
    key: string;
    userAgent: string;
    exp: number;
  }>(token, "refreshTokenPublicKey");
  return payload;
};

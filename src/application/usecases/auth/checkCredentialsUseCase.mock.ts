import { verifyAccessToken } from "@/impl/services/cryptography.impl";
import { Session } from "@/application/entities/session";
import { defaultSessionMock } from "@/test/mocks/entities/session.entity.mock";
import { makeCheckCredentials } from "../common/checkCredentials.service";
import { CheckCredentials } from "./getCurrentDetails.usecase";

export const passingCheckCredentials: CheckCredentials = makeCheckCredentials({
  decodeAccessToken: (_accToken: string) => {
    return { exp: 1806531559, userId: "user01", key: "session01" };
  },
  getActiveSessionData: async (_sessionId: string) => {
    return defaultSessionMock;
  },
});

export const invalidAccessTokenCheckCredentialsUseCase: CheckCredentials =
  makeCheckCredentials({
    decodeAccessToken: (_accToken: string) => null,
    getActiveSessionData: async (_sessionId: string) => {
      return defaultSessionMock;
    },
  });

export const expiredAccessTokenCheckCredentials: CheckCredentials =
  makeCheckCredentials({
    decodeAccessToken: verifyAccessToken,
    getActiveSessionData: async (_sessionId: string) => {
      return defaultSessionMock;
    },
  });

export const wrongSessionKeyCheckCredentialsUseCase: CheckCredentials =
  makeCheckCredentials({
    decodeAccessToken: verifyAccessToken,
    getActiveSessionData: async (_sessionId: string) => {
      return defaultSessionMock;
    },
  });

export const invalidSessionKeyCheckCredentialsUseCase: CheckCredentials =
  makeCheckCredentials({
    decodeAccessToken: verifyAccessToken,
    getActiveSessionData: async (_sessionId: string) => null,
  });

export const invalidUserAgentCheckCredentialsUseCase: CheckCredentials =
  makeCheckCredentials({
    decodeAccessToken: verifyAccessToken,
    getActiveSessionData: async (_sessionId: string) => {
      return new Promise<Session>((resolve) =>
        resolve({
          id: "session01",
          userId: "user01",
          userAgent: "supertestAgent",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );
    },
  });

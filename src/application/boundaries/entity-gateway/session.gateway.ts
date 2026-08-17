import { Session } from "@/application/entities/session";

export type FindSessionByKey = (key: string) => Promise<Session | null>;

export type GetActiveSessionData = (
  sessionId: string
) => Promise<Session | null>;

export type CreateSession = (
  userId: string,
  userAgent: string
) => Promise<Session>;

export type DeactivateSession = (id: string) => Promise<boolean>;

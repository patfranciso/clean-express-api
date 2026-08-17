import _ from "lodash";
import { v4 } from "uuid";

import { Session } from "@/application/entities/session";
import SessionModel from "@/impl/mongoose/models/session.model";
import {
  DeactivateSession,
  FindSessionByKey,
  GetActiveSessionData,
} from "@/application/boundaries/entity-gateway/session.gateway";

export async function createSession(
  userId: string,
  userAgent: string
): Promise<Session> {
  const id = v4();
  const session = await SessionModel.create({
    _id: id,
    userId,
    userAgent,
  });
  const sessionDoc = _.omit(session.toJSON(), "_id");
  return { id, ...sessionDoc } as Session;
}

export const getActiveSessionData: GetActiveSessionData = async (
  sessionId: string
) => {
  const sessionDoc:
    | null
    | ({ _id: string; __v: number } & Omit<Session, "id">) =
    await SessionModel.findById(sessionId);
  if (sessionDoc === null) return null;
  if (!sessionDoc.isActive) {
    return null;
  }
  const id = sessionDoc._id;
  const data = _.omit(sessionDoc, ["__v", "_id"]);
  return { id, ...data } as Session;
};
export const findSessionByKey: FindSessionByKey = async (sessionId: string) => {
  const sessionDoc:
    | null
    | ({ _id: string; __v: number } & Omit<Session, "id">) =
    await SessionModel.findById(sessionId);
  if (sessionDoc === null) return null;
  const id = sessionDoc._id;
  const data = _.omit(sessionDoc, ["__v", "_id"]);
  return { id, ...data } as Session;
};

export const deactivateSession: DeactivateSession = async (id: string) => {
  const session = await findSessionByKey(id);
  if (!session) return false;
  if (!session.isActive) return false;
  await SessionModel.updateOne<Session>({ _id: id }, { isActive: false });
  return true;
};

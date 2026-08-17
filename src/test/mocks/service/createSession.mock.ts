import { Session } from "@/application/entities/session";

export const createSession = async (_: any): Promise<Session> => {
  return new Promise<Session>((resolve) => {
    return resolve({
      id: "session01",
      userId: "userID",
      isActive: true,
      userAgent: "superAgentClient",
      createdAt: new Date("2024-01-19T11:53:27.813Z"),
      updatedAt: new Date("2024-01-19T11:53:27.813Z"),
    });
  });
};

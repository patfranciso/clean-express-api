import { Session } from "@/application/entities/session";

export const defaultSessionMock: Session = {
  id: "session01",
  userId: "user01",
  userAgent: "supertestAgent",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const expiredSessionMock: Session = {
  id: "session02",
  userId: "user01",
  userAgent: "supertestAgent",
  isActive: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

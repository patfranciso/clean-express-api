import { Entity } from "./entity";
import { User } from "./user";

export interface Session extends Entity {
  userId: User["id"];
  isActive: boolean;
  userAgent: string;
}

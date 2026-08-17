import { Entity } from "./entity";

export interface User extends Entity {
  handle: string;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "CUSTOMER" | "VENDOR";

  resetPasswordToken?: string | null | undefined;
  resetPasswordExpiresAt?: Date | null | undefined;
  verificationToken?: string | null | undefined;
  verificationTokenExpiresAt?: Date | null | undefined;
}

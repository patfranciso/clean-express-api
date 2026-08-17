import { User } from "@/application/entities/user";

export type SaveUser = (user: User) => Promise<User>;

export type FindUserByEmail = (email: string) => Promise<User | null>;
export type FindUserById = (userId: string) => Promise<User | null>;
export type FindUserByEmailOrHandle = ({
  email,
  handle,
}: {
  email: string;
  handle: string;
}) => Promise<User | null>;

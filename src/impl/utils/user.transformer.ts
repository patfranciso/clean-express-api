import _ from "lodash";
import { User } from "@/application/entities/user";
import { Transformer } from "@/application/utils/transformer";

export const transformUser: Transformer<User> = (user) => {
  const privateFields: Array<keyof User> = [
    "password",
    "createdAt",
    "updatedAt",
  ];
  return _.omit(user, privateFields);
};

export const userDetailTransform = (user: Partial<User>) => {
  const selectedFields: Array<keyof User> = [
    "id",
    "email",
    "handle",
    "name",
    "role",
  ];
  return _.pick(user, selectedFields);
};

import _ from "lodash";
import UserModel from "@/impl/mongoose/models/user.model";
import {
  FindUserByEmailOrHandle,
  SaveUser,
  FindUserByEmail,
  FindUserById,
} from "@/application/boundaries/entity-gateway/user.gateway";
import { User } from "@/application/entities/user";
import { GetUserData } from "@/application/usecases/auth/getCurrentDetails.usecase";

export const findUser: FindUserByEmailOrHandle = async ({ email, handle }) => {
  const users = await UserModel.find({
    $or: [{ email }, { handle }],
  });
  return users.length < 1 ? null : (users[0] as unknown as User);
};
export const saveNewUser: SaveUser = async (u) => {
  await UserModel.create({ _id: u.id, ...u });
  return u;
};

export const findUserByEmail: FindUserByEmail = async (email: string) => {
  const userDoc = await UserModel.findOne({ email });

  if (userDoc === null) return null;

  const userData: User = {
    id: userDoc.id as unknown as string,
    email: userDoc.email,
    handle: userDoc.handle,
    name: userDoc.name,
    role: userDoc.role,
    password: userDoc.password,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };

  return userData;
};

export const findUserById: FindUserById = async (id: string) => {
  const userDoc = await UserModel.findById(id);

  if (userDoc === null) return null;

  const data = _.omit(userDoc, ["__v", "_id", "password"]);
  return {
    id,
    ...data,
  } as User;
};
export const getUserData: GetUserData = async (userId: string) => {
  const userDoc: null | ({ _id: string; __v: number } & Omit<User, "id">) =
    await UserModel.findById(userId);
  if (userDoc === null) return null;
  const id = userDoc._id;
  const data = _.omit(userDoc, ["__v", "_id"]);
  return { id, ...data } as User;
};

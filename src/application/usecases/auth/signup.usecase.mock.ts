import { validateSignup } from "@/application/usecases/auth/signup.validate";
import { makeSignupUseCase } from "@/application/usecases/auth/signup.usecase";
import {
  existingEmail,
  existingMockUser,
  existingHandle,
} from "../../../test/mocks/entities/user.entity.mock";
import { getCurrentDate, uid } from "@/impl/services/utils.impl";

export const newValidUserDataSignupUseCase = makeSignupUseCase({
  findUserByEmailOrHandle: async (x) => null,
  hashPassword: async (s) => "hashedPass",
  saveUser: async (x) => x,
  validate: validateSignup,
  uid: uid,
  currentDate: getCurrentDate,
});

export const existingUserSignupUseCase = makeSignupUseCase({
  findUserByEmailOrHandle: async (x) => {
    return x.handle === existingHandle || x.email === existingEmail
      ? existingMockUser
      : null;
  },
  hashPassword: async (s) => "hashedPass",
  saveUser: async (x) => x,
  validate: validateSignup,
  uid,
  currentDate: getCurrentDate,
});

export const throwingSignupUseCase = makeSignupUseCase({
  findUserByEmailOrHandle: async (x) => null,
  hashPassword: async (s) => "hashedPass",
  saveUser: async (u) => {
    throw new Error("Invalid user data");
  },
  validate: validateSignup,
  uid,
  currentDate: getCurrentDate,
});

import { hasher } from "@/impl/services/cryptography.impl";
import { findUser, saveNewUser } from "@/impl/services/repo/user.repo";
import { getCurrentDate, uid } from "@/impl/services/utils.impl";
import { validateSignup } from "@/application/usecases/auth/signup.validate";
import { makeSignupUseCase } from "@/application/usecases/auth/signup.usecase";

export const signupCommand = makeSignupUseCase({
  findUserByEmailOrHandle: findUser,
  hashPassword: hasher,
  saveUser: saveNewUser,
  validate: validateSignup,
  uid: uid,
  currentDate: getCurrentDate,
});

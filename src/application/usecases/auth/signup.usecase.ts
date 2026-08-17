import { CanFail, isEr } from "@/utils/canFail";
import { User } from "@/application/entities/user";
import { Hasher } from "@/application/boundaries/cryptography.def";
import { FindUserByEmailOrHandle } from "@/application/boundaries/entity-gateway/user.gateway";
import { transformUser } from "@/impl/utils/user.transformer";
import {
  CurrentDateGenerator,
  UidGenerator,
} from "@/application/boundaries/utils.def";
import { UseCaseErrorsType } from "../types";

export const makeSignupUseCase =
  ({
    findUserByEmailOrHandle,
    hashPassword,
    saveUser,
    validate,
    uid,
    currentDate,
  }: MakeSignupUseCaseProps) =>
  async (input: SignupInput): Promise<SignupResult> => {
    const result = validate(input);
    if (isEr(result)) {
      return mapSignupError("SignupValidationError", result.err);
    }
    const existingUser = await findUserByEmailOrHandle({
      email: input.email,
      handle: input.handle,
    });
    if (existingUser) {
      return mapSignupError("UniqueFieldError");
    }

    const hashedPassword = await hashPassword(input.password);

    // Create a new User entity
    const newUser: User = {
      id: uid(),
      handle: input.handle,
      email: input.email,
      name: input.name,
      role: input.role,
      password: hashedPassword,
      createdAt: currentDate(),
      updatedAt: currentDate(),
    };

    // Save the new user to the repository
    const savedUser = await saveUser(newUser);

    return {
      status: "success",
      meta: "SignupSuccess",
      data: { user: transformUser(savedUser) },
    };
  };

export type MakeSignupUseCaseProps = {
  findUserByEmailOrHandle: FindUserByEmailOrHandle;
  hashPassword: Hasher;
  saveUser: SaveUser;
  validate: ValidateSignupInput;
  uid: UidGenerator;
  currentDate: CurrentDateGenerator;
};

export interface SignupInput {
  handle: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: User["role"];
}

export type SignupErrors = Record<string, any>;
export type ValidateSignupInput = (
  data: SignupInput
) => CanFail<SignupErrors, SignupInput>;

export type SignupResult =
  | { status: "success"; meta: "SignupSuccess"; data: { user: Partial<User> } }
  | { status: "failed"; meta: SignupFailure; errors: SignupErrors }
  | { status: "error"; meta: "SignupUnexpectedError"; errors: SignupErrors };

export type SignupFailure = "SignupValidationError" | "UniqueFieldError";

export const mapSignupError = (
  error: SignupFailure,
  payload: Record<string, any> = {}
): SignupResult => {
  const messageMap: Record<SignupFailure, UseCaseErrorsType> = {
    SignupValidationError: "payload",
    UniqueFieldError: "Email and / or Handle is already registered",
  };

  const message = messageMap[error];
  if (!message) {
    throw new Error(`Unhandled SignupFailure: ${error}`);
  }

  if (error === "SignupValidationError") {
    return {
      status: "failed",
      meta: error,
      errors: payload,
    };
  }

  return {
    status: "failed",
    meta: error,
    errors: typeof message === "string" ? { message } : message,
  };
};

export type SaveUser = (user: User) => Promise<User>;

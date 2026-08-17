import { validateAddAddress } from "./addAddress.validate";
import { makeAddAddressUseCase } from "@/application/usecases/address/addAddress.usecase";
import {
  // defaultMockUser,
  defaultMockAddress,
} from "@/test/mocks/entities/address.entity.mock";
import { getCurrentDate, uid } from "@/impl/services/utils.impl";
import { defaultMockUser } from "@/test/mocks/entities/user.entity.mock";

export const newValidDataAddAddressUseCase = makeAddAddressUseCase({
  findUserById: async (x) => defaultMockUser,
  saveAddress: async (x) => defaultMockAddress,
  validate: validateAddAddress,
  uid: uid,
  currentDate: getCurrentDate,
});

export const newUserNotFoundAddAddressUseCase = makeAddAddressUseCase({
  findUserById: async (x) => null,
  saveAddress: async (x) => defaultMockAddress,
  validate: validateAddAddress,
  uid: uid,
  currentDate: getCurrentDate,
});

export const invalidAddAddressUseCase = makeAddAddressUseCase({
  findUserById: async (x) => defaultMockUser,
  saveAddress: async (u) => {
    throw new Error("Database save address data");
  },
  validate: validateAddAddress,
  uid: uid,
  currentDate: getCurrentDate,
});

import { uid, getCurrentDate } from "@/impl/services/utils.impl";
import { findUserById } from "@/impl/services/repo/user.repo";
import { validateAddAddress } from "@/application/usecases/address/addAddress.validate";
import { saveAddress } from "@/impl/services/repo/address.repo";
import { makeAddAddressUseCase } from "@/application/usecases/address/addAddress.usecase";

export const addAddressCommand = makeAddAddressUseCase({
  findUserById,
  saveAddress,
  validate: validateAddAddress,
  uid,
  currentDate: getCurrentDate,
});

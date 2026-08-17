import { makeEditAddressUseCase } from "@/application/usecases/address/editAddress.usecase";
import { validateEditAddress } from "@/application/usecases/address/editAddress.validate";
import { checkCredentials } from "@/impl/controllers/common/checkCredentials";
// import { checkCredentials } from "@/impl/services/auth.impl"; // Assuming auth.impl.ts exists now
import {
  findAddressById,
  updateAddress,
} from "@/impl/services/repo/address.repo"; // Assuming address.repo.ts exists now
import { getCurrentDate } from "@/impl/services/utils.impl"; // Assuming utils.impl.ts exists

export const editAddressCommand = makeEditAddressUseCase({
  validate: validateEditAddress,
  checkCredentials: checkCredentials,
  findAddressById: findAddressById,
  updateAddress: updateAddress,
  currentDate: getCurrentDate,
});

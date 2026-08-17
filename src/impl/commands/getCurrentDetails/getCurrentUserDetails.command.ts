import { makeGetCurrentUserDetailsUseCase } from "@/application/usecases/auth/getCurrentDetails.usecase";
import { checkCredentials } from "@/impl/controllers/common/checkCredentials";
import { getUserData } from "@/impl/services/repo/user.repo";
import { userDetailTransform } from "@/impl/utils/user.transformer";

export const getCurrentUserDetailsCommand = makeGetCurrentUserDetailsUseCase({
  checkCredentials,
  getUserData,
  transformUser: userDetailTransform,
});

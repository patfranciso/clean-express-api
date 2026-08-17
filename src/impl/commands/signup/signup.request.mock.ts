import { SignupInput } from "@/application/usecases/auth/signup.usecase";
import { existingMockUser } from "@/test/mocks/entities/user.entity.mock";

export const getExistingUserInput: () => SignupInput = () => ({
  email: existingMockUser.email,
  handle: existingMockUser.handle,
  name: existingMockUser.name,
  password: existingMockUser.password,
  confirmPassword: existingMockUser.password,
  role: "CUSTOMER",
});

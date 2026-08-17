import { User } from "@/application/entities/user";
import { SignupResult } from "@/application/usecases/auth/signup.usecase";
import { transformUser } from "@/impl/utils/user.transformer";

const presentSignupResult = (
  result: SignupResult
): {
  statusCode: number;
  data?: Partial<User>;
  errors?: Record<string, any>;
} => {
  if (result.status === "success") {
    const user = transformUser(result.data.user);
    return { statusCode: 200, data: user };
  } else if (result.status === "error") {
    return { statusCode: 500, errors: result.errors };
  } else {
    return { statusCode: 400, errors: result.errors };
  }
};

export default presentSignupResult;

import Address from "@/application/entities/address";
import { CanFail, isEr } from "@/utils/canFail";
import {
  FindAddressById,
  UpdateAddress,
} from "@/application/boundaries/entity-gateway/address.gateway";
import {
  CheckCredentials,
  CheckCredentialsError,
  Credentials,
} from "@/application/boundaries/auth.def"; // Import CheckCredentials and Credentials
import { CurrentDateGenerator } from "@/application/boundaries/utils.def"; // Import CurrentDateGenerator

// 1. Define Input Type
export interface EditAddressInput {
  addressId: string;
  address?: string;
  city?: string;
  pincode?: string;
  phone?: string;
  notes?: string | null;
  credentials: Credentials; // Include credentials for authorization
}

// 2. Define Output/Result Types
export type EditAddressSuccessData = {
  address: Address;
};

export type EditAddressErrors = Record<string, any>;

export type EditAddressResult =
  | EditAddressSuccess
  | EditAddressFailure
  | EditAddressUnexpectedError;

export type EditAddressSuccess = {
  status: "success";
  meta: "EditAddressSuccess";
  data: EditAddressSuccessData;
};

export type EditAddressFailure = {
  status: "failed";
  meta:
    | "ValidationError"
    | "AddressNotFoundError"
    | "UnauthorizedError"
    | CheckCredentialsError; // Include possible errors from CheckCredentials
  errors: EditAddressErrors;
};

export type EditAddressUnexpectedError = {
  status: "error";
  meta: "EditAddressUnexpectedError";
  errors: EditAddressErrors;
};

// 3. Define Error Constants
export const AddressNotFoundError: EditAddressFailure = {
  status: "failed",
  meta: "AddressNotFoundError",
  errors: { message: "Address not found" },
};

export const UnauthorizedError: EditAddressFailure = {
  status: "failed",
  meta: "UnauthorizedError",
  errors: { message: "Unauthorized to edit this address" },
};

// Helper to map CheckCredentialsError to failure structure (similar to getCurrentDetails)
const mapCheckCredentialsError = (
  error: CheckCredentialsError
): EditAddressFailure => {
  const messageMap: Record<CheckCredentialsError, string> = {
    InvalidAccessTokenError: "Invalid access token",
    AccessTokenWithWrongSessionKeyError: "Access token with wrong key",
    InvalidSessionKeyError: "Invalid session key",
    InvalidUserAgentError: "Invalid user agent",
  };
  return {
    status: "failed",
    meta: error,
    errors: { message: messageMap[error] },
  };
};

// 4. Define Use Case Dependencies (Props)
export type ValidateEditAddressInput = (
  data: EditAddressInput
) => CanFail<EditAddressErrors, EditAddressInput>;

export type MakeEditAddressUseCaseProps = {
  validate: ValidateEditAddressInput;
  checkCredentials: CheckCredentials; // Dependency to verify user and get userId
  findAddressById: FindAddressById; // Dependency to find the address
  updateAddress: UpdateAddress; // Dependency to save the updated address
  currentDate: CurrentDateGenerator; // Dependency for timestamp
};

// 5. Create the Use Case Factory Function
export const makeEditAddressUseCase =
  ({
    validate,
    checkCredentials,
    findAddressById,
    updateAddress,
    currentDate,
  }: MakeEditAddressUseCaseProps) =>
  async (input: EditAddressInput): Promise<EditAddressResult> => {
    try {
      // 5.1. Validate Input
      const validationResult = validate(input);
      if (isEr(validationResult)) {
        return {
          status: "failed",
          meta: "ValidationError",
          errors: validationResult.err,
        };
      }
      const validatedInput = validationResult.value;
      const { addressId, credentials, ...updateFields } = validatedInput; // Destructure update fields

      // 5.2. Check Credentials and Authorize User
      const authResult = await checkCredentials(credentials);
      if (isEr(authResult)) {
        return mapCheckCredentialsError(authResult.err);
      }
      const userId = authResult.value; // Get authenticated user ID

      // 5.3. Find the Address
      const existingAddress = await findAddressById(addressId);
      if (!existingAddress) {
        return AddressNotFoundError;
      }

      // 5.4. Check Ownership (Authorization)
      if (existingAddress.userId !== userId) {
        return UnauthorizedError;
      }

      // 5.5. Apply Updates to the Address entity
      // Only apply fields that are present in the input (not undefined)
      const updatedAddress: Address = {
        ...existingAddress,
        ...Object.fromEntries(
          Object.entries(updateFields).filter(
            ([key, value]) => value !== undefined
          )
        ),
        updatedAt: currentDate(), // Update the timestamp
      };

      // 5.6. Save the Updated Address
      const savedAddress = await updateAddress(updatedAddress);

      // 5.7. Return Success
      return {
        status: "success",
        meta: "EditAddressSuccess",
        data: { address: savedAddress },
      };
    } catch (error: any) {
      console.error("Error in EditAddressUseCase:", error); // Log the error
      return {
        status: "error",
        meta: "EditAddressUnexpectedError",
        errors: { message: error.message || "An unexpected error occurred" },
      };
    }
  };

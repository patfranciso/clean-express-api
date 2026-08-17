import { isEr, CanFail } from "@/utils/canFail";
import { FindUserById } from "@/application/boundaries/entity-gateway/user.gateway";
import Address from "@/application/entities/address";
import { SaveAddress } from "@/application/boundaries/entity-gateway/address.gateway";
import {
  CurrentDateGenerator,
  UidGenerator,
} from "@/application/boundaries/utils.def";

export const makeAddAddressUseCase =
  ({
    findUserById,
    saveAddress,
    validate,
    uid,
    currentDate,
  }: MakeAddAddressUseCaseProps) =>
  async (input: AddAddressInput): Promise<AddAddressResult> => {
    const validationResult = validate(input);
    if (isEr(validationResult)) {
      return {
        status: "failed",
        meta: "ValidationError",
        errors: validationResult.err,
      };
    }

    const existingUser = await findUserById(input.userId);

    if (!existingUser) {
      return UserNotFoundError;
    }

    // Create a new Address entity
    const newAddress: Address = {
      id: uid(),
      address: input.address,
      userId: input.userId,
      city: input.city,
      pincode: input.pincode,
      phone: input.phone,
      notes: input.notes,
      createdAt: currentDate(),
      updatedAt: currentDate(),
    };

    // Save the new address to the repository
    const savedAddress = await saveAddress(newAddress);

    return {
      status: "success",
      meta: "AddAddressSuccess",
      data: { address: savedAddress },
    };
  };

export type MakeAddAddressUseCaseProps = {
  findUserById: FindUserById;
  saveAddress: SaveAddress;
  validate: ValidateAddAddressInput;
  uid: UidGenerator;
  currentDate: CurrentDateGenerator;
};

export interface AddAddressInput {
  userId: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  notes?: string;
}

export type AddAddressErrors = Record<string, any>;
export type ValidateAddAddressInput = (
  data: AddAddressInput
) => CanFail<AddAddressErrors, AddAddressInput>;

export type AddAddressSuccess = {
  status: "success";
  meta: "AddAddressSuccess";
  data: { address: Address };
};

export type AddAddressFailure = {
  status: "failed";
  meta: "ValidationError" | "UserNotFoundError";
  errors: AddAddressErrors;
};

export type AddAddressUnexpectedError = {
  status: "error";
  meta: "AddAddressUnexpectedError";
  errors: AddAddressErrors;
};

export type AddAddressResult =
  | AddAddressSuccess
  | AddAddressFailure
  | AddAddressUnexpectedError;

export const UserNotFoundError: AddAddressFailure = {
  status: "failed",
  meta: "UserNotFoundError",
  errors: { message: "User not found" },
};

export type AddAddressOutput =
  | { data: AddAddressSuccess["data"] }
  | { errors: AddAddressErrors };

import {
  makeEditAddressUseCase,
  EditAddressInput,
  AddressNotFoundError,
  UnauthorizedError,
  EditAddressResult,
} from "./editAddress.usecase";
import { validateEditAddress } from "./editAddress.validate"; // Use the real validator
import {
  CheckCredentialsError,
  Credentials,
} from "@/application/boundaries/auth.def";
import { CanFail, ok, er } from "@/utils/canFail";
import Address from "@/application/entities/address";
import {
  FindAddressById,
  UpdateAddress,
} from "@/application/boundaries/entity-gateway/address.gateway";
import {
  mockAddress,
  anotherMockAddress,
} from "@/test/mocks/entities/address.entity.mock";
import { defaultMockUser } from "@/test/mocks/entities/user.entity.mock"; // To get the user ID
import { getCurrentDate } from "@/impl/services/utils.impl"; // Mock or real simple date generator

// --- Mock Dependencies ---

// Mock for successful checkCredentials
const mockCheckCredentialsSuccess = async (
  credentials: Credentials
): Promise<CanFail<CheckCredentialsError, string>> => {
  // Simulate successful credential check for the default user
  if (
    credentials.sessionId === "validSessionId" &&
    credentials.accessToken === "validAccessToken" &&
    credentials.userAgent === "supertestAgent"
  ) {
    return ok(defaultMockUser.id); // Return the user ID of the address owner
  }
  if (
    credentials.sessionId === "validSessionIdAnotherUser" &&
    credentials.accessToken === "validAccessTokenAnotherUser" &&
    credentials.userAgent === "supertestAgent"
  ) {
    return ok(anotherMockAddress.userId); // Return user ID of the other user
  }
  // Fallback or simulated failure if needed for other tests, though specific failure mocks are better
  return er("InvalidAccessTokenError"); // Default failure if not valid
};

// Mocks for specific checkCredentials failures
const mockCheckCredentialsInvalidAccessToken = async (
  credentials: Credentials
): Promise<CanFail<CheckCredentialsError, string>> => {
  return er("InvalidAccessTokenError");
};

const mockCheckCredentialsAccessTokenWrongSessionKey = async (
  credentials: Credentials
): Promise<CanFail<CheckCredentialsError, string>> => {
  return er("AccessTokenWithWrongSessionKeyError");
};

const mockCheckCredentialsInvalidSessionKey = async (
  credentials: Credentials
): Promise<CanFail<CheckCredentialsError, string>> => {
  return er("InvalidSessionKeyError");
};

const mockCheckCredentialsInvalidUserAgent = async (
  credentials: Credentials
): Promise<CanFail<CheckCredentialsError, string>> => {
  return er("InvalidUserAgentError");
};

// Mock for findAddressById
const mockFindAddressById = async (
  addressId: string
): Promise<Address | null> => {
  if (addressId === mockAddress.id) {
    return mockAddress; // Return the mock address if ID matches
  }
  if (addressId === anotherMockAddress.id) {
    return anotherMockAddress; // Return the other mock address if ID matches
  }
  return null; // Return null if address not found
};

// Mock for updateAddress (simply returns the updated address passed to it)
const mockUpdateAddress = async (address: Address): Promise<Address> => {
  // In a real scenario, this would interact with the DB
  // For the unit test, we just confirm it received the correct updated data
  return address;
};

// Mock for currentDate (returns a fixed date for predictability)
const mockCurrentDate = () => new Date("2024-01-20T12:00:00.000Z");

// --- Mock Use Case Instances (Commands) ---

// Use case instance for valid scenarios (uses successful mocks)
export const validEditAddressUseCase = makeEditAddressUseCase({
  validate: validateEditAddress, // Use real validator
  checkCredentials: mockCheckCredentialsSuccess,
  findAddressById: mockFindAddressById,
  updateAddress: mockUpdateAddress,
  currentDate: mockCurrentDate,
});

// Use case instance for address not found scenario
export const addressNotFoundEditAddressUseCase = makeEditAddressUseCase({
  validate: validateEditAddress,
  checkCredentials: mockCheckCredentialsSuccess, // Credentials are valid
  findAddressById: async (id) => null, // Simulate address not found
  updateAddress: mockUpdateAddress,
  currentDate: mockCurrentDate,
});

// Use case instance for unauthorized scenario (user ID from credentials doesn't match address owner ID)
export const unauthorizedEditAddressUseCase = makeEditAddressUseCase({
  validate: validateEditAddress,
  checkCredentials: async (creds) => ok("someOtherUserId"), // Simulate credentials belonging to a different user
  findAddressById: mockFindAddressById, // Address is found
  updateAddress: mockUpdateAddress,
  currentDate: mockCurrentDate,
});

// Use case instances for checkCredentials failure scenarios
export const invalidAccessTokenEditAddressUseCase = makeEditAddressUseCase({
  validate: validateEditAddress,
  checkCredentials: mockCheckCredentialsInvalidAccessToken,
  findAddressById: mockFindAddressById,
  updateAddress: mockUpdateAddress,
  currentDate: mockCurrentDate,
});

export const accessTokenWrongKeyEditAddressUseCase = makeEditAddressUseCase({
  validate: validateEditAddress,
  checkCredentials: mockCheckCredentialsAccessTokenWrongSessionKey,
  findAddressById: mockFindAddressById,
  updateAddress: mockUpdateAddress,
  currentDate: mockCurrentDate,
});

export const invalidSessionKeyEditAddressUseCase = makeEditAddressUseCase({
  validate: validateEditAddress,
  checkCredentials: mockCheckCredentialsInvalidSessionKey,
  findAddressById: mockFindAddressById,
  updateAddress: mockUpdateAddress,
  currentDate: mockCurrentDate,
});

export const invalidUserAgentEditAddressUseCase = makeEditAddressUseCase({
  validate: validateEditAddress,
  checkCredentials: mockCheckCredentialsInvalidUserAgent,
  findAddressById: mockFindAddressById,
  updateAddress: mockUpdateAddress,
  currentDate: mockCurrentDate,
});

// Use case instance for unexpected error scenario (e.g., gateway throws)
export const throwingFindAddressEditAddressUseCase = makeEditAddressUseCase({
  validate: validateEditAddress,
  checkCredentials: mockCheckCredentialsSuccess,
  findAddressById: async (id) => {
    throw new Error("Simulated database error finding address"); // Simulate unexpected error
  },
  updateAddress: mockUpdateAddress,
  currentDate: mockCurrentDate,
});

// Use case instance for validation errors (uses the real validator,
// but we can create a separate instance if we needed mocks for validation specifically,
// but using the real one is better for integration testing the usecase+validator)
// export const validationErrorEditAddressUseCase = makeEditAddressUseCase({ ... }); // Not strictly necessary if validEditAddressUseCase covers it

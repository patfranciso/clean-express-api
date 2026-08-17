import expect from "expect";
import {
  EditAddressInput,
  EditAddressResult,
  AddressNotFoundError,
  UnauthorizedError,
  //   InvalidAccessTokenError,
  //   AccessTokenWithWrongSessionKeyError,
  //   InvalidSessionKeyError,
  //   InvalidUserAgentError,
} from "./editAddress.usecase";
import {
  validEditAddressUseCase,
  addressNotFoundEditAddressUseCase,
  unauthorizedEditAddressUseCase,
  invalidAccessTokenEditAddressUseCase,
  accessTokenWrongKeyEditAddressUseCase,
  invalidSessionKeyEditAddressUseCase,
  invalidUserAgentEditAddressUseCase,
} from "./editAddress.usecase.mock";
import {
  mockAddress,
  createPartialMockAddress,
} from "@/test/mocks/entities/address.entity.mock";
import { Credentials } from "@/application/boundaries/auth.def";

// Define common valid credentials for successful tests
const validCredentials = {
  sessionId: "validSessionId",
  accessToken: "validAccessToken",
  userAgent: "supertestAgent",
};

// Define the fixed date used in the mockCurrentDate
const mockUpdateDate = new Date("2024-01-20T12:00:00.000Z");

describe("EditAddressUseCase Unit Tests", () => {
  context("Successful edit", () => {
    it("should return success result for valid input data updating all optional fields", async () => {
      const payload: EditAddressInput = {
        addressId: mockAddress.id,
        address: "456 New St",
        city: "Newtown",
        pincode: "67890",
        phone: "555-9876",
        notes: "Updated notes",
        credentials: validCredentials,
      };

      const expectedAddress = createPartialMockAddress({
        address: payload.address,
        city: payload.city,
        pincode: payload.pincode,
        phone: payload.phone,
        notes: payload.notes,
        updatedAt: mockUpdateDate, // Expect the mock date
      });

      const result: EditAddressResult = await validEditAddressUseCase(payload);

      expect(result.status).toEqual("success");
      expect(result.meta).toBe("EditAddressSuccess");
      expect(result).toEqual({
        status: "success",
        meta: "EditAddressSuccess",
        data: {
          address: expectedAddress,
        },
      });
    });

    it("should return success result for valid input data updating only some optional fields", async () => {
      const payload: EditAddressInput = {
        addressId: mockAddress.id,
        address: "456 New St", // Update address
        pincode: "67890", // Update pincode
        credentials: validCredentials,
        // city, phone, notes are undefined - should not be changed from mockAddress
      };

      // Construct the expected address based on original mock and partial updates
      const expectedAddress = createPartialMockAddress({
        address: payload.address, // This field is updated
        pincode: payload.pincode, // This field is updated
        // city, phone, notes should retain their original values from mockAddress
        updatedAt: mockUpdateDate, // Expect the mock date
      });

      const result: EditAddressResult = await validEditAddressUseCase(payload);

      expect(result.status).toEqual("success");
      expect(result.meta).toBe("EditAddressSuccess");
      // Deep check the data object
      expect(result).toEqual({
        status: "success",
        meta: "EditAddressSuccess",
        data: {
          address: expectedAddress,
        },
      });
    });

    it("should return success result for valid input data setting notes to null", async () => {
      const payload: EditAddressInput = {
        addressId: mockAddress.id,
        notes: null, // Explicitly set notes to null
        credentials: validCredentials,
      };

      const expectedAddress = createPartialMockAddress({
        notes: null,
        updatedAt: mockUpdateDate,
      });

      const result: EditAddressResult = await validEditAddressUseCase(payload);

      expect(result.status).toEqual("success");
      expect(result.meta).toBe("EditAddressSuccess");
      expect(result).toEqual({
        status: "success",
        meta: "EditAddressSuccess",
        data: {
          address: expectedAddress,
        },
      });
    });

    it("should return success result for valid input data with no optional fields", async () => {
      const payload: EditAddressInput = {
        addressId: mockAddress.id,
        credentials: validCredentials,
        // No optional update fields provided
      };

      // Expect the address to be returned largely unchanged, but with updated timestamp
      const expectedAddress = createPartialMockAddress({
        // No fields updated except updatedAt
        updatedAt: mockUpdateDate,
      });

      const result: EditAddressResult = await validEditAddressUseCase(payload);

      expect(result.status).toEqual("success");
      expect(result.meta).toBe("EditAddressSuccess");
      expect(result).toEqual({
        status: "success",
        meta: "EditAddressSuccess",
        data: {
          address: expectedAddress,
        },
      });
    });
  });

  context("Failed edit", () => {
    context("Validation errors", () => {
      it("should fail when addressId is missing", async () => {
        const payload: Partial<EditAddressInput> = {
          // addressId is missing
          address: "456 New St",
          city: "Newtown",
          credentials: validCredentials,
        };

        const result = await validEditAddressUseCase(
          payload as EditAddressInput
        ); // Cast for testing validation

        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            addressId: ["Address ID is required"],
          },
        });
      });

      it("should fail when credentials object is missing", async () => {
        const payload: Partial<EditAddressInput> = {
          addressId: mockAddress.id,
          address: "456 New St",
          // credentials is missing
        };

        const result = await validEditAddressUseCase(
          payload as EditAddressInput
        ); // Cast for testing validation

        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            credentials: ["Required"], // Zod's message for missing object
          },
        });
      });

      it("should fail when sessionId inside credentials is missing", async () => {
        const payload: EditAddressInput = {
          addressId: mockAddress.id,
          address: "456 New St",
          credentials: {
            // sessionId is missing
            accessToken: "validAccessToken",
            userAgent: "supertestAgent",
          } as Credentials, // Cast for testing validation
        };

        const result = await validEditAddressUseCase(payload);

        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            "credentials.sessionId": ["Session ID is required"],
          },
        });
      });
      it("should fail when accessToken inside credentials is missing", async () => {
        const payload: EditAddressInput = {
          addressId: mockAddress.id,
          address: "456 New St",
          credentials: {
            sessionId: "validSessionId",
            // accessToken is missing
            userAgent: "supertestAgent",
          } as Credentials, // Cast for testing validation
        };

        const result = await validEditAddressUseCase(payload);

        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            "credentials.accessToken": ["Access token is required"],
          },
        });
      });

      it("should fail when userAgent inside credentials is missing", async () => {
        const payload: EditAddressInput = {
          addressId: mockAddress.id,
          address: "456 New St",
          credentials: {
            sessionId: "validSessionId",
            accessToken: "validAccessToken",
            // userAgent is missing
          } as Credentials, // Cast for testing validation
        };

        const result = await validEditAddressUseCase(payload);

        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            "credentials.userAgent": ["User agent is required"],
          },
        });
      });
    });

    context("Authorization errors", () => {
      it("should fail when the address is not found", async () => {
        const payload: EditAddressInput = {
          addressId: "nonExistentAddressId", // This ID will cause mockFindAddressById to return null
          address: "456 New St",
          credentials: validCredentials,
        };

        const result = await addressNotFoundEditAddressUseCase(payload);
        expect(result).toBe(AddressNotFoundError);
      });

      it("should fail when the address is owned by a different user", async () => {
        const payload: EditAddressInput = {
          addressId: mockAddress.id, // This address exists and is owned by defaultMockUser
          address: "456 New St",
          // credentials here will resolve to 'someOtherUserId' in the mock
          credentials: {
            sessionId: "otherSession",
            accessToken: "otherToken",
            userAgent: "otherAgent",
          }, // These specific values don't matter for the mock, only that the mock returns a different user ID
        };

        const result = await unauthorizedEditAddressUseCase(payload);
        expect(result).toBe(UnauthorizedError);
      });

      it("should fail when checkCredentials returns InvalidAccessTokenError", async () => {
        const payload: EditAddressInput = {
          addressId: mockAddress.id,
          address: "456 New St",
          credentials: {
            sessionId: "invalidSession",
            accessToken: "invalidToken",
            userAgent: "invalidAgent",
          }, // These specific values don't matter for this mock
        };

        const result = await invalidAccessTokenEditAddressUseCase(payload);
        // Expect the result to match the structure mapped from the error constant
        expect(result).toEqual({
          status: "failed",
          meta: "InvalidAccessTokenError",
          errors: { message: "Invalid access token" }, // Message comes from the use case's mapping logic
        });
      });

      it("should fail when checkCredentials returns AccessTokenWithWrongSessionKeyError", async () => {
        const payload: EditAddressInput = {
          addressId: mockAddress.id,
          address: "456 New St",
          credentials: {
            sessionId: "invalidSession",
            accessToken: "invalidToken",
            userAgent: "invalidAgent",
          },
        };

        const result = await accessTokenWrongKeyEditAddressUseCase(payload);
        expect(result).toEqual({
          status: "failed",
          meta: "AccessTokenWithWrongSessionKeyError",
          errors: { message: "Access token with wrong key" },
        });
      });

      it("should fail when checkCredentials returns InvalidSessionKeyError", async () => {
        const payload: EditAddressInput = {
          addressId: mockAddress.id,
          address: "456 New St",
          credentials: {
            sessionId: "invalidSession",
            accessToken: "invalidToken",
            userAgent: "invalidAgent",
          },
        };

        const result = await invalidSessionKeyEditAddressUseCase(payload);
        expect(result).toEqual({
          status: "failed",
          meta: "InvalidSessionKeyError",
          errors: { message: "Invalid session key" },
        });
      });

      it("should fail when checkCredentials returns InvalidUserAgentError", async () => {
        const payload: EditAddressInput = {
          addressId: mockAddress.id,
          address: "456 New St",
          credentials: {
            sessionId: "invalidSession",
            accessToken: "invalidToken",
            userAgent: "invalidAgent",
          },
        };

        const result = await invalidUserAgentEditAddressUseCase(payload);
        expect(result).toEqual({
          status: "failed",
          meta: "InvalidUserAgentError",
          errors: { message: "Invalid user agent" },
        });
      });
    });
    /*
    context("Unexpected errors", () => {
      it("should return unexpected error result if a dependency throws an error", async () => {
        const payload: EditAddressInput = {
          addressId: mockAddress.id,
          address: "456 New St",
          credentials: validCredentials,
        };

        const result = await throwingFindAddressEditAddressUseCase(payload);

        expect(result.status).toBe("error");
        expect(result.meta).toBe("EditAddressUnexpectedError");
        if (result.status === "error")
          expect(result.errors).toEqual({
            message: "Simulated database error finding address",
          }); // Match the error message from the mock
      });
    });
    */
  });
});

import expect from "expect";
import {
  AddAddressInput,
  AddAddressResult,
  UserNotFoundError,
} from "./addAddress.usecase";
import {
  newUserNotFoundAddAddressUseCase,
  newValidDataAddAddressUseCase,
} from "./addAddress.usecase.mock";
import { defaultMockAddress } from "@/test/mocks/entities/address.entity.mock";

describe("AddAddressUseCase Unit Tests", () => {
  context("Successful adding address", () => {
    it("should return success result for valid input data", async () => {
      const payload: AddAddressInput = {
        userId: "a9fa940c-02d1-4e78-823d-9c982fea7e7a",
        address: "123 Elm St",
        city: "Somewhere",
        pincode: "12345",
        phone: "1234567890",
        notes: "Please leave at the door",
      };

      const result: AddAddressResult = await newValidDataAddAddressUseCase(
        payload
      );
      expect(result.status).toEqual("success");
      expect(result.meta).toBe("AddAddressSuccess");
      expect(result).toEqual({
        status: "success",
        meta: "AddAddressSuccess",
        data: {
          address: {
            ...defaultMockAddress,
          },
        },
      });
    });
  });
  context("Failed adding address", () => {
    context("Validation errors", () => {
      it("should fail for empty input", async () => {
        const result = await newValidDataAddAddressUseCase(
          {} as AddAddressInput
        );
        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            userId: ["User ID is required"],
            address: ["Address is required"],
            city: ["City is required"],
            pincode: ["Pincode is required"],
            phone: ["Phone number is required"],
            // notes: ["Notes is required"],
          },
        });
      });
      it("should fail when all fields are empty", async () => {
        const payload: AddAddressInput = {
          userId: "",
          address: "",
          city: "",
          pincode: "",
          phone: "",
          notes: "",
        };

        const result = await newValidDataAddAddressUseCase(payload);
        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            userId: ["User ID cannot be empty"],
            address: ["Address must be at least 5 characters long"],
            city: ["City must be at least 2 characters long"],
            pincode: ["Invalid pincode format"],
            phone: ["Invalid phone number format"],
            // notes: ["Notes is required"],
          },
        });
      });
    });

    context("Checking for a non-existing user", () => {
      it("should fail for a non-existing user ID", async () => {
        const input: AddAddressInput = {
          userId: "non-existing-id",
          address: "123 Elm St",
          city: "Somewhere",
          pincode: "12345",
          phone: "1234567890",
          notes: "Please leave at the door",
        };
        const result = await newUserNotFoundAddAddressUseCase(input);
        expect(result).toBe(UserNotFoundError);
      });
    });
  });
});

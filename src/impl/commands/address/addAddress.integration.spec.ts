import expect from "expect";
import supertest from "supertest";

import createServer from "@/server";
import "@/test/setup";

import { AddAddressInput } from "@/application/usecases/address/addAddress.usecase";
import { createTestUser } from "@/test/mocks/entities/user.entity.mock";

const app = createServer();

describe("AddAddressUseCase Integration Tests", () => {
  let existingUser: any;
  beforeEach(async () => {
    existingUser = await createTestUser({ email: "existing@example.com" });
  });

  context("Successful address addition", () => {
    it("should return success result for valid input data", async () => {
      const input: AddAddressInput = {
        userId: existingUser.id,
        address: "123 ABC St",
        city: "XYZ City",
        pincode: "654321",
        phone: "0987654321",
        notes: "Test Notes",
      };
      const response = await supertest(app).post("/addresses").send(input);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        status: "success",
        data: {
          address: {
            id: expect.any(String),
            address: input.address,
            userId: input.userId,
            city: input.city,
            pincode: input.pincode,
            phone: input.phone,
            notes: input.notes,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        },
      });
    });
    it("should not fail when notes is empty", async () => {
      const input: AddAddressInput = {
        userId: existingUser.id,
        address: "123 ABC St",
        city: "XYZ City",
        pincode: "654321",
        phone: "+0987654321",
        notes: "",
      };
      const result = {
        data: {
          address: expect.any(Object),
        },
        status: "success",
      };
      const response = await supertest(app).post("/addresses").send(input);
      expect(response.body).toEqual(result);
      expect(response.status).toEqual(201);
    });
  });

  context("Failed address addition", () => {
    context("Validation errors", () => {
      it("should fail when all fields are empty", async () => {
        const result = {
          errors: {
            userId: ["User ID is required"],
            address: ["Address is required"],
            city: ["City is required"],
            pincode: ["Pincode is required"],
            phone: ["Phone number is required"],
            // notes: ["Notes is required"],
          },
          status: "failed",
        };
        const response = await supertest(app).post("/addresses");
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(result);
      });

      it("should fail when userId is empty", async () => {
        const input: AddAddressInput = {
          userId: "",
          address: "123 ABC St",
          city: "XYZ City",
          pincode: "654321",
          phone: "0987654321",
          notes: "Test Notes",
        };
        const result = {
          errors: {
            userId: ["User ID cannot be empty"],
          },
          status: "failed",
        };
        const response = await supertest(app).post("/addresses").send(input);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(result);
      });

      it("should fail when address is empty", async () => {
        const input: AddAddressInput = {
          userId: existingUser.id,
          address: "",
          city: "XYZ City",
          pincode: "654321",
          phone: "0987654321",
          notes: "Test Notes",
        };
        const result = {
          errors: {
            address: ["Address must be at least 5 characters long"],
          },
          status: "failed",
        };
        const response = await supertest(app).post("/addresses").send(input);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(result);
      });

      it("should fail when city is empty", async () => {
        const input: AddAddressInput = {
          userId: existingUser.id,
          address: "123 ABC St",
          city: "",
          pincode: "654321",
          phone: "0987654321",
          notes: "Test Notes",
        };
        const result = {
          errors: {
            city: ["City must be at least 2 characters long"],
          },
          status: "failed",
        };
        const response = await supertest(app).post("/addresses").send(input);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(result);
      });

      it("should fail when pincode is empty", async () => {
        const input = {
          userId: existingUser.id,
          address: "123 ABC St",
          city: "XYZ City",
          pincode: "",
          phone: "0987654321",
          notes: "Test Notes",
        };
        const result = {
          errors: {
            pincode: ["Invalid pincode format"],
          },
          status: "failed",
        };
        const response = await supertest(app).post("/addresses").send(input);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(result);
      });

      it("should fail when phone is empty", async () => {
        const input: AddAddressInput = {
          userId: existingUser.id,
          address: "123 ABC St",
          city: "XYZ City",
          pincode: "654321",
          phone: "",
          notes: "Test Notes",
        };
        const result = {
          errors: {
            phone: ["Invalid phone number format"],
          },
          status: "failed",
        };
        const response = await supertest(app).post("/addresses").send(input);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(result);
      });
    });

    context("Checking for an unknown user", () => {
      const unknownUserError = {
        status: "failed",
        errors: { message: "User not found" },
      };
      it("should fail for an unknown user ID", async () => {
        const input: AddAddressInput = {
          userId: "unknownUserId",
          address: "123 ABC St",
          city: "XYZ City",
          pincode: "654321",
          phone: "0987654321",
          notes: "Test Notes",
        };
        const response = await supertest(app).post("/addresses").send(input);
        expect(response.status).toEqual(400);
        expect(response.body).toEqual(unknownUserError);
      });
    });
  });
});

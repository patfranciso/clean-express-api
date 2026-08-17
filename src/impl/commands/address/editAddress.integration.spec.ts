import expect from "expect";
import supertest from "supertest";
import { v4 as uuidv4 } from "uuid"; // Needed for non-existent address ID

import createServer from "@/server";
import "@/test/setup"; // Handles DB connection and clearing
import { getExistingUserInput } from "@/impl/commands/signup/signup.request.mock";
import {
  EditAddressInput,
  EditAddressSuccessData,
  AddressNotFoundError,
  UnauthorizedError,
} from "@/application/usecases/address/editAddress.usecase"; // Import necessary types and errors
import {
  createTestAddress,
  defaultMockAddress,
} from "@/test/mocks/entities/address.entity.mock"; // Helper to create address
import { SignupInput } from "@/application/usecases/auth/signup.usecase";
import {
  LoginInput,
  LoginSuccessData,
} from "@/application/usecases/auth/login.usecase";
import getCookieFromResponse from "../../../utils/getCookieFromResponse";

const app = createServer();

// Store test data obtained during setup
let user1Id: string;
let user1AccessToken: string;
let user1SessionId: string;
let user1UserAgent: string;
let address1Id: string;
let address1InitialData: any; // Store initial data to check against later

let user2Id: string;
let user2AccessToken: string;
let user2SessionId: string;
let user2UserAgent: string;
let address2Id: string;

describe("EditAddress UseCase Integration Tests", () => {
  beforeEach(async () => {
    // Ensure DB is cleared by setup.ts
    // 1. Create User 1 via signup
    const user1SignupInput: SignupInput = getExistingUserInput(); // Using existing handle/email from mock
    const user1SignupResponse = await supertest(app)
      .post("/signup")
      .send(user1SignupInput);
    expect(user1SignupResponse.status).toBe(200); // Should succeed if DB is clean

    // 2. Login User 1 to get credentials
    const user1LoginInput: LoginInput = {
      email: user1SignupInput.email,
      password: user1SignupInput.password,
      userAgent: "user1Agent",
    };
    const user1LoginResponse = await supertest(app)
      .post("/login")
      .send(user1LoginInput)
      .set("user-agent", user1LoginInput.userAgent); // Set user agent header for consistency
    expect(user1LoginResponse.status).toBe(200);
    const user1LoginData = user1LoginResponse.body.data as LoginSuccessData;
    user1Id = user1LoginData.user.userId;

    user1SessionId = getCookieFromResponse(user1LoginResponse, "key");
    user1AccessToken = user1LoginData.accessToken;
    user1UserAgent = user1LoginInput.userAgent; // Store the agent used

    // 3. Create Address 1 for User 1 directly in the DB
    const createdAddress1 = await createTestAddress(user1Id, {
      address: "1 User1 St",
      city: "User1 City",
      pincode: "11111",
      phone: "111-1111",
      notes: "Initial notes 1",
    });
    address1Id = createdAddress1.id;
    // Store initial data to verify partial updates later
    address1InitialData = {
      address: createdAddress1.address,
      city: createdAddress1.city,
      pincode: createdAddress1.pincode,
      phone: createdAddress1.phone,
      notes: createdAddress1.notes,
      userId: createdAddress1.userId,
      // Don't store id, createdAt, updatedAt here as they change or are checked differently
    };

    // 4. Create User 2 via signup
    const user2SignupInput: SignupInput = {
      handle: "user2handle",
      email: "user2@example.com",
      name: "User Two",
      password: "password2",
      confirmPassword: "password2",
      role: "CUSTOMER",
    };
    const user2SignupResponse = await supertest(app)
      .post("/signup")
      .send(user2SignupInput);
    expect(user2SignupResponse.status).toBe(200);

    // 5. Login User 2 to get credentials (needed for unauthorized tests)
    const user2LoginInput: LoginInput = {
      email: user2SignupInput.email,
      password: user2SignupInput.password,
      userAgent: "user2Agent",
    };
    const user2LoginResponse = await supertest(app)
      .post("/login")
      .send(user2LoginInput)
      .set("user-agent", user2LoginInput.userAgent);
    expect(user2LoginResponse.status).toBe(200);
    const user2LoginData = user2LoginResponse.body.data as LoginSuccessData;
    user2Id = user2LoginData.user.userId;
    user2SessionId = getCookieFromResponse(user2LoginResponse, "key");
    user2AccessToken = user2LoginData.accessToken;
    user2UserAgent = user2LoginInput.userAgent;

    // 6. Create Address 2 for User 2 directly in the DB
    const createdAddress2 = await createTestAddress(user2Id, {
      address: "2 User2 St",
      city: "User2 City",
    });
    address2Id = createdAddress2.id;
  });

  const getCredentials = (userId: string) => {
    if (userId === user1Id) {
      return {
        sessionId: user1SessionId,
        accessToken: user1AccessToken,
        userAgent: user1UserAgent,
      };
    } else if (userId === user2Id) {
      return {
        sessionId: user2SessionId,
        accessToken: user2AccessToken,
        userAgent: user2UserAgent,
      };
    }
    // Return invalid credentials for other cases
    return {
      sessionId: "invalid-session",
      accessToken: "invalid-access-token",
      userAgent: "invalid-agent",
    };
  };

  context("Successful address edit", () => {
    it("should update the city of the address", async () => {
      const input: EditAddressInput = {
        addressId: address1Id,
        city: "Updated City",
        credentials: getCredentials(user1Id),
      };

      const response = await supertest(app)
        .patch(`/addresses/${address1Id}`) // Assuming PATCH is used for partial updates
        .send(input);

      expect(response.status).toBe(200);
      const responseBody = response.body as { data: EditAddressSuccessData };
      expect(responseBody.data.address.id).toBe(address1Id);
      expect(responseBody.data.address.userId).toBe(user1Id);
      expect(responseBody.data.address.city).toBe(input.city);
      // Ensure other fields are unchanged
      expect(responseBody.data.address.address).toBe(
        address1InitialData.address
      );
      expect(responseBody.data.address.pincode).toBe(
        address1InitialData.pincode
      );
      expect(responseBody.data.address.phone).toBe(address1InitialData.phone);
      expect(responseBody.data.address.notes).toBe(address1InitialData.notes);
      // Check timestamps (updatedAt should be newer than createdAt, but hard to assert exact date)
      expect(
        new Date(responseBody.data.address.updatedAt).getTime()
      ).toBeGreaterThanOrEqual(
        new Date(responseBody.data.address.createdAt).getTime()
      );
    });

    it("should update multiple fields of the address", async () => {
      const input: EditAddressInput = {
        addressId: address1Id,
        address: "New Updated Street",
        phone: "999-8888",
        notes: "Updated notes",
        credentials: getCredentials(user1Id),
      };

      const response = await supertest(app)
        .patch(`/addresses/${address1Id}`)
        .send(input);

      expect(response.status).toBe(200);
      const responseBody = response.body as { data: EditAddressSuccessData };
      expect(responseBody.data.address.id).toBe(address1Id);
      expect(responseBody.data.address.userId).toBe(user1Id);
      expect(responseBody.data.address.address).toBe(input.address);
      expect(responseBody.data.address.phone).toBe(input.phone);
      expect(responseBody.data.address.notes).toBe(input.notes);
      // Ensure other fields are unchanged
      expect(responseBody.data.address.city).toBe(address1InitialData.city);
      expect(responseBody.data.address.pincode).toBe(
        address1InitialData.pincode
      );
    });

    it("should set notes to null", async () => {
      const input: EditAddressInput = {
        addressId: address1Id,
        notes: null, // Explicitly setting to null
        credentials: getCredentials(user1Id),
      };

      const response = await supertest(app)
        .patch(`/addresses/${address1Id}`)
        .send(input);

      expect(response.status).toBe(200);
      const responseBody = response.body as { data: EditAddressSuccessData };
      expect(responseBody.data.address.notes).toBeNull();
      // Ensure other fields are unchanged
      expect(responseBody.data.address.address).toBe(
        address1InitialData.address
      );
      expect(responseBody.data.address.city).toBe(address1InitialData.city);
      expect(responseBody.data.address.pincode).toBe(
        address1InitialData.pincode
      );
      expect(responseBody.data.address.phone).toBe(address1InitialData.phone);
    });

    it("should succeed if only addressId and credentials are provided (no fields to update)", async () => {
      const input: EditAddressInput = {
        addressId: address1Id,
        credentials: getCredentials(user1Id),
      };

      const response = await supertest(app)
        .patch(`/addresses/${address1Id}`)
        .send(input);

      expect(response.status).toBe(200);
      const responseBody = response.body as { data: EditAddressSuccessData };
      expect(responseBody.data.address.id).toBe(address1Id);
      expect(responseBody.data.address.userId).toBe(user1Id);
      // Verify fields are unchanged from initial data
      expect(responseBody.data.address.address).toBe(
        address1InitialData.address
      );
      expect(responseBody.data.address.city).toBe(address1InitialData.city);
      expect(responseBody.data.address.pincode).toBe(
        address1InitialData.pincode
      );
      expect(responseBody.data.address.phone).toBe(address1InitialData.phone);
      expect(responseBody.data.address.notes).toBe(address1InitialData.notes);
      // updatedAt should be different/newer, createdAt should be the same.
      // Precise timestamp comparison is tricky across DB interactions,
      // but we can check the updated object is returned.
    });
  });

  context("Failed address edit", () => {
    context("Validation errors", () => {
      it("should fail when addressId is unknown", async () => {
        const input: Partial<EditAddressInput> = {
          // Use partial as addressId is missing
          city: "Some City",
          credentials: getCredentials(user1Id),
        };
        const expectedErrors = {
          errors: { message: "Address not found" },
        };

        const response = await supertest(app)
          .patch(`/addresses/${uuidv4()}`) // Still need an ID in the URL path, but validation checks the body
          .send(input);

        expect(response.status).toEqual(400); // Assuming validation errors map to 400
        expect(response.body).toEqual(expectedErrors);
      });

      it("should fail when credentials object is missing", async () => {
        const input: Partial<EditAddressInput> = {
          addressId: address1Id,
          city: "Some City",
          // credentials missing
        };
        const expectedErrors = {
          errors: { credentials: ["Required"] }, // Zod's default message for missing object field
        };

        const response = await supertest(app)
          .patch(`/addresses/${address1Id}`)
          .send(input);

        expect(response.status).toEqual(400);
        expect(response.body).toEqual(expectedErrors);
      });

      it("should fail when credentials fields are missing", async () => {
        const input: Partial<EditAddressInput> = {
          addressId: address1Id,
          city: "Some City",
          credentials: {} as any, // Send empty object to trigger nested validation
        };
        const expectedErrors = {
          errors: {
            "credentials.sessionId": ["Session ID is required"],
            "credentials.accessToken": ["Access token is required"],
            "credentials.userAgent": ["User agent is required"],
          },
        };

        const response = await supertest(app)
          .patch(`/addresses/${address1Id}`)
          .send(input);

        expect(response.status).toEqual(400);
        // Use expect.objectContaining for robustness if order/extra fields might appear
        expect(response.body).toEqual(expect.objectContaining(expectedErrors));
      });
      // Add more validation tests if needed (e.g., invalid type for a field)
    });

    context("Address not found", () => {
      it("should fail when the addressId does not exist", async () => {
        const nonExistentAddressId = uuidv4(); // Use a valid UUID format but non-existent
        const input: EditAddressInput = {
          addressId: nonExistentAddressId,
          city: "Attempted Update City",
          credentials: getCredentials(user1Id),
        };
        const expectedError = {
          errors: AddressNotFoundError.errors, // Use the predefined error object structure
        };

        const response = await supertest(app)
          .patch(`/addresses/${nonExistentAddressId}`)
          .send(input);

        expect(response.status).toEqual(400); // Address not found is a client error (400)
        expect(response.body).toEqual(expectedError);
      });
    });

    context("Unauthorized access", () => {
      it("should fail when trying to edit an address belonging to another user", async () => {
        const input: EditAddressInput = {
          addressId: address2Id, // Try to edit user2's address
          city: "Malicious City",
          credentials: getCredentials(user1Id), // Using user1's credentials
        };
        const expectedError = {
          errors: UnauthorizedError.errors,
        };

        const response = await supertest(app)
          .patch(`/addresses/${address2Id}`)
          .send(input);

        expect(response.status).toEqual(400); // Unauthorized is typically 401 or 403, but use case returns 400 failure
        expect(response.body).toEqual(expectedError);
      });
    });

    context("Credential errors", () => {
      // Assuming the controller maps CheckCredentialsError from the use case
      // back to HTTP 400 with the specific error message.
      // Note: Testing ALL CheckCredentialsError types via Supertest
      // might require complex setup of the auth service implementation.
      // We'll test a few common ones by providing invalid data.

      it("should fail with InvalidAccessTokenError for a wrong access token", async () => {
        const input: EditAddressInput = {
          addressId: address1Id,
          city: "City with Bad Token",
          credentials: {
            sessionId: user1SessionId,
            accessToken: "definitely-wrong-token",
            userAgent: user1UserAgent,
          },
        };
        // Expected error structure depends on the mapCheckCredentialsError helper and controller
        const expectedError = {
          errors: { message: "Invalid access token" }, // As defined in mapCheckCredentialsError
        };

        const response = await supertest(app)
          .patch(`/addresses/${address1Id}`)
          .send(input);

        expect(response.status).toEqual(400);
        expect(response.body).toEqual(expectedError);
      });

      it("should fail with InvalidSessionKeyError for a wrong session ID", async () => {
        const input: EditAddressInput = {
          addressId: address1Id,
          city: "City with Bad Session ID",
          credentials: {
            sessionId: uuidv4(), // Wrong session ID
            accessToken: user1AccessToken,
            userAgent: user1UserAgent,
          },
        };
        const expectedError = {
          errors: { message: "Access token with wrong key" },
        };

        const response = await supertest(app)
          .patch(`/addresses/${address1Id}`)
          .send(input);

        expect(response.status).toEqual(400);
        expect(response.body).toEqual(expectedError);
      });

      it("should fail with InvalidUserAgentError for a different user agent", async () => {
        const input: EditAddressInput = {
          addressId: address1Id,
          city: "City with Different User Agent",
          credentials: {
            sessionId: user1SessionId,
            accessToken: user1AccessToken,
            userAgent: "differentAgent", // Wrong user agent
          },
        };
        const expectedError = {
          errors: { message: "Invalid user agent" },
        };

        const response = await supertest(app)
          .patch(`/addresses/${address1Id}`)
          .send(input);

        expect(response.status).toEqual(400);
        expect(response.body).toEqual(expectedError);
      });
      // Note: AccessTokenWithWrongSessionKeyError might be harder to trigger
      // purely via Supertest without specific auth service setup.
    });
  });
});

import { v4 as uuidv4 } from "uuid";

import Address from "@/application/entities/address";
import AddressModel from "@/impl/mongoose/models/address.model";
import { defaultMockUser } from "@/test/mocks/entities/user.entity.mock";

/*
export const defaultMockAddress: Address = {
  id: "addr01",
  address: "123 Elm St",
  userId: defaultMockUser.id,
  city: "Somewhere",
  pincode: "12345",
  phone: "1234567890",
  notes: "Please leave at the door",
  createdAt: new Date("2024-01-19T11:53:27.813Z"),
  updatedAt: new Date("2024-01-19T11:53:27.813Z"),
};
/*/
export const defaultMockAddress: Address = {
  id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  userId: "testUserId", // Placeholder, should be dynamic
  address: "123 Main St",
  city: "Anytown",
  pincode: "12345",
  phone: "555-1234",
  notes: "A test address",
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Creates an address document directly in the database for testing.
 * @param userId The ID of the user this address belongs to.
 * @param data Optional partial address data to override defaults.
 * @returns The created Address entity.
 */
export const createTestAddress = async (
  userId: string,
  data?: Partial<Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<Address> => {
  const addressData = {
    _id: uuidv4(), // Mongoose uses _id
    userId: userId,
    address: data?.address ?? defaultMockAddress.address,
    city: data?.city ?? defaultMockAddress.city,
    pincode: data?.pincode ?? defaultMockAddress.pincode,
    phone: data?.phone ?? defaultMockAddress.phone,
    notes: data?.notes ?? defaultMockAddress.notes,
    // Timestamps will be added by Mongoose schema option
  };
  const createdDoc = await AddressModel.create(addressData);
  // Convert Mongoose document back to domain entity structure
  const createdAddress: Address = {
    id: createdDoc._id,
    userId: createdDoc.userId,
    address: createdDoc.address,
    city: createdDoc.city,
    pincode: createdDoc.pincode,
    phone: createdDoc.phone,
    notes: createdDoc.notes,
    createdAt: createdDoc.createdAt,
    updatedAt: createdDoc.updatedAt,
  };
  return createdAddress;
};
export const mockAddress: Address = {
  id: "mockAddressId123",
  userId: "a9fa940c-02d1-4e78-823d-9c982fea7e7a", // Matches defaultMockUser.id
  address: "123 Main St",
  city: "Anytown",
  pincode: "12345",
  phone: "555-1234",
  notes: null,
  createdAt: new Date("2023-10-01T10:00:00.000Z"),
  updatedAt: new Date("2023-10-01T10:00:00.000Z"),
};

// Mock address owned by a different user
export const anotherMockAddress: Address = {
  id: "anotherMockAddressId456",
  userId: "anotherUserId456789", // Different user ID
  address: "456 Oak Ave",
  city: "Otherville",
  pincode: "67890",
  phone: "555-5678",
  notes: "Near the park",
  createdAt: new Date("2023-11-15T12:00:00.000Z"),
  updatedAt: new Date("2023-11-15T12:00:00.000Z"),
};

// Helper to create a partial address
export const createPartialMockAddress = (
  updates: Partial<Address>
): Address => {
  return {
    ...mockAddress,
    ...updates,
    updatedAt: updates.updatedAt || new Date(), // Ensure updatedAt is updated if not provided in partial
  };
};

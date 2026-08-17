import { User } from "@/application/entities/user";
import UserModel from "@/impl/mongoose/models/user.model";

export const existingHandle = "existingHandle";
export const existingEmail = "existing@example.com";

export const defaultMockUser: User = {
  id: "a9fa940c-02d1-4e78-823d-9c982fea7e7a",
  handle: "pat",
  name: "Pat Example",
  email: "pat@example.com",
  password: "hashedPass",
  role: "CUSTOMER",
  createdAt: new Date("2024-01-19T11:53:27.813Z"),
  updatedAt: new Date("2024-01-19T11:53:27.813Z"),
};
export const existingMockUser: User = {
  id: "a9fa940c-02d1-4e78-823d-9c982fea7e7a",
  handle: existingHandle,
  name: "Existing User",
  email: existingEmail,
  password: "hashedPass",
  role: "CUSTOMER",
  createdAt: new Date("2024-01-19T11:53:27.813Z"),
  updatedAt: new Date("2024-01-19T11:53:27.813Z"),
};

export const createTestUser = async (user: Partial<User>): Promise<User> => {
  // const newUser: User = {
  //   id: user.id ?? "testUserId",
  //   handle: user.handle ?? "testHandle",
  //   name: user.name ?? "Test User",
  //   email: user.email ?? "test@example.com",
  //   password: user.password ?? "hashedPass",
  //   role: user.role ?? "CUSTOMER",
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // };
  // const savedUser = await UserModel.create(newUser);
  const savedUser = await UserModel.create({
    _id: existingMockUser.id,
    ...existingMockUser,
    // password: await hasher(existingMockUser.password),
  });
  return savedUser;
};
/*
export const createTestAddress = async (
  address: Partial<Address>,
  userId: string
): Promise<Address> => {
  const newAddress: Address = {
    // id: address.id ?? "testAddressId",
    address: address.address ?? "123 Test St",
    // userId: userId,
    city: address.city ?? "Test City",
    pincode: address.pincode ?? "123456",
    phone: address.phone ?? "1234567890",
    notes: address.notes ?? "Test Notes",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const savedAddress = await AddressModel.create(newAddress);
  return savedAddress;
};
*/

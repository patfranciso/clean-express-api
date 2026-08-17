import Address from "@/application/entities/address";

export type SaveAddress = (address: Address) => Promise<Address>;
export type FindAddressById = (addressId: string) => Promise<Address | null>;
export type FindAddressesByUserId = (userId: string) => Promise<Address[]>;
export type UpdateAddress = (address: Address) => Promise<Address>;

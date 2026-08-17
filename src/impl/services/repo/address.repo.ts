import AddressModel from "@/impl/mongoose/models/address.model";
import {
  SaveAddress,
  FindAddressById,
  UpdateAddress,
} from "@/application/boundaries/entity-gateway/address.gateway";
import Address from "@/application/entities/address";
import { docToEntity } from "@/utils/mappers";

export const saveAddress: SaveAddress = async (address: Address) => {
  const addressDoc = await AddressModel.create({ _id: address.id, ...address });

  const addressData: Address = {
    id: addressDoc.id as unknown as string,
    address: addressDoc.address,
    userId: addressDoc.userId,
    city: addressDoc.city,
    pincode: addressDoc.pincode,
    phone: addressDoc.phone,
    notes: addressDoc.notes,
    createdAt: addressDoc.createdAt,
    updatedAt: addressDoc.updatedAt,
  };
  return addressData;
};

export const findAddressById: FindAddressById = async (addressId: string) => {
  const addressDoc = await AddressModel.findById(addressId).exec();

  if (addressDoc === null) return null;

  const addressData: Address = {
    id: addressDoc.id as unknown as string,
    address: addressDoc.address,
    userId: addressDoc.userId,
    city: addressDoc.city,
    pincode: addressDoc.pincode,
    phone: addressDoc.phone,
    notes: addressDoc.notes,
    createdAt: addressDoc.createdAt,
    updatedAt: addressDoc.updatedAt,
  };
  return addressData;
};

export const updateAddress: UpdateAddress = async (address: Address) => {
  // Mongoose update expects _id, not id.
  // The entity already has the correct `updatedAt` from the use case logic.
  const updateData = {
    ...address,
    // Mongoose will use the document's _id from the query;
    // no need to explicitly put `_id: address.id` in the update payload itself,
    // as _id is immutable and including it might cause issues or be ignored.
    // We pass the address object which has 'id', we use 'address.id' in the findByIdAndUpdate query.
    // The rest of the properties will be used for the update.
  };

  // Use findByIdAndUpdate to get the updated document back
  const updatedDoc = await AddressModel.findByIdAndUpdate(
    address.id, // Query by _id which is mapped from address.id
    updateData, // Use the entity data for the update payload
    { new: true } // Return the modified document
  ).exec();

  if (!updatedDoc) {
    // This case *shouldn't* happen if findAddressById already found it,
    // but defensive coding is good.
    throw new Error("Failed to find address after update attempt");
  }

  // Convert the updated Mongoose document back to a domain entity
  return docToEntity<Address>(updatedDoc.toJSON());
};

import CartRecordType from "@/impl/mongoose/record-types/cart.record-type";
import { ObjectId } from "mongodb"; // Assuming ObjectId is consistently imported from 'mongodb'

import { Cart } from "@/application/entities/cart";
import { FlattenMaps } from "mongoose"; // Used for Mongoose's .lean() or .toObject() results
import CartModel from "@/impl/mongoose/models/cart.model";
import {
  FindCartByUserId,
  CreateCart,
  UpdateCart,
} from "@/application/boundaries/entity-gateway/cart.gateway";
import { MongoDbDoc, docToEntity } from "@/utils/mappers";

export const findCartByUserId: FindCartByUserId = async (
  userId: string | ObjectId
) => {
  const cartDoc = await CartModel.findOne({ userId })
    .lean<FlattenMaps<CartRecordType> & MongoDbDoc>()
    .exec();
  if (!cartDoc) return null;
  return docToEntity<Cart>(cartDoc);
};

export const createCart: CreateCart = async (cart: Cart) => {
  const cartDoc = await CartModel.create({ _id: cart.id, ...cart });
  // Mongoose .create() returns a document, we need to convert it to a plain object and then to our entity
  const result = cartDoc.toObject<FlattenMaps<CartRecordType> & MongoDbDoc>();
  return docToEntity<Cart>(result);
};

export const updateCart: UpdateCart = async (cart: Cart) => {
  const updatedDoc = await CartModel.findByIdAndUpdate(
    cart.id,
    { ...cart, _id: cart.id }, // Ensure _id is consistent and use spread for updates
    { new: true, runValidators: true } // Return the new document, run schema validators
  ).lean<FlattenMaps<CartRecordType> & MongoDbDoc>();

  if (!updatedDoc) {
    // This case should ideally not happen if the cart.id was valid,
    // but good to handle defensively.
    throw new Error(`Cart with ID ${cart.id} not found for update.`);
  }
  return docToEntity<Cart>(updatedDoc);
};

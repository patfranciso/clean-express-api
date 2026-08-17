import { Cart } from "@/application/entities/cart";

/**
 * Finds a user's cart by their ID.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the Cart object if found, otherwise null.
 */
export type FindCartByUserId = (userId: string) => Promise<Cart | null>;

/**
 * Creates a new cart entry.
 * @param cart The Cart object to create.
 * @returns A promise that resolves to the created Cart object.
 */
export type CreateCart = (cart: Cart) => Promise<Cart>;

/**
 * Updates an existing cart entry.
 * @param cart The Cart object to update. The ID property is used to identify the cart.
 * @returns A promise that resolves to the updated Cart object.
 */
export type UpdateCart = (cart: Cart) => Promise<Cart>;

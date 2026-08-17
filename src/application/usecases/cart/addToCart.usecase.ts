import { isEr, CanFail } from "@/utils/canFail";
import { Cart } from "@/application/entities/cart";
import {
  UidGenerator,
  CurrentDateGenerator,
} from "@/application/boundaries/utils.def";
import {
  FindCartByUserId,
  CreateCart,
  UpdateCart,
} from "@/application/boundaries/entity-gateway/cart.gateway";
import { FindProductById } from "@/application/boundaries/entity-gateway/product.gateway";

/**
 * Creates an "Add to Cart" use case function.
 * This use case handles adding a specified quantity of a product to a user's cart.
 * It validates input, checks product availability, and either creates a new cart
 * or updates an existing one for the user.
 *
 * @param props Dependencies required by the use case (e.g., validators, gateways, utility functions).
 * @returns An async function that takes AddToCartInput and returns an AddToCartResult.
 */
export const makeAddToCartUseCase =
  ({
    validate,
    findProductById,
    findCartByUserId,
    createCart,
    updateCart,
    uid,
    currentDate,
  }: MakeAddToCartUseCaseProps) =>
  async (input: AddToCartInput): Promise<AddToCartResult> => {
    // 1. Validate input
    const validationResult = validate(input);
    if (isEr(validationResult)) {
      return {
        status: "failed",
        meta: "ValidationError",
        errors: validationResult.err,
      };
    }

    const { userId, productId, quantity } = input;

    // 2. Find Product and check existence
    const product = await findProductById(productId);
    if (!product) {
      return ProductNotFoundError;
    }

    // 3. Find user's cart
    let userCart = await findCartByUserId(userId);

    // Calculate effective quantity to add (considering current cart if product already exists)
    let currentQuantityInCart = 0;
    if (userCart) {
      const existingCartItem = userCart.items.find(
        (item) => item.productId === productId
      );
      if (existingCartItem) {
        currentQuantityInCart = existingCartItem.quantity;
      }
    }
    const totalRequestedQuantity = currentQuantityInCart + quantity;

    // 4. Check Product Stock against total requested quantity
    if (product.totalStock < totalRequestedQuantity) {
      return InsufficientStockError;
    }

    // 5. Update or Create Cart based on existence
    if (!userCart) {
      // Create a new cart for the user
      userCart = {
        id: uid(), // Generate a unique ID for the new cart
        userId: userId,
        items: [
          {
            productId: productId,
            quantity: quantity,
          },
        ],
        createdAt: currentDate(),
        updatedAt: currentDate(),
      };
      await createCart(userCart);
    } else {
      // Update existing cart
      const existingCartItemIndex = userCart.items.findIndex(
        (item) => item.productId === productId
      );

      if (existingCartItemIndex > -1) {
        // Product already in cart, update its quantity
        userCart.items[existingCartItemIndex].quantity = totalRequestedQuantity;
      } else {
        // Product not in cart, add as a new item
        userCart.items.push({
          productId: productId,
          quantity: quantity,
        });
      }
      userCart.updatedAt = currentDate(); // Update the cart's last modified timestamp
      await updateCart(userCart);
    }

    // 6. Return success result with the updated/created cart
    return {
      status: "success",
      meta: "AddToCartSuccess",
      data: { cart: userCart },
    };
  };

/**
 * Input type for the Add To Cart use case.
 */
export interface AddToCartInput {
  userId: string;
  productId: string;
  quantity: number;
  userAgent?: string; // Optional, might be used for session tracking
}

/**
 * Output data for a successful Add To Cart operation.
 */
export type AddToCartOutput =
  | { data: AddToCartSuccess["data"] }
  | { errors: AddToCartErrors };

/**
 * Type for an object containing validation or other errors.
 */
export type AddToCartErrors = Record<string, any>;

/**
 * Type definition for the input validation function specific to AddToCart.
 */
export type ValidateAddToCartInput = (
  data: AddToCartInput
) => CanFail<AddToCartErrors, AddToCartInput>;

/**
 * Union type representing all possible outcomes of the Add To Cart use case.
 */
export type AddToCartResult =
  | AddToCartSuccess
  | AddToCartFailure
  | AddToCartUnexpectedError;

/**
 * Type for a successful Add To Cart operation.
 */
export type AddToCartSuccess = {
  status: "success";
  meta: "AddToCartSuccess";
  data: { cart: Cart };
};

/**
 * Type for a failed Add To Cart operation due to business rules or validation.
 */
export type AddToCartFailure = {
  status: "failed";
  meta: "ValidationError" | "ProductNotFoundError" | "InsufficientStockError";
  errors: AddToCartErrors;
};

/**
 * Type for an unexpected error during the Add To Cart operation.
 */
export type AddToCartUnexpectedError = {
  status: "error";
  meta: "AddToCartUnexpectedError";
  errors: AddToCartErrors;
};

/**
 * Predefined error object for when a product is not found.
 */
export const ProductNotFoundError: AddToCartFailure = {
  status: "failed",
  meta: "ProductNotFoundError",
  errors: { message: "Product not found." },
};

/**
 * Predefined error object for when there is insufficient stock.
 */
export const InsufficientStockError: AddToCartFailure = {
  status: "failed",
  meta: "InsufficientStockError",
  errors: { message: "Insufficient stock for the requested product." },
};

/**
 * Properties required to construct the Add To Cart use case.
 * These are functions representing dependencies like validation, database operations, and utility generators.
 */
export type MakeAddToCartUseCaseProps = {
  validate: ValidateAddToCartInput;
  findProductById: FindProductById;
  findCartByUserId: FindCartByUserId;
  createCart: CreateCart;
  updateCart: UpdateCart;
  uid: UidGenerator;
  currentDate: CurrentDateGenerator;
};

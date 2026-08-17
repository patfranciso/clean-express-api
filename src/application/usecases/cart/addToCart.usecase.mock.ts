import { validateAddToCart } from "./addToCart.validate";
import { makeAddToCartUseCase } from "./addToCart.usecase";
import { mockUid, mockDate } from "@/test/mocks/service/utils.mock";
import {
  defaultMockProduct,
  lowStockMockProduct,
  outOfStockMockProduct,
} from "@/test/mocks/entities/product.entity.mock";
import {
  defaultMockCart,
  cartWithExistingProduct,
} from "@/test/mocks/entities/cart.entity.mock";

// Helper to deep copy carts to avoid mutation across tests
const deepCopyCart = (cart: any) => JSON.parse(JSON.stringify(cart));

// --- Mocks for successful scenarios ---

// Scenario 1: Add to an empty cart
export const addToEmptyCartUseCase = makeAddToCartUseCase({
  validate: validateAddToCart,
  findProductById: async (id) =>
    id === defaultMockProduct.id ? defaultMockProduct : null,
  findCartByUserId: async (userId) => null, // No existing cart
  createCart: async (cart) => ({
    ...cart,
    id: mockUid(),
    createdAt: mockDate(),
    updatedAt: mockDate(),
  }), // Simulate creation
  updateCart: async (cart) => cart, // Should not be called
  uid: mockUid,
  currentDate: mockDate,
});

// Scenario 2: Add a new product to an existing cart (without that product)
export const addNewProductToExistingCartUseCase = makeAddToCartUseCase({
  validate: validateAddToCart,
  findProductById: async (id) =>
    id === defaultMockProduct.id ? defaultMockProduct : null,
  findCartByUserId: async (userId) => deepCopyCart(defaultMockCart), // Existing empty cart
  createCart: async (cart) => cart, // Should not be called
  updateCart: async (cart) => cart, // Simulate update
  uid: mockUid,
  currentDate: mockDate,
});

// Scenario 3: Add more quantity to an existing product in cart
export const addQuantityToExistingProductInCartUseCase = makeAddToCartUseCase({
  validate: validateAddToCart,
  findProductById: async (id) =>
    id === defaultMockProduct.id ? defaultMockProduct : null,
  findCartByUserId: async (userId) => deepCopyCart(cartWithExistingProduct), // Existing cart with product "product-001" (qty 2)
  createCart: async (cart) => cart, // Should not be called
  updateCart: async (cart) => cart, // Simulate update
  uid: mockUid,
  currentDate: mockDate,
});

// --- Mocks for failed scenarios ---

// Scenario 4: Product not found
export const unknownProductAddToCartUseCase = makeAddToCartUseCase({
  validate: validateAddToCart,
  findProductById: async (id) => null, // Product not found
  findCartByUserId: async (userId) => null,
  createCart: async (cart) => cart,
  updateCart: async (cart) => cart,
  uid: mockUid,
  currentDate: mockDate,
});

// Scenario 5: Insufficient stock (initial add)
export const insufficientStockInitialAddToCartUseCase = makeAddToCartUseCase({
  validate: validateAddToCart,
  findProductById: async (id) =>
    id === outOfStockMockProduct.id ? outOfStockMockProduct : null, // Product with low stock (totalStock: 5)
  findCartByUserId: async (userId) => null, // No existing cart
  createCart: async (cart) => cart,
  updateCart: async (cart) => cart,
  uid: mockUid,
  currentDate: mockDate,
});

// Scenario 6: Insufficient stock (add to existing product)
export const insufficientStockExistingAddToCartUseCase = makeAddToCartUseCase({
  validate: validateAddToCart,
  findProductById: async (id) =>
    id === lowStockMockProduct.id ? lowStockMockProduct : null, // Product with low stock (totalStock: 5)
  findCartByUserId: async (userId) => ({
    ...deepCopyCart(defaultMockCart),
    items: [{ productId: lowStockMockProduct.id, quantity: 3 }], // Already has 3 of the low stock product
  }),
  createCart: async (cart) => cart,
  updateCart: async (cart) => cart,
  uid: mockUid,
  currentDate: mockDate,
});

// Scenario 7: Gateway throws an unexpected error
export const throwingGatewayAddToCartUseCase = makeAddToCartUseCase({
  validate: validateAddToCart,
  findProductById: async (id) => {
    throw new Error("Database connection failed");
  },
  findCartByUserId: async (userId) => null,
  createCart: async (cart) => cart,
  updateCart: async (cart) => cart,
  uid: mockUid,
  currentDate: mockDate,
});

// For validation tests, we can reuse any of the above mocks as the validation step comes first.
// The `validateAddToCart` function is the primary focus for validation errors.

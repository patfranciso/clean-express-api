import expect from "expect";
import {
  AddToCartInput,
  AddToCartResult,
  ProductNotFoundError,
  InsufficientStockError,
} from "./addToCart.usecase";
import {
  addToEmptyCartUseCase,
  addNewProductToExistingCartUseCase,
  addQuantityToExistingProductInCartUseCase,
  unknownProductAddToCartUseCase,
  insufficientStockInitialAddToCartUseCase,
  insufficientStockExistingAddToCartUseCase,
} from "./addToCart.usecase.mock";
import { defaultMockUser } from "@/test/mocks/entities/user.entity.mock";
import {
  defaultMockProduct,
  lowStockMockProduct,
} from "@/test/mocks/entities/product.entity.mock";
import { mockUid, mockDate } from "@/test/mocks/service/utils.mock";

describe("AddToCartUseCase Unit Tests", () => {
  const commonInput: AddToCartInput = {
    userId: defaultMockUser.id,
    productId: defaultMockProduct.id,
    quantity: 1,
    userAgent: "test-agent",
  };

  context("Successful Add To Cart", () => {
    it("should add a product to an empty cart and return success", async () => {
      const payload: AddToCartInput = { ...commonInput, quantity: 5 };
      const result: AddToCartResult = await addToEmptyCartUseCase(payload);

      expect(result.status).toEqual("success");
      expect(result.meta).toBe("AddToCartSuccess");
      if (result.status === "success") {
        expect(result.data.cart).toEqual({
          id: mockUid(),
          userId: defaultMockUser.id,
          items: [{ productId: defaultMockProduct.id, quantity: 5 }],
          createdAt: mockDate(),
          updatedAt: mockDate(),
        });
      }
    });

    it("should add a new product to an existing cart (without that product) and return success", async () => {
      const payload: AddToCartInput = { ...commonInput, quantity: 3 };
      const result: AddToCartResult = await addNewProductToExistingCartUseCase(
        payload
      );

      expect(result.status).toEqual("success");
      expect(result.meta).toBe("AddToCartSuccess");
      if (result.status === "success") {
        expect(result.data.cart.id).toEqual("cart-001"); // Should be the ID of the mocked defaultMockCart
        expect(result.data.cart.userId).toEqual(defaultMockUser.id);
        expect(result.data.cart.items).toEqual([
          { productId: defaultMockProduct.id, quantity: 3 },
        ]);
        expect(result.data.cart.updatedAt).toEqual(mockDate());
      }
    });

    it("should update quantity for an existing product in the cart and return success", async () => {
      const payload: AddToCartInput = { ...commonInput, quantity: 3 }; // Existing cart has 2, adding 3 makes 5
      const result: AddToCartResult =
        await addQuantityToExistingProductInCartUseCase(payload);

      expect(result.status).toEqual("success");
      expect(result.meta).toBe("AddToCartSuccess");
      if (result.status === "success") {
        expect(result.data.cart.id).toEqual("cart-002"); // Should be the ID of the mocked cartWithExistingProduct
        expect(result.data.cart.userId).toEqual(defaultMockUser.id);
        expect(result.data.cart.items).toEqual([
          { productId: defaultMockProduct.id, quantity: 5 }, // 2 (initial) + 3 (added) = 5
        ]);
        expect(result.data.cart.updatedAt).toEqual(mockDate());
      }
    });
  });

  context("Failed Add To Cart", () => {
    context("Validation errors", () => {
      it("should fail when userId is empty", async () => {
        const payload: AddToCartInput = {
          ...commonInput,
          userId: "",
        };

        const result = await addToEmptyCartUseCase(payload);
        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            userId: ["User ID cannot be empty"],
          },
        });
      });

      it("should fail when productId is empty", async () => {
        const payload: AddToCartInput = {
          ...commonInput,
          productId: "",
        };

        const result = await addToEmptyCartUseCase(payload);
        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            productId: ["Product ID cannot be empty"],
          },
        });
      });

      it("should fail when quantity is zero", async () => {
        const payload: AddToCartInput = {
          ...commonInput,
          quantity: 0,
        };

        const result = await addToEmptyCartUseCase(payload);
        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            quantity: ["Quantity must be positive"],
          },
        });
      });

      it("should fail when quantity is negative", async () => {
        const payload: AddToCartInput = {
          ...commonInput,
          quantity: -1,
        };

        const result = await addToEmptyCartUseCase(payload);
        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            quantity: ["Quantity must be positive"],
          },
        });
      });

      it("should fail when quantity is not an integer", async () => {
        const payload: AddToCartInput = {
          ...commonInput,
          quantity: 1.5,
        };

        const result = await addToEmptyCartUseCase(payload);
        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            quantity: ["Quantity must be an integer"],
          },
        });
      });

      it("should fail when required fields are missing", async () => {
        const payload = {
          userId: defaultMockUser.id, // Missing productId and quantity
        } as unknown as AddToCartInput; // Cast to bypass TS type checking for test

        const result = await addToEmptyCartUseCase(payload);
        expect(result.status).toBe("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "ValidationError",
          errors: {
            productId: ["Product ID is required"],
            quantity: ["Quantity is required"],
          },
        });
      });
    });

    context("Business logic errors", () => {
      it("should fail if product is not found", async () => {
        const payload: AddToCartInput = {
          ...commonInput,
          productId: "non-existent-product",
        };
        const result = await unknownProductAddToCartUseCase(payload);
        expect(result).toBe(ProductNotFoundError);
      });

      it("should fail if there is insufficient stock for an initial add", async () => {
        const payload: AddToCartInput = {
          userId: defaultMockUser.id,
          productId: lowStockMockProduct.id, // Product with totalStock: 5
          quantity: 6, // Requesting more than available
        };
        const result = await insufficientStockExistingAddToCartUseCase(payload);
        expect(result).toBe(InsufficientStockError);
      });

      it("should fail if there is insufficient stock when adding to an existing product in cart", async () => {
        const payload: AddToCartInput = {
          userId: defaultMockUser.id,
          productId: lowStockMockProduct.id, // Product with totalStock: 5
          quantity: 3, // Already 3 in cart, adding 3 makes 6 (insufficient)
        };
        const result = await insufficientStockExistingAddToCartUseCase(payload);
        expect(result).toBe(InsufficientStockError);
      });

      it("should fail if product is completely out of stock", async () => {
        const payload: AddToCartInput = {
          userId: defaultMockUser.id,
          productId: "product-out-of-stock", // Out of stock product
          quantity: 1,
        };
        const result = await insufficientStockInitialAddToCartUseCase(payload); // Using initial add use case as it checks stock
        expect(result).toBe(InsufficientStockError);
      });
    });
  });
});

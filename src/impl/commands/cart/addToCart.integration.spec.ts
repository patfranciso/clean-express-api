import expect from "expect";
import supertest from "supertest";

import createServer from "@/server";
import "@/test/setup"; // Handles DB connection/clearing
import {
  createTestUser,
  defaultMockUser,
} from "@/test/mocks/entities/user.entity.mock";
import {
  createTestProduct,
  defaultMockProduct,
  anotherMockProduct,
  lowStockMockProduct,
  outOfStockMockProduct,
} from "@/test/mocks/entities/product.entity.mock";
import { Cart } from "@/application/entities/cart";
import CartModel from "@/impl/mongoose/models/cart.model"; // For direct DB interaction in tests
import ProductModel from "@/impl/mongoose/models/product.model"; // For direct DB interaction in tests (e.g., seeding, verifying stock)
import {
  AddToCartInput,
  AddToCartSuccess,
} from "@/application/usecases/cart/addToCart.usecase";

// Assuming `createServer()` correctly sets up Express routes and injects
// the `addToCart` use case with its dependencies.
// The route for this use case is assumed to be POST /cart/add-to-cart
const app = createServer();

describe("AddToCartUseCase Integration Tests", () => {
  let user1: typeof defaultMockUser;
  let prod1: typeof defaultMockProduct;
  let prod2: typeof anotherMockProduct;
  let prodLowStock: typeof lowStockMockProduct;
  let prodOutOfStock: typeof outOfStockMockProduct;

  // Before each test, clear the database and seed necessary data
  beforeEach(async () => {
    // Clear collections to ensure test isolation
    await CartModel.deleteMany({});
    await ProductModel.deleteMany({});
    // UserMock has its own setup in /test/setup, but let's explicitly create one
    // for this use case to ensure a consistent userId.
    user1 = await createTestUser({ ...defaultMockUser, id: "test-user-id-1" });

    // Seed products with known stock levels
    prod1 = await createTestProduct({
      ...defaultMockProduct,
      id: "test-product-id-1",
      totalStock: 100,
    });
    prod2 = await createTestProduct({
      ...anotherMockProduct,
      id: "test-product-id-2",
      totalStock: 50,
    });
    prodLowStock = await createTestProduct({
      ...lowStockMockProduct,
      id: "test-product-id-low-stock",
      totalStock: 5,
    });
    prodOutOfStock = await createTestProduct({
      ...outOfStockMockProduct,
      id: "test-product-id-out-of-stock",
      totalStock: 0,
    });
  });

  context("Successful Add To Cart", () => {
    it("should create a new cart and add a product if the user's cart does not exist", async () => {
      const input: AddToCartInput = {
        userId: user1.id,
        productId: prod1.id,
        quantity: 5,
        userAgent: "test-agent", // Optional, but can be passed
      };

      const response = await supertest(app)
        .post("/cart/add-to-cart")
        .send(input);

      expect(response.status).toBe(200);
      const successData = response.body.data as AddToCartSuccess["data"];
      expect(successData.cart).toBeDefined();
      expect(successData.cart.userId).toEqual(user1.id);
      expect(successData.cart.items).toEqual([
        {
          productId: prod1.id,
          quantity: 5,
        },
      ]);
      expect(successData.cart.id).toBeDefined();
      expect(successData.cart.createdAt).toBeDefined();
      expect(successData.cart.updatedAt).toBeDefined();

      // Verify the cart was saved correctly in the database
      const savedCart = await CartModel.findOne({
        _id: successData.cart.id,
      }).lean();
      expect(savedCart).toBeDefined();
      expect(savedCart?.userId).toEqual(user1.id);
      expect(savedCart?.items[0].productId).toEqual(prod1.id);
      expect(savedCart?.items[0].quantity).toEqual(5);
    });

    it("should add a new product to an existing cart for the user", async () => {
      // Seed an existing cart for the user with product1
      const existingCart: Cart = {
        id: "existing-cart-id-1",
        userId: user1.id,
        items: [{ productId: prod1.id, quantity: 2 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await CartModel.create({ _id: existingCart.id, ...existingCart });

      const input: AddToCartInput = {
        userId: user1.id,
        productId: prod2.id, // Adding a different product
        quantity: 3,
        userAgent: "test-agent",
      };

      const response = await supertest(app)
        .post("/cart/add-to-cart")
        .send(input);

      expect(response.status).toBe(200);
      const successData = response.body.data as AddToCartSuccess["data"];
      expect(successData.cart.userId).toEqual(user1.id);
      expect(successData.cart.id).toEqual(existingCart.id); // Should update the existing cart
      expect(successData.cart.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ productId: prod1.id, quantity: 2 }),
          { productId: prod2.id, quantity: 3 },
        ])
      );
      expect(successData.cart.items.length).toBe(2);

      // Verify the updated cart in the database
      const updatedCart = await CartModel.findOne({
        _id: existingCart.id,
      }).lean();
      expect(updatedCart).toBeDefined();
      expect(updatedCart?.items.length).toBe(2);
      expect(updatedCart?.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ productId: prod1.id, quantity: 2 }),
          expect.objectContaining({ productId: prod2.id, quantity: 3 }),
        ])
      );
    });

    it("should increase the quantity of an existing product in the cart", async () => {
      // Seed an existing cart with product1
      const existingCart: Cart = {
        id: "existing-cart-id-2",
        userId: user1.id,
        items: [{ productId: prod1.id, quantity: 2 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await CartModel.create({ _id: existingCart.id, ...existingCart });

      const input: AddToCartInput = {
        userId: user1.id,
        productId: prod1.id, // Adding more of the same product
        quantity: 3,
        userAgent: "test-agent",
      };

      const response = await supertest(app)
        .post("/cart/add-to-cart")
        .send(input);

      expect(response.status).toBe(200);
      const successData = response.body.data as AddToCartSuccess["data"];
      expect(successData.cart.userId).toEqual(user1.id);
      expect(successData.cart.id).toEqual(existingCart.id);
      expect(successData.cart.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ productId: prod1.id, quantity: 5 }), // Original 2 + new 3 = 5
        ])
      );
      expect(successData.cart.items.length).toBe(1);

      // Verify the updated cart in the database
      const updatedCart = await CartModel.findOne({
        _id: existingCart.id,
      }).lean();
      expect(updatedCart).toBeDefined();
      expect(updatedCart?.items.length).toBe(1);
      expect(updatedCart?.items[0].productId).toEqual(prod1.id);
      expect(updatedCart?.items[0].quantity).toEqual(5);
    });

    it("should work correctly when userAgent is not provided (as it's optional)", async () => {
      const input: AddToCartInput = {
        userId: user1.id,
        productId: prod1.id,
        quantity: 1,
        // userAgent intentionally omitted
      };

      const response = await supertest(app)
        .post("/cart/add-to-cart")
        .send(input);

      expect(response.status).toBe(200);
      const successData = response.body.data as AddToCartSuccess["data"];
      expect(successData.cart.userId).toEqual(user1.id);
      expect(successData.cart.items).toEqual([
        { productId: prod1.id, quantity: 1 },
      ]);
    });
  });

  context("Failed Add To Cart", () => {
    context("Validation errors", () => {
      it("should return validation error for missing userId", async () => {
        const input = {
          productId: prod1.id,
          quantity: 1,
        };

        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { userId: ["User ID is required"] },
        });
      });

      it("should return validation error for empty userId", async () => {
        const input = {
          userId: "",
          productId: prod1.id,
          quantity: 1,
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { userId: ["User ID cannot be empty"] },
        });
      });

      it("should return validation error for missing productId", async () => {
        const input = {
          userId: user1.id,
          quantity: 1,
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { productId: ["Product ID is required"] },
        });
      });

      it("should return validation error for empty productId", async () => {
        const input = {
          userId: user1.id,
          productId: "",
          quantity: 1,
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { productId: ["Product ID cannot be empty"] },
        });
      });

      it("should return validation error for missing quantity", async () => {
        const input = {
          userId: user1.id,
          productId: prod1.id,
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { quantity: ["Quantity is required"] },
        });
      });

      it("should return validation error for zero quantity", async () => {
        const input: AddToCartInput = {
          userId: user1.id,
          productId: prod1.id,
          quantity: 0,
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { quantity: ["Quantity must be positive"] },
        });
      });

      it("should return validation error for negative quantity", async () => {
        const input: AddToCartInput = {
          userId: user1.id,
          productId: prod1.id,
          quantity: -1,
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { quantity: ["Quantity must be positive"] },
        });
      });

      it("should return validation error for non-integer quantity", async () => {
        const input: AddToCartInput = {
          userId: user1.id,
          productId: prod1.id,
          quantity: 1.5,
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { quantity: ["Quantity must be an integer"] },
        });
      });
    });

    context("Business logic errors", () => {
      it("should return ProductNotFoundError if the product does not exist", async () => {
        const nonExistentProductId = "non-existent-product-id";
        const input: AddToCartInput = {
          userId: user1.id,
          productId: nonExistentProductId,
          quantity: 1,
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { message: "Product not found." },
        });
      });

      it("should return InsufficientStockError if the requested quantity exceeds stock (initial add)", async () => {
        const input: AddToCartInput = {
          userId: user1.id,
          productId: prodLowStock.id, // prodLowStock has totalStock: 5
          quantity: 6, // Requesting more than available
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { message: "Insufficient stock for the requested product." },
        });
      });

      it("should return InsufficientStockError if the total quantity in cart exceeds stock (adding more to existing cart)", async () => {
        // Seed an existing cart with prodLowStock already
        const existingCart: Cart = {
          id: "existing-cart-id-3",
          userId: user1.id,
          items: [{ productId: prodLowStock.id, quantity: 3 }], // 3 already in cart, prodLowStock has totalStock 5
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await CartModel.create({ _id: existingCart.id, ...existingCart });

        const input: AddToCartInput = {
          userId: user1.id,
          productId: prodLowStock.id,
          quantity: 3, // Adding 3 more, total will be 3+3=6, which exceeds totalStock 5
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { message: "Insufficient stock for the requested product." },
        });
      });

      it("should return InsufficientStockError if the product is completely out of stock", async () => {
        const input: AddToCartInput = {
          userId: user1.id,
          productId: prodOutOfStock.id, // prodOutOfStock has totalStock: 0
          quantity: 1,
        };
        const response = await supertest(app)
          .post("/cart/add-to-cart")
          .send(input);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          errors: { message: "Insufficient stock for the requested product." },
        });
      });
    });
  });
});

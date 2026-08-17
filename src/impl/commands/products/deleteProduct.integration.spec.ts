import expect from "expect";
import supertest from "supertest";

import createServer from "@/server";
import "@/test/setup";
import { createMockProduct } from "@/impl/commands/products/deleteProduct.request.mock";
import { DeleteProductInput } from "@/application/usecases/product/deleteProduct.usecase";
import ProductModel from "@/impl/mongoose/models/product.model";

const app = createServer();

describe("DeleteProductUseCase Integration Tests", () => {
  // Create a product before each test to ensure there's something to delete
  beforeEach(async () => {
    await createMockProduct();
  });

  context("Successful delete", () => {
    it("should return success result for valid input data", async () => {
      const input: DeleteProductInput = {
        productId: "test-product-id",
      };

      const response = await supertest(app)
        .delete(`/api/admin/products/delete/${input.productId}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: {
          productId: input.productId,
        },
      });

      // Check that the product is no longer in the database
      const product = await ProductModel.findById(input.productId);
      expect(product).toBeNull();
    });
  });

  context("Failed delete", () => {
    context("Validation errors", () => {
      it("should fail when product id is invalid", async () => {
        const input: DeleteProductInput = {
          productId: "abc",
        };

        const response = await supertest(app)
          .delete(`/api/admin/products/delete/${input.productId}`)
          .send(input);

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
          errors: {
            productId: ["Product ID must be at least 4 character long"],
          },
        });
      });
    });

    context("Checking for a non-existent product", () => {
      it("should fail for a non-existent product id", async () => {
        const nonExistentProductId = "non-existent-id";
        const input: DeleteProductInput = {
          productId: nonExistentProductId,
        };

        const response = await supertest(app)
          .delete(`/api/admin/products/delete/${nonExistentProductId}`)
          .send(input);

        expect(response.status).toEqual(400);
        expect(response.body).toEqual({
          errors: {
            message: "Product not found",
          },
        });
      });
    });
  });
});

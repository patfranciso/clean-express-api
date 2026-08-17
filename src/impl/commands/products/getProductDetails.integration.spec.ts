import { expect } from "expect";
import supertest from "supertest";

import createServer from "@/server";
import "@/test/setup";
import { saveNewProduct } from "@/impl/services/repo/product.repo";
import { getExistingProductInput } from "./editProduct.request.mock";

const app = createServer();

describe("GetProductDetailsUseCase Integration Tests", () => {
  const existingProduct = getExistingProductInput();

  before(async () => {
    await saveNewProduct({
      id: existingProduct.productId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...existingProduct,
    });
  });

  context("Successfully get details for an existing Product", () => {
    it("should return success result for existing product", async function () {
      const response = await supertest(app).get(
        `/products/${existingProduct.productId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.data.product).toEqual({
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        ...existingProduct,
        productId: undefined,
      });
    });
  });
  context("Fail cases", () => {
    it("should return not found failure for non-existing product", async function () {
      const response = await supertest(app).get(
        "/products/nonExistingProductId}"
      );

      expect(response.status).toBe(404);
      expect(response.body.errors.message).toEqual(expect.any(String));
    });
  });
});

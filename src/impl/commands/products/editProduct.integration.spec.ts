import { expect } from "expect";
import supertest from "supertest";

import createServer from "@/server";
import "@/test/setup";
import { getExistingProductInput } from "./editProduct.request.mock";
import { Product } from "@/application/entities/product";
import { saveNewProduct } from "@/impl/services/repo/product.repo";
import { EditProductInput } from "@/application/usecases/products/editProduct.usecase";

const app = createServer();

describe("EditProductUseCase Integration Tests", () => {
  const existingProductInput = getExistingProductInput();
  let product: Product;

  beforeEach(async () => {
    product = await saveNewProduct({
      id: existingProductInput.productId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...existingProductInput,
    });
  });

  context("Successful Edit Product", () => {
    it("should return success result for valid input data", async function () {
      const updatedProduct: Partial<Product> = {
        title: "Updated Title",
        description: "Updated Description",
        category: "Updated Category",
        brand: "Updated Brand",
        image: "updatedImage.jpg",
        price: 19.99,
        salePrice: 15.99,
        totalStock: 200,
        averageReview: 4.5,
      };

      const input: EditProductInput = {
        productId: existingProductInput.productId,
        title: updatedProduct.title,
        description: updatedProduct.description,
        category: updatedProduct.category,
        brand: updatedProduct.brand,
        image: updatedProduct.image,
        price: updatedProduct.price,
        salePrice: updatedProduct.salePrice,
        totalStock: updatedProduct.totalStock,
        averageReview: updatedProduct.averageReview,
      };

      const response = await supertest(app)
        .put(`/api/admin/products/edit/${input.productId}`)
        .send(input);

      expect(response.status).toBe(200);
      expect(response.body.data.product.id).toEqual(expect.any(String));
      expect(response.body.data.product.title).toEqual(updatedProduct.title);
      expect(response.body.data.product.description).toEqual(
        updatedProduct.description
      );
      expect(response.body.data.product.category).toEqual(
        updatedProduct.category
      );
      expect(response.body.data.product.brand).toEqual(updatedProduct.brand);
      expect(response.body.data.product.image).toEqual(updatedProduct.image);
      expect(response.body.data.product.price).toBe(updatedProduct.price);
      expect(response.body.data.product.salePrice).toBe(
        updatedProduct.salePrice
      );
      expect(response.body.data.product.totalStock).toBe(
        updatedProduct.totalStock
      );
      expect(response.body.data.product.averageReview).toBe(
        updatedProduct.averageReview
      );
    });

    it("should work with valid string inputs for numbers", async function () {
      const updatedProduct: Partial<Product> = {
        title: "Updated Title",
        description: "Updated Description",
        category: "Updated Category",
        brand: "Updated Brand",
        image: "updatedImage.jpg",
        price: 19.99,
        salePrice: 15.99,
        totalStock: 200,
        averageReview: 4.5,
      };

      const input = {
        productId: product!.id,
        title: updatedProduct.title,
        description: updatedProduct.description,
        category: updatedProduct.category,
        brand: updatedProduct.brand,
        image: updatedProduct.image,
        price: String(updatedProduct.price),
        salePrice: String(updatedProduct.salePrice),
        totalStock: String(updatedProduct.totalStock),
        averageReview: String(updatedProduct.averageReview),
      };

      const response = await supertest(app)
        .put(`/api/admin/products/edit/${input.productId}`)
        .send(input);

      expect(response.status).toBe(200);
      expect(response.body.data.product.title).toEqual(updatedProduct.title);
      expect(response.body.data.product.description).toEqual(
        updatedProduct.description
      );
      expect(response.body.data.product.category).toEqual(
        updatedProduct.category
      );
      expect(response.body.data.product.brand).toEqual(updatedProduct.brand);
      expect(response.body.data.product.image).toEqual(updatedProduct.image);
      expect(response.body.data.product.price).toBe(updatedProduct.price);
      expect(response.body.data.product.salePrice).toBe(
        updatedProduct.salePrice
      );
      expect(response.body.data.product.totalStock).toBe(
        updatedProduct.totalStock
      );
      expect(response.body.data.product.averageReview).toBe(
        updatedProduct.averageReview
      );
    });
  });

  context("Failed Edit Product", () => {
    context("Validation errors", () => {
      it("should fail when there is no provided field to edit", async () => {
        const input: EditProductInput = {
          productId: product!.id,
        };

        const response = await supertest(app)
          .put(`/api/admin/products/edit/${input.productId}`)
          .send(input);

        expect(response.status).toEqual(400);
        expect(response.body.errors).toEqual({
          countUpdatedFields: ["Nothing to edit or update"],
        });
      });

      it("should fail when productId is blank", async () => {
        const input: EditProductInput = {
          productId: "",
          title: "Updated Title",
          description: "Updated Description",
          category: "Updated Category",
          brand: "Updated Brand",
          image: "updatedImage.jpg",
          price: 19.99,
          salePrice: 15.99,
          totalStock: 200,
          averageReview: 4.5,
        };

        const response = await supertest(app)
          .put(`/api/admin/products/edit/${product!.id}`)
          .send(input);

        expect(response.status).toEqual(400);
        expect(response.body.errors.productId).toContain(
          "ProductId must be at least 1 character long"
        );
      });

      it("should fail when productId does not exist", async () => {
        const productNotFoundError = {
          errors: { message: "Product not found" },
        };
        const input: EditProductInput = {
          productId: "nonExistentProductId",
          title: "Updated Title",
          description: "Updated Description",
          category: "Updated Category",
          brand: "Updated Brand",
          image: "updatedImage.jpg",
          price: 19.99,
          salePrice: 15.99,
          totalStock: 200,
          averageReview: 4.5,
        };

        const response = await supertest(app)
          .put(`/api/admin/products/edit/${input.productId}`)
          .send(input);

        expect(response.status).toEqual(404);
        expect(response.body).toEqual(productNotFoundError);
      });

      it("should fail for invalid product data", async () => {
        const input = {
          productId: existingProductInput.productId,
          averageReview: "b4",
        };

        const response = await supertest(app)
          .put(`/api/admin/products/edit/${existingProductInput.productId}`)
          .send(input);

        expect(response.status).toEqual(400);
        expect(response.body.errors).toEqual({
          averageReview: ["Expected number, received nan"],
        });
      });
    });
  });
});

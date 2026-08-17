import { expect } from "expect";
import supertest from "supertest";

import createServer from "@/server";
import "@/test/setup";
import ProductModel from "@/impl/mongoose/models/product.model";
import { GetFilteredProductsInput } from "@/impl/controllers/products/getFilteredProducts.controller";
import { Product } from "@/application/entities/product";

const app = createServer();

const sampleProducts = [
  {
    title: "Product A",
    category: "Electronics",
    brand: "Brand X",
    price: 100,
    image: "sample/img.png",
    description: "description",
    salePrice: 20,
    totalStock: 50,
    averageReview: 4,
    _id: "u000",
    createdAt: new Date("2024-01-19T11:53:27.813Z"),
    updatedAt: new Date("2024-01-19T11:53:27.813Z"),
  },
  {
    title: "Product B",
    category: "Clothing",
    brand: "Brand Y",
    price: 200,
    image: "sample/img.png",
    description: "description",
    salePrice: 20,
    totalStock: 50,
    averageReview: 4,
    _id: "u001",
    createdAt: new Date("2024-01-19T11:53:27.813Z"),
    updatedAt: new Date("2024-01-19T11:53:27.813Z"),
  },
  {
    title: "Product C",
    category: "Electronics",
    brand: "Brand X",
    price: 150,
    image: "sample/img.png",
    description: "description",
    salePrice: 20,
    totalStock: 50,
    averageReview: 4,
    _id: "u002",
    createdAt: new Date("2024-01-19T11:53:27.813Z"),
    updatedAt: new Date("2024-01-19T11:53:27.813Z"),
  },
  {
    title: "Product D",
    category: "Clothing",
    brand: "Brand Z",
    price: 50,
    image: "sample/img.png",
    description: "description",
    salePrice: 20,
    totalStock: 50,
    averageReview: 4,
    _id: "u003",
    createdAt: new Date("2024-01-19T11:53:27.813Z"),
    updatedAt: new Date("2024-01-19T11:53:27.813Z"),
  },
  {
    title: "Product E",
    category: "Books",
    brand: "Brand Y",
    price: 75,
    image: "sample/img.png",
    description: "description",
    salePrice: 20,
    totalStock: 50,
    averageReview: 4,
    _id: "u004",
    createdAt: new Date("2024-01-19T11:53:27.813Z"),
    updatedAt: new Date("2024-01-19T11:53:27.813Z"),
  },
];

describe("GetFilteredProducts Integration Tests", () => {
  beforeEach(async () => {
    await ProductModel.insertMany(sampleProducts);
  });

  context("Successful Get filtered Products", () => {
    it("should return all products when no filters are provided", async () => {
      const input: GetFilteredProductsInput = {};
      const response = await supertest(app)
        .get(`/api/shop/products/get`)
        .query(input);

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBe(sampleProducts.length);
    });

    it("should filter by category", async () => {
      const input: GetFilteredProductsInput = { category: "Electronics" };
      const response = await supertest(app)
        .get(`/api/shop/products/get`)
        .query(input);

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBe(2);
      response.body.data.products.forEach((product: Product) => {
        expect(product.category).toBe("Electronics");
      });
    });

    it("should filter by brand", async () => {
      const input: GetFilteredProductsInput = { brand: "Brand Y" };
      const response = await supertest(app)
        .get(`/api/shop/products/get`)
        .query(input);

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBe(2);
      response.body.data.products.forEach((product: Product) => {
        expect(product.brand).toBe("Brand Y");
      });
    });

    it("should filter by category and brand", async () => {
      const input: GetFilteredProductsInput = {
        category: "Electronics",
        brand: "Brand X",
      };
      const response = await supertest(app)
        .get(`/api/shop/products/get`)
        .query(input);

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBe(2);
      response.body.data.products.forEach((product: Product) => {
        expect(product.category).toBe("Electronics");
        expect(product.brand).toBe("Brand X");
      });
    });

    it("should sort by price low to high (default)", async () => {
      const input: GetFilteredProductsInput = {};
      const response = await supertest(app)
        .get(`/api/shop/products/get`)
        .query(input);

      expect(response.status).toBe(200);

      const prices = response.body.data.products.map((p: Product) => p.price);
      expect(prices).toEqual(
        prices.slice().sort((a: number, b: number) => a - b)
      );
    });

    it("should sort by price high to low", async () => {
      const input: GetFilteredProductsInput = { sortBy: "price-hightolow" };
      const response = await supertest(app)
        .get(`/api/shop/products/get`)
        .query(input);

      expect(response.status).toBe(200);

      const prices = response.body.data.products.map((p: Product) => p.price);
      expect(prices).toEqual(
        prices.slice().sort((a: number, b: number) => b - a)
      );
    });

    it("should handle multiple categories and brands", async () => {
      const input: GetFilteredProductsInput = {
        category: "Electronics,Clothing",
        brand: "Brand X,Brand Y",
      };
      const response = await supertest(app)
        .get(`/api/shop/products/get`)
        .query(input);

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toBe(3);
    });
  });
  context("Invalid input data", () => {
    it("should fail for invalid sortBy value", async () => {
      const input = { sortBy: "invalid-sort" };
      const response = await supertest(app)
        .get(`/api/shop/products/get`)
        .query(input);

      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual({ sortBy: expect.any(Array) });
    });
  });
});

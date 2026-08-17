import { expect } from "expect";
import supertest from "supertest";

import createServer from "@/server";
import "@/test/setup";
import { saveNewProduct } from "@/impl/services/repo/product.repo";

const app = createServer();

describe("FetchAllProductsUseCase Integration Tests", () => {
  const productListData = [
    {
      productId: "12345",
      title: "HP Laptop",
      description: "This is an HP laptop.",
      category: "Electronics",
      brand: "HP",
      image: "https://example.com/products/12345.png",
      price: 999.99,
      salePrice: 799.99,
      totalStock: 80,
      averageReview: 4.8,
    },
    {
      productId: "67890",
      title: "Dell Laptop",
      description: "This is a Dell laptop.",
      category: "Electronics",
      brand: "Dell",
      image: "https://example.com/products/67890.png",
      price: 1299.99,
      salePrice: 1099.99,
      totalStock: 90,
      averageReview: 4.5,
    },
    {
      productId: "54321",
      title: "Apple MacBook Pro",
      description: "This is an Apple MacBook Pro.",
      category: "Electronics",
      brand: "Apple",
      image: "https://example.com/products/54321.png",
      price: 1999.99,
      salePrice: 1799.99,
      totalStock: 70,
      averageReview: 5.0,
    },
    {
      productId: "87654",
      title: "HP Laptop",
      description: "This is an HP laptop.",
      category: "Electronics",
      brand: "HP",
      image: "https://example.com/products/87654.png",
      price: 999.99,
      salePrice: 799.99,
      totalStock: 80,
      averageReview: 4.8,
    },
    {
      productId: "32145",
      title: "Dell Laptop",
      description: "This is a Dell laptop.",
      category: "Electronics",
      brand: "Dell",
      image: "https://example.com/products/32145.png",
      price: 1299.99,
      salePrice: 1099.99,
      totalStock: 90,
      averageReview: 4.5,
    },
    {
      productId: "78965",
      title: "Apple MacBook Pro",
      description: "This is an Apple MacBook Pro.",
      category: "Electronics",
      brand: "Apple",
      image: "https://example.com/products/78965.png",
      price: 1999.99,
      salePrice: 1799.99,
      totalStock: 70,
      averageReview: 5.0,
    },
    {
      productId: "45678",
      title: "HP Laptop",
      description: "This is an HP laptop.",
      category: "Electronics",
      brand: "HP",
      image: "https://example.com/products/45678.png",
      price: 999.99,
      salePrice: 799.99,
      totalStock: 80,
      averageReview: 4.8,
    },
  ];

  before(async () => {
    for (let i = 0; i < productListData.length; i++)
      await saveNewProduct({
        id: productListData[i].productId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...productListData[i],
      });
  });

  context("Successful Fetching All Products", () => {
    it("should return success result for existing product", async function () {
      const response = await supertest(app).get(`/products`);

      expect(response.status).toBe(200);
      expect(response.body.data.products.length).toEqual(7);
    });
  });
});

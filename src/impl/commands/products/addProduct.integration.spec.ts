import expect from "expect";
import supertest from "supertest";

import createServer from "@/server";
import "@/test/setup";
import { addProductInputMock } from "@/test/mocks/entities/product.entity.mock";
import { AddProductInput } from "@/application/usecases/products/addProduct.usecase";

const app = createServer();

describe("AddProductUseCase Integration tests", () => {
  context("Successful", async () => {
    it("should return success result for a valid product input data", async () => {
      const input: AddProductInput = addProductInputMock;

      const response = await supertest(app)
        .post("/api/admin/products/add")
        .send(input)
        .set("user-agent", "supertestAgent");

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("data.product");
    });
  });
  context("Failed addProduct cases", () => {
    it("should fail for empty product input data", async () => {
      const response = await supertest(app)
        .post("/api/admin/products/add")
        .send({});

      expect(response.status).toEqual(400);
      expect(response.body).toHaveProperty("errors.averageReview");
      expect(response.body.errors).toMatchObject({
        averageReview: expect.any(Array),
        brand: expect.any(Array),
        category: expect.any(Array),
        description: expect.any(Array),
        image: ["Image is required"],
        price: ["Price is required"],
        salePrice: ["Sale Price is required"],
        title: ["Title is required"],
        totalStock: ["Total Stock is required"],
      });
    });
    it("should fail for invalid product input data", async () => {
      const input: AddProductInput = {
        image: "",
        title: "",
        description: "",
        category: "",
        brand: "",
        price: 0,
        salePrice: 0,
        totalStock: 0,
        averageReview: 0,
      };
      const response = await supertest(app)
        .post("/api/admin/products/add")
        .send(input);

      expect(response.status).toEqual(400);
      expect(response.body).toHaveProperty("errors.description");
    });
    it("should fail when sale price is greater than regular price", async () => {
      const input: AddProductInput = {
        ...addProductInputMock,
        price: 10,
        salePrice: 15, // Sale price greater than regular price
      };
      const response = await supertest(app)
        .post("/api/admin/products/add")
        .send(input);

      expect(response.status).toEqual(400);
      expect(response.body).toHaveProperty("errors.salePrice");
    });
  });
});

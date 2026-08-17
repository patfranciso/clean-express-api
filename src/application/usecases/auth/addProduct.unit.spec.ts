import expect from "expect";

import {
  AddProductInput,
  AddProductResult,
} from "../products/addProduct.usecase";
import { validAddProductUseCase } from "./addProduct.usecase.mock";
import { addProductInputMock } from "@/test/mocks/entities/product.entity.mock";

describe("AddProductUseCase unit tests", () => {
  context("Successful", async () => {
    it("should return success result for a valid product input data", async () => {
      const input: AddProductInput = addProductInputMock;

      const result: AddProductResult = await validAddProductUseCase(input);
      expect(result).toEqual({
        status: "success",
        meta: "AddProductSuccess",
        data: {
          product: {
            averageReview: 5,
            brand: "TestBrand",
            category: "test",
            id: "id00",
            description: "Description for test product",
            image: "http://example.com/image/sample.png",
            price: 10,
            salePrice: 10,
            title: "Test Product",
            totalStock: 100,
            // createdAt: new Date("2024-01-19T11:53:27.813Z"),
            // updatedAt: new Date("2024-01-19T11:53:27.813Z"),
          },
        },
      });
    });
  });
  context("Failed addProduct cases", () => {
    it("should fail for empty input data", async () => {
      const input = {};
      const result: AddProductResult = await validAddProductUseCase(
        input as AddProductInput
      );
      expect(result.status).toEqual("failed");
      expect(result.meta).toBe("AddProductValidationError");
    });
    it("should map ValidationError correctly", async () => {
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
      const result: AddProductResult = await validAddProductUseCase(
        input as AddProductInput
      );
      expect(result.status).toEqual("failed");
      expect(result.meta).toEqual("AddProductValidationError");
      if (result.status === "failed") {
        expect(result.errors).toEqual(expect.any(Object));
      }
    });
    it("should fail for invalid input data", async () => {
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
      const result: AddProductResult = await validAddProductUseCase(
        input as AddProductInput
      );
      expect(result.status).toEqual("failed");
      expect(result.meta).toBe("AddProductValidationError");
    });
  });
});

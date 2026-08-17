import expect from "expect";
import {
  DeleteProductInput,
  DeleteProductResult,
  DeleteProductFailure,
  mapDeleteProductError,
} from "./deleteProduct.usecase";
import {
  deleteProductSuccessUseCase,
  deleteProductNotFoundUseCase,
  deleteProductInvalidInputUseCase,
} from "./deleteProduct.usecase.mock";

describe("DeleteProductUseCase Unit Tests", () => {
  context("Successful product deletion", () => {
    it("should return success result for valid product ID", async () => {
      const payload: DeleteProductInput = {
        productId: "prod001",
      };

      const result: DeleteProductResult = await deleteProductSuccessUseCase(
        payload
      );
      expect(result.status).toEqual("success");
      expect(result.meta).toEqual("DeleteProductSuccess");
      if (result.status === "success") {
        expect(result.data.productId).toEqual("prod001");
      }
    });
  });

  context("Failed product deletion", () => {
    context("Validation errors", () => {
      it("should fail when product ID is missing", async () => {
        const payload: DeleteProductInput = {
          productId: "",
        };

        const result = await deleteProductInvalidInputUseCase(payload);
        expect(result.status).toEqual("failed");
        expect(result).toEqual({
          status: "failed",
          meta: "DeleteProductValidationError",
          errors: {
            productId: ["Product ID must be at least 4 character long"],
          },
        });
      });
    });

    context("Product not found", () => {
      it("should fail for a non-existent product ID", async () => {
        const payload: DeleteProductInput = {
          productId: "nonExistentProductId",
        };

        const result = await deleteProductNotFoundUseCase(payload);
        expect(result).toEqual(mapDeleteProductError("ProductNotFoundError"));
      });
    });
  });

  describe("mapDeleteProductError", () => {
    it("should map ValidationError to proper error result", () => {
      const result = mapDeleteProductError("DeleteProductValidationError", {
        id: "",
      });
      expect(result).toEqual({
        status: "failed",
        meta: "DeleteProductValidationError",
        errors: { id: "" },
      });
    });

    it("should map ProductNotFoundError to proper error result", () => {
      const result = mapDeleteProductError("ProductNotFoundError");
      expect(result).toEqual({
        status: "failed",
        meta: "ProductNotFoundError",
        errors: { message: "Product not found" },
      });
    });

    it("should throw error for unmapped failure type", () => {
      expect(() =>
        mapDeleteProductError("UnknownError" as DeleteProductFailure)
      ).toThrow("Unhandled DeleteProductFailure: UnknownError");
    });
  });
});

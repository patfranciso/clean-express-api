import expect from "expect";
import { EditProductErrors, EditProductInput } from "./editProduct.usecase";
import { defaultMockProduct } from "@/test/mocks/entities/product.entity.mock";
import { makeEditProductUseCase } from "./editProduct.usecase";
import { Product } from "@/application/entities/product";
import { CanFail, er, ok } from "@/utils/canFail";
import { validateEditProduct } from "./editProduct.validate";

// Mock dependencies
const findProductById = async (productId: string): Promise<Product | null> => {
  if (productId === defaultMockProduct.id) return defaultMockProduct;
  return null;
};

const editProductInDb = async (
  product: Product
): Promise<CanFail<EditProductErrors, Product>> => {
  return ok(product);
};

// Setup the usecase
const makeUseCase = makeEditProductUseCase({
  validate: validateEditProduct,
  findProductById,
  editProductInDb,
});

describe("EditProductUseCase Unit Tests", () => {
  context("Successful product edit", () => {
    it("should return success result for valid input data", async () => {
      const payload: EditProductInput = {
        productId: defaultMockProduct.id,
        title: "Updated Title",
        description: "Updated Description",
        category: "Updated Category",
        brand: "Updated Brand",
        image: "updated-image-url.jpg",
        price: 99.99,
        salePrice: 89.99,
        totalStock: 20,
        averageReview: 4.5,
      };

      const result = await makeUseCase(payload);

      expect(result.status).toEqual("success");
      expect(result.meta).toEqual("EditProductSuccess");
      if (result.status === "success") {
        expect(result.data.product.title).toBe(payload.title);
        expect(result.data.product.description).toBe(payload.description);
        expect(result.data.product.category).toBe(payload.category);
        expect(result.data.product.brand).toBe(payload.brand);
        expect(result.data.product.image).toBe(payload.image);
        expect(result.data.product.price).toBe(payload.price);
        expect(result.data.product.salePrice).toBe(payload.salePrice);
        expect(result.data.product.totalStock).toBe(payload.totalStock);
        expect(result.data.product.averageReview).toBe(payload.averageReview);
      }
    });
  });

  context("Failed product edit", () => {
    context("Validation errors", () => {
      it("should fail when productId is blank", async () => {
        const payload: EditProductInput = {
          productId: "productToEdit",
          title: "Updated Title",
          description: "Updated Description",
          category: "Updated Category",
          brand: "Updated Brand",
          image: "updated-image-url.jpg",
          price: 99.99,
          salePrice: 89.99,
          totalStock: 20,
          averageReview: 4.5,
        };

        const result = await makeUseCase({ ...payload, productId: "" });

        expect(result.status).toEqual("failed");
        expect(result.meta).toBe("EditProductValidationError");
        if (result.status === "failed") {
          expect(result.errors.productId).toEqual([
            "ProductId must be at least 1 character long",
          ]);
        }
      });
    });

    context("Product not found", () => {
      it("should fail for a non-existent productId", async () => {
        const payload: EditProductInput = {
          productId: "nonExistentId",
          title: "Updated Title",
          description: "Updated Description",
          category: "Updated Category",
          brand: "Updated Brand",
          image: "updated-image-url.jpg",
          price: 99.99,
          salePrice: 89.99,
          totalStock: 20,
          averageReview: 4.5,
        };

        const result = await makeUseCase(payload);

        expect(result.status).toEqual("failed");
        expect(result.meta).toBe("ProductNotFoundError");
        if (result.status === "failed") {
          expect(result.errors.message).toBe("Product not found");
        }
      });
    });

    context("EditProductFailedError", () => {
      it("should fail when editProductInDb returns an error", async () => {
        const payload: EditProductInput = {
          productId: defaultMockProduct.id,
          title: "Updated Title",
          description: "Updated Description",
          category: "Updated Category",
          brand: "Updated Brand",
          image: "updated-image-url.jpg",
          price: 99.99,
          salePrice: 89.99,
          totalStock: 20,
          averageReview: 4.5,
        };

        const editProductInDbErr = async (product: Product) =>
          er({ message: "Failed to update product" });
        const makeFailedUseCase = makeEditProductUseCase({
          validate: validateEditProduct,
          findProductById,
          editProductInDb: editProductInDbErr,
        });

        const result = await makeFailedUseCase(payload);

        expect(result.status).toEqual("failed");
        expect(result.meta).toBe("EditProductFailedError");
        if (result.status === "failed") {
          expect(result.errors.message).toBe("Failed to update product");
        }
      });
    });
  });
});

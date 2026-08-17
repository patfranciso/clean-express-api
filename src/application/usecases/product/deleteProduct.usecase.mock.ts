import { makeDeleteProductUseCase } from "./deleteProduct.usecase";
import {
  DeleteProductFailure,
  mapDeleteProductError,
} from "./deleteProduct.usecase";

export const deleteProductSuccessUseCase = makeDeleteProductUseCase({
  findProductById: async (productId) => ({
    id: productId,
    image: "image.png",
    title: "Sample Product",
    description: "Sample Product Description",
    category: "Category",
    brand: "Brand",
    price: 100,
    salePrice: 90,
    totalStock: 10,
    averageReview: 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  deleteProductById: async (productId) => {},
});

export const deleteProductNotFoundUseCase = makeDeleteProductUseCase({
  findProductById: async () => null,
  deleteProductById: async (productId) => {},
});

export const deleteProductInvalidInputUseCase = makeDeleteProductUseCase({
  findProductById: async (productId) => ({
    id: productId,
    image: "image.png",
    title: "Sample Product",
    description: "Sample Product Description",
    category: "Category",
    brand: "Brand",
    price: 100,
    salePrice: 90,
    totalStock: 10,
    averageReview: 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  deleteProductById: async (productId) => {},
});

// Add a mock that directly returns error results for testing
export const deleteProductValidationFailureUseCase = async () => {
  return mapDeleteProductError("DeleteProductValidationError");
};

export const deleteProductNotFoundFailureUseCase = async () => {
  return mapDeleteProductError("ProductNotFoundError");
};

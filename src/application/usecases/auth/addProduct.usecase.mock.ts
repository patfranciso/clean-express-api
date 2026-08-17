import { defaultMockProduct } from "@/test/mocks/entities/product.entity.mock";
import { makeAddProductUseCase } from "../products/addProduct.usecase";
import { validateAddProductInput } from "../products/addProduct.validate";
import { getCurrentDate, uid } from "@/impl/services/utils.impl";

export const validAddProductUseCase = makeAddProductUseCase({
  validate: validateAddProductInput,
  saveNewProduct: async () => defaultMockProduct,
  uid,
  currentDate: getCurrentDate,
});

export const failingAddProductUseCase = makeAddProductUseCase({
  validate: validateAddProductInput,
  saveNewProduct: async () => {
    throw new Error("Database error");
  },
  uid,
  currentDate: getCurrentDate,
});

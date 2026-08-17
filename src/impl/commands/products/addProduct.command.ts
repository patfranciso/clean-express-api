import { v4 } from "uuid";

import { makeAddProductUseCase } from "@/application/usecases/products/addProduct.usecase";
import { validateAddProductInput } from "@/application/usecases/products/addProduct.validate";
import { saveNewProduct } from "@/impl/services/repo/product.repo";
import { getCurrentDate } from "@/impl/services/utils.impl";

const addProductCommand = makeAddProductUseCase({
  validate: validateAddProductInput,
  saveNewProduct,
  uid: v4,
  currentDate: getCurrentDate,
});

export default addProductCommand;

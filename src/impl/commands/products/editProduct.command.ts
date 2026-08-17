import { makeEditProductUseCase } from "@/application/usecases/products/editProduct.usecase";
import { validateEditProduct } from "@/application/usecases/products/editProduct.validate";
import {
  editProduct,
  findProductById,
} from "@/impl/services/repo/product.repo";

const editProductCommand = makeEditProductUseCase({
  validate: validateEditProduct,
  editProductInDb: editProduct,
  findProductById,
});

export default editProductCommand;

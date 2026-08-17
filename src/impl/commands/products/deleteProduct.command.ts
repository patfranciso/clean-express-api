import { makeDeleteProductUseCase } from "@/application/usecases/product/deleteProduct.usecase";
import {
  findProductById,
  deleteProductById,
} from "@/impl/services/repo/product.repo";

export const deleteProductCommand = makeDeleteProductUseCase({
  findProductById,
  deleteProductById,
});

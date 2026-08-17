import ProductModel from "@/impl/mongoose/models/product.model";
import { SaveNewProduct } from "@/application/usecases/products/addProduct.usecase";
import {
  EditProductInDb,
  FindProductById,
  mapEditProductError,
} from "@/application/usecases/products/editProduct.usecase";
import { Product } from "@/application/entities/product";
import { er, ok } from "@/utils/canFail";
import { docToEntity } from "@/utils/mappers";
import { DeleteProductById } from "@/application/boundaries/entity-gateway/product.gateway";

export const saveNewProduct: SaveNewProduct = async (p) => {
  const productDoc = await ProductModel.create({ _id: p.id, ...p });

  return docToEntity<Product>(productDoc.toJSON());
};

export const editProduct: EditProductInDb = async (updatedProduct: Product) => {
  updatedProduct.updatedAt = new Date();
  const writeResult = await ProductModel.updateOne(
    { _id: updatedProduct.id },
    updatedProduct
  );

  return writeResult.modifiedCount === 1
    ? ok(updatedProduct)
    : er(mapEditProductError("EditProductFailedError"));
};

export const findProductById: FindProductById = async (productId: string) => {
  const productDoc = await ProductModel.findById(productId).exec();

  if (productDoc === null) return null;

  return docToEntity<Product>(productDoc.toJSON());
};

export const deleteProductById: DeleteProductById = async (
  productId: string
) => {
  await ProductModel.findByIdAndDelete(productId);
};

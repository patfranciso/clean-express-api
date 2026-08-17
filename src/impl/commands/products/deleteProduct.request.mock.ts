import { Product } from "@/application/entities/product";
import { ProductDocType } from "@/impl/mongoose/models/product.model";
import ProductModel from "@/impl/mongoose/models/product.model";

export const createMockProduct = async (): Promise<ProductDocType> => {
  const productData: Omit<Product, "id"> = {
    image: "test.jpg",
    title: "Test Product",
    description: "A test product for deletion.",
    category: "Test",
    brand: "Test Brand",
    price: 100,
    salePrice: 100,
    totalStock: 10,
    averageReview: 4.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const product = new ProductModel({
    ...productData,
    _id: "test-product-id",
  });

  return await product.save();
};

export const defaultMockProduct: Product = {
  id: "test-product-id",
  image: "test.jpg",
  title: "Test Product",
  description: "A test product for deletion.",
  category: "Test",
  brand: "Test Brand",
  price: 100,
  salePrice: 100,
  totalStock: 10,
  averageReview: 4.5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

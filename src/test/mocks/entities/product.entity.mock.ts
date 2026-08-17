import { Product } from "@/application/entities/product";
import { AddProductInput } from "@/application/usecases/products/addProduct.usecase";
import ProductModel from "@/impl/mongoose/models/product.model";

export const addProductInputMock: AddProductInput = {
  image: "http://example.com/image/sample.png",
  title: "Test Product",
  description: "Description for test product",
  category: "test",
  brand: "TestBrand",
  price: 10,
  salePrice: 10,
  totalStock: 100,
  averageReview: 5,
};
export const defaultMockProduct: Product = {
  id: "id00",
  createdAt: new Date("2024-01-19T11:53:27.813Z"),
  updatedAt: new Date("2024-01-19T11:53:27.813Z"),
  ...addProductInputMock,
};

export const lowStockMockProduct: Product = {
  ...defaultMockProduct,
  id: "product-low-stock",
  title: "Low Stock Product",
  totalStock: 5, // Only 5 in stock
};

export const outOfStockMockProduct: Product = {
  ...defaultMockProduct,
  id: "product-out-of-stock",
  title: "Out Of Stock Product",
  totalStock: 0, // 0 in stock
};

export const anotherMockProduct: Product = {
  id: "id01",
  createdAt: new Date("2024-01-19T11:53:27.813Z"),
  updatedAt: new Date("2024-01-19T11:53:27.813Z"),
  image: "http://example.com/image/sample2.png",
  title: "Another Product",
  description: "Description for another product",
  category: "test",
  brand: "AnotherBrand",
  price: 20,
  salePrice: 18,
  totalStock: 50,
  averageReview: 4,
};

// Function to create a test product in the database
export const createTestProduct = async (
  product: Partial<Product>
): Promise<Product> => {
  const newProduct: Product = {
    id: product.id ?? "testProductId",
    image: product.image ?? "http://example.com/test.png",
    title: product.title ?? "Test Product",
    description: product.description ?? "Description",
    category: product.category ?? "Category",
    brand: product.brand ?? "Brand",
    price: product.price ?? 10.0,
    salePrice: product.salePrice ?? 8.0,
    totalStock: product.totalStock ?? 100,
    averageReview: product.averageReview ?? 4.5,
    createdAt: product.createdAt ?? new Date(),
    updatedAt: product.updatedAt ?? new Date(),
  };

  // console.log({ product, newProduct });
  const savedProduct = await ProductModel.create({
    _id: newProduct.id,
    ...newProduct,
  });
  // return savedProduct.toJSON() as Product; // Return as plain object
  return newProduct;
};

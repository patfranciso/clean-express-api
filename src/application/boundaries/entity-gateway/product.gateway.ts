import { Product } from "@/application/entities/product";

export type FindProductById = (productId: string) => Promise<Product | null>;
export type DeleteProductById = (productId: string) => Promise<void>;

export type ProductGateway = {
  findProductById: FindProductById;
  deleteProductById: DeleteProductById;
};

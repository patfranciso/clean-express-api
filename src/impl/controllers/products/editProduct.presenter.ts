import { Product } from "@/application/entities/product";
import { EditProductResult } from "@/application/usecases/products/editProduct.usecase";

const presentEditProduct = (result: EditProductResult): TResponse => {
  if (result.status === "success") {
    return {
      statusCode: 200,
      data: {
        product: result.data.product,
      },
    };
  } else if (result.status === "failed") {
    const statusCode = result.meta === "ProductNotFoundError" ? 404 : 400;
    return {
      statusCode,
      errors: result.errors,
    };
  } else {
    return {
      statusCode: 500,
      errors: result.errors,
    };
  }
};

type TResponse =
  | {
      statusCode: 200;
      data: {
        product: Product;
      };
    }
  | {
      statusCode: 400 | 404 | 500;
      errors?: Record<string, any>;
    };

export default presentEditProduct;

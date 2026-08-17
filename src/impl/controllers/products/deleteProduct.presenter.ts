import { DeleteProductResult } from "@/application/usecases/product/deleteProduct.usecase";

const presentDeleteProductResult = (result: DeleteProductResult) => {
  if (result.status === "success") {
    return {
      statusCode: 200,
      data: {
        productId: result.data.productId,
      },
    };
  } else {
    return { statusCode: 400, errors: result.errors };
  }
};

export default presentDeleteProductResult;

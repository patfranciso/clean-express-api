import { AddProductResult } from "@/application/usecases/products/addProduct.usecase";

const presentAddProductResult = (result: AddProductResult) => {
  if (result.status === "success") {
    return {
      statusCode: 201,
      data: {
        product: result.data.product,
      },
    };
  } else {
    // Map different error types to appropriate HTTP status codes
    let statusCode = 400; // Default for validation errors

    switch (result.meta) {
      case "AddProductValidationError":
        statusCode = 400;
        break;
      case "DatabaseError":
        statusCode = 500;
        break;
      case "InsufficientStockError":
        statusCode = 409; // Conflict
        break;
      case "InvalidPriceError":
        statusCode = 400;
        break;
      default:
        statusCode = 500;
    }

    return { statusCode, errors: result.errors };
  }
};

export default presentAddProductResult;

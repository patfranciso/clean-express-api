import {
  AddToCartResult,
  AddToCartSuccess,
  AddToCartFailure,
} from "@/application/usecases/cart/addToCart.usecase";

const presentAddToCartResult = (
  result: AddToCartResult
): {
  statusCode: number;
  data?: AddToCartSuccess["data"];
  errors?: AddToCartFailure["errors"];
} => {
  if (result.status === "success") {
    // The use case already returns the full Cart entity, no further transformation needed for this presenter
    return {
      statusCode: 200,
      data: { cart: result.data.cart },
    };
  } else if (result.status === "failed") {
    return { statusCode: 400, errors: result.errors };
  } else {
    // Covers "error" status for unexpected server errors
    return { statusCode: 500, errors: result.errors };
  }
};

export default presentAddToCartResult;

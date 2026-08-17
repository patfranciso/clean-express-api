import {
  TypedRequestParams,
  TypedResponse,
} from "@/infrastructure/types/express";
import ProductModel from "@/impl/mongoose/models/product.model";
import { Product } from "@/application/entities/product";
import { docToEntity } from "@/utils/mappers";

export default async function getProductDetailsController(
  req: TypedRequestParams<GetProductDetailsInput>,
  res: TypedResponse<GetProductDetailsOutput>
) {
  const input: GetProductDetailsInput = { productId: req.params.productId };
  const result = await getProductDetailsCommand(input.productId);
  const output = presentGetProductDetails(result);

  return res
    .status(output.statusCode)
    .json(
      output.statusCode === 200
        ? { data: output.data }
        : { errors: output.errors }
    );
}

async function getProductDetailsCommand(
  productId: string
): Promise<GetProductDetailsResult> {
  try {
    let productDoc = await ProductModel.findById(productId).exec();

    if (!productDoc) {
      return {
        statusCode: 404,
        status: "failed",
        meta: "ProductNotFoundFailure",
        errors: { message: "Product not found" },
      };
    }
    const product = docToEntity(productDoc.toJSON());
    return {
      statusCode: 200,
      status: "success",
      meta: "GetProductDetailsSuccess",
      data: product,
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      status: "error",
      meta: "UnexpectedGetProductDetailsError",
      errors: { message: "Unexpected Error occured" },
    };
  }
}

const presentGetProductDetails = (
  result: GetProductDetailsResult
): GetProductDetailsResponse => {
  if (result.status === "success") {
    return {
      statusCode: result.statusCode,
      data: {
        product: result.data,
      },
    };
  } else {
    return {
      statusCode: result.statusCode,
      errors: result.errors,
    };
  }
};
export type GetProductDetailsInput = { productId: string };
export type GetProductDetailsOutput =
  | { data: GetProductDetailsSuccessData }
  | { errors: Record<string, any> };

export type GetProductDetailsSuccessData = {
  product: Product;
};

export type GetProductDetailsResponse =
  | { statusCode: 200; data: GetProductDetailsSuccessData }
  | { statusCode: 404 | 500; errors: Record<string, any> };
export interface ProductNotFoundFailure {
  meta: "ProductNotFoundFailure";
  status: "failed";
  statusCode: 404;
  errors: Record<string, any>;
}

export type GetProductDetailsResult =
  | GetProductDetailsSuccess
  | ProductNotFoundFailure
  | UnexpectedGetProductDetailsError;

export interface GetProductDetailsSuccess {
  meta: "GetProductDetailsSuccess";
  status: "success";
  statusCode: 200;
  data: Product;
}
export interface UnexpectedGetProductDetailsError {
  meta: "UnexpectedGetProductDetailsError";
  status: "error";
  statusCode: 500;
  errors: Record<string, any>;
}

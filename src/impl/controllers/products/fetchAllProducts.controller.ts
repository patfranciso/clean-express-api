import { TypedRequest, TypedResponse } from "@/infrastructure/types/express";
import ProductModel from "@/impl/mongoose/models/product.model";
import { Product } from "@/application/entities/product";
import { docToEntity } from "@/utils/mappers";

export default async function fetchAllProductsController(
  req: TypedRequest<{}, {}>,
  res: TypedResponse<FetchAllProductsOutput>
) {
  const result = await fetchAllProductsCommand();
  const output = presentFetchAllProducts(result);

  return res
    .status(output.statusCode)
    .json(
      output.statusCode === 200
        ? { data: output.data }
        : { errors: output.errors }
    );
}

async function fetchAllProductsCommand(): Promise<FetchAllProductsResult> {
  try {
    let productDocs = await ProductModel.find().exec();

    const products = productDocs.map((product) =>
      docToEntity(product.toJSON())
    );
    return {
      statusCode: 200,
      status: "success",
      meta: "FetchAllProductsSuccess",
      data: products,
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      status: "error",
      meta: "UnexpectedFetchAllProductsError",
      errors: { message: "Unexpected Error occured" },
    };
  }
}

const presentFetchAllProducts = (
  result: FetchAllProductsResult
): FetchAllProductsResponse => {
  if (result.status === "success") {
    return {
      statusCode: result.statusCode,
      data: {
        products: result.data,
      },
    };
  } else {
    return {
      statusCode: result.statusCode,
      errors: result.errors,
    };
  }
};
// export type FetchAllProductsInput = {
//   limit?: number;
//   offset?: number;
// };
export type FetchAllProductsOutput =
  | { data: FetchAllProductsSuccessData }
  | { errors: Record<string, any> };

export type FetchAllProductsSuccessData = {
  products: Array<Product>;
};

export type FetchAllProductsResponse =
  | { statusCode: 200; data: FetchAllProductsSuccessData }
  | { statusCode: 400 | 404 | 500; errors: Record<string, any> };

export type FetchAllProductsResult =
  | FetchAllProductsSuccess
  | UnexpectedFetchAllProductsError;

export interface FetchAllProductsSuccess {
  meta: "FetchAllProductsSuccess";
  status: "success";
  statusCode: 200;
  data: Array<Product>;
}
export interface UnexpectedFetchAllProductsError {
  meta: "UnexpectedFetchAllProductsError";
  status: "error";
  statusCode: 500;
  errors: Record<string, any>;
}

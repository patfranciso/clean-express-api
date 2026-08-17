import {
  TypedRequestQuery,
  TypedResponse,
} from "@/infrastructure/types/express";
import ProductModel from "@/impl/mongoose/models/product.model";
import { Product } from "@/application/entities/product";
import { isEr } from "@/utils/canFail";
import { AtLeastOne } from "@/impl/utils/types";
import { validateInput } from "@/utils/validate";
import { z } from "zod";
import { SortOrder } from "mongoose";
import { docToEntity } from "@/utils/mappers";

type Payload = AtLeastOne<Omit<GetFilteredProductsInput, "productId">>;

export default async function getFilteredProductsController(
  req: TypedRequestQuery<Payload>,
  res: TypedResponse<GetFilteredProductsOutput>
) {
  const input = req.query;
  const result = await getFilteredProductsCommand(input);

  const output = presentGetFilteredProducts(result);

  return res
    .status(output.statusCode)
    .json(
      output.statusCode === 200
        ? { data: { products: output.data.products } }
        : { errors: output.errors }
    );
}

const presentGetFilteredProducts = (
  result: GetFilteredProductsResult
): GetFilteredProductsResponse => {
  if (result.status === "success") {
    return {
      statusCode: result.statusCode,
      data: result.data,
    };
  } else {
    return {
      statusCode: result.statusCode,
      errors: result.errors,
    };
  }
};
async function getFilteredProductsCommand(
  input: GetFilteredProductsInput
): Promise<GetFilteredProductsResult> {
  const validationResult = validateGetFilteredProducts(input);

  if (isEr(validationResult)) {
    return {
      statusCode: 400,
      status: "failed",
      meta: "GetFilteredProductsValidationFailure",
      errors: validationResult.err,
    };
  }
  try {
    let filters: FilterOptions = {};
    const { brand, category, sortBy } = validationResult.value;

    if (category?.length) {
      filters.category = { $in: category!.split(",") };
    }

    if (brand?.length) {
      filters.brand = { $in: brand!.split(",") };
    }

    // let sort: SortOptions = {};
    let sort: { [key: string]: SortOrder | { $meta: any } } = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;

      default:
        sort.price = 1;
        break;
    }

    const productDocs = await ProductModel.find(filters).sort(sort).lean();

    const products: Array<any> = productDocs.map((p) =>
      docToEntity(p as { _id: string })
    );

    return {
      statusCode: 200,
      status: "success",
      meta: "GetFilteredProductsSuccess",
      data: { products },
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      status: "error",
      meta: "UnexpectedGetFilteredProductsError",
      errors: { message: "Unexpected Error occured" },
    };
  }
}
type SortOptions = {
  category?: string;
  brand?: string;
  price?: number;
  title?: number;
};
type FilterOptions = {
  category?: Record<string, Array<string>>;
  brand?: Record<string, Array<string>>;
};

export type GetFilteredProductsInput = {
  category?: string;
  brand?: string;
  sortBy?: "price-lowtohigh" | "price-hightolow" | "title-atoz" | "title-ztoa";
};

export type GetFilteredProductsOutput =
  | { data: GetFilteredProductsSuccessData }
  | { errors: Record<string, any> };

export type GetFilteredProductsResponse =
  | { statusCode: 200; data: GetFilteredProductsSuccessData }
  | { statusCode: 400 | 404 | 500; errors: Record<string, any> };

export type GetFilteredProductsSuccessData = {
  products: Array<Product>;
};

export type GetFilteredProductsResult =
  | GetFilteredProductsSuccess
  | GetFilteredProductsValidationFailure
  | UnexpectedGetFilteredProductsError;

export interface GetFilteredProductsSuccess {
  meta: "GetFilteredProductsSuccess";
  status: "success";
  statusCode: 200;
  data: { products: Array<Product> };
}

export interface GetFilteredProductsValidationFailure {
  meta: "GetFilteredProductsValidationFailure";
  status: "failed";
  statusCode: 400;
  errors: Record<string, any>;
}
export interface UnexpectedGetFilteredProductsError {
  meta: "UnexpectedGetFilteredProductsError";
  status: "error";
  statusCode: 500;
  errors: Record<string, any>;
}

export const getFilteredProductsSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  sortBy: z
    .enum(["price-lowtohigh", "price-hightolow", "title-atoz", "title-ztoa"])
    .optional()
    .default("price-lowtohigh"),
});

export const validateGetFilteredProducts =
  validateInput<GetFilteredProductsInput>(getFilteredProductsSchema);

import { CanFail, isEr } from "@/utils/canFail";
import { Product } from "@/application/entities/product";
import { transformProduct } from "@/impl/utils/product.transformer";
import { UseCaseErrorsType } from "../types";

export const makeAddProductUseCase =
  ({
    validate,
    saveNewProduct,
    uid,
    currentDate,
  }: MakeAddProductUseCaseProps) =>
  async (input: AddProductInput): Promise<AddProductResult> => {
    const validationResult = validate(input);

    if (isEr(validationResult)) {
      return mapAddProductError(
        "AddProductValidationError",
        validationResult.err
      );
    }

    const product: Product = {
      id: uid(),
      image: input.image,
      title: input.title,
      description: input.description,
      category: input.category,
      brand: input.brand,
      price: input.price,
      salePrice: input.salePrice,
      totalStock: input.totalStock,
      averageReview: input.averageReview,
      createdAt: currentDate(),
      updatedAt: currentDate(),
    };

    const savedProduct = await saveNewProduct(product);

    return {
      status: "success",
      meta: "AddProductSuccess",
      data: { product: transformProduct(savedProduct) },
    };
  };

export interface AddProductInput {
  image: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  salePrice: number;
  totalStock: number;
  averageReview: number;
}

export type AddProductOutput =
  | { data: AddProductSuccessData }
  | { errors: Record<string, any> };

export type AddProductSuccessData = {
  product: Partial<Product>;
};

/**
 * Possible failure reasons for adding a product.
 * Add new cases here if needed, and update messageMap accordingly.
 */
export type AddProductFailure =
  | "AddProductValidationError"
  | "DatabaseError"
  | "InsufficientStockError"
  | "InvalidPriceError";

/**
 * Result of adding a product.
 * Discriminated union to ensure type safety for success/failure handling.
 */
export type AddProductResult =
  | {
      status: "success";
      meta: "AddProductSuccess";
      data: AddProductSuccessData;
    }
  | {
      status: "failed";
      meta: AddProductFailure;
      errors: { message: string } | Record<string, any>;
    };

/**
 * Maps an add product failure reason to a structured error result.
 * @param error The specific failure type.
 * @returns A failed AddProductResult with the corresponding error message(s).
 * @throws Error if the error type is unmapped (for safety).
 */
export const mapAddProductError = (
  error: AddProductFailure,
  payload: Record<string, any> = {}
): AddProductResult => {
  const messageMap: Record<AddProductFailure, UseCaseErrorsType> = {
    AddProductValidationError: "payload",
    DatabaseError: "Failed to save product to database.",
    InsufficientStockError: "Insufficient stock for this product.",
    InvalidPriceError:
      "Price must be greater than 0 and sale price must be less than or equal to price.",
  };

  const message = messageMap[error];
  if (!message) {
    throw new Error(`Unhandled AddProductFailure: ${error}`);
  }

  if (error === "AddProductValidationError") {
    return {
      status: "failed",
      meta: error,
      errors: payload,
    };
  }

  return mapAddProductError(error);
};

export type SaveNewProduct = (product: Product) => Promise<Product>;

export type MakeAddProductUseCaseProps = {
  validate: (
    input: AddProductInput
  ) => CanFail<Record<string, any>, AddProductInput>;
  saveNewProduct: SaveNewProduct;
  uid: () => string;
  currentDate: () => Date;
};

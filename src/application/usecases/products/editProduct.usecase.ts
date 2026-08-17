import { CanFail } from "@/utils/canFail";
import { Product } from "@/application/entities/product";
import { isEr } from "@/utils/canFail";
import { UseCaseErrorsType } from "../types";

export const makeEditProductUseCase =
  ({
    validate,
    findProductById,
    editProductInDb,
  }: MakeEditProductUseCaseProps) =>
  async (input: EditProductInput): Promise<EditProductResult> => {
    const validationResult = validate(input);

    if (isEr(validationResult)) {
      return mapEditProductError(
        "EditProductValidationError",
        validationResult.err
      );
    }

    const existingProduct = await findProductById(input.productId);

    if (!existingProduct) {
      return mapEditProductError("ProductNotFoundError");
    }

    const validatedInput = validationResult.value;

    const updatedProduct: Product = {
      ...existingProduct,
      ...validatedInput,
      updatedAt: new Date(),
    };

    // Only update fields that were provided in the input
    Object.keys(validatedInput).forEach((key) => {
      if (
        key !== "productId" &&
        validatedInput[key as keyof EditProductInput] !== undefined
      ) {
        (updatedProduct as any)[key] =
          validatedInput[key as keyof EditProductInput];
      }
    });

    const updateResult = await editProductInDb(updatedProduct);

    if (isEr(updateResult)) {
      return mapEditProductError("EditProductFailedError");
    }

    return createEditProductSuccess(updateResult.value);
  };

export type EditProductInput = {
  productId: string;
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  image?: string;
  price?: number;
  salePrice?: number;
  totalStock?: number;
  averageReview?: number;
};

export type EditProductErrors = Record<string, any>;
export type ValidateEditProductInput = (
  data: EditProductInput
) => CanFail<EditProductErrors, EditProductInput>;

export type EditProductInDb = (
  updatedProduct: Product
) => Promise<CanFail<EditProductErrors, Product>>;

export type FindProductById = (productId: string) => Promise<Product | null>;

export type MakeEditProductUseCaseProps = {
  validate: ValidateEditProductInput;
  findProductById: FindProductById;
  editProductInDb: EditProductInDb;
};
/**
 * Result of an edit product attempt.
 * Discriminated union to ensure type safety for success/failure handling.
 */
export type EditProductResult =
  | { status: "success"; meta: "EditProductSuccess"; data: { product: any } }
  | {
      status: "failed";
      meta: EditProductFailure;
      errors: Record<string, any>;
    }
  | {
      status: "error";
      meta: "UnexpectedEditProductError";
      errors: { message: string };
    };

/**
 * Possible failure reasons for edit product.
 * Add new cases here if needed, and update messageMap accordingly.
 */
export type EditProductFailure =
  | "EditProductValidationError"
  | "ProductNotFoundError"
  | "EditProductFailedError";

/**
 * Maps an edit product failure reason to a structured error result.
 * @param error The specific failure type.
 * @returns A failed EditProductResult with the corresponding error message(s).
 * @throws Error if the error type is unmapped (for safety).
 */
export const mapEditProductError = (
  error: EditProductFailure,
  payload: Record<string, any> = {}
): EditProductResult => {
  const messageMap: Record<EditProductFailure, UseCaseErrorsType> = {
    EditProductValidationError: "payload",
    ProductNotFoundError: "Product not found",
    EditProductFailedError: "Failed to update product",
  };

  const message = messageMap[error];
  if (!message) {
    throw new Error(`Unhandled EditProductFailure: ${error}`);
  }

  if (error === "EditProductValidationError") {
    return {
      status: "failed",
      meta: "EditProductValidationError",
      errors: payload,
    };
  }

  return {
    status: "failed",
    meta: error,
    errors: typeof message === "string" ? { message } : message,
  };
};

/**
 * Creates a success result for edit product.
 * @param product The updated product entity.
 * @returns A successful EditProductResult.
 */
export const createEditProductSuccess = (
  product: Product
): EditProductResult => ({
  status: "success",
  meta: "EditProductSuccess",
  data: { product },
});

/**
 * Creates an error result for unexpected errors.
 * @param error The error message.
 * @returns An error EditProductResult.
 */
export const createEditProductError = (error: string): EditProductResult => ({
  status: "error",
  meta: "UnexpectedEditProductError",
  errors: { message: error },
});

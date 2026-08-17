import { CanFail, isEr } from "@/utils/canFail";
import {
  FindProductById,
  DeleteProductById,
} from "@/application/boundaries/entity-gateway/product.gateway";
import { validateDeleteProductInput } from "./deleteProduct.validate";
import { UseCaseErrorsType } from "../types";

/**
 * Result of a delete product attempt.
 * Discriminated union to ensure type safety for success/failure handling.
 */
export type DeleteProductResult =
  | {
      status: "success";
      meta: "DeleteProductSuccess";
      data: { productId: string };
    }
  | {
      status: "failed";
      meta: DeleteProductFailure;
      errors: { message: string } | Record<string, any>;
    };

/**
 * Possible failure reasons for delete product.
 * Add new cases here if needed, and update messageMap accordingly.
 */
export type DeleteProductFailure =
  | "DeleteProductValidationError"
  | "ProductNotFoundError";

/**
 * Maps a delete product failure reason to a structured error result.
 * @param error The specific failure type.
 * @returns A failed DeleteProductResult with the corresponding error message(s).
 * @throws Error if the error type is unmapped (for safety).
 */
export const mapDeleteProductError = (
  error: DeleteProductFailure,
  payload: Record<string, any> = {}
): DeleteProductResult => {
  const messageMap: Record<DeleteProductFailure, string | Record<string, any>> =
    {
      DeleteProductValidationError: "payload",
      ProductNotFoundError: "Product not found",
    };

  const message = messageMap[error];
  if (!message) {
    throw new Error(`Unhandled DeleteProductFailure: ${error}`);
  }

  if (error == "DeleteProductValidationError")
    return {
      status: "failed",
      meta: "DeleteProductValidationError",
      errors: payload,
    };

  return {
    status: "failed",
    meta: error,
    errors: { message },
  };
};

export const makeDeleteProductUseCase =
  ({ findProductById, deleteProductById }: MakeDeleteProductUseCaseProps) =>
  async (input: DeleteProductInput): Promise<DeleteProductResult> => {
    const result = validateDeleteProductInput(input);
    if (isEr(result)) {
      return mapDeleteProductError("DeleteProductValidationError", result.err);
    }

    const productId = input.productId;
    const product = await findProductById(productId);

    if (!product) {
      return mapDeleteProductError("ProductNotFoundError");
    }

    await deleteProductById(productId);

    return {
      status: "success",
      meta: "DeleteProductSuccess",
      data: {
        productId,
      },
    };
  };

export interface DeleteProductInput {
  productId: string;
}

export type DeleteProductOutput =
  | {
      data: {
        productId: string;
      };
    }
  | {
      errors: UseCaseErrorsType;
    };

export type ValidateDeleteProductInput = (
  data: DeleteProductInput
) => CanFail<DeleteProductErrors, DeleteProductInput>;

export type DeleteProductErrors = Record<string, any>;

export type MakeDeleteProductUseCaseProps = {
  findProductById: FindProductById;
  deleteProductById: DeleteProductById;
};

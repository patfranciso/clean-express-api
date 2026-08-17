import {
  TypedFullRequest,
  TypedResponse,
} from "@/infrastructure/types/express";
import { AtLeastOne } from "@/impl/utils/types";
import { logger } from "@/utils/logger";
import { EditProductInput } from "@/application/usecases/products/editProduct.usecase";
import editProductCommand from "@/impl/commands/products/editProduct.command";
import presentEditProduct from "./editProduct.presenter";
import commandHandler from "@/impl/commands/commandHandler";

type Payload = AtLeastOne<Omit<EditProductInput, "productId">>;

export default async function editProductController(
  req: TypedFullRequest<Payload, { productId: string }, undefined>,
  res: TypedResponse<any>
) {
  const input = {
    productId: req.params.productId,
    ...req.body,
  };

  const handler = commandHandler(editProductCommand, "EditProduct");
  const result = await handler(input);

  // Log the result for debugging and monitoring
  logger.info({
    message: "EditProduct attempt result",
    status: result.status,
    meta: result.meta,
    productId: input.productId,
    // Don't log sensitive data
    ...(result.status === "failed" && { errors: result.errors }),
  });

  const output = presentEditProduct(result);

  return res
    .status(output.statusCode)
    .json(
      output.statusCode === 200
        ? { data: output.data }
        : { errors: output.errors }
    );
}

export type EditProductOutput =
  | { data: { product: any } }
  | { errors: Record<string, any> };

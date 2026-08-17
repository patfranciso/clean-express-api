import {
  TypedRequestParams,
  TypedResponse,
} from "@/infrastructure/types/express";
import {
  DeleteProductInput,
  DeleteProductOutput,
  DeleteProductResult,
} from "@/application/usecases/product/deleteProduct.usecase";
import commandHandler from "@/impl/commands/commandHandler";
import { deleteProductCommand } from "@/impl/commands/products/deleteProduct.command";
import presentDeleteProductResult from "./deleteProduct.presenter";
import { logger } from "@/utils/logger";

async function deleteProductController(
  req: TypedRequestParams<{ productId: string }>,
  res: TypedResponse<DeleteProductOutput>
) {
  const input = req.params;

  const handler = commandHandler(deleteProductCommand, "DeleteProduct");

  const result: DeleteProductResult = await handler(input);

  // Log the result
  logger.info(`DeleteProduct command result: ${JSON.stringify(result)}`);
  logger.info({
    type: "DeleteProduct command result",
    status: result.status,
    meta: result.meta,
    // Don't log sensitive data
    ...(result.status === "failed" && { errors: result.errors }),
  });
  const output = presentDeleteProductResult(result);
  return res
    .status(output.statusCode)
    .json(
      output.statusCode === 200
        ? { data: output.data! }
        : { errors: output.errors! }
    );
}

export default deleteProductController;

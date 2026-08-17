import {
  TypedRequestBody,
  TypedResponse,
} from "@/infrastructure/types/express";
import {
  AddProductInput,
  AddProductOutput,
} from "@/application/usecases/products/addProduct.usecase";
import commandHandler from "@/impl/commands/commandHandler";
import addProductCommand from "@/impl/commands/products/addProduct.command";
import presentAddProductResult from "./addProduct.presenter";
import { logger } from "@/utils/logger";
// import logger from "@/infrastructure/logging/logger";

async function addProductController(
  req: TypedRequestBody<AddProductInput>,
  res: TypedResponse<AddProductOutput>
) {
  const input = req.body;
  const userAgent = req.get("user-agent") || "unknown";

  logger.info({
    message: "AddProduct request received",
    input: {
      ...input,
      // Don't log sensitive data if any
    },
    userAgent,
    ip: req.ip,
  });

  const handler = commandHandler(addProductCommand, "AddProduct");

  const result = await handler(input);

  // Log the result of the command
  if (result.status === "success") {
    logger.info("AddProduct succeeded", {
      productId: result.data.product.id,
      title: result.data.product.title,
    });
  } else {
    logger.warn("AddProduct failed", {
      meta: result.meta,
      errors: result.errors,
    });
  }

  const output = presentAddProductResult(result);
  return res
    .status(output.statusCode)
    .json(
      output.statusCode === 201
        ? { data: output.data! }
        : { errors: output.errors! }
    );
}
export default addProductController;

import {
  TypedRequestBody,
  TypedResponse,
} from "@/infrastructure/types/express";
import {
  AddToCartInput,
  AddToCartOutput,
  AddToCartErrors,
  AddToCartSuccess,
} from "@/application/usecases/cart/addToCart.usecase";
import commandHandler from "@/impl/commands/commandHandler";
import { addToCartCommand } from "@/impl/commands/cart/addToCart.command";
import presentAddToCartResult from "./addToCart.presenter";

export async function addToCartController(
  req: TypedRequestBody<AddToCartInput>,
  res: TypedResponse<AddToCartOutput>
) {
  // Extract input directly from req.body as per integration test pattern
  const input: AddToCartInput = {
    userId: req.body.userId,
    productId: req.body.productId,
    quantity: req.body.quantity,
    userAgent: req.body.userAgent, // Assuming userAgent comes from req.body or is optionally handled
  };

  const handler = commandHandler(addToCartCommand, "AddToCart");
  const result = await handler(input);

  const output = presentAddToCartResult(result);

  return res
    .status(output.statusCode)
    .json(
      output.statusCode === 200
        ? { data: output.data as AddToCartSuccess["data"] }
        : { errors: output.errors as AddToCartErrors }
    );
}

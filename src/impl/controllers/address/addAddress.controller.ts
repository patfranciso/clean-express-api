import {
  TypedRequestBody,
  TypedResponse,
} from "@/infrastructure/types/express";
import {
  AddAddressInput,
  AddAddressOutput,
} from "@/application/usecases/address/addAddress.usecase";
import commandHandler from "@/impl/commands/commandHandler";
import { addAddressCommand } from "@/impl/commands/address/addAddress.command";
import presentAddAddressResult from "./addAddress.presenter";

async function addAddressController(
  req: TypedRequestBody<AddAddressInput>,
  res: TypedResponse<AddAddressOutput>
) {
  const input = req.body;

  const handler = commandHandler(addAddressCommand, "AddAddress");

  const result = await handler(input);

  const output = presentAddAddressResult(result);
  return res.status(output.statusCode).json(output.body);
}

export default addAddressController;

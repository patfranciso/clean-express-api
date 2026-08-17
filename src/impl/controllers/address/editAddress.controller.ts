import {
  TypedRequestBody,
  TypedResponse,
  TypedRequestParams, // Need this for path parameters
} from "@/infrastructure/types/express"; // Assuming these types are defined

import {
  EditAddressInput,
  EditAddressSuccessData,
  EditAddressErrors,
} from "@/application/usecases/address/editAddress.usecase";

import commandHandler from "@/impl/commands/commandHandler"; // Assuming commandHandler exists
import { editAddressCommand } from "@/impl/commands/address/editAddress.command"; // Import the command
import presentEditAddressResult from "./editAddress.presenter"; // Import the presenter

// Define the expected types for request params and response body
type EditAddressRequestParams = { addressId: string };
type EditAddressResponseBody =
  | { data: EditAddressSuccessData }
  | { errors: EditAddressErrors };

export async function editAddressController(
  req: TypedRequestParams<EditAddressRequestParams> &
    TypedRequestBody<EditAddressInput>,
  res: TypedResponse<EditAddressResponseBody>
) {
  // Extract addressId from URL params
  const addressId = req.params.addressId;

  // Extract update fields and credentials from the request body
  // The use case input type includes addressId and credentials in the *same* object as update fields.
  // The controller should construct this object from req.params and req.body.
  const input: EditAddressInput = {
    addressId: addressId, // Use ID from URL params as authoritative
    address: req.body.address,
    city: req.body.city,
    pincode: req.body.pincode,
    phone: req.body.phone,
    notes: req.body.notes,
    credentials: req.body.credentials, // Credentials expected in body as per input type and test
  };

  const handler = commandHandler(editAddressCommand, "EditAddress"); // Use the command handler
  const result = await handler(input);

  const output = presentEditAddressResult(result); // Use the presenter

  return res
    .status(output.statusCode)
    .json(
      output.statusCode === 200
        ? { data: output.data! }
        : { errors: output.errors! }
    );
}

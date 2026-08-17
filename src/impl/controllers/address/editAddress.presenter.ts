import {
  EditAddressResult,
  EditAddressSuccessData,
  EditAddressErrors,
} from "@/application/usecases/address/editAddress.usecase";
import Address from "@/application/entities/address";

// Define the response shape for the controller
export type EditAddressResponse =
  | { data: EditAddressSuccessData }
  | { errors: EditAddressErrors };

const presentEditAddressResult = (
  result: EditAddressResult
): {
  statusCode: number;
  data?: EditAddressSuccessData;
  errors?: EditAddressErrors;
} => {
  switch (result.status) {
    case "success":
      // For success, the data is the updated Address entity
      return { statusCode: 200, data: { address: result.data.address } };

    case "failed":
      // Map specific failure metas to appropriate status codes if needed,
      // or default to 400 as per other examples and test structure.
      // The test expects 400 for all 'failed' statuses (validation, not found, unauthorized, credential errors).
      return { statusCode: 400, errors: result.errors };

    case "error":
      // Unexpected errors, typically 500
      console.error("Unexpected error in EditAddress use case:", result.errors); // Log server-side
      return { statusCode: 500, errors: result.errors };

    default:
      // Should not happen with sealed types, but good practice
      console.error("Unknown result status in EditAddress presenter:", result);
      return {
        statusCode: 500,
        errors: { message: "An unexpected server error occurred" },
      };
  }
};

export default presentEditAddressResult;

import { AddAddressResult } from "@/application/usecases/address/addAddress.usecase";

const presentAddAddressResult = (result: AddAddressResult) => {
  if (result.status === "success") {
    return {
      statusCode: 201,
      body: {
        status: "success",
        data: {
          address: result.data.address,
        },
      },
    };
  } else {
    return {
      statusCode: 400,
      body: {
        status: result.status,
        errors: result.errors,
      },
    };
  }
};

export default presentAddAddressResult;

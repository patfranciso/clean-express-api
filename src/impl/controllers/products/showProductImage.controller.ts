import fs from "fs";
import {
  TypedRequestParams,
  TypedResponse,
} from "@/infrastructure/types/express";
import { isImageFileName } from "@/impl/utils/strings";

export async function showProductImage(
  req: TypedRequestParams<{ filename: string }>,
  res: TypedResponse<any>
) {
  const filename = req.params.filename;
  if (!isImageFileName(filename))
    return res
      .status(403)
      .json({ message: "The requested file is not an Image file" });
  // Read the image file from the private uploads folder
  const filePath = process.cwd() + `/uploads/product-images/${filename}`;
  if (!fs.existsSync(filePath))
    return res
      .status(404)
      .json({ message: "The requested file does not exist" });
  // Serve the image file as a response
  else res.sendFile(filePath);
}

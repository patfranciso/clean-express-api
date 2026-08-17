import { Request, Response } from "express";

import { productImageUpload } from "@/infrastructure/multer/upload";
import {
  TypedRequestParams,
  TypedResponse,
} from "@/infrastructure/types/express";

const productImageUploader = productImageUpload.single("my_file");

async function uploadProductImage(
  req: Request & TypedRequestParams<{ hostname: string; file: string }>,
  res: Response & TypedResponse<any>
) {
  productImageUploader(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: { message: err.message } });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Expecting a jpeg, jpg, png or gif image" });
    }

    return res.json({
      message: "Product image uploaded successfully",
      path: req?.file?.path.replace(
        "uploads/product-images",
        `http://${req.get("host")}/prod-imgs`
      ),
    });
  });
}

export default uploadProductImage;

import { Request, Response } from "express";

import { featureImageUpload } from "@/infrastructure/multer/upload";
import {
  TypedRequestParams,
  TypedResponse,
} from "@/infrastructure/types/express";

const featureImageUploader = featureImageUpload.single("my_file");

async function uploadFeatureImage(
  req: Request &
    TypedRequestParams<{ hostname: string; file: string }> & {
      file?: Express.Multer.File;
    },
  res: Response & TypedResponse<any>
) {
  featureImageUploader(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: { message: err.message } });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Expecting a jpeg, jpg, png, webp or gif image" });
    }

    return res.json({
      message: "Feature image uploaded successfully",
      path: req?.file?.path.replace(
        "uploads/feature-images",
        `http://${req.get("host")}/feature-images`
      ),
    });
  });
}

export default uploadFeatureImage;

import path from "path";
import multer from "multer";

import { env } from "@/env";
import { sanitizeFileName } from "@/impl/utils/strings";

const makeStorage = (uploadPath?: string) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, getUploadPath(uploadPath));
    },
    filename: function (req, file, cb) {
      cb(
        null,
        Date.now() + "-" + sanitizeFileName(path.basename(file.originalname))
      );
    },
  });
const defaultStorage = makeStorage();
const productImageStorage = makeStorage("uploads/product-images/");
const featureImageStorage = makeStorage("uploads/feature-images/");
export const getUploadPath = (path?: string): string => {
  if (path) return path;
  else return process.env.NODE_ENV !== "test" ? env.UPLOAD_PATH : "temp/";
};

export const makeUpload = (
  fileTypes: RegExp,
  fileSize = 1024 * 1024,
  storage: multer.StorageEngine = defaultStorage
) => {
  return multer({
    storage,
    fileFilter: function (req, file, callback) {
      checkFileType(file, callback);
    },
    limits: {
      fileSize,
    },
  });
  function checkFileType(
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) {
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(null, false);
    }
  }
};

const imageUpload = makeUpload(/jpeg|jpg|png|gif/, 300 * 1024);
const productImageUpload = makeUpload(
  /jpeg|jpg|png|gif/,
  1000 * 1024,
  productImageStorage
);
const featureImageUpload = makeUpload(
  /jpeg|jpg|png|gif|webp/,
  1000 * 1024,
  featureImageStorage
);
export default imageUpload;
export { imageUpload, productImageUpload, featureImageUpload };

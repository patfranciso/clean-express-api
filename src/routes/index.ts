import express from "express";

import { imageUpload } from "@/infrastructure/multer/upload";

import { healthController } from "@/impl/controllers/health/index.controller";
import { signupController } from "@/impl/controllers/auth/signup.controller";
import { loginController } from "@/impl/controllers/auth/login.controller";
import { logoutController } from "@/impl/controllers/auth/logout.controller";
import { refreshTokenController } from "@/impl/controllers/auth/refreshToken.controller";
import { getCurrentUserDetailsController } from "@/impl/controllers/auth/getCurrentUserDetails.controller";
import { showProductImage } from "@/impl/controllers/products/showProductImage.controller";
import uploadProductImage from "@/impl/controllers/admin/uploadProductImage.controller";
import addProductController from "../impl/controllers/products/addProduct.controller";
import editProductController from "../impl/controllers/products/editProduct.controller";
import deleteProductController from "../impl/controllers/products/deleteProduct.controller";
import fetchAllProductsController from "../impl/controllers/products/fetchAllProducts.controller";
import getProductDetailsController from "../impl/controllers/products/getProductDetails.controller";
import getFilteredProductsController from "../impl/controllers/products/getFilteredProducts.controller";
import addAddressController from "../impl/controllers/address/addAddress.controller";
import { editAddressController } from "@/impl/controllers/address/editAddress.controller";
import {
  addFeatureImage,
  getFeatureImages,
} from "@/impl/controllers/common/feature-controller";
import uploadFeatureImage from "@/impl/controllers/admin/uploadFeatureImage.controller";
import { showFeatureImage } from "@/impl/controllers/admin/showFeatureImage.controller";
import { addToCartController } from "@/impl/controllers/cart/addToCart.controller";
// import productsRoutes from "@/impl/controllers/products";

const router = express.Router();

router.get("/health", healthController);

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/api/auth/logout", logoutController);
router.get("/refresh", refreshTokenController);
router.get("/me", getCurrentUserDetailsController);

router.get("/prod-imgs/:filename", showProductImage);

// router.post("/products", productsRoutes);
router.post("/api/admin/products/add", addProductController);
router.put("/api/admin/products/edit/:productId", editProductController);
router.delete("/api/admin/products/delete/:productId", deleteProductController);
router.get("/api/admin/products/get", fetchAllProductsController);
router.get("/products", fetchAllProductsController);
router.get("/api/shop/products/get", getFilteredProductsController);
router.get("/products/:productId", getProductDetailsController);

router.post("/addresses", addAddressController);
router.patch("/addresses/:addressId", editAddressController);

router.post("/cart/add-to-cart", addToCartController);

const avatarUpload = imageUpload.single("avatar");
router.post("/upload-single", async (req, res) => {
  avatarUpload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: { message: err.message } });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Expecting a jpeg, jpg, png or gif image" });
    }
    return res.json({
      message: "File uploaded successfully",
      path: req?.file?.path,
    });
  });
});

router.get("/cookies", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const key = req.cookies.key;
  res.json({ refreshToken, key });
});

router.post(
  "/upload-multiple",
  imageUpload.array("avatars"),
  async (req, res) => {
    if (req.files) {
      let paths = ""; // combined path for all the files
      // @ts-ignore: callable forEach
      req?.files?.forEach(function (
        file: { path: string },
        index: any,
        arr: any
      ) {
        paths = paths + file.path + ",";
      });
      paths = paths.substring(0, paths.lastIndexOf(",")); // remove the last comma

      return res.json({ message: "Files uploaded successfully", paths });
    }
  }
);

// special
router.post("/api/common/feature/add", addFeatureImage);
router.get("/api/common/feature/get", getFeatureImages);
router.get("/feature-images/:filename", showFeatureImage);
router.post("/api/admin/feature/upload-image", uploadFeatureImage);
router.get("/product-images/:filename", showProductImage);
router.post("/api/admin/products/upload-product-image", uploadProductImage);

export default router;

import express from "express";

import uploadProductImage from "../admin/uploadProductImage.controller";

const productsRoutes = express.Router();

// productsRoutes.post("/upload-product-image/prod-imgs/", uploadProductImage);

productsRoutes.post("/add", (req, res) => {
  return res.json({
    message: "Hello World",
  });
});

export default productsRoutes;

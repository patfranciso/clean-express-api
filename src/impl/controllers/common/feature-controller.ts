import { Request } from "express";

import FeatureModel from "@/impl/mongoose/models/feature.model";
import { TypedResponse } from "@/infrastructure/types/express";

const addFeatureImage = async (
  req: Request & { body: { image: unknown } },
  res: TypedResponse<unknown>
) => {
  try {
    const { image } = req.body;

    console.log(image, "image");

    const featureImages = new FeatureModel({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getFeatureImages = async (
  req: Request,
  res: TypedResponse<
    | {
        success: true;
        data: Array<{
          _id: string;
          image: string;
          createdAt: string;
          updatedAt: string;
          __v: 0;
        }>;
      }
    | { success: false; message: string }
  >
) => {
  try {
    const images = await FeatureModel.find({});

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

export { addFeatureImage, getFeatureImages };

import { makeAddToCartUseCase } from "@/application/usecases/cart/addToCart.usecase";
import { validateAddToCart } from "@/application/usecases/cart/addToCart.validate";
import { findProductById } from "@/impl/services/repo/product.repo";
import {
  findCartByUserId,
  createCart,
  updateCart,
} from "@/impl/services/repo/cart.repo";
import { uid, getCurrentDate } from "@/impl/services/utils.impl";

export const addToCartCommand = makeAddToCartUseCase({
  validate: validateAddToCart,
  findProductById,
  findCartByUserId,
  createCart,
  updateCart,
  uid,
  currentDate: getCurrentDate,
});

import { Cart } from "@/application/entities/cart";
import { defaultMockUser } from "./user.entity.mock";
import { defaultMockProduct } from "./product.entity.mock";

export const defaultMockCart: Cart = {
  id: "cart-001",
  userId: defaultMockUser.id,
  items: [],
  createdAt: new Date("2024-02-01T00:00:00.000Z"),
  updatedAt: new Date("2024-02-01T00:00:00.000Z"),
};

export const cartWithExistingProduct: Cart = {
  id: "cart-002",
  userId: defaultMockUser.id,
  items: [{ productId: defaultMockProduct.id, quantity: 2 }],
  createdAt: new Date("2024-02-01T00:00:00.000Z"),
  updatedAt: new Date("2024-02-01T00:00:00.000Z"),
};

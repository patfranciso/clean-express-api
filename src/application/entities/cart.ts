import { Entity } from "./entity";
import { Product } from "./product";
import { User } from "./user";

export interface Cart extends Entity {
  userId: User["id"];
  items: Array<{
    productId: Product["id"];
    quantity: number;
  }>;
}

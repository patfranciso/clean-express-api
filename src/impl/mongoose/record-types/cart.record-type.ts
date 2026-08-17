import { Entity } from "@/application/entities/entity";

interface CartRecordType extends Entity {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export default CartRecordType;

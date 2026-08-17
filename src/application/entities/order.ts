import { Entity } from "./entity";

interface Order extends Entity {
  userId: string;
  cartId: string;
  cartItems: Array<{
    productId: string;
    title: string;
    image: string;
    price: string;
    quantity: number;
  }>;
  orderInfo: {
    order: string;
    city: string;
    pincode: string;
    phone: string;
    notes: string;
  };
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  orderDate: Date;
  paymentId?: string | null | undefined;
  payerId: string;
}

export default Order;

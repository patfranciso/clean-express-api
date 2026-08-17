import { Entity } from "./entity";

interface Address extends Entity {
  address: string;
  userId: string;
  city: string;
  pincode: string;
  phone: string;
  notes?: string | null;
}
export default Address;

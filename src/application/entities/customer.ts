import { User } from "./user";

interface Customer extends User {
  role: "CUSTOMER";
}

export default Customer;

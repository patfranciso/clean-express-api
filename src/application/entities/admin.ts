import { User } from "./user";

interface Admin extends User {
  role: "ADMIN";
}

export default Admin;

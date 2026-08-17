import { z } from "zod";
import { validateInput } from "@/utils/validate";

import { AddAddressInput } from "./addAddress.usecase";

export const addAddressSchema = z.object({
  userId: z
    .string({ required_error: "User ID is required" })
    .min(1, "User ID cannot be empty"),
  address: z
    .string({ required_error: "Address is required" })
    .min(5, "Address must be at least 5 characters long"),
  city: z
    .string({ required_error: "City is required" })
    .min(2, "City must be at least 2 characters long"),
  pincode: z
    .string({ required_error: "Pincode is required" })
    // .nonempty({
    //   message: "Pincode can't be empty!",
    // })
    .regex(/^\d{5,6}$/, "Invalid pincode format"), // Example regex for 5 or 6 digits
  phone: z
    .string({ required_error: "Phone number is required" })
    .regex(/^\+?\d{8,15}$/, "Invalid phone number format"),
  notes: z.string().optional(), // Notes are optional
  // userId: z.string({ required_error: "User ID is required" }).min(1),
  //   address: z.string({ required_error: "Address is required" }).min(1),
  //   city: z.string({ required_error: "City is required" }).min(1),
  //   pincode: z.string({ required_error: "Pincode is required" }).min(1),
  //   phone: z.string({ required_error: "Phone is required" }).min(1),
  //   notes: z.string({ required_error: "Notes is required" }).min(1),
});
export const validateAddAddress =
  validateInput<AddAddressInput>(addAddressSchema);

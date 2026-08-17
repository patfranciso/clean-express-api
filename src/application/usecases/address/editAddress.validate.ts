import { z } from "zod";
import { validateInput } from "@/utils/validate"; // Assuming validateInput helper exists
import { EditAddressInput } from "./editAddress.usecase"; // Import the input type

export const editAddressSchema = z.object({
  addressId: z.string({ required_error: "Address ID is required" }),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().nullable().optional(), // Notes can be null
  credentials: z.object({
    sessionId: z.string({ required_error: "Session ID is required" }),
    accessToken: z.string({ required_error: "Access token is required" }),
    userAgent: z
      .string({ required_error: "User agent is required" })
      .min(4, "userAgent should be at least 4 chars"),
  }),
});

export const validateEditAddress =
  validateInput<EditAddressInput>(editAddressSchema);

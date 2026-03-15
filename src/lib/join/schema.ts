import { z } from "zod";

export const joinApplicationSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  businessName: z.string().trim().min(1, "Business name is required."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  phone: z.string().trim().min(1, "Phone is required."),
  areasCovered: z.string().trim().min(1, "Area(s) covered is required."),
  vanType: z.enum(["SMALL", "MEDIUM", "LARGE"], {
    error: "Van type is required.",
  }),
  insuranceConfirmed: z.literal(true, {
    error: "Insurance confirmation is required.",
  }),
  message: z.string().trim().optional(),
});

export type JoinApplicationInput = z.infer<typeof joinApplicationSchema>;

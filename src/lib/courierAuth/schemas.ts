import { z } from "zod";

export const requestMagicLinkSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const verifyMagicLinkSchema = z.object({
  token: z.string().min(20, "Token is invalid."),
});

export const availabilityUpdateSchema = z
  .object({
    status: z.enum(["AVAILABLE", "BUSY", "OFF"]),
    busyUntil: z.string().datetime().nullable().optional(),
  })
  .superRefine((input, ctx) => {
    if (input.status === "BUSY" && !input.busyUntil) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Busy until is required when setting status to BUSY.",
        path: ["busyUntil"],
      });
    }
  });

export const jobActionSchema = z.object({
  id: z.string().uuid(),
});

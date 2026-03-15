import { z } from "zod";

export const bookingDraftStopSchema = z.object({
  id: z.string().uuid(),
  sequence: z.number().int().nonnegative(),
  kind: z.enum(["COLLECTION", "DELIVERY"]),
  postcode: z.string().min(1, "Postcode is required."),
  addressLine1: z.string().trim().min(1, "Full address is required."),
  contactName: z.string().min(1, "Contact name is required."),
  contactPhone: z.string().min(1, "Contact phone is required."),
});

export const bookingDraftUpdateSchema = z.object({
  customerName: z.string().trim().min(1, "Your name is required."),
  customerEmail: z.email("Enter a valid email address."),
  customerPhone: z.string().trim().min(1, "Your phone number is required."),
  collectionAddressLine1: z.string().trim().min(1, "Full collection address is required."),
  collectionContactName: z.string().trim().min(1, "Collection contact name is required."),
  collectionContactPhone: z.string().trim().min(1, "Collection contact phone is required."),
  notes: z.string().max(2000, "Notes are too long.").optional().or(z.literal("")),
  reference: z.string().max(120, "Reference is too long.").optional().or(z.literal("")),
  draftStops: z
    .array(bookingDraftStopSchema)
    .min(1, "At least one delivery stop is required."),
});

export type BookingDraftUpdateInput = z.infer<typeof bookingDraftUpdateSchema>;


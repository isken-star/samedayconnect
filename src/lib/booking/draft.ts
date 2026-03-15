import type { BookingDraft, BookingDraftStop, QuoteRequest } from "@prisma/client";

type BookingDraftWithDetails = BookingDraft & {
  draftStops: BookingDraftStop[];
  quoteRequest: QuoteRequest;
};

export function getIncompleteBookingDraftMessage(
  draft: BookingDraftWithDetails,
): string | null {
  if (!draft.customerName?.trim()) {
    return "Add your name before continuing to payment.";
  }

  if (!draft.customerEmail?.trim()) {
    return "Add your email address before continuing to payment.";
  }

  if (!draft.customerPhone?.trim()) {
    return "Add your phone number before continuing to payment.";
  }

  if (!draft.collectionAddressLine1?.trim()) {
    return "Add the full collection address before continuing to payment.";
  }

  if (!draft.collectionContactName?.trim()) {
    return "Add the collection contact name before continuing to payment.";
  }

  if (!draft.collectionContactPhone?.trim()) {
    return "Add the collection contact phone before continuing to payment.";
  }

  if (draft.draftStops.length === 0) {
    return "Add at least one delivery stop before continuing to payment.";
  }

  for (const stop of draft.draftStops) {
    if (!stop.addressLine1?.trim()) {
      return `Add the full address for delivery stop ${stop.sequence}.`;
    }
    if (!stop.contactName?.trim()) {
      return `Add the contact name for delivery stop ${stop.sequence}.`;
    }
    if (!stop.contactPhone?.trim()) {
      return `Add the contact phone for delivery stop ${stop.sequence}.`;
    }
  }

  return null;
}


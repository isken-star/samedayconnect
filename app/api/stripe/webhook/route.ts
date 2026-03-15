import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getIncompleteBookingDraftMessage } from "@/src/lib/booking/draft";
import { db } from "@/src/lib/db";
import { getStripeServer, getStripeWebhookSecret } from "@/src/lib/stripe/server";

export async function POST(request: Request) {
  const stripe = getStripeServer();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;

      if (!paymentId) {
        return NextResponse.json({ received: true });
      }

      await db.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { id: paymentId },
          include: {
            booking: true,
            bookingDraft: {
              include: {
                draftStops: {
                  orderBy: { sequence: "asc" },
                },
                quoteRequest: true,
              },
            },
          },
        });

        if (!payment) {
          return;
        }

        if (payment.status === "SUCCEEDED" && payment.booking) {
          return;
        }

        const draft = payment.bookingDraft;
        const incompleteMessage = getIncompleteBookingDraftMessage(draft);
        if (incompleteMessage) {
          throw new Error(`Booking draft incomplete during webhook finalization: ${incompleteMessage}`);
        }

        let booking = await tx.booking.findUnique({
          where: { bookingDraftId: draft.id },
        });

        if (!booking) {
          booking = await tx.booking.create({
            data: {
              bookingDraftId: draft.id,
              quoteRequestId: draft.quoteRequestId,
              courierId: draft.quoteRequest.courierId,
              jobTypeChosen: draft.jobTypeChosen,
              status: "CONFIRMED",
              communityShareOptIn: draft.communityShareOptIn,
              quotedTotal: draft.quotedTotal,
              currency: draft.currency,
              customerName: draft.customerName!,
              customerEmail: draft.customerEmail!,
              customerPhone: draft.customerPhone || null,
              notes: draft.notes || null,
              reference: draft.reference || null,
              paidAt: new Date(),
              stops: {
                create: [
                  {
                    sequence: 0,
                    kind: "COLLECTION",
                    postcode: draft.quoteRequest.collectionPostcode,
                    addressLine1: draft.collectionAddressLine1!,
                    contactName: draft.collectionContactName!,
                    contactPhone: draft.collectionContactPhone!,
                  },
                  ...draft.draftStops.map((stop) => ({
                    sequence: stop.sequence,
                    kind: "DELIVERY" as const,
                    postcode: stop.postcode,
                    addressLine1: stop.addressLine1!,
                    contactName: stop.contactName!,
                    contactPhone: stop.contactPhone!,
                  })),
                ],
              },
            },
          });

          if (draft.quoteRequest.courierId) {
            await tx.job.create({
              data: {
                bookingId: booking.id,
                courierId: draft.quoteRequest.courierId,
                status: "PENDING",
                collectionPostcode: draft.quoteRequest.collectionPostcode,
                deliveryPostcodes: draft.quoteRequest.deliveryPostcodes,
                vanType: draft.quoteRequest.selectedVanType,
                jobType: draft.jobTypeChosen,
                readyAt: draft.quoteRequest.collectionDateTime,
                quotedTotal: draft.quotedTotal,
              },
            });
          }
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            bookingId: booking.id,
            status: "SUCCEEDED",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : null,
            paidAt: new Date(),
          },
        });

        await tx.bookingDraft.update({
          where: { id: draft.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handling failed:", error);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}


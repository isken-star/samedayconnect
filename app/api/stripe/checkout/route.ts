import { NextResponse } from "next/server";
import { z } from "zod";

import { getIncompleteBookingDraftMessage } from "@/src/lib/booking/draft";
import {
  getBookingJobTypeDescription,
  getBookingJobTypeLabel,
  toMinorUnits,
} from "@/src/lib/booking/helpers";
import { db } from "@/src/lib/db";
import { getCanonicalAppUrl } from "@/src/lib/domain";
import { getStripeServer } from "@/src/lib/stripe/server";

const checkoutSchema = z.object({
  bookingDraftId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the booking details and try again." },
        { status: 400 },
      );
    }

    const bookingDraft = await db.bookingDraft.findUnique({
      where: { id: parsed.data.bookingDraftId },
      include: {
        booking: true,
        draftStops: {
          orderBy: { sequence: "asc" },
        },
        quoteRequest: {
          include: {
            courier: true,
          },
        },
      },
    });

    if (!bookingDraft) {
      return NextResponse.json({ error: "Booking draft not found." }, { status: 404 });
    }

    if (bookingDraft.booking || bookingDraft.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This booking has already been paid and confirmed." },
        { status: 409 },
      );
    }

    const incompleteMessage = getIncompleteBookingDraftMessage(bookingDraft);
    if (incompleteMessage) {
      return NextResponse.json({ error: incompleteMessage }, { status: 400 });
    }

    const stripe = getStripeServer();
    const payment = await db.payment.create({
      data: {
        bookingDraftId: bookingDraft.id,
        provider: "STRIPE",
        amount: bookingDraft.quotedTotal,
        currency: bookingDraft.currency,
      },
    });

    const successUrl = `${getCanonicalAppUrl()}/booking/success?bookingDraftId=${encodeURIComponent(
      bookingDraft.id,
    )}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${getCanonicalAppUrl()}/booking?bookingDraftId=${encodeURIComponent(
      bookingDraft.id,
    )}&checkout=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: bookingDraft.customerEmail ?? undefined,
      metadata: {
        bookingDraftId: bookingDraft.id,
        paymentId: payment.id,
      },
      payment_intent_data: {
        metadata: {
          bookingDraftId: bookingDraft.id,
          paymentId: payment.id,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: bookingDraft.currency.toLowerCase(),
            unit_amount: toMinorUnits(Number(bookingDraft.quotedTotal)),
            product_data: {
              name: getBookingJobTypeLabel(bookingDraft.jobTypeChosen),
              description: `${getBookingJobTypeDescription(
                bookingDraft.jobTypeChosen,
              )} Booking with ${
                bookingDraft.quoteRequest.courier?.businessName ?? "Same Day Connect"
              }.`,
            },
          },
        },
      ],
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "We couldn’t start secure payment. Please try again." },
        { status: 502 },
      );
    }

    await db.$transaction([
      db.payment.update({
        where: { id: payment.id },
        data: {
          status: "CHECKOUT_CREATED",
          stripeCheckoutSessionId: session.id,
        },
      }),
      db.bookingDraft.update({
        where: { id: bookingDraft.id },
        data: {
          status: "CHECKOUT_CREATED",
          checkoutStartedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout creation failed:", error);
    return NextResponse.json(
      {
        error: "We couldn’t start secure payment. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}


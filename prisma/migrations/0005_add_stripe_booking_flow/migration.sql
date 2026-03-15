-- CreateEnum
CREATE TYPE "BookingDraftStatus" AS ENUM ('DRAFT', 'CHECKOUT_CREATED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BookingStopKind" AS ENUM ('COLLECTION', 'DELIVERY');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CHECKOUT_CREATED', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "BookingDraft" ADD COLUMN "checkoutStartedAt" TIMESTAMP(3);
ALTER TABLE "BookingDraft" ADD COLUMN "collectionAddressLine1" TEXT;
ALTER TABLE "BookingDraft" ADD COLUMN "collectionContactName" TEXT;
ALTER TABLE "BookingDraft" ADD COLUMN "collectionContactPhone" TEXT;
ALTER TABLE "BookingDraft" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "BookingDraft" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'GBP';
ALTER TABLE "BookingDraft" ADD COLUMN "customerEmail" TEXT;
ALTER TABLE "BookingDraft" ADD COLUMN "customerName" TEXT;
ALTER TABLE "BookingDraft" ADD COLUMN "customerPhone" TEXT;
ALTER TABLE "BookingDraft" ADD COLUMN "notes" TEXT;
ALTER TABLE "BookingDraft" ADD COLUMN "quotedTotal" DECIMAL(10,2);
ALTER TABLE "BookingDraft" ADD COLUMN "reference" TEXT;
ALTER TABLE "BookingDraft" ADD COLUMN "status" "BookingDraftStatus" NOT NULL DEFAULT 'DRAFT';

-- Backfill quoted amount from the selected quote result for existing drafts.
UPDATE "BookingDraft" AS bd
SET "quotedTotal" = qr."total"
FROM "QuoteResult" AS qr
WHERE qr."quoteRequestId" = bd."quoteRequestId"
  AND qr."jobType" = bd."jobTypeChosen";

ALTER TABLE "BookingDraft" ALTER COLUMN "quotedTotal" SET NOT NULL;

-- CreateTable
CREATE TABLE "BookingDraftStop" (
    "id" TEXT NOT NULL,
    "bookingDraftId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "kind" "BookingStopKind" NOT NULL,
    "postcode" TEXT NOT NULL,
    "addressLine1" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingDraftStop_pkey" PRIMARY KEY ("id")
);

-- Seed delivery draft stops for any existing drafts.
INSERT INTO "BookingDraftStop" (
  "id",
  "bookingDraftId",
  "sequence",
  "kind",
  "postcode",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  bd."id",
  ordinality,
  'DELIVERY'::"BookingStopKind",
  postcode,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "BookingDraft" AS bd
JOIN "QuoteRequest" AS qr ON qr."id" = bd."quoteRequestId"
CROSS JOIN LATERAL unnest(qr."deliveryPostcodes") WITH ORDINALITY AS delivery(postcode, ordinality);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingDraftId" TEXT NOT NULL,
    "quoteRequestId" TEXT NOT NULL,
    "courierId" TEXT,
    "jobTypeChosen" "JobType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "communityShareOptIn" BOOLEAN NOT NULL,
    "quotedTotal" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "notes" TEXT,
    "reference" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingStop" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "kind" "BookingStopKind" NOT NULL,
    "postcode" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingDraftId" TEXT NOT NULL,
    "bookingId" TEXT,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Job" ADD COLUMN "bookingId" TEXT;

-- CreateIndex
CREATE INDEX "BookingDraft_status_idx" ON "BookingDraft"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BookingDraftStop_bookingDraftId_sequence_key" ON "BookingDraftStop"("bookingDraftId", "sequence");
CREATE INDEX "BookingDraftStop_bookingDraftId_kind_idx" ON "BookingDraftStop"("bookingDraftId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingDraftId_key" ON "Booking"("bookingDraftId");
CREATE INDEX "Booking_quoteRequestId_idx" ON "Booking"("quoteRequestId");
CREATE INDEX "Booking_courierId_idx" ON "Booking"("courierId");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BookingStop_bookingId_sequence_key" ON "BookingStop"("bookingId", "sequence");
CREATE INDEX "BookingStop_bookingId_kind_idx" ON "BookingStop"("bookingId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeCheckoutSessionId_key" ON "Payment"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");
CREATE INDEX "Payment_bookingDraftId_idx" ON "Payment"("bookingDraftId");
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Job_bookingId_key" ON "Job"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingDraftStop" ADD CONSTRAINT "BookingDraftStop_bookingDraftId_fkey" FOREIGN KEY ("bookingDraftId") REFERENCES "BookingDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookingDraftId_fkey" FOREIGN KEY ("bookingDraftId") REFERENCES "BookingDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingStop" ADD CONSTRAINT "BookingStop_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingDraftId_fkey" FOREIGN KEY ("bookingDraftId") REFERENCES "BookingDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

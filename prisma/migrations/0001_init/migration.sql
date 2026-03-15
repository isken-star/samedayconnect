-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "VanType" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('SAME_DAY', 'DIRECT');

-- CreateEnum
CREATE TYPE "ReadyMode" AS ENUM ('READY_NOW', 'PREBOOK');

-- CreateTable
CREATE TABLE "Courier" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "baseArea" TEXT NOT NULL,
    "vanType" "VanType" NOT NULL,
    "vanPayloadKg" INTEGER NOT NULL,
    "insuranceGoodsInTransit" BOOLEAN NOT NULL,
    "insurancePublicLiability" BOOLEAN NOT NULL,
    "profilePhotoUrl" TEXT,
    "vanPhotoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Courier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "courierId" TEXT,
    "collectionPostcode" TEXT NOT NULL,
    "deliveryPostcodes" TEXT[],
    "readyMode" "ReadyMode" NOT NULL,
    "collectionDateTime" TIMESTAMP(3),
    "selectedVanType" "VanType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteResult" (
    "id" TEXT NOT NULL,
    "quoteRequestId" TEXT NOT NULL,
    "jobType" "JobType" NOT NULL,
    "miles" DOUBLE PRECISION NOT NULL,
    "perMileRate" DECIMAL(10,2) NOT NULL,
    "distanceCharge" DECIMAL(10,2) NOT NULL,
    "minimumCharge" DECIMAL(10,2) NOT NULL,
    "minimumApplied" BOOLEAN NOT NULL,
    "extraStopsCount" INTEGER NOT NULL,
    "stopsFee" DECIMAL(10,2) NOT NULL,
    "congestionApplied" BOOLEAN NOT NULL,
    "congestionFee" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingDraft" (
    "id" TEXT NOT NULL,
    "quoteRequestId" TEXT NOT NULL,
    "jobTypeChosen" "JobType" NOT NULL,
    "communityShareOptIn" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Courier_email_key" ON "Courier"("email");

-- CreateIndex
CREATE INDEX "Courier_isActive_idx" ON "Courier"("isActive");

-- CreateIndex
CREATE INDEX "QuoteRequest_courierId_idx" ON "QuoteRequest"("courierId");

-- CreateIndex
CREATE INDEX "QuoteRequest_createdAt_idx" ON "QuoteRequest"("createdAt");

-- CreateIndex
CREATE INDEX "QuoteResult_quoteRequestId_idx" ON "QuoteResult"("quoteRequestId");

-- CreateIndex
CREATE INDEX "QuoteResult_jobType_idx" ON "QuoteResult"("jobType");

-- CreateIndex
CREATE INDEX "BookingDraft_quoteRequestId_idx" ON "BookingDraft"("quoteRequestId");

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteResult" ADD CONSTRAINT "QuoteResult_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingDraft" ADD CONSTRAINT "BookingDraft_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;


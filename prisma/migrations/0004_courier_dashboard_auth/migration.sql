-- CreateEnum
CREATE TYPE "CourierAvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFF');

-- CreateEnum
CREATE TYPE "CourierJobStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'COMPLETED');

-- CreateTable
CREATE TABLE "CourierSession" (
    "id" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourierSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicLinkToken" (
    "id" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestIp" TEXT,

    CONSTRAINT "MagicLinkToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierAvailability" (
    "courierId" TEXT NOT NULL,
    "status" "CourierAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "busyUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourierAvailability_pkey" PRIMARY KEY ("courierId")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "courierId" TEXT NOT NULL,
    "status" "CourierJobStatus" NOT NULL DEFAULT 'PENDING',
    "collectionPostcode" TEXT NOT NULL,
    "deliveryPostcodes" TEXT[],
    "vanType" "VanType" NOT NULL,
    "jobType" "JobType" NOT NULL,
    "readyAt" TIMESTAMP(3),
    "quotedTotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourierSession_sessionTokenHash_key" ON "CourierSession"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "CourierSession_courierId_idx" ON "CourierSession"("courierId");

-- CreateIndex
CREATE INDEX "CourierSession_expiresAt_idx" ON "CourierSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MagicLinkToken_tokenHash_key" ON "MagicLinkToken"("tokenHash");

-- CreateIndex
CREATE INDEX "MagicLinkToken_courierId_idx" ON "MagicLinkToken"("courierId");

-- CreateIndex
CREATE INDEX "MagicLinkToken_expiresAt_idx" ON "MagicLinkToken"("expiresAt");

-- CreateIndex
CREATE INDEX "MagicLinkToken_usedAt_idx" ON "MagicLinkToken"("usedAt");

-- CreateIndex
CREATE INDEX "Job_courierId_status_idx" ON "Job"("courierId", "status");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");

-- CreateIndex
CREATE INDEX "Job_readyAt_idx" ON "Job"("readyAt");

-- AddForeignKey
ALTER TABLE "CourierSession" ADD CONSTRAINT "CourierSession_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicLinkToken" ADD CONSTRAINT "MagicLinkToken_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierAvailability" ADD CONSTRAINT "CourierAvailability_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "Courier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

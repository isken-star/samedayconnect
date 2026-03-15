-- AlterTable
ALTER TABLE "Courier" ADD COLUMN "basePostcode" TEXT;

-- AlterTable
ALTER TABLE "QuoteResult" ADD COLUMN "runningMilesFee" DECIMAL(10,2) NOT NULL DEFAULT 0;

CREATE TABLE "JoinApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "areasCovered" TEXT NOT NULL,
    "vanType" "VanType" NOT NULL,
    "insuranceConfirmed" BOOLEAN NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JoinApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JoinApplication_createdAt_idx" ON "JoinApplication"("createdAt");

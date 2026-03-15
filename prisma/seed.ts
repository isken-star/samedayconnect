import { CourierAvailabilityStatus, CourierJobStatus, JobType, PrismaClient, VanType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const primaryCourier = await prisma.courier.upsert({
    where: {
      email: "hello@couriercommunity.co.uk",
    },
    update: {
      slug: "ahmed-k",
      businessName: "Courier Community Logistics",
      displayName: "Ahmed K.",
      bio: "Independent courier focused on careful handling and clear communication.",
      phone: "07400 000000",
      baseArea: "Devon",
      basePostcode: "TQ2 7PH",
      vanType: VanType.MEDIUM,
      vanPayloadKg: 800,
      insuranceGoodsInTransit: true,
      insurancePublicLiability: true,
      profilePhotoUrl: "/couriers/placeholders/profile.svg",
      vanPhotoUrl: "/couriers/placeholders/van.svg",
      isActive: true,
    },
    create: {
      slug: "ahmed-k",
      businessName: "Courier Community Logistics",
      displayName: "Ahmed K.",
      bio: "Independent courier focused on careful handling and clear communication.",
      phone: "07400 000000",
      email: "hello@couriercommunity.co.uk",
      baseArea: "Devon",
      basePostcode: "TQ2 7PH",
      vanType: VanType.MEDIUM,
      vanPayloadKg: 800,
      insuranceGoodsInTransit: true,
      insurancePublicLiability: true,
      profilePhotoUrl: "/couriers/placeholders/profile.svg",
      vanPhotoUrl: "/couriers/placeholders/van.svg",
      isActive: true,
    },
  });

  const testCourier = await prisma.courier.upsert({
    where: {
      email: "test@couriercommunity.co.uk",
    },
    update: {
      slug: "test-courier",
      businessName: "Courier Community Test",
      displayName: "Test Courier",
      bio: "Courier dashboard test account.",
      phone: "07411 111111",
      baseArea: "Devon",
      basePostcode: "TQ2 7PH",
      vanType: VanType.MEDIUM,
      vanPayloadKg: 800,
      insuranceGoodsInTransit: true,
      insurancePublicLiability: true,
      profilePhotoUrl: "/couriers/placeholders/profile.svg",
      vanPhotoUrl: "/couriers/placeholders/van.svg",
      isActive: true,
    },
    create: {
      slug: "test-courier",
      businessName: "Courier Community Test",
      displayName: "Test Courier",
      bio: "Courier dashboard test account.",
      phone: "07411 111111",
      email: "test@couriercommunity.co.uk",
      baseArea: "Devon",
      basePostcode: "TQ2 7PH",
      vanType: VanType.MEDIUM,
      vanPayloadKg: 800,
      insuranceGoodsInTransit: true,
      insurancePublicLiability: true,
      profilePhotoUrl: "/couriers/placeholders/profile.svg",
      vanPhotoUrl: "/couriers/placeholders/van.svg",
      isActive: true,
    },
  });

  await prisma.courierAvailability.upsert({
    where: { courierId: testCourier.id },
    update: {
      status: CourierAvailabilityStatus.AVAILABLE,
      busyUntil: null,
    },
    create: {
      courierId: testCourier.id,
      status: CourierAvailabilityStatus.AVAILABLE,
    },
  });

  await prisma.job.deleteMany({
    where: { courierId: testCourier.id },
  });

  const now = Date.now();
  await prisma.job.createMany({
    data: [
      {
        courierId: testCourier.id,
        status: CourierJobStatus.PENDING,
        collectionPostcode: "SW1A 1AA",
        deliveryPostcodes: ["M1 1AE"],
        vanType: VanType.MEDIUM,
        jobType: JobType.SAME_DAY,
        readyAt: null,
        quotedTotal: 65,
      },
      {
        courierId: testCourier.id,
        status: CourierJobStatus.PENDING,
        collectionPostcode: "EC1A 1BB",
        deliveryPostcodes: ["E1 6AN", "SE1 7PB"],
        vanType: VanType.MEDIUM,
        jobType: JobType.DIRECT,
        readyAt: new Date(now + 60 * 60 * 1000),
        quotedTotal: 88,
      },
      {
        courierId: testCourier.id,
        status: CourierJobStatus.ACCEPTED,
        collectionPostcode: "NW1 5DB",
        deliveryPostcodes: ["W1D 3QF"],
        vanType: VanType.MEDIUM,
        jobType: JobType.SAME_DAY,
        readyAt: new Date(now + 2 * 60 * 60 * 1000),
        quotedTotal: 72,
        acceptedAt: new Date(now - 10 * 60 * 1000),
      },
      {
        courierId: testCourier.id,
        status: CourierJobStatus.COMPLETED,
        collectionPostcode: "BR1 1AA",
        deliveryPostcodes: ["CR0 2EU"],
        vanType: VanType.MEDIUM,
        jobType: JobType.DIRECT,
        readyAt: new Date(now - 24 * 60 * 60 * 1000),
        quotedTotal: 95,
        acceptedAt: new Date(now - 25 * 60 * 60 * 1000),
        completedAt: new Date(now - 23 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.courierAvailability.upsert({
    where: { courierId: primaryCourier.id },
    update: {},
    create: {
      courierId: primaryCourier.id,
      status: CourierAvailabilityStatus.AVAILABLE,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

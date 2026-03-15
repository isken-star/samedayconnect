import Image from "next/image";
import Link from "next/link";

import { getCurrentCourierContext } from "@/src/lib/courier/current";
import { getCourierBySlug } from "@/src/lib/courier/getCourierBySlug";
import {
  COURIER_IMAGE_FALLBACKS,
  getActiveCourier,
  resolveCourierImage,
} from "@/src/lib/courier/getActiveCourier";
import { VAN_PAYLOADS, type VanSize } from "@/src/lib/pricing/config";

function mapVanType(vanType: "SMALL" | "MEDIUM" | "LARGE"): {
  label: string;
  key: VanSize;
} {
  if (vanType === "SMALL") {
    return { label: "Small Van", key: "small" };
  }
  if (vanType === "MEDIUM") {
    return { label: "Medium Van", key: "medium" };
  }
  return { label: "Large Van", key: "large" };
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ courier?: string }>;
}) {
  const currentCourier = await getCurrentCourierContext();
  const params = await searchParams;
  const pathCourier =
    !currentCourier.courier && params.courier
      ? await getCourierBySlug(params.courier)
      : null;
  const courier = currentCourier.courier ?? pathCourier ?? (await getActiveCourier());
  const isCourierSite = Boolean(currentCourier.courier ?? pathCourier);
  const scopedCourierSlug = currentCourier.courier?.slug ?? pathCourier?.slug ?? null;
  const homeHref = currentCourier.courier
    ? "/"
    : scopedCourierSlug
      ? `/courier/${encodeURIComponent(scopedCourierSlug)}`
      : "/";
  const quoteHref = currentCourier.courier
    ? "/quote"
    : scopedCourierSlug
      ? `/quote?courier=${encodeURIComponent(scopedCourierSlug)}`
      : "/quote";

  const courierVan = courier ? mapVanType(courier.vanType) : { label: "Medium Van", key: "medium" as const };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="space-y-8">
        <header className="space-y-4">
          <Link href={homeHref} className="text-sm font-medium text-[var(--accent-soft)] underline underline-offset-4">
            Back to home
          </Link>
          <p className="eyebrow-label">About</p>
          <h1 className="page-title-gradient headline-gradient">
            {isCourierSite && courier
              ? `${courier.businessName} — independent courier service with nationwide collection and delivery.`
              : "A community of independent couriers — book direct and save."}
          </h1>
          <p className="body-copy-lg max-w-3xl">
            {isCourierSite && courier
              ? `${courier.displayName} runs ${courier.businessName}, an independent courier service based in ${courier.baseArea}. Customers can book direct, get clear pricing, and deal with the same business that handles the delivery.`
              : "We’re self-employed couriers helping customers book direct, so you avoid the usual middleman markup while keeping service personal and reliable."}
          </p>
          <p className="body-copy max-w-3xl">
            Each booking is fulfilled by the courier shown on the page, with clear communication and
            transparent pricing from quote to delivery.
          </p>
        </header>

        <section className="content-panel rounded-2xl border border-[var(--border-subtle)] p-5 sm:p-6">
          <h2 className="card-title">Why customers book with us</h2>
          <ul className="body-copy mt-3 list-disc space-y-1 pl-5">
            <li>Experienced couriers</li>
            <li>Insurance required (Goods in Transit &amp; Public Liability)</li>
            <li>Real vehicles — see the van that arrives</li>
            <li>Clear, distance-based pricing (VAT included)</li>
            <li>15 minutes free loading/unloading</li>
          </ul>
        </section>

        <section className="content-card rounded-2xl border border-[var(--border-subtle)] p-5 text-[var(--text-main)]">
          You book with the courier you choose. If they’re unavailable, we can share your request
          with other Same Day Connect couriers only if you opt in.
        </section>

        <section className="content-panel rounded-2xl border border-[var(--border-subtle)] p-6 sm:p-8">
          <h2 className="section-title">Meet your courier</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="space-y-4">
              <Image
                src={resolveCourierImage(courier?.profilePhotoUrl, COURIER_IMAGE_FALLBACKS.profile)}
                alt="Courier profile"
                width={220}
                height={220}
                className="rounded-xl border border-[var(--border-subtle)] object-cover"
              />
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3 text-sm">
                <p className="font-semibold">{courier?.displayName ?? "Same Day Connect"}</p>
                <p className="text-[var(--text-muted)]">{courier?.businessName ?? "Independent courier partner"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="body-copy">
                {courier?.bio ??
                  "Reliable independent courier with a focus on secure, on-time deliveries across local and long-distance routes."}
              </p>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
                <Image
                  src={resolveCourierImage(courier?.vanPhotoUrl, COURIER_IMAGE_FALLBACKS.van)}
                  alt="Courier van"
                  width={640}
                  height={360}
                  className="rounded-lg border border-[var(--border-subtle)] object-cover"
                />
                <p className="mt-2 text-sm font-medium text-[var(--text-main)]">
                  Your vehicle: {courierVan.label}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Up to {courier?.vanPayloadKg ?? VAN_PAYLOADS[courierVan.key]}kg payload
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-main)]">
                {courier?.insuranceGoodsInTransit ? (
                  <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1">Goods in Transit verified</span>
                ) : null}
                {courier?.insurancePublicLiability ? (
                  <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--chip-bg)] px-3 py-1">Public Liability verified</span>
                ) : null}
              </div>

              <p className="text-sm text-[var(--text-muted)]">Service area: {courier?.baseArea ?? "Greater London"}</p>
              <p className="text-sm text-[var(--text-muted)]">★★★★★ 4.9 (Verified bookings)</p>

              <Link
                href={quoteHref}
                className="gradient-button inline-flex rounded-xl px-4 py-2.5 font-semibold shadow-[0_0_24px_rgba(236,72,153,0.3)]"
              >
                Get a quote
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

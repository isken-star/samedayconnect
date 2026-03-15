import { QuotePageClient } from "@/src/components/quote/QuotePageClient";
import { getCurrentCourierContext } from "@/src/lib/courier/current";
import { getCourierBySlug } from "@/src/lib/courier/getCourierBySlug";

export default async function QuotePage({
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
  const activeCourier = currentCourier.courier ?? pathCourier;

  return (
    <QuotePageClient
      courierId={activeCourier?.id}
      courierBusinessName={activeCourier?.businessName}
      courierDisplayName={activeCourier?.displayName}
    />
  );
}

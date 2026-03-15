import { notFound } from "next/navigation";

import { CourierHomePage as CourierHomeContent } from "@/src/components/courier/CourierHomePage";
import { getCourierBySlug } from "@/src/lib/courier/getCourierBySlug";

interface CourierHomePageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourierHomePage({ params }: CourierHomePageProps) {
  const { slug } = await params;
  const courier = await getCourierBySlug(slug);

  if (!courier) {
    notFound();
  }

  return (
    <CourierHomeContent
      courier={courier}
      quoteHref={`/quote?courier=${encodeURIComponent(courier.slug)}`}
      contactHref={`/courier/${encodeURIComponent(courier.slug)}/contact`}
      aboutHref={`/about?courier=${encodeURIComponent(courier.slug)}`}
    />
  );
}

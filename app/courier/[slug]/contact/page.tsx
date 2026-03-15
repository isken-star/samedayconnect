import { notFound } from "next/navigation";

import { CourierContactPage as CourierContactContent } from "@/src/components/courier/CourierContactPage";
import { getCourierBySlug } from "@/src/lib/courier/getCourierBySlug";

interface CourierContactPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourierContactPage({ params }: CourierContactPageProps) {
  const { slug } = await params;
  const courier = await getCourierBySlug(slug);

  if (!courier) {
    notFound();
  }

  return (
    <CourierContactContent
      courier={courier}
      quoteHref={`/quote?courier=${encodeURIComponent(courier.slug)}`}
    />
  );
}

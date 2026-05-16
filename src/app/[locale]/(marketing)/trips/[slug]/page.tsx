import {notFound} from 'next/navigation';
import {TripDetailPage} from '@/components/marketing/trip-detail-page';

const VALID = ['ludao-4d3n', 'liuqiu-2d1n', 'lanyu-5d4n'] as const;
type Slug = (typeof VALID)[number];

export function generateStaticParams() {
  return VALID.map((slug) => ({slug}));
}

export default async function TripDetail({
  params
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  if (!VALID.includes(slug as Slug)) notFound();
  return <TripDetailPage slug={slug as Slug} />;
}

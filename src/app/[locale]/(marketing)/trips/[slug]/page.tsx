import {notFound} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {TripDetailPage} from '@/components/marketing/trip-detail-page';
import {BookingForm} from '@/components/marketing/booking-form';
import {getTripBySlug} from '@/lib/cms/queries';
import {pickContent} from '@/lib/cms/content';

export const dynamic = 'force-dynamic';

export default async function TripDetail({
  params
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  const trip = await getTripBySlug(slug);
  if (!trip || trip.status === 'draft') notFound();
  const locale = await getLocale();
  return (
    <TripDetailPage
      slug={slug}
      content={pickContent(trip, locale)}
      bookingForm={
        <BookingForm
          itemType="trip"
          itemId={trip.id}
          itemSlug={trip.slug}
          itemTitle={trip.title}
        />
      }
    />
  );
}

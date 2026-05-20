import {notFound} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {CourseDetailPage} from '@/components/marketing/course-detail-page';
import {BookingForm} from '@/components/marketing/booking-form';
import {getCourseBySlug} from '@/lib/cms/queries';
import {pickContent} from '@/lib/cms/content';

export const dynamic = 'force-dynamic';

export default async function CourseDetail({
  params
}: {
  params: Promise<{level: string}>;
}) {
  const {level} = await params;
  const course = await getCourseBySlug(level);
  if (!course || course.status === 'draft') notFound();
  const locale = await getLocale();
  return (
    <CourseDetailPage
      system={level}
      content={pickContent(course, locale)}
      coverImage={course.cover_image}
      bookingForm={
        <BookingForm
          itemType="course"
          itemId={course.id}
          itemSlug={course.slug}
          itemTitle={course.title}
        />
      }
    />
  );
}

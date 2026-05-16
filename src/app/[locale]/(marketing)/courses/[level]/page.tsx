import {notFound} from 'next/navigation';
import {CourseDetailPage} from '@/components/marketing/course-detail-page';

const VALID = ['aida', 'padi'] as const;
type Level = (typeof VALID)[number];

export function generateStaticParams() {
  return VALID.map((level) => ({level}));
}

export default async function CourseDetail({
  params
}: {
  params: Promise<{level: string}>;
}) {
  const {level} = await params;
  if (!VALID.includes(level as Level)) notFound();
  return <CourseDetailPage system={level as Level} />;
}

import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {getCourse} from '@/lib/cms/queries';
import {CourseForm} from '../_components/course-form';

export const dynamic = 'force-dynamic';

export default async function EditCoursePage({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  const course = await getCourse(id);
  if (!course) notFound();
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/courses`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" /> 返回課程列表
      </Link>
      <header>
        <h1 className="font-heading text-2xl font-bold text-navy-900">編輯課程</h1>
        <p className="mt-1 font-en text-xs text-gray-500">{course.slug}</p>
      </header>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <CourseForm course={course} locale={locale} />
      </div>
    </div>
  );
}

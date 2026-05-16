import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {CourseForm} from '../_components/course-form';

export default async function NewCoursePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/courses`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" /> 返回課程列表
      </Link>
      <header>
        <h1 className="font-heading text-2xl font-bold text-navy-900">新增課程</h1>
      </header>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <CourseForm locale={locale} />
      </div>
    </div>
  );
}

import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {TripForm} from '../_components/trip-form';

export default async function NewTripPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/trips`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" /> 返回行程列表
      </Link>
      <header>
        <h1 className="font-heading text-2xl font-bold text-navy-900">新增行程</h1>
        <p className="mt-1 text-sm text-gray-500">
          建立新行程，狀態設為「開放」後會出現在前台日曆與行程列表。
        </p>
      </header>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <TripForm locale={locale} />
      </div>
    </div>
  );
}

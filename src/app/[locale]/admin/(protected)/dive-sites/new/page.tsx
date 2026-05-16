import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {DiveSiteForm} from '../_components/dive-site-form';

export default async function NewDiveSitePage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/dive-sites`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" /> 返回景點列表
      </Link>
      <header>
        <h1 className="font-heading text-2xl font-bold text-navy-900">新增景點</h1>
      </header>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <DiveSiteForm locale={locale} />
      </div>
    </div>
  );
}

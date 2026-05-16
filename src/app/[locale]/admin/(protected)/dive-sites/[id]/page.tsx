import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {getDiveSite} from '@/lib/cms/queries';
import {DiveSiteForm} from '../_components/dive-site-form';

export const dynamic = 'force-dynamic';

export default async function EditDiveSitePage({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  const site = await getDiveSite(id);
  if (!site) notFound();
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/${locale}/admin/dive-sites`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4" /> 返回景點列表
      </Link>
      <header>
        <h1 className="font-heading text-2xl font-bold text-navy-900">編輯景點</h1>
        <p className="mt-1 font-en text-xs text-gray-500">{site.slug}</p>
      </header>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <DiveSiteForm site={site} locale={locale} />
      </div>
    </div>
  );
}

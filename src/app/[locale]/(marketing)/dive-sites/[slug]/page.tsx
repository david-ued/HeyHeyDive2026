import {notFound} from 'next/navigation';
import {getLocale} from 'next-intl/server';
import {DiveSitePage} from '@/components/marketing/dive-site-page';
import {getDiveSiteBySlug} from '@/lib/cms/queries';
import {pickContent} from '@/lib/cms/content';

export const dynamic = 'force-dynamic';

export default async function DiveSiteDetail({
  params
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  const site = await getDiveSiteBySlug(slug);
  if (!site || site.status === 'draft') notFound();
  const locale = await getLocale();
  return <DiveSitePage slug={slug} content={pickContent(site, locale)} />;
}

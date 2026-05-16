import {notFound} from 'next/navigation';
import {DiveSitePage} from '@/components/marketing/dive-site-page';

const VALID_SLUGS = ['ludao', 'lanyu', 'liuqiu'] as const;
type Slug = (typeof VALID_SLUGS)[number];

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({slug}));
}

export default async function DiveSiteDetail({
  params
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  if (!VALID_SLUGS.includes(slug as Slug)) notFound();
  return <DiveSitePage slug={slug as Slug} />;
}

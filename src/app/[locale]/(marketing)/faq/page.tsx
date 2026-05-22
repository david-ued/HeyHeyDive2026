import {FAQPage} from '@/components/marketing/faq-page';
import {listFaqWithItems} from '@/lib/cms/queries';

export const dynamic = 'force-dynamic';

export default async function Page({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const result = await listFaqWithItems({publicOnly: true});
  const categories = result.status === 'ok' ? result.rows : [];
  return <FAQPage categories={categories} locale={locale} />;
}

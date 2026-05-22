import {getTranslations, getLocale} from 'next-intl/server';
import {ArrowUpRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {listPublicDiveSites} from '@/lib/cms/queries';
import {pickText} from '@/lib/cms/i18n';
import {deriveSimpleStatus, statusBadgeClassLight, statusLabel} from '@/lib/cms/status';

const GRADIENTS: Record<string, string> = {
  ludao: 'from-aqua/40 via-navy-700 to-navy-900',
  lanyu: 'from-coral/30 via-navy-700 to-navy-900',
  liuqiu: 'from-gold/30 via-navy-700 to-navy-900'
};

export async function DiveSiteCards() {
  const t = await getTranslations('Home.sites');
  const locale = await getLocale();
  const sites = await listPublicDiveSites();

  if (sites.length === 0) return null;

  return (
    <section className="reveal bg-off-white pb-24 text-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 md:px-20">
        <header className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-heading text-2xl font-bold md:text-[32px]">
            {t('title')}
          </h2>
          <p className="font-en text-sm tracking-wider text-gray-500">
            {t('subtitle')}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {sites.map((site) => {
            const derived = deriveSimpleStatus(site);
            return (
            <Link
              key={site.id}
              href={`/dive-sites/${site.slug}`}
              className={`group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${derived === 'closed' ? 'opacity-70' : ''}`}
            >
              <div
                className={`relative aspect-[16/11] w-full bg-gradient-to-br ${GRADIENTS[site.slug] ?? 'from-navy-500 via-navy-700 to-navy-900'}`}
                style={
                  site.cover_image
                    ? {
                        backgroundImage: `url(${site.cover_image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }
                    : undefined
                }
              >
                {!site.cover_image ? (
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:18px_18px]"
                  />
                ) : null}
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 font-en text-[11px] font-semibold tracking-wide text-ink">
                  {site.slug.toUpperCase()}
                </span>
                {derived !== 'open' ? (
                  <span
                    className={`absolute right-5 top-5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusBadgeClassLight(derived)}`}
                  >
                    {statusLabel(derived, locale)}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-xl font-bold">
                      {pickText(site.name, site.name_en, site.name_ja, locale)}
                    </h3>
                    <p className="font-en text-xs tracking-wider text-gray-500">
                      {locale === 'en'
                        ? site.name_en ?? site.name
                        : locale === 'ja'
                          ? site.name_ja ?? site.name
                          : site.region ?? ''}
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-500 transition group-hover:text-coral" />
                </div>
                <p className="text-sm leading-relaxed text-gray-700">
                  {pickText(site.intro, site.intro_en, site.intro_ja, locale)}
                </p>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

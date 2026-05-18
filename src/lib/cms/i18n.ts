// Locale-aware accessors for bilingual CMS fields.
// zh-TW is the canonical text; *_en is optional and falls back to the zh value.

export type Locale = 'zh-TW' | 'en';

export function pickText(
  zh: string | null | undefined,
  en: string | null | undefined,
  locale: string
): string {
  if (locale === 'en') return (en || zh || '').trim();
  return (zh || en || '').trim();
}

export function formatTripDates(
  startISO: string,
  endISO: string,
  locale: string
): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (locale === 'en') {
    const m = start.toLocaleString('en-US', {month: 'short'});
    const d1 = String(start.getUTCDate()).padStart(2, '0');
    const d2 = String(end.getUTCDate()).padStart(2, '0');
    const sameMonth = start.getUTCMonth() === end.getUTCMonth();
    return sameMonth
      ? `${m} ${d1} – ${d2}`
      : `${m} ${d1} – ${end.toLocaleString('en-US', {month: 'short'})} ${d2}`;
  }
  const mm1 = String(start.getUTCMonth() + 1).padStart(2, '0');
  const dd1 = String(start.getUTCDate()).padStart(2, '0');
  const mm2 = String(end.getUTCMonth() + 1).padStart(2, '0');
  const dd2 = String(end.getUTCDate()).padStart(2, '0');
  return `${mm1}.${dd1} – ${mm2}.${dd2}`;
}

export function formatPriceTWD(n: number): string {
  return `NT$ ${n.toLocaleString('en-US')}`;
}

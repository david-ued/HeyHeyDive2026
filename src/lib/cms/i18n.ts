// Locale-aware accessors for trilingual CMS fields.
// zh-TW is the canonical text; *_en and *_ja are optional and fall back to zh.

export type Locale = 'zh-TW' | 'en' | 'ja';

export function pickText(
  zh: string | null | undefined,
  en: string | null | undefined,
  ja: string | null | undefined,
  locale: string
): string {
  if (locale === 'en') return (en || zh || ja || '').trim();
  if (locale === 'ja') return (ja || zh || en || '').trim();
  return (zh || en || ja || '').trim();
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
  if (locale === 'ja') {
    const m1 = start.getUTCMonth() + 1;
    const m2 = end.getUTCMonth() + 1;
    const d1 = start.getUTCDate();
    const d2 = end.getUTCDate();
    const sameMonth = m1 === m2;
    return sameMonth
      ? `${m1}月${d1}日 – ${d2}日`
      : `${m1}月${d1}日 – ${m2}月${d2}日`;
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

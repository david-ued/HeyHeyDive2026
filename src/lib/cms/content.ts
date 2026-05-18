// Helpers for rendering deep CMS content with next-intl translations as fallback.

export type DeepContent = Record<string, unknown> | null | undefined;

/**
 * Walk a dotted path (`a.b.c`) and return the string at that location, or `null`
 * if the path doesn't resolve to a string. Numeric segments index arrays.
 */
export function pickPath(obj: DeepContent, path: string): string | null {
  if (!obj) return null;
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null) return null;
    if (Array.isArray(cur)) {
      const idx = Number(p);
      cur = Number.isInteger(idx) ? cur[idx] : undefined;
    } else if (typeof cur === 'object') {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return null;
    }
  }
  return typeof cur === 'string' && cur.length > 0 ? cur : null;
}

/**
 * Build a translator that prefers a DB-stored JSONB content blob, falling back
 * to a next-intl `t(path)` function when the path is missing or empty.
 *
 * Usage in a detail component:
 *
 *   const t = useTranslations(`Trip.${slug}`);
 *   const ct = buildContentT(content, t);
 *   ct('day1.title')  // returns content.day1.title if present, else t('day1.title')
 */
export function buildContentT(
  content: DeepContent,
  fallback: (path: string) => string
): (path: string) => string {
  return (path: string) => pickPath(content, path) ?? fallback(path);
}

/**
 * Pick the locale-appropriate content blob from a row with content_zh / content_en.
 */
export function pickContent(
  row: {content_zh: DeepContent; content_en: DeepContent} | null | undefined,
  locale: string
): DeepContent {
  if (!row) return null;
  return locale === 'en' ? row.content_en ?? row.content_zh : row.content_zh ?? row.content_en;
}

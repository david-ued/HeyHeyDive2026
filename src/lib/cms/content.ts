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
 * Pick the locale-appropriate content blob from a row with content_zh / content_en / content_ja.
 */
export function pickContent(
  row:
    | {content_zh: DeepContent; content_en: DeepContent; content_ja?: DeepContent}
    | null
    | undefined,
  locale: string
): DeepContent {
  if (!row) return null;
  if (locale === 'en') return row.content_en ?? row.content_zh ?? row.content_ja ?? null;
  if (locale === 'ja') return row.content_ja ?? row.content_zh ?? row.content_en ?? null;
  return row.content_zh ?? row.content_en ?? row.content_ja ?? null;
}

/**
 * Walk `obj` and apply `path`-keyed string `value`. Numeric segments index arrays.
 * Empty string deletes the leaf instead of writing. Mutates and returns obj.
 */
function setDeep(
  obj: Record<string, unknown>,
  path: string,
  value: string
): void {
  const parts = path.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    const next = cur[k];
    if (!next || typeof next !== 'object') {
      cur[k] = {};
    }
    cur = cur[k] as Record<string, unknown>;
  }
  const leaf = parts[parts.length - 1];
  if (value === '') {
    delete cur[leaf];
  } else {
    cur[leaf] = value;
  }
}

/**
 * Read every FormData entry whose key starts with `prefix.` and apply it to the
 * given existing JSONB content (mutated). Returns the merged content, or `null`
 * if the merged result is an empty object.
 */
export function mergeContentFromFormData(
  formData: FormData,
  prefix: 'cz' | 'ce' | 'cj',
  existing: DeepContent
): DeepContent {
  const merged: Record<string, unknown> = existing
    ? JSON.parse(JSON.stringify(existing))
    : {};
  const dot = `${prefix}.`;
  let touched = false;
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith(dot)) continue;
    touched = true;
    const subPath = key.slice(dot.length);
    if (!subPath) continue;
    setDeep(merged, subPath, typeof value === 'string' ? value.trim() : '');
  }
  if (!touched) return existing;
  // Strip empty objects after deletions
  pruneEmpty(merged);
  return Object.keys(merged).length === 0 ? null : merged;
}

function pruneEmpty(obj: Record<string, unknown>): void {
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      pruneEmpty(v as Record<string, unknown>);
      if (Object.keys(v as object).length === 0) {
        delete obj[k];
      }
    }
  }
}

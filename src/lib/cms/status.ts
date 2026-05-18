import type {Course, DiveSite, Trip} from './types';

export type DerivedTripStatus =
  | 'open'
  | 'sold_out'
  | 'closed'
  | 'draft'
  | 'expired';

export function deriveTripStatus(trip: Trip, now: Date = new Date()): DerivedTripStatus {
  if (trip.status === 'draft') return 'draft';
  if (trip.status === 'sold_out') return 'sold_out';
  if (trip.status === 'closed') return 'closed';
  // status === 'open': check if past end_date
  const end = new Date(trip.end_date + 'T23:59:59');
  if (end.getTime() < now.getTime()) return 'expired';
  return 'open';
}

type BadgeKey =
  | 'open'
  | 'sold_out'
  | 'closed'
  | 'draft'
  | 'expired';

const LABEL_ZH: Record<BadgeKey, string> = {
  open: '開放報名',
  sold_out: '已售完',
  closed: '已結束',
  draft: '草稿',
  expired: '已過檔期'
};

const LABEL_EN: Record<BadgeKey, string> = {
  open: 'Open',
  sold_out: 'Sold out',
  closed: 'Closed',
  draft: 'Draft',
  expired: 'Past'
};

export function statusLabel(status: BadgeKey, locale: string): string {
  return locale === 'en' ? LABEL_EN[status] : LABEL_ZH[status];
}

// Tailwind classes for the badge pill.
const BADGE_CLS: Record<BadgeKey, string> = {
  open: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40',
  sold_out: 'bg-amber-500/20 text-amber-100 border-amber-400/40',
  closed: 'bg-gray-500/30 text-gray-200 border-gray-400/40',
  draft: 'bg-gray-700/40 text-gray-300 border-gray-500/40',
  expired: 'bg-gray-500/30 text-gray-300 border-gray-400/40'
};

export function statusBadgeClass(status: BadgeKey): string {
  return BADGE_CLS[status];
}

// Light variants for white/cream backgrounds (dive-site / course cards).
const LIGHT_BADGE_CLS: Record<BadgeKey, string> = {
  open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  sold_out: 'bg-amber-100 text-amber-800 border-amber-200',
  closed: 'bg-gray-200 text-gray-700 border-gray-300',
  draft: 'bg-gray-200 text-gray-600 border-gray-300',
  expired: 'bg-gray-200 text-gray-700 border-gray-300'
};

export function statusBadgeClassLight(status: BadgeKey): string {
  return LIGHT_BADGE_CLS[status];
}

export function deriveSimpleStatus(item: DiveSite | Course): BadgeKey {
  if (item.status === 'draft') return 'draft';
  if (item.status === 'closed') return 'closed';
  return 'open';
}

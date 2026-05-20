import Link from 'next/link';
import {Inbox, Mail, MessageCircle, Phone} from 'lucide-react';
import {listBookings, countBookingsByStatus} from '@/lib/cms/queries';
import {MissingTableNotice} from '@/components/admin/form-fields';
import type {BookingStatus} from '@/lib/cms/types';
import {BookingsTabs} from './_components/bookings-tabs';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: '尚未聯絡',
  contacted: '已聯絡',
  confirmed: '已確認',
  cancelled: '已取消'
};

const STATUS_BADGE: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  contacted: 'bg-sky-100 text-sky-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-gray-200 text-gray-600'
};

const ITEM_TYPE_LABEL: Record<string, string> = {
  trip: '行程',
  course: '課程'
};

export default async function AdminBookingsPage({
  params,
  searchParams
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<{status?: string}>;
}) {
  const {locale} = await params;
  const {status} = await searchParams;
  const filter = status && (Object.keys(STATUS_LABEL) as string[]).includes(status) ? status : undefined;
  const [result, counts] = await Promise.all([
    listBookings({status: filter}),
    countBookingsByStatus()
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold text-navy-900">報名管理</h1>
        <p className="text-sm text-gray-500">
          使用者透過行程或課程頁送出的報名都會出現在這裡，依狀態追蹤聯絡進度。
        </p>
      </header>

      <BookingsTabs active="all" locale={locale} />

      <nav className="flex flex-wrap items-center gap-2 text-sm">
        <FilterPill href={`/${locale}/admin/bookings`} active={!filter} count={total} label="全部" />
        {(Object.keys(STATUS_LABEL) as BookingStatus[]).map((s) => (
          <FilterPill
            key={s}
            href={`/${locale}/admin/bookings?status=${s}`}
            active={filter === s}
            count={counts[s] ?? 0}
            label={STATUS_LABEL[s]}
          />
        ))}
      </nav>

      {result.status === 'missing-table' ? (
        <MissingTableNotice />
      ) : result.status === 'error' ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {result.error}
        </p>
      ) : result.rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            {filter ? `沒有「${STATUS_LABEL[filter as BookingStatus]}」的報名` : '還沒有任何報名'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">送出時間</th>
                <th className="px-4 py-3">報名項目</th>
                <th className="px-4 py-3">聯絡人</th>
                <th className="px-4 py-3">聯絡方式</th>
                <th className="px-4 py-3">人數</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {result.rows.map((b) => (
                <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-en text-xs text-gray-600">
                    {formatDateTime(b.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-navy-900">{b.item_title_snapshot}</div>
                    <div className="font-en text-xs text-gray-500">
                      {ITEM_TYPE_LABEL[b.item_type] ?? b.item_type} · {b.item_slug}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy-900">{b.contact_name}</div>
                    <div className="font-en text-xs text-gray-500">{b.contact_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 font-en text-xs text-gray-600">
                      {b.contact_phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {b.contact_phone}
                        </span>
                      ) : null}
                      {b.contact_line ? (
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {b.contact_line}
                        </span>
                      ) : null}
                      {!b.contact_phone && !b.contact_line ? (
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <Mail className="h-3 w-3" /> Email only
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-en text-sm">{b.party_size}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/${locale}/admin/bookings/${b.id}`}
                      className="text-sm font-medium text-coral hover:underline"
                    >
                      檢視
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  href,
  active,
  count,
  label
}: {
  href: string;
  active: boolean;
  count: number;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition ${
        active
          ? 'bg-navy-900 text-white'
          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 text-[11px] font-en ${
          active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

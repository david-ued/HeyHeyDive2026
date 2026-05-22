import {notFound} from 'next/navigation';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
  UserCheck,
  Users,
  Waves,
  XCircle
} from 'lucide-react';
import {createClient} from '@/lib/supabase/server';
import {Link} from '@/i18n/navigation';
import type {Booking, Trip} from '@/lib/cms/types';

export const dynamic = 'force-dynamic';

const DESTINATION_LABEL: Record<string, string> = {
  ludao: '綠島',
  lanyu: '蘭嶼',
  liuqiu: '小琉球',
  kenting: '墾丁',
  other: '其他'
};

const STATUS_META: Record<
  string,
  {label: string; cls: string; hint: string; cancelled?: boolean}
> = {
  pending: {
    label: '尚未聯絡',
    cls: 'bg-amber-100 text-amber-800',
    hint: '我們已收到你的報名，工作人員會在 1–2 個工作日內與你聯繫。'
  },
  contacted: {
    label: '聯絡中',
    cls: 'bg-sky-100 text-sky-800',
    hint: '我們已聯繫，請依工作人員指引完成付款或補件。'
  },
  confirmed: {
    label: '已確認',
    cls: 'bg-emerald-100 text-emerald-800',
    hint: '報名已確認 ✨ 出發前我們會再次提醒注意事項。'
  },
  cancelled: {
    label: '已取消',
    cls: 'bg-gray-100 text-gray-700',
    hint: '這筆報名已取消。如要重新報名請聯絡客服。',
    cancelled: true
  }
};

const STEPS = ['pending', 'contacted', 'confirmed'] as const;

export default async function MemberBookingDetail({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {id} = await params;
  const supabase = await createClient();
  const {data} = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!data) notFound();
  const booking = data as Booking;

  let trip: Trip | null = null;
  if (booking.item_type === 'trip') {
    const {data: t} = await supabase
      .from('trips')
      .select('*')
      .eq('slug', booking.item_slug)
      .maybeSingle();
    trip = (t ?? null) as Trip | null;
  }

  const status = STATUS_META[booking.status] ?? STATUS_META.pending;
  const companions = (booking.companions ?? []).filter(Boolean);
  const destination = trip ? DESTINATION_LABEL[trip.destination] ?? trip.destination : null;

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/member"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900"
      >
        <ChevronLeft className="h-4 w-4" /> 回到我的報名
      </Link>

      <header className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {trip?.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip.cover_image}
            alt={trip.title}
            className="h-44 w-full object-cover sm:h-56"
          />
        ) : (
          <div className="matte matte-soft flex h-44 w-full items-center justify-center bg-gradient-to-br from-navy-900 to-coral/70 text-white sm:h-56">
            <Waves className="h-12 w-12 opacity-70" />
          </div>
        )}
        <div className="flex flex-col gap-3 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-en text-[10px] font-medium uppercase tracking-[0.2em] text-coral">
              {booking.item_type === 'trip' ? 'TRIP' : 'COURSE'}
              {destination ? ` · ${destination}` : ''}
            </p>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.cls}`}
            >
              {status.label}
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
            {booking.item_title_snapshot}
          </h1>
          {trip ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatRange(trip.start_date, trip.end_date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                {destination}
              </span>
              {trip.price_twd ? (
                <span className="font-en text-xs text-gray-500">
                  NT$ {trip.price_twd.toLocaleString()}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              送出時間：{new Date(booking.created_at).toLocaleString('zh-TW')}
            </p>
          )}
          <p className="rounded-md bg-coral/5 px-3 py-2 text-sm text-coral">
            <Info className="mr-1.5 inline h-4 w-4 -translate-y-0.5" />
            {status.hint}
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-5 font-heading text-lg font-semibold text-navy-900">
          進度追蹤
        </h2>
        <ProgressTimeline status={booking.status} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 font-heading text-lg font-semibold text-navy-900">
            報名資訊
          </h2>
          <dl className="grid gap-y-3 gap-x-6 sm:grid-cols-2">
            <Field icon={<UserCheck className="h-4 w-4" />} label="主要聯絡人">
              {booking.contact_name}
            </Field>
            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <a className="text-coral hover:underline" href={`mailto:${booking.contact_email}`}>
                {booking.contact_email}
              </a>
            </Field>
            <Field icon={<Phone className="h-4 w-4" />} label="電話">
              {booking.contact_phone ? (
                <a className="text-coral hover:underline" href={`tel:${booking.contact_phone}`}>
                  {booking.contact_phone}
                </a>
              ) : (
                '—'
              )}
            </Field>
            <Field icon={<MessageCircle className="h-4 w-4" />} label="LINE ID">
              {booking.contact_line ?? '—'}
            </Field>
            <Field icon={<Users className="h-4 w-4" />} label="總人數">
              {booking.party_size} 人
            </Field>
            <Field icon={<ShieldAlert className="h-4 w-4" />} label="證照等級">
              {booking.dive_cert_level ?? '—'}
            </Field>
          </dl>

          <div className="mt-6">
            <h3 className="mb-2 font-heading text-sm font-semibold text-navy-900">
              緊急聯絡人
            </h3>
            <div className="grid gap-y-2 gap-x-6 rounded-md bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <span className="text-gray-500">姓名：</span>
                <span className="text-navy-900">
                  {booking.emergency_contact_name ?? '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">電話：</span>
                <span className="text-navy-900">
                  {booking.emergency_contact_phone ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {companions.length > 0 ? (
            <div className="mt-6">
              <h3 className="mb-2 font-heading text-sm font-semibold text-navy-900">
                同行者（{companions.length}）
              </h3>
              <ul className="flex flex-wrap gap-2">
                {companions.map((c, i) => (
                  <li
                    key={i}
                    className="rounded-full bg-coral/10 px-3 py-1 text-xs text-coral ring-1 ring-coral/30"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {booking.notes?.trim() ? (
            <div className="mt-6">
              <h3 className="mb-2 font-heading text-sm font-semibold text-navy-900">
                你的備註
              </h3>
              <p className="whitespace-pre-line rounded-md bg-gray-50 px-3 py-3 text-sm text-gray-700">
                {booking.notes}
              </p>
            </div>
          ) : null}

          {booking.admin_note ? (
            <div className="mt-6 rounded-md border border-coral/40 bg-coral/5 px-4 py-3 text-sm">
              <p className="mb-1 font-medium text-coral">工作人員留言</p>
              <p className="whitespace-pre-line text-navy-900">{booking.admin_note}</p>
            </div>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-3 font-heading text-sm font-semibold text-navy-900">
              需要協助？
            </h2>
            <p className="mb-3 text-xs text-gray-600">
              要修改聯絡資訊、調整人數或申請取消？請透過下列方式聯繫我們。
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://line.me/R/ti/p/@heydive"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:brightness-110"
              >
                <MessageCircle className="h-3.5 w-3.5" /> LINE @heydive
              </a>
              <a
                href="mailto:hello@heyheydive.com"
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-navy-900 hover:bg-gray-50"
              >
                <Mail className="h-3.5 w-3.5" /> hello@heyheydive.com
              </a>
              <a
                href="tel:+886989123456"
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-navy-900 hover:bg-gray-50"
              >
                <Phone className="h-3.5 w-3.5" /> +886 989 123 456
              </a>
            </div>
          </div>

          {trip ? (
            <Link
              href={`/trips/${trip.slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-coral/40 bg-coral/5 px-3 py-2 text-xs font-semibold text-coral hover:bg-coral/10"
            >
              查看完整行程介紹
            </Link>
          ) : booking.item_type === 'course' ? (
            <Link
              href={`/courses/${booking.item_slug}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-coral/40 bg-coral/5 px-3 py-2 text-xs font-semibold text-coral hover:bg-coral/10"
            >
              查看完整課程介紹
            </Link>
          ) : null}
        </aside>
      </section>

      <footer className="text-xs text-gray-400">
        報名編號 · <span className="font-en">{booking.id}</span>
      </footer>
    </div>
  );
}

function Field({
  icon,
  label,
  children
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gray-500">
        <span className="text-gray-400">{icon}</span>
        {label}
      </dt>
      <dd className="text-sm text-navy-900">{children}</dd>
    </div>
  );
}

function ProgressTimeline({status}: {status: string}) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-600">
        <XCircle className="h-5 w-5 text-gray-400" />
        此報名已取消。如需重新報名請聯絡客服。
      </div>
    );
  }
  const currentIdx = STEPS.indexOf(status as (typeof STEPS)[number]);
  const labels = ['送出報名', '聯絡確認', '報名完成'];
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
            <div className="flex items-center gap-3 sm:w-full">
              {done ? (
                <CheckCircle2
                  className={`h-6 w-6 ${
                    isCurrent ? 'text-coral' : 'text-emerald-500'
                  }`}
                />
              ) : (
                <Circle className="h-6 w-6 text-gray-300" />
              )}
              {i < STEPS.length - 1 ? (
                <span
                  className={`hidden h-px flex-1 sm:block ${
                    i < currentIdx ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              ) : null}
            </div>
            <div className="flex flex-col">
              <span
                className={`text-sm font-medium ${
                  done ? 'text-navy-900' : 'text-gray-400'
                }`}
              >
                {labels[i]}
              </span>
              <span className="font-en text-[10px] uppercase tracking-wider text-gray-400">
                Step {i + 1}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  if (fmt(s) === fmt(e)) return `${s.getFullYear()} ${fmt(s)}`;
  return `${s.getFullYear()} ${fmt(s)} – ${fmt(e)}`;
}

import {
  ArrowRight,
  Award,
  CalendarDays,
  IdCard,
  KeyRound,
  MapPin,
  MessageCircle,
  Users,
  Waves
} from 'lucide-react';
import {createClient} from '@/lib/supabase/server';
import {Link} from '@/i18n/navigation';
import {getCurrentUser} from '@/lib/supabase/auth';
import type {Booking, Trip} from '@/lib/cms/types';

export const dynamic = 'force-dynamic';

const STATUS_META: Record<
  string,
  {label: string; cls: string; hint: string}
> = {
  pending: {
    label: '尚未聯絡',
    cls: 'bg-amber-100 text-amber-800 border-amber-200',
    hint: '我們會盡快與你聯絡確認細節'
  },
  contacted: {
    label: '聯絡中',
    cls: 'bg-sky-100 text-sky-800 border-sky-200',
    hint: '工作人員已聯繫，請回覆訊息以確認報名'
  },
  confirmed: {
    label: '已確認 · 等你下水',
    cls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    hint: '報名已確認，請依工作人員指示準備'
  },
  cancelled: {
    label: '已取消',
    cls: 'bg-gray-100 text-gray-600 border-gray-200',
    hint: '此筆報名已取消，如有疑問請聯絡客服'
  }
};

const DESTINATION_LABEL: Record<string, string> = {
  ludao: '綠島',
  lanyu: '蘭嶼',
  liuqiu: '小琉球',
  kenting: '墾丁',
  other: '其他'
};

export default async function MemberDashboard({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const [{data: bookingsData}, {data: tripsData}, {data: certsData}] =
    await Promise.all([
      supabase.from('bookings').select('*').order('created_at', {ascending: false}),
      supabase.from('trips').select('*'),
      supabase.from('certificates').select('id')
    ]);

  const bookings = (bookingsData ?? []) as Booking[];
  const trips = (tripsData ?? []) as Trip[];
  const certCount = (certsData ?? []).length;

  const tripsBySlug = new Map(trips.map((t) => [t.slug, t]));
  const today = new Date().toISOString().slice(0, 10);

  const upcomingConfirmed = bookings.filter(
    (b) =>
      b.status === 'confirmed' &&
      (tripsBySlug.get(b.item_slug)?.end_date ?? '9999-12-31') >= today
  );
  const active = bookings.filter((b) => b.status !== 'cancelled');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  const displayName =
    (user!.user_metadata?.display_name as string | undefined)?.trim() ||
    user!.email ||
    '會員';

  const nextTripBooking = upcomingConfirmed.sort((a, b) => {
    const aDate = tripsBySlug.get(a.item_slug)?.start_date ?? '9999';
    const bDate = tripsBySlug.get(b.item_slug)?.start_date ?? '9999';
    return aDate.localeCompare(bDate);
  })[0];
  const nextTrip = nextTripBooking
    ? tripsBySlug.get(nextTripBooking.item_slug)
    : null;

  return (
    <div className="flex flex-col gap-8">
      <HeroBanner
        name={displayName}
        nextTrip={nextTrip ?? null}
        nextBooking={nextTripBooking ?? null}
        locale={locale}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<CalendarDays className="h-4 w-4" />}
          label="進行中"
          value={active.length}
          hint="尚未取消的所有報名"
        />
        <StatCard
          icon={<Waves className="h-4 w-4" />}
          label="已確認"
          value={bookings.filter((b) => b.status === 'confirmed').length}
          hint="即將出發的活動"
        />
        <StatCard
          icon={<Award className="h-4 w-4" />}
          label="持有證照"
          value={certCount}
          hint="由 HeyHeyDive 上傳"
        />
      </section>

      <QuickActions locale={locale} />

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-lg font-semibold text-navy-900">
            我的報名
          </h2>
          <span className="text-xs text-gray-500">
            共 {active.length} 筆進行中
          </span>
        </div>
        {active.length === 0 ? (
          <EmptyState
            icon={<Waves className="mx-auto h-10 w-10 text-coral/40" />}
            title="準備好開始第一次探索了嗎？"
            hint="挑選一個梯次，把腳趾尖泡進海裡。報名送出後，這裡會出現你的活動。"
            ctaLabel="查看近期行程"
            ctaHref="/calendar"
          />
        ) : (
          <div className="grid gap-3">
            {active.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                trip={tripsBySlug.get(b.item_slug) ?? null}
              />
            ))}
          </div>
        )}
      </section>

      {cancelled.length > 0 ? (
        <details className="rounded-lg border border-gray-200 bg-white p-5">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-navy-900">
            已取消的報名（{cancelled.length}）
          </summary>
          <div className="mt-3 grid gap-3">
            {cancelled.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                trip={tripsBySlug.get(b.item_slug) ?? null}
                muted
              />
            ))}
          </div>
        </details>
      ) : null}

      <footer className="rounded-lg border border-dashed border-gray-300 bg-white p-5 text-xs text-gray-500">
        <p>
          登入信箱：<span className="font-en">{user?.email}</span>
        </p>
        <p className="mt-1">
          若聯絡資訊有誤，請 <a
            href="https://line.me/R/ti/p/@heydive"
            target="_blank"
            rel="noreferrer noopener"
            className="text-coral hover:underline"
          >LINE 通知工作人員</a> 或寄信到 <a className="text-coral hover:underline" href="mailto:hello@heyheydive.com">hello@heyheydive.com</a>。
        </p>
      </footer>
    </div>
  );
}

function HeroBanner({
  name,
  nextTrip,
  nextBooking,
  locale
}: {
  name: string;
  nextTrip: Trip | null;
  nextBooking: Booking | null;
  locale: string;
}) {
  const greeting = greetingFor(new Date());
  return (
    <section className="matte matte-soft matte-strong relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-coral/80 p-8 text-white shadow-lg">
      <div
        aria-hidden
        className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-gold/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-coral/40 blur-3xl"
      />
      <div className="relative flex flex-col gap-4">
        <p className="font-en text-[11px] font-bold tracking-[0.3em] text-gold">
          {greeting.kicker}
        </p>
        <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
          {greeting.text}，{name}
        </h1>

        {nextTrip && nextBooking ? (
          <div className="mt-2 flex flex-col gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="font-en text-[10px] font-medium uppercase tracking-wider text-gold">
                NEXT TRIP
              </p>
              <p className="font-heading text-lg font-semibold">{nextTrip.title}</p>
              <p className="flex items-center gap-3 text-xs text-white/80">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatRange(nextTrip.start_date, nextTrip.end_date)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {DESTINATION_LABEL[nextTrip.destination] ?? nextTrip.destination}
                </span>
              </p>
            </div>
            <Link
              href={`/member/bookings/${nextBooking.id}`}
              className="inline-flex items-center gap-1.5 self-start rounded-full bg-white px-4 py-2 text-xs font-semibold text-navy-900 transition hover:bg-gold sm:self-auto"
            >
              查看我的行程
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <p className="text-sm text-white/80">
            目前沒有確認中的下水梯次。逛逛 <Link
              href="/calendar"
              className="text-gold underline-offset-4 hover:underline"
            >報名行程</Link> 找下一場吧。
          </p>
        )}

        <p className="hidden text-[10px] text-white/50 sm:block">
          現在時間（{locale}）：{new Date().toLocaleString('zh-TW')}
        </p>
      </div>
    </section>
  );
}

function QuickActions({locale}: {locale: string}) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <ActionCard
        icon={<IdCard className="h-5 w-5 text-coral" />}
        title="查看證照"
        body="AIDA / PADI 證照"
        href="/member/certificates"
      />
      <ActionCard
        icon={<KeyRound className="h-5 w-5 text-coral" />}
        title="帳號設定"
        body="變更密碼、查看資料"
        href="/member/account"
      />
      <ActionCard
        icon={<Waves className="h-5 w-5 text-coral" />}
        title="近期行程"
        body="瀏覽報名梯次"
        href="/calendar"
      />
      <ExternalAction
        icon={<MessageCircle className="h-5 w-5 text-coral" />}
        title="LINE 聯絡客服"
        body="@heydive"
        href="https://line.me/R/ti/p/@heydive"
      />
    </section>
  );
}

function ActionCard({
  icon,
  title,
  body,
  href
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-coral hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-coral/10">
          {icon}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-navy-900">{title}</span>
          <span className="text-xs text-gray-500">{body}</span>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-1 group-hover:text-coral" />
    </Link>
  );
}

function ExternalAction({
  icon,
  title,
  body,
  href
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-coral hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-coral/10">
          {icon}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-navy-900">{title}</span>
          <span className="text-xs text-gray-500">{body}</span>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-1 group-hover:text-coral" />
    </a>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
      <div className="flex items-center gap-2 text-coral">
        {icon}
        <p className="font-en text-[11px] font-medium uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="mt-1 font-heading text-3xl font-bold text-navy-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  );
}

function BookingCard({
  booking,
  trip,
  muted = false
}: {
  booking: Booking;
  trip: Trip | null;
  muted?: boolean;
}) {
  const status = STATUS_META[booking.status] ?? STATUS_META.pending;
  const destination = trip
    ? DESTINATION_LABEL[trip.destination] ?? trip.destination
    : null;

  return (
    <Link
      href={`/member/bookings/${booking.id}`}
      className={`group flex flex-col gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-coral hover:shadow-md ${
        muted ? 'opacity-70' : ''
      }`}
    >
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-stretch sm:gap-5">
        {trip?.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip.cover_image}
            alt={trip.title}
            className="h-32 w-full shrink-0 rounded-md object-cover sm:h-24 sm:w-40"
          />
        ) : (
          <div className="matte flex h-32 w-full shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-navy-900 to-coral/70 text-white sm:h-24 sm:w-40">
            <Waves className="h-8 w-8 opacity-70" />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <p className="font-en text-[10px] font-medium uppercase tracking-wider text-coral">
                {booking.item_type === 'trip' ? 'TRIP' : 'COURSE'}
                {destination ? ` · ${destination}` : ''}
              </p>
              <h3 className="font-heading text-base font-semibold text-navy-900 group-hover:text-coral">
                {booking.item_title_snapshot}
              </h3>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.cls}`}
            >
              {status.label}
            </span>
          </div>

          <p className="text-xs text-gray-500">{status.hint}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
            {trip ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                {formatRange(trip.start_date, trip.end_date)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                送出：{new Date(booking.created_at).toLocaleDateString('zh-TW')}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              {booking.party_size} 人
            </span>
            {booking.dive_cert_level ? (
              <span className="font-en text-[11px] text-gray-500">
                證照：{booking.dive_cert_level}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  hint,
  ctaLabel,
  ctaHref
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      {icon}
      <p className="mt-3 font-heading text-base font-semibold text-navy-900">
        {title}
      </p>
      <p className="mt-1 text-sm text-gray-500">{hint}</p>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
      >
        {ctaLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) {
    return {kicker: 'GOOD MORNING', text: '早安'};
  }
  if (hour >= 11 && hour < 14) {
    return {kicker: 'BUENOS DÍAS', text: '中午好'};
  }
  if (hour >= 14 && hour < 18) {
    return {kicker: 'GOOD AFTERNOON', text: '午安'};
  }
  if (hour >= 18 && hour < 22) {
    return {kicker: 'GOOD EVENING', text: '晚上好'};
  }
  return {kicker: 'STILL DIVING?', text: '夜安'};
}

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const sStr = `${s.getMonth() + 1}/${s.getDate()}`;
  const eStr = `${e.getMonth() + 1}/${e.getDate()}`;
  if (sStr === eStr) return `${s.getFullYear()} ${sStr}`;
  return `${s.getFullYear()} ${sStr} – ${eStr}`;
}

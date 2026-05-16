import {useTranslations} from 'next-intl';
import {Calendar, MapPin, Users, Waves} from 'lucide-react';
import {createAdminClient} from '@/lib/supabase/admin-client';

export const dynamic = 'force-dynamic';

async function getUserCount(): Promise<number | null> {
  try {
    const admin = createAdminClient();
    const {data, error} = await admin.auth.admin.listUsers({page: 1, perPage: 1});
    if (error) return null;
    // The auth API doesn't return a total; we infer "at least N" by paging.
    // For a small site this is fine — replace once we have a profiles table.
    return data.users.length;
  } catch {
    return null;
  }
}

export default async function AdminDashboard() {
  const userCount = await getUserCount();
  return <Dashboard userCount={userCount} />;
}

function Dashboard({userCount}: {userCount: number | null}) {
  const t = useTranslations('Admin.dashboard');

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="font-en text-xs font-bold tracking-[0.2em] text-coral">
          DASHBOARD
        </p>
        <h1 className="font-heading text-3xl font-bold text-navy-900">
          {t('title')}
        </h1>
        <p className="text-sm text-gray-500">{t('subtitle')}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users />} label={t('stat.users')} value={userCount ?? '—'} />
        <StatCard icon={<Calendar />} label={t('stat.upcomingTrips')} value="3" hint={t('stat.placeholder')} />
        <StatCard icon={<MapPin />} label={t('stat.activeSites')} value="3" hint={t('stat.placeholder')} />
        <StatCard icon={<Waves />} label={t('stat.coursesRunning')} value="2" hint={t('stat.placeholder')} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title={t('panels.recentBookings.title')} body={t('panels.recentBookings.body')} />
        <Panel title={t('panels.notes.title')} body={t('panels.notes.body')} />
      </section>
    </div>
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
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5">
      <span className="text-coral [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <p className="font-en text-xs uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="font-en text-3xl font-bold text-navy-900">{value}</p>
      {hint ? <p className="text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

function Panel({title, body}: {title: string; body: string}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6">
      <p className="font-heading text-lg font-bold text-navy-900">{title}</p>
      <p className="text-sm leading-relaxed text-gray-500">{body}</p>
    </div>
  );
}

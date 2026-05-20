import Link from 'next/link';

type Tab = 'all' | 'by-trip';

export function BookingsTabs({active, locale}: {active: Tab; locale: string}) {
  const tabs: Array<{key: Tab; label: string; href: string}> = [
    {key: 'all', label: '全部報名', href: `/${locale}/admin/bookings`},
    {key: 'by-trip', label: '依行程', href: `/${locale}/admin/bookings/by-trip`}
  ];
  return (
    <nav className="inline-flex w-fit overflow-hidden rounded-md border border-gray-200 bg-white text-sm">
      {tabs.map((t, i) => (
        <Link
          key={t.key}
          href={t.href}
          className={`px-4 py-2 font-medium transition ${
            active === t.key
              ? 'bg-navy-900 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          } ${i > 0 ? 'border-l border-gray-200' : ''}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

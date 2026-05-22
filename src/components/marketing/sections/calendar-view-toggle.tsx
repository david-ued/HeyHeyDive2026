import {useTranslations} from 'next-intl';
import {CalendarDays, List} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';

export type CalendarView = 'calendar' | 'list';

export function CalendarViewToggle({
  view,
  ym
}: {
  view: CalendarView;
  /** Month query string preserved when switching views; e.g. "2026-06" */
  ym: string | null;
}) {
  const t = useTranslations('Calendar.view');
  const calendarHref = ym ? `/calendar?view=calendar&ym=${ym}` : '/calendar?view=calendar';
  const listHref = ym ? `/calendar?view=list&ym=${ym}` : '/calendar?view=list';

  return (
    <div className="flex justify-center">
      <div
        role="tablist"
        aria-label="View mode"
        className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm"
      >
        <Link
          href={calendarHref}
          role="tab"
          aria-selected={view === 'calendar'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition',
            view === 'calendar'
              ? 'bg-navy-900 text-white shadow'
              : 'text-gray-600 hover:bg-gray-50 hover:text-navy-900'
          )}
        >
          <CalendarDays className="h-4 w-4" />
          {t('calendar')}
        </Link>
        <Link
          href={listHref}
          role="tab"
          aria-selected={view === 'list'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition',
            view === 'list'
              ? 'bg-navy-900 text-white shadow'
              : 'text-gray-600 hover:bg-gray-50 hover:text-navy-900'
          )}
        >
          <List className="h-4 w-4" />
          {t('list')}
        </Link>
      </div>
    </div>
  );
}

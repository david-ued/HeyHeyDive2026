'use client';

import {useState} from 'react';
import type {ReactNode} from 'react';
import {IdCard, KeyRound, LayoutDashboard, LogOut, Menu, X} from 'lucide-react';
import {Link, usePathname} from '@/i18n/navigation';
import {signOutMemberAction} from '../actions';

const NAV = [
  {href: '/member', label: '我的報名', icon: LayoutDashboard},
  {href: '/member/certificates', label: '我的證照', icon: IdCard},
  {href: '/member/account', label: '帳號設定', icon: KeyRound}
] as const;

export function MemberShell({
  children,
  locale,
  email,
  displayName
}: {
  children: ReactNode;
  locale: string;
  email: string;
  displayName: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-off-white text-ink md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/heyhey.jpg"
            alt="heyheydive"
            className="h-8 w-8 rounded-md object-cover"
          />
          <div className="flex flex-col leading-tight">
            <p className="font-en text-[9px] font-bold tracking-[0.25em] text-coral">
              MEMBER
            </p>
            <p className="text-xs font-semibold text-navy-900">{displayName}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={open ? '關閉選單' : '開啟選單'}
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-md border border-gray-300 text-navy-900"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute inset-y-0 left-0 flex w-72 flex-col gap-5 bg-white px-6 py-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <MemberHeader displayName={displayName} email={email} />
            <Nav onNavigate={() => setOpen(false)} pathname={pathname} />
            <Footer locale={locale} />
          </aside>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col gap-5 border-r border-gray-200 bg-white px-6 py-10 md:flex">
        <MemberHeader displayName={displayName} email={email} />
        <Nav pathname={pathname} />
        <Footer locale={locale} />
      </aside>

      <main className="animate-fade-up flex-1 px-5 py-6 md:px-12 md:py-10">
        {children}
      </main>
    </div>
  );
}

function MemberHeader({displayName, email}: {displayName: string; email: string}) {
  return (
    <>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/heyhey.jpg"
          alt="heyheydive"
          className="h-10 w-10 rounded-md object-cover"
        />
        <div className="flex flex-col leading-tight">
          <p className="font-en text-[10px] font-bold tracking-[0.25em] text-coral">
            MEMBER PORTAL
          </p>
          <p className="text-sm font-semibold text-navy-900">HeyHeyDive</p>
        </div>
      </div>

      <div className="matte matte-soft flex flex-col gap-1 overflow-hidden rounded-lg bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-3 text-white">
        <p className="font-en text-[10px] font-medium uppercase tracking-wider text-gold">
          歡迎回來
        </p>
        <p className="truncate text-sm font-semibold">{displayName}</p>
        <p className="truncate font-en text-[11px] text-white/70">{email}</p>
      </div>
    </>
  );
}

function Nav({
  pathname,
  onNavigate
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="mt-2 flex flex-col gap-1">
      {NAV.map(({href, label, icon: Icon}) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition ${
              active
                ? 'bg-coral/10 text-coral'
                : 'text-gray-700 hover:bg-coral/10 hover:text-coral'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Footer({locale}: {locale: string}) {
  return (
    <div className="mt-auto flex flex-col gap-3 border-t border-gray-200 pt-4">
      <Link href="/" className="text-xs text-gray-500 hover:text-navy-900">
        ← 回首頁
      </Link>
      <form action={signOutMemberAction}>
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          <LogOut className="h-3.5 w-3.5" /> 登出
        </button>
      </form>
    </div>
  );
}

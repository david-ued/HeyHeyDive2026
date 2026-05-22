'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {signInMemberAction, type MemberLoginState} from './actions';

const initial: MemberLoginState = {error: null};

const ERROR_MESSAGES: Record<string, string> = {
  'missing-fields': '請輸入 Email 和密碼。',
  'invalid-credentials': 'Email 或密碼錯誤，請再確認或聯絡客服。'
};

export function MemberLoginForm({locale}: {locale: string}) {
  const [state, formAction] = useActionState(signInMemberAction, initial);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium tracking-wider text-gray-700">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="h-11 rounded-md border border-gray-300 bg-white px-3 font-en text-sm text-navy-900 placeholder:text-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium tracking-wider text-gray-700">密碼</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-11 rounded-md border border-gray-300 bg-white px-3 font-en text-sm text-navy-900 placeholder:text-gray-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
      </label>

      {state.error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {ERROR_MESSAGES[state.error] ?? state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-center text-xs text-gray-500">
        尚未收到帳號？請與工作人員確認你的報名狀態（確認後會自動發送帳密）。
      </p>
    </form>
  );
}

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-md bg-coral font-en text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? '登入中…' : '登入'}
    </button>
  );
}

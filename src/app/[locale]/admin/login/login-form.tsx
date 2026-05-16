'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {useTranslations} from 'next-intl';
import {signInAction, type LoginState} from './actions';

const initial: LoginState = {error: null};

export function LoginForm({locale}: {locale: string}) {
  const t = useTranslations('Admin.login');
  const [state, formAction] = useActionState(signInAction, initial);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />

      <label className="flex flex-col gap-1.5">
        <span className="font-en text-xs font-medium tracking-wider text-gray-300">
          {t('emailLabel')}
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="h-11 rounded-md border border-navy-700 bg-navy-800 px-3 font-en text-sm text-white placeholder:text-gray-500 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          placeholder="you@heyheydive.com"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-en text-xs font-medium tracking-wider text-gray-300">
          {t('passwordLabel')}
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="h-11 rounded-md border border-navy-700 bg-navy-800 px-3 font-en text-sm text-white placeholder:text-gray-500 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          placeholder="••••••••"
        />
      </label>

      {state.error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {t(`errors.${state.error}`)}
        </p>
      ) : null}

      <SubmitButton label={t('submit')} pendingLabel={t('submitting')} />
    </form>
  );
}

function SubmitButton({
  label,
  pendingLabel
}: {
  label: string;
  pendingLabel: string;
}) {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-md bg-coral font-en text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

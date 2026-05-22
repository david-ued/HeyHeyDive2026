'use client';

import {useActionState, useRef} from 'react';
import {useFormStatus} from 'react-dom';
import {KeyRound} from 'lucide-react';
import {changePasswordAction, type ChangePasswordState} from '../actions';

const initial: ChangePasswordState = {ok: false, error: null};

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    async (prev: ChangePasswordState, fd: FormData) => {
      const next = await changePasswordAction(prev, fd);
      if (next.ok) formRef.current?.reset();
      return next;
    },
    initial
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6"
    >
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-coral/10">
          <KeyRound className="h-5 w-5 text-coral" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold text-navy-900">
            變更密碼
          </h2>
          <p className="text-xs text-gray-500">
            建議首次登入後就替換成你自己記得的密碼。
          </p>
        </div>
      </header>

      <PasswordField
        label="目前密碼"
        name="current_password"
        autoComplete="current-password"
        placeholder="工作人員提供的密碼"
      />
      <PasswordField
        label="新密碼"
        name="new_password"
        autoComplete="new-password"
        placeholder="至少 8 個字元"
      />
      <PasswordField
        label="再次確認新密碼"
        name="confirm_password"
        autoComplete="new-password"
        placeholder="再輸入一次"
      />

      {state.error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          密碼已更新 ✨ 下次登入請使用新密碼。
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function PasswordField({
  label,
  name,
  autoComplete,
  placeholder
}: {
  label: string;
  name: string;
  autoComplete: string;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-navy-900">{label}</span>
      <input
        type="password"
        name={name}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-11 rounded-md border border-gray-300 px-3 font-en text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
      />
    </label>
  );
}

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
    >
      {pending ? '更新中…' : '更新密碼'}
    </button>
  );
}

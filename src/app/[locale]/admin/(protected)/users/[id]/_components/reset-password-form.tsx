'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {resetMemberPasswordAction, type ResetPasswordState} from '../../actions';

const initial: ResetPasswordState = {password: null, error: null};

export function ResetPasswordForm({userId, email}: {userId: string; email: string}) {
  const [state, formAction] = useActionState(resetMemberPasswordAction, initial);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`確定要重設 ${email} 的密碼？舊密碼將立刻失效。`)) {
          e.preventDefault();
        }
      }}
      className="rounded-lg border border-gray-200 bg-white p-5"
    >
      <input type="hidden" name="user_id" value={userId} />
      <h3 className="mb-2 font-heading text-sm font-semibold text-navy-900">重設密碼</h3>
      <p className="text-xs text-gray-500">
        產生新的隨機密碼。舊密碼立刻失效，新密碼僅顯示一次。
      </p>

      {state.error ? (
        <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.password ? (
        <div className="mt-3 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <p className="mb-1 font-medium">新密碼（請複製轉知會員）：</p>
          <p className="font-en text-sm font-semibold">{state.password}</p>
        </div>
      ) : null}

      <ResetButton />
    </form>
  );
}

function ResetButton() {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-navy-900 hover:bg-gray-50 disabled:opacity-60"
    >
      {pending ? '產生中…' : '產生新密碼'}
    </button>
  );
}

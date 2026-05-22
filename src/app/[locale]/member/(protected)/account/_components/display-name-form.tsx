'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {UserCheck} from 'lucide-react';
import {updateDisplayNameAction, type ProfileState} from '../actions';

const initial: ProfileState = {ok: false, error: null};

export function DisplayNameForm({defaultValue}: {defaultValue: string}) {
  const [state, formAction] = useActionState(updateDisplayNameAction, initial);
  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6"
    >
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-coral/10">
          <UserCheck className="h-5 w-5 text-coral" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold text-navy-900">
            顯示名稱
          </h2>
          <p className="text-xs text-gray-500">
            這個名稱會顯示在會員後台與管理員看到的資料中。
          </p>
        </div>
      </header>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-navy-900">名稱</span>
        <input
          type="text"
          name="display_name"
          defaultValue={defaultValue}
          maxLength={80}
          placeholder="想被稱呼的名字"
          className="h-11 rounded-md border border-gray-300 px-3 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
      </label>

      {state.error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          名稱已更新。
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
    >
      {pending ? '儲存中…' : '儲存名稱'}
    </button>
  );
}

'use client';

import {deleteUserAction} from '../actions';

export function DeleteUserButton({id, email}: {id: string; email: string}) {
  return (
    <form
      action={deleteUserAction}
      onSubmit={(e) => {
        if (!confirm(`確定要刪除 ${email}？此動作無法復原。`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="user_id" value={id} />
      <button
        type="submit"
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
      >
        刪除
      </button>
    </form>
  );
}

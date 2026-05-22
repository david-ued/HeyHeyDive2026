'use client';

import {useActionState, useRef} from 'react';
import {useFormStatus} from 'react-dom';
import {
  createCertificateAction,
  type CertificateFormState
} from '@/lib/cms/certificates';

const initial: CertificateFormState = {ok: false, error: null};

export function CertificateUploadForm({
  userId,
  locale
}: {
  userId: string;
  locale: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(async (prev: CertificateFormState, fd: FormData) => {
    const next = await createCertificateAction(prev, fd);
    if (next.ok) {
      formRef.current?.reset();
    }
    return next;
  }, initial);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="locale" value={locale} />

      <Field label="系統" required>
        <select
          name="system"
          required
          defaultValue=""
          className="h-10 rounded-md border border-gray-300 bg-white px-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        >
          <option value="" disabled>
            請選擇
          </option>
          <option value="aida">AIDA 自由潛水</option>
          <option value="padi">PADI 水肺潛水</option>
          <option value="other">其他</option>
        </select>
      </Field>

      <Field label="等級 / 名稱" required>
        <input
          name="level"
          required
          placeholder="例：OWD、AIDA 2、Rescue Diver"
          className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
      </Field>

      <Field label="證照編號">
        <input
          name="cert_number"
          placeholder="例：123456789"
          className="h-10 rounded-md border border-gray-300 px-3 font-en text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
      </Field>

      <Field label="發證日期">
        <input
          type="date"
          name="issued_date"
          className="h-10 rounded-md border border-gray-300 px-3 font-en text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
      </Field>

      <Field label="證照圖片" hint="JPG / PNG，5MB 內" className="sm:col-span-2">
        <input
          type="file"
          name="image"
          accept="image/*"
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:brightness-110"
        />
      </Field>

      <Field label="備註" className="sm:col-span-2">
        <textarea
          name="notes"
          rows={3}
          placeholder="可填發證機構、教練、有效期限等..."
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
      </Field>

      {state.error ? (
        <p className="sm:col-span-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="sm:col-span-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          證照已新增。
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  className,
  children
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-xs font-medium text-navy-900">
        {label}
        {required ? <span className="ml-0.5 text-coral">*</span> : null}
        {hint ? <span className="ml-2 text-[10px] text-gray-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
    >
      {pending ? '上傳中…' : '新增證照'}
    </button>
  );
}

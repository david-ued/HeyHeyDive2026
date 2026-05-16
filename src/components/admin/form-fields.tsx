import type {ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes} from 'react';

const INPUT_CLS =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-en text-sm text-navy-900 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral';

export function FieldLabel({
  label,
  hint,
  required,
  children
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-navy-900">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${INPUT_CLS} ${props.className ?? ''}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${INPUT_CLS} min-h-[100px] ${props.className ?? ''}`}
    />
  );
}

export function Select({
  options,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{value: string; label: string}>;
}) {
  return (
    <select {...rest} className={`${INPUT_CLS} ${rest.className ?? ''}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function FormError({error}: {error?: string | null}) {
  if (!error) return null;
  return (
    <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
      {error}
    </p>
  );
}

export function MissingTableNotice() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <p className="font-medium">資料表尚未建立</p>
      <p className="mt-1">
        請執行 <code className="rounded bg-white px-1.5 py-0.5">pnpm db:migrate</code>
        ，或將 <code className="rounded bg-white px-1.5 py-0.5">
          supabase/migrations/0001_init_cms.sql
        </code> 貼到 Supabase Dashboard 的 SQL Editor 後按 Run。
      </p>
    </div>
  );
}

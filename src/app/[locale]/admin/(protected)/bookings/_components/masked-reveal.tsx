'use client';

import {useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';

function mask(value: string): string {
  if (value.length <= 4) return '••••';
  return value.slice(0, 1) + '•'.repeat(Math.max(3, value.length - 4)) + value.slice(-3);
}

export function MaskedReveal({value, label}: {value: string; label?: string}) {
  const [shown, setShown] = useState(false);
  return (
    <span className="inline-flex items-center gap-1.5 font-en text-xs">
      <span className="tracking-wider">{shown ? value : mask(value)}</span>
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        className="inline-flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-navy-900"
        aria-label={label ?? (shown ? '隱藏' : '顯示全號')}
      >
        {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}

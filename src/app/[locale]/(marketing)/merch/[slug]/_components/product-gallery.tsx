'use client';

import {useState} from 'react';
import {ShoppingBag} from 'lucide-react';

export function ProductGallery({
  images,
  name,
  soldOut = false
}: {
  images: string[];
  name: string;
  soldOut?: boolean;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="matte matte-soft aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-navy-900 to-coral/40">
        <div className="flex h-full items-center justify-center text-white">
          <ShoppingBag className="h-12 w-12 opacity-60" />
        </div>
      </div>
    );
  }

  const main = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main}
          alt={name}
          className={`h-full w-full object-cover transition ${
            soldOut ? 'grayscale opacity-80' : ''
          }`}
        />
        {soldOut ? (
          <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            售完
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <li key={src + i}>
              <button
                type="button"
                aria-label={`查看第 ${i + 1} 張`}
                onClick={() => setActive(i)}
                className={`block aspect-square w-full overflow-hidden rounded-md border-2 transition ${
                  i === active
                    ? 'border-coral'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${name} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

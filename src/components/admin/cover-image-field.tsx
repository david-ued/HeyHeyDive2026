'use client';

import {useState, useRef, useEffect} from 'react';
import {Upload, X} from 'lucide-react';

/**
 * Cover image picker:
 *  – file input that shows a live blob-URL preview before submit
 *  – URL fallback input (paste a remote URL instead of uploading)
 *  – falls back to the currently-saved image when neither is set
 */
export function CoverImageField({
  fileName = 'cover_image_file',
  urlName = 'cover_image',
  defaultUrl
}: {
  fileName?: string;
  urlName?: string;
  defaultUrl?: string | null;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlValue, setUrlValue] = useState<string>(defaultUrl ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setPreviewUrl(null);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function clearFile() {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  const shownImage = previewUrl ?? (urlValue || null);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-navy-900">封面圖片</p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex flex-1 flex-col gap-2.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-navy-900">上傳檔案</span>
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800">
                <Upload className="h-3.5 w-3.5" />
                選擇圖片
                <input
                  ref={fileInputRef}
                  type="file"
                  name={fileName}
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
              {previewUrl ? (
                <button
                  type="button"
                  onClick={clearFile}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-white"
                >
                  <X className="h-3 w-3" /> 清除
                </button>
              ) : null}
            </div>
            <span className="text-xs text-gray-500">
              JPG / PNG，最大 5MB。送出後會自動覆蓋下方 URL。
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-navy-900">或貼上圖片 URL</span>
            <input
              type="url"
              name={urlName}
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-en text-sm text-navy-900 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
            />
          </label>
        </div>

        <div className="flex w-full flex-col gap-1.5 sm:w-56">
          <span className="text-sm font-medium text-navy-900">
            {previewUrl ? '預覽（尚未儲存）' : '目前圖片'}
          </span>
          {shownImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownImage}
              alt="cover preview"
              className="h-32 w-full rounded-md border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-gray-300 text-xs text-gray-400">
              無圖片
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

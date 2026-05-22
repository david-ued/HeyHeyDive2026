import {notFound} from 'next/navigation';
import Link from 'next/link';
import {ChevronLeft} from 'lucide-react';
import {createAdminClient} from '@/lib/supabase/admin-client';
import {listCertificatesForUser} from '@/lib/cms/certificates';
import type {Booking, Certificate} from '@/lib/cms/types';
import {CertificateUploadForm} from './_components/certificate-upload-form';
import {CertificateList} from './_components/certificate-list';
import {ResetPasswordForm} from './_components/reset-password-form';

export const dynamic = 'force-dynamic';

const BOOKING_STATUS_LABEL: Record<string, string> = {
  pending: '尚未聯絡',
  contacted: '已聯絡',
  confirmed: '已確認',
  cancelled: '已取消'
};

export default async function AdminUserDetail({
  params
}: {
  params: Promise<{locale: string; id: string}>;
}) {
  const {locale, id} = await params;
  const admin = createAdminClient();
  const {data: userResp, error: userErr} = await admin.auth.admin.getUserById(id);
  if (userErr || !userResp.user) notFound();
  const user = userResp.user;

  const email = (user.email ?? '').toLowerCase();
  const [linkedRes, emailRes, certificates] = await Promise.all([
    admin
      .from('bookings')
      .select('*')
      .eq('user_id', id)
      .order('created_at', {ascending: false}),
    email
      ? admin
          .from('bookings')
          .select('*')
          .ilike('contact_email', email)
          .is('user_id', null)
          .order('created_at', {ascending: false})
      : Promise.resolve({data: [] as Booking[]}),
    listCertificatesForUser(id)
  ]);
  const seen = new Set<string>();
  const bookings: Booking[] = [];
  for (const row of [...((linkedRes.data ?? []) as Booking[]), ...((emailRes.data ?? []) as Booking[])]) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      bookings.push(row);
    }
  }

  // Pre-sign cert images for the admin preview.
  const signed = new Map<string, string>();
  await Promise.all(
    certificates
      .filter((c) => !!c.image_path)
      .map(async (c) => {
        const {data} = await admin.storage
          .from('certificates')
          .createSignedUrl(c.image_path!, 60 * 10);
        if (data?.signedUrl) signed.set(c.id, data.signedUrl);
      })
  );

  const displayName =
    (user.user_metadata?.display_name as string | undefined)?.trim() ||
    user.email ||
    '(未命名)';
  const isAdmin = user.app_metadata?.role === 'admin';

  return (
    <div className="flex flex-col gap-8">
      <Link
        href={`/${locale}/admin/users`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900"
      >
        <ChevronLeft className="h-4 w-4" /> 回到會員列表
      </Link>

      <header className="flex flex-col gap-1">
        <p className="font-en text-xs font-semibold tracking-[0.2em] text-coral">
          MEMBER #{user.id.slice(0, 8)}
        </p>
        <h1 className="font-heading text-2xl font-bold text-navy-900">{displayName}</h1>
        <p className="font-en text-sm text-gray-500">{user.email}</p>
        {isAdmin ? (
          <span className="mt-1 inline-flex w-fit items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            管理員
          </span>
        ) : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 font-heading text-lg font-semibold text-navy-900">
            報名紀錄（{bookings.length}）
          </h2>
          {bookings.length === 0 ? (
            <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              此會員尚無任何報名紀錄。
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-100">
              {bookings.map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <div className="flex flex-col">
                    <Link
                      href={`/${locale}/admin/bookings/${b.id}`}
                      className="text-navy-900 hover:text-coral"
                    >
                      {b.item_title_snapshot}
                    </Link>
                    <span className="font-en text-[11px] text-gray-500">
                      {b.item_type === 'trip' ? 'TRIP' : 'COURSE'} · {b.item_slug} ·{' '}
                      {new Date(b.created_at).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {BOOKING_STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <ResetPasswordForm userId={user.id} email={user.email ?? ''} />
          <div className="rounded-lg border border-gray-200 bg-white p-5 text-xs text-gray-500">
            <p className="mb-1 font-medium text-navy-900">會員資料</p>
            <p>建立時間：{new Date(user.created_at).toLocaleString('zh-TW')}</p>
            <p>
              最後登入：
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString('zh-TW')
                : '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-navy-900">
          證照管理（{certificates.length}）
        </h2>
        <CertificateList
          certificates={certificates as Certificate[]}
          signedUrls={Object.fromEntries(signed)}
          locale={locale}
        />
        <div className="mt-6 border-t border-gray-100 pt-6">
          <h3 className="mb-3 font-heading text-sm font-semibold text-navy-900">
            上傳新證照
          </h3>
          <CertificateUploadForm userId={user.id} locale={locale} />
        </div>
      </section>
    </div>
  );
}

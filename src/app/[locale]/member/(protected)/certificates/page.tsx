import {Award, MessageCircle} from 'lucide-react';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin-client';
import {getCurrentUser} from '@/lib/supabase/auth';
import type {Certificate} from '@/lib/cms/types';
import {CertificateGrid, type DisplayCertificate} from './_components/certificate-grid';

export const dynamic = 'force-dynamic';

export default async function MemberCertificatesPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const {data} = await supabase
    .from('certificates')
    .select('*')
    .order('created_at', {ascending: false});

  const certificates = (data ?? []) as Certificate[];

  const admin = createAdminClient();
  const items: DisplayCertificate[] = await Promise.all(
    certificates.map(async (c) => {
      let image_url: string | null = null;
      if (c.image_path) {
        const {data: sign} = await admin.storage
          .from('certificates')
          .createSignedUrl(c.image_path, 60 * 10);
        image_url = sign?.signedUrl ?? null;
      }
      return {
        id: c.id,
        system: c.system,
        level: c.level,
        cert_number: c.cert_number,
        issued_date: c.issued_date,
        notes: c.notes,
        image_url
      };
    })
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="font-en text-xs font-bold tracking-[0.2em] text-coral">
          CERTIFICATES
        </p>
        <h1 className="font-heading text-3xl font-bold text-navy-900">我的證照</h1>
        <p className="text-sm text-gray-600">
          HeyHeyDive 為你上傳的 AIDA / PADI 證照。只有你本人登入後能看到。
        </p>
      </header>

      {items.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gradient-to-br from-white via-white to-coral/5 p-10 text-center">
          <span className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-coral/10">
            <Award className="h-8 w-8 text-coral" />
          </span>
          <p className="mt-4 font-heading text-lg font-semibold text-navy-900">
            還沒有任何證照記錄
          </p>
          <p className="mt-1 text-sm text-gray-500">
            完成課程後，工作人員會把你的 AIDA / PADI 證照上傳到這裡。
            <br className="hidden sm:block" />
            如果你已經拿到證照但這裡看不到，可以 LINE 我們補上。
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs">
            <a
              href="https://line.me/R/ti/p/@heydive"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-2 font-semibold text-white hover:brightness-110"
            >
              <MessageCircle className="h-3.5 w-3.5" /> LINE 提醒上傳
            </a>
            <span className="font-en text-gray-400">登入信箱：{user?.email}</span>
          </div>
        </div>
      ) : (
        <CertificateGrid items={items} />
      )}
    </div>
  );
}

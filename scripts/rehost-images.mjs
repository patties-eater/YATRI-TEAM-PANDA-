// Rehost every cuisine image into Supabase Storage (bucket: dish-images) and
// point each row at the new public URL. Fixes Wikimedia's hotlink rate-limiting
// (429 / "some images not showing").
//
// Run (PowerShell):
//   $env:SUPABASE_SERVICE_KEY="<your service_role key>"; node scripts/rehost-images.mjs
// Run (bash):
//   SUPABASE_SERVICE_KEY="<your service_role key>" node scripts/rehost-images.mjs
//
// Get the service_role key: Supabase dashboard → Project Settings → API →
// "service_role" secret. Keep it private — do NOT put it in the app/.env.

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);

const url = env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
if (!serviceKey) {
  console.error('❌ Set SUPABASE_SERVICE_KEY (service_role key) before running.');
  process.exit(1);
}

const BUCKET = 'dish-images';
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ensureBucket() {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error && !/already exists/i.test(error.message)) throw error;
}

async function download(src, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(src, {
      headers: { 'User-Agent': 'YatriApp/1.0 (food discovery app; contact@yatri.app)' },
    });
    if (res.ok) {
      const ct = res.headers.get('content-type') || 'image/jpeg';
      return { buf: Buffer.from(await res.arrayBuffer()), ct };
    }
    if (res.status === 429) { await sleep(1500 * (i + 1)); continue; } // back off
    throw new Error(`HTTP ${res.status}`);
  }
  throw new Error('rate-limited after retries');
}

const main = async () => {
  await ensureBucket();
  const { data: rows, error } = await supabase
    .from('cuisines')
    .select('id,name,image')
    .order('sort_order');
  if (error) throw error;

  for (const row of rows) {
    // Already rehosted? skip.
    if (row.image.includes('/storage/v1/object/public/' + BUCKET)) {
      console.log(`• ${row.name} — already rehosted, skip`);
      continue;
    }
    try {
      const { buf, ct } = await download(row.image);
      const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : 'jpg';
      const path = `${row.id}.${ext}`;
      const up = await supabase.storage.from(BUCKET).upload(path, buf, {
        contentType: ct,
        upsert: true,
      });
      if (up.error) throw up.error;
      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const u = await supabase.from('cuisines').update({ image: publicUrl }).eq('id', row.id);
      if (u.error) throw u.error;
      console.log(`✅ ${row.name} → ${publicUrl}`);
    } catch (e) {
      console.error(`❌ ${row.name}: ${e.message}`);
    }
    await sleep(400); // be polite to the source
  }
  console.log('\nDone. Reload the app — images now load from Supabase Storage.');
};

main().catch(e => { console.error(e); process.exit(1); });

// Quick check that the Supabase data + embedded relation work.
// Run:  node scripts/test-supabase.mjs
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_KEY;

const res = await fetch(
  `${url}/rest/v1/cuisines?select=id,name,category,diet,cuisine_locations(id,area)&order=sort_order`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
);

const body = await res.json();

if (!res.ok) {
  console.error(`❌ HTTP ${res.status}:`, body.message ?? body);
  console.error('   → Did you run supabase/schema.sql in the SQL Editor?');
  process.exit(1);
}

console.log(`✅ Fetched ${body.length} dishes from Supabase`);
for (const c of body.slice(0, 5)) {
  console.log(
    `   • ${c.name} (${c.category}, ${c.diet}) — ${c.cuisine_locations.length} spots`,
  );
}
if (body.length > 5) console.log(`   … and ${body.length - 5} more`);
const totalSpots = body.reduce((n, c) => n + c.cuisine_locations.length, 0);
console.log(`   Total locations: ${totalSpots}`);

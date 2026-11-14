// `next build` (output: "export") sonrası, Cloudflare'e yüklemeden önce çalışır.
//
// Cloudflare ücretsiz plan bir sürümde en fazla 20.000 dosya kabul ediyor.
// Statik dışa aktarım ~8.700 HTML'e ek olarak ~52.000 `.txt` (React Server
// Components gezinme verisi: sayfa ve segment önbellek dosyaları) üretiyor.
// Bunlar silinince site aynen çalışır: Next.js istemci tarafı geçişte RSC
// verisini alamazsa sayfayı normal (tam) yüklemeyle açar.
// public/ altından gelen gerçek .txt dosyaları (robots.txt, ads.txt) korunur.
import { readdirSync, rmSync, statSync, rmdirSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "out";
const LIMIT = 19000; // Cloudflare sınırı 20.000; pay bırak.
// robots.txt src/app/robots.ts'ten üretiliyor, public/'te değil.
const keep = new Set(["robots.txt", ...readdirSync("public").filter((f) => f.endsWith(".txt"))]);

let removed = 0;
let files = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      walk(p);
      if (readdirSync(p).length === 0) rmdirSync(p);
      continue;
    }
    const rel = relative(OUT, p).replaceAll("\\", "/");
    if (name.endsWith(".txt") && !keep.has(rel)) {
      rmSync(p);
      removed++;
    } else {
      files++;
    }
  }
}

walk(OUT);
console.log(`cloudflare-postbuild: ${removed} RSC .txt dosyası silindi, ${files} dosya kaldı.`);
if (files > LIMIT) {
  console.error(`HATA: ${files} dosya > ${LIMIT}. Cloudflare ücretsiz plan sınırı (20.000) aşılır.`);
  process.exit(1);
}

// Erstellt Screenshots der laufenden Website für das Änderungsprotokoll.
// Aufruf: node scripts/screenshots.mjs <zielordner> [pfad ...]
// Basis-URL über BASE_URL (Standard: http://localhost:4321).
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

// Playwright wird per require geladen, damit auch eine global installierte Version gefunden wird
// (lokal ggf. vorher: npm install --no-save playwright && npx playwright install chromium webkit).
const { chromium, webkit, devices } = createRequire(import.meta.url)('playwright');

const [outDir, ...paths] = process.argv.slice(2);
if (!outDir) {
  console.error('Aufruf: node scripts/screenshots.mjs <zielordner> [pfad ...]');
  process.exit(1);
}
const pages = paths.length ? paths : ['/'];
const baseUrl = (process.env.BASE_URL || 'http://localhost:4321').replace(/\/$/, '');

const views = [
  { name: 'iphone17', context: devices['iPhone 17'] },
  { name: 'laptop', context: { viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 } },
];

const slug = (p) => p.replace(/^\/|\/$/g, '').replace(/\.html$/, '').replace(/[^\w-]+/g, '-') || 'start';

// iPhone möglichst mit WebKit (Safari-Engine), sonst Chromium-Emulation.
async function launch(engine) {
  try { return await engine.launch(); } catch { return null; }
}
const chrome = await chromium.launch();
const safari = await launch(webkit);

await mkdir(outDir, { recursive: true });
for (const view of views) {
  const browser = view.name === 'iphone17' && safari ? safari : chrome;
  const context = await browser.newContext({ ...view.context, locale: 'de-DE' });
  const page = await context.newPage();
  for (const p of pages) {
    const base = join(outDir, `${slug(p)}-${view.name}`);
    // 1) Erster Bildschirm direkt nach dem Laden – so, wie Besucher die Seite zuerst sehen.
    await page.goto(baseUrl + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${base}-ansicht.jpg`, type: 'jpeg', quality: 85 });
    // 2) Ganze Seite: einmal durchscrollen, damit Scroll-Animationen und Lazy-Loading
    //    ausgelöst werden. Als JPEG, damit die Dateien klein bleiben.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${base}-ganzeseite.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
    console.log(`✓ ${p} (${view.name}${browser === safari ? ', WebKit' : ''})`);
  }
  await context.close();
}
await chrome.close();
if (safari) await safari.close();

// فحص في متصفح حقيقي (Chromium عبر Playwright): الصفحة تفتح بدون أخطاء، الشعار مرة وحدة،
// اللمس يحرك ذيبان، الأزرار تشتغل، ولقطات شاشة بمقاس آيفون بالعرض.
// التشغيل: node tests/smoke.js   (يحتاج playwright)
'use strict';
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = process.env.SHOTS || path.join(ROOT, 'build');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

function serve() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
    }).listen(0, () => res(s));
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve(), url = `http://localhost:${srv.address().port}/`;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const iphone = devices['iPhone 13 landscape'] || { viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
  const page = await browser.newPage(Object.assign({}, iphone, { deviceScaleFactor: 2 }));
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('requestfailed', r => errors.push('request failed: ' + r.url()));

  const fail = msg => { console.error('FAIL: ' + msg); process.exitCode = 1; };
  const ok = msg => console.log('ok - ' + msg);

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'shot-1-logo.png') });
  const logos = await page.locator('img[src*="aboden"]').count();
  logos === 1 ? ok('الشعار المعتمد يظهر مرة وحدة') : fail('عدد الشعارات ' + logos);
  await page.waitForTimeout(2600);
  await page.screenshot({ path: path.join(OUT, 'shot-2-title.png') });

  await page.tap('#startBtn');
  await page.waitForTimeout(2600);
  await page.screenshot({ path: path.join(OUT, 'shot-2b-intro.png') });
  const intro = await page.evaluate(() => document.body.classList.contains('intro'));
  intro ? ok('اللقطة الافتتاحية تشتغل') : fail('ما فيه لقطة افتتاحية');
  await page.tap('#skip');
  await page.waitForTimeout(400);
  const introOff = await page.evaluate(() => !document.body.classList.contains('intro'));
  introOff ? ok('اللمس يتخطى اللقطة') : fail('ما تخطى اللقطة');
  const hidden = await page.evaluate(() => document.getElementById('title').hidden);
  hidden ? ok('زر ابدأ يدخل اللعبة') : fail('شاشة البداية ما اختفت');
  const logoVisible = await page.evaluate(() => { const i = document.querySelector('img[src*="aboden"]'); return !!(i && i.offsetParent && getComputedStyle(i).visibility !== 'hidden'); });
  !logoVisible ? ok('الشعار ما يظهر داخل اللعب') : fail('الشعار ظاهر داخل اللعب');

  // لمس العصا: نسحب لفوق (شمال) شوي = مشي
  const z0 = await page.evaluate(() => __theeban.S.player.z);
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  await touch('touchStart', 120, 300);
  for (let i = 1; i <= 6; i++) { await touch('touchMove', 120, 300 - i * 6); await page.waitForTimeout(16); }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'shot-3-walk.png') });
  await touch('touchEnd');
  const z1 = await page.evaluate(() => __theeban.S.player.z);
  z1 < z0 - 1 ? ok(`العصا تحرك ذيبان (${z0.toFixed(1)} ← ${z1.toFixed(1)})`) : fail(`ذيبان ما تحرك: ${z0} ${z1}`);

  await page.tap('#stance');
  const st = await page.evaluate(() => __theeban.S.player.stance);
  st === 'crouch' ? ok('زر الوضعية: منحني') : fail('الوضعية ' + st);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'shot-4-crouch.png') });

  // التخدير: نوقف ورا الحارس الثقيل (واقف في البوابة يطالع جنوب)
  await page.evaluate(() => { const S = __theeban.S; S.player.stance = 'crouch'; const g = S.guards[1]; g.state = 'calm'; g.meter = 0; g.dir = 0; g.home = 0; S.player.x = g.x; S.player.z = g.z - 1.1; S.player.dir = 0; });
  await page.waitForFunction(() => document.getElementById('act').dataset.m === 'subdue', null, { timeout: 8000 }).catch(() => {});
  const subMode = await page.evaluate(() => document.getElementById('act').dataset.m);
  subMode === 'subdue' ? ok('زر التخدير يطلع ورا الحارس') : fail('زر التخدير ما طلع: ' + subMode);
  await page.tap('#act');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'shot-4b-subdue.png') });
  await page.waitForFunction(() => __theeban.S.guards[1].state === 'out', null, { timeout: 15000 }).catch(() => {});
  const outSt = await page.evaluate(() => __theeban.S.guards[1].state);
  outSt === 'out' ? ok('الحارس انخدّر ونام') : fail('حالة الحارس ' + outSt);
  await page.screenshot({ path: path.join(OUT, 'shot-4c-asleep.png') });

  // الكشاف الضوئي: نوقف ذيبان في بقعة ضوء البرج
  await page.evaluate(() => { const S = __theeban.S, l = S.L.searchlights[0]; const [x, z] = __theeban.TH.lightPos(S, l); S.player.stance = 'stand'; S.player.x = x; S.player.z = z; });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, 'shot-4d-searchlight.png') });
  await page.waitForFunction(() => __theeban.TH.alertLevel(__theeban.S).level === 2, null, { timeout: 15000 }).catch(() => {});
  const spotted = await page.evaluate(() => __theeban.TH.alertLevel(__theeban.S).level);
  spotted === 2 ? ok('الكشاف الضوئي ينذر الحراس') : fail('الكشاف الضوئي ما أنذر: ' + spotted);
  await page.screenshot({ path: path.join(OUT, 'shot-4e-alarm.png') });
  // إطفاء الإنذار من اللوحة (نبعد الحراس عشان ما يمسكونه)
  await page.evaluate(() => { const S = __theeban.S; S.guards.forEach(g => { g.state = 'out'; g.outT = 999; }); const p = S.L.panels[0]; S.player.x = p.x; S.player.z = p.z; S.L.searchlights.forEach(l => { l.ax = 0; l.az = 0; l.cx = 60; }); });
  await page.waitForFunction(() => document.getElementById('act').dataset.m === 'panel', null, { timeout: 8000 }).catch(() => {});
  const pm = await page.evaluate(() => document.getElementById('act').dataset.m);
  pm === 'panel' ? ok('زر "أطفئ" يطلع عند لوحة الإنذار') : fail('زر الإنذار: ' + pm);
  await page.screenshot({ path: path.join(OUT, 'shot-4f-panel.png') });
  await page.tap('#act');
  await page.waitForFunction(() => !__theeban.S.alarm.on, null, { timeout: 15000 }).catch(() => {});
  (await page.evaluate(() => !__theeban.S.alarm.on)) ? ok('الإنذار انطفى من اللوحة') : fail('الإنذار ما انطفى');

  // قطع الكهربا من المولد
  await page.evaluate(() => { const S = __theeban.S, G = S.L.generator; S.player.x = G.x; S.player.z = G.z; });
  await page.waitForFunction(() => document.getElementById('act').dataset.m === 'gen', null, { timeout: 8000 }).catch(() => {});
  await page.tap('#act');
  await page.waitForFunction(() => __theeban.S.power.off, null, { timeout: 15000 }).catch(() => {});
  (await page.evaluate(() => __theeban.S.power.off)) ? ok('المولد: الكهربا انقطعت') : fail('الكهربا ما انقطعت');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'shot-4g-poweroff.png') });

  await page.evaluate(() => { const S = __theeban.S; S.L.searchlights.forEach(l => { l.speed = 0; l.cx = 60; }); __theeban.TH.resetToCheckpoint(S); });
  await page.waitForTimeout(500);

  // نوديه قدام الكشاف عشان نشوف الإنذار والمخروط الأحمر
  await page.evaluate(() => { const S = __theeban.S; S.player.stance = 'stand'; const g = S.guards[0]; g.x = 0; g.z = 7; g.dir = 0; g.waitT = 5; S.player.x = 0; S.player.z = 12; });
  await page.waitForFunction(() => __theeban.TH.alertLevel(__theeban.S).level >= 1, null, { timeout: 15000 }).catch(() => {});
  const lvl = await page.evaluate(() => __theeban.TH.alertLevel(__theeban.S).level);
  lvl >= 1 ? ok('الحارس انتبه (المستوى ' + lvl + ')') : fail('الحارس ما انتبه');
  await page.screenshot({ path: path.join(OUT, 'shot-5-alert.png') });

  // عند الهدف: زر التفاعل يشتغل ويطلع شاشة القصة
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const S = __theeban.S; S.guards = []; S.status = 'play'; S.player.x = S.L.objective.x; S.player.z = S.L.objective.z + 1.2; });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'shot-6-objective.png') });
  const enabled = await page.evaluate(() => !document.getElementById('act').disabled);
  enabled ? ok('زر التفاعل يتفعل عند التسجيل') : fail('زر التفاعل مقفول عند الهدف');
  await page.tap('#act');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'shot-6b-playing.png') });
  await page.waitForFunction(() => !document.getElementById('won').hidden, null, { timeout: 40000 }).catch(() => {});
  await page.waitForTimeout(4000);
  const won = await page.evaluate(() => !document.getElementById('won').hidden);
  won ? ok('شاشة نهاية المهمة ظهرت') : fail('شاشة النهاية ما ظهرت');
  await page.screenshot({ path: path.join(OUT, 'shot-7-ending.png') });

  // وضع الجوال طولي: رسالة لف الجوال
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const rot = await page.evaluate(() => getComputedStyle(document.getElementById('rotate')).display !== 'none');
  rot ? ok('رسالة "لف الجوال" بالطولي') : fail('رسالة لف الجوال ما ظهرت');

  errors.length ? fail('أخطاء في الصفحة:\n' + errors.join('\n')) : ok('بدون أخطاء في الصفحة');
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });

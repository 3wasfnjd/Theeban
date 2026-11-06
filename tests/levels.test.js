// اختبارات المهمات 2–5: كل مهمة قابلة للعب (الأهداف ونقاط الحفظ والأغراض يوصل لها، دوريات الحراس سليمة،
// نقاط الحفظ آمنة، البداية آمنة، وسلسلة الأهداف توصل للفوز)
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const T = require('../js/logic.js');
const LEVELS = { 2: require('../js/level2.js'), 3: require('../js/level3.js'), 4: require('../js/level4.js'), 5: require('../js/level5.js') };
const DT = 1 / 60;
function run(S, seconds, input) { for (let t = 0; t < seconds; t += DT) T.update(S, input || {}, DT); }
const clone = o => JSON.parse(JSON.stringify(o));

function routeSamples(L) {
  const out = [];
  for (const g of L.guards) {
    const r = g.route, range = T.GUARD_TYPES[g.type].range;
    if (r.length === 1) { out.push([r[0][0], r[0][1], range]); continue; }
    const segs = r.length === 2 ? 1 : r.length;
    for (let i = 0; i < segs; i++) { const a = r[i], b = r[(i + 1) % r.length], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])); for (let k = 0; k <= n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n, range]); }
  }
  return out;
}

for (const n of Object.keys(LEVELS)) {
  const D = LEVELS[n];
  test(`المهمة ${n}: البداية والأهداف والأغراض ونقاط الحفظ يوصل لها`, () => {
    const L = T.makeLevel(clone(D));
    const pts = [...L.objectives, ...L.checkpoints, ...(L.gasPickups || []), ...(L.hideSpots || []), ...(L.panels || []), ...(L.generator ? [L.generator] : [])];
    for (const p of pts) assert.ok(T.playerReachable(L, L.start, p), `ما يوصل لـ ${JSON.stringify(p)}`);
  });

  test(`المهمة ${n}: دوريات الحراس يقدرون يمشونها`, () => {
    const L = T.makeLevel(clone(D));
    for (const g of L.guards) {
      for (let i = 0; i < g.route.length; i++) {
        const a = g.route[i], b = g.route[(i + 1) % g.route.length];
        const c = T.findPath(L, a[0], a[1], b[0], b[1]);
        assert.ok(c, `دورية ${g.type} من ${a} إلى ${b}`);
      }
      const S = T.newGame(L), G = S.guards[L.guards.indexOf(g)]; S.player.x = 999;
      assert.ok(T.findPath(L, G.x, G.z, g.route[0][0], g.route[0][1]));
    }
  });

  test(`المهمة ${n}: نقاط الحفظ بعيدة عن الدوريات والكشافات والكاميرات`, () => {
    const L = T.makeLevel(clone(D));
    const samples = routeSamples(L);
    for (const c of L.checkpoints) {
      for (const [x, z, range] of samples) {
        const d = Math.hypot(c.x - x, c.z - z), hidden = T.blocked(L.allObstacles, x, z, T.EYE, c.x, c.z, 1.5);
        assert.ok(d >= 6 || hidden, `نقطة (${c.x},${c.z}) قريبة ومكشوفة لدورية (${x.toFixed(1)},${z.toFixed(1)})`);
        if (d < range) assert.ok(hidden, `نقطة (${c.x},${c.z}) تنشاف من (${x.toFixed(1)},${z.toFixed(1)})`);
      }
      for (const l of L.searchlights || []) {
        const inSweep = Math.abs(c.x - l.cx) < l.ax + l.r + c.r && Math.abs(c.z - l.cz) < l.az + l.r + c.r;
        assert.ok(!inSweep || T.blocked(L.allObstacles, l.sx, l.sz, l.sh, c.x, c.z, 1.5), `نقطة (${c.x},${c.z}) في مسح كشاف`);
      }
      for (const cam of L.cameras || []) {
        const d = Math.hypot(c.x - cam.x, c.z - cam.z);
        assert.ok(d > cam.range + c.r || T.blocked(L.allObstacles, cam.x, cam.z, cam.h, c.x, c.z, 1.5), `نقطة (${c.x},${c.z}) تشوفها كاميرا (${cam.x},${cam.z})`);
      }
    }
  });

  test(`المهمة ${n}: البداية آمنة — ذيبان واقف 4 ثواني وما أحد ينذر`, () => {
    const L = T.makeLevel(clone(D)); const S = T.newGame(L);
    run(S, 4);
    assert.strictEqual(S.status, 'play');
    assert.ok(!S.alarm.on, 'إنذار من البداية');
    assert.ok(S.guards.every(g => g.state !== 'alert'));
  });

  test(`المهمة ${n}: سلسلة الأهداف توصل للفوز`, () => {
    const L = T.makeLevel(clone(D)); const S = T.newGame(L); S.guards = [];
    for (let i = 0; i < L.objectives.length; i++) {
      const o = T.curObjective(S); assert.ok(o);
      S.player.x = o.x; S.player.z = o.z; S.player.stance = 'stand';
      if (o.kind === 'use') { const a = T.action(S); assert.ok(a && a.kind === 'use', `زر الهدف ${i}: ${JSON.stringify(a)}`); T.doAction(S); run(S, o.need + 0.2); }
      else run(S, 0.1);
    }
    assert.strictEqual(S.status, 'won');
  });

  test(`المهمة ${n}: دقيقتين لعب عشوائي بدون أخطاء`, () => {
    const L = T.makeLevel(clone(D)); const S = T.newGame(L);
    let seed = 7 + +n; const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    let inp = {};
    for (let t = 0; t < 120; t += DT) {
      if (r() < 0.02) inp = { x: r() * 2 - 1, z: r() * 2 - 1, run: r() < 0.3 };
      if (r() < 0.004) T.cycleStance(S);
      if (r() < 0.003) T.useTool(S);
      if (r() < 0.003) T.cycleTool(S);
      if (r() < 0.005) T.doAction(S);
      T.update(S, inp, DT);
      if (S.status === 'won') break;
    }
    assert.ok(Number.isFinite(S.player.x) && Number.isFinite(S.player.z));
  });
}

test('الأنفاق: الجدار يصد، والمجرى للزاحف بس', () => {
  const L = T.makeLevel(clone(LEVELS[2]));
  const duct = L.allObstacles.find(o => o.kind === 'duct');
  assert.ok(duct);
  const S = T.newGame(L); S.guards = [];
  S.player.x = duct.x; S.player.z = duct.z; S.player.stance = 'crawl'; run(S, 0.05);
  assert.ok(Math.hypot(S.player.x - duct.x, S.player.z - duct.z) < 0.01, 'الزاحف يقدر يكون داخل المجرى');
  assert.strictEqual(T.setStance(S, 'stand'), false, 'ما يوقف داخل المجرى');
});

test('الكاميرات: تشوفه وتنذر، والعازل يطفيها، والهدف يطفيها نهائياً', () => {
  const L = T.makeLevel({ size: { w: 30, d: 30 }, start: { x: 0, z: 6 }, checkpoints: [], radio: [], obstacles: [], guards: [{ type: 'tech', route: [[12, 12]], dir: 0, look: 0 }],
    cameras: [{ x: 0, z: 0, h: 3, dir: 0, amp: 0, fov: 60, range: 9 }], tools: { azil: 1 },
    objectives: [{ kind: 'use', x: -10, z: -10, r: 1.2, need: 0.5, camsOff: true, label: 'x' }, { kind: 'exit', x: 10, z: -10, label: 'y' }] });
  let S = T.newGame(L);
  run(S, 1.2);
  assert.ok(S.alarm.on, 'الكاميرا أنذرت');
  S = T.newGame(L); S.player.tool = 'azil'; S.player.dir = Math.PI;
  assert.ok(T.useTool(S)); assert.strictEqual(S.player.azil, 0);
  run(S, 3); assert.ok(!S.alarm.on, 'معطلة');
  S.player.x = -10; S.player.z = -10; T.doAction(S); run(S, 0.7);
  assert.ok(S.camsDead);
  S.player.x = 0; S.player.z = 6; run(S, 30); assert.ok(!S.alarm.on, 'طفت نهائياً');
});

test('النبّاه: يطيح جنب الحارس ويخليه يتحقق', () => {
  const L = T.makeLevel({ size: { w: 30, d: 30 }, start: { x: 0, z: 8 }, checkpoints: [], radio: [], obstacles: [], tools: { nabbah: 1 },
    guards: [{ type: 'tech', route: [[0, 0]], dir: Math.PI, look: 0 }] });
  const S = T.newGame(L); S.player.tool = 'nabbah'; S.player.dir = Math.PI;
  assert.ok(T.useTool(S)); run(S, 1.5);
  assert.strictEqual(S.player.nabbah, 0);
  assert.strictEqual(S.guards[0].state, 'suspicious');
});

test('الزاحف: يمشي ويسحب الحارس وراه', () => {
  const L = T.makeLevel({ size: { w: 30, d: 30 }, start: { x: 0, z: 8 }, checkpoints: [], radio: [], obstacles: [], tools: { zahif: 1 },
    guards: [{ type: 'tech', route: [[0, 0]], dir: Math.PI, look: 0 }] });
  const S = T.newGame(L); S.player.tool = 'zahif'; S.player.dir = Math.PI;
  assert.ok(T.useTool(S)); run(S, 0.1); S.player.x = 13; S.player.z = 13; run(S, 3);
  assert.strictEqual(S.guards[0].state, 'suspicious');
  assert.ok(S.guards[0].target, 'يلحق الصوت');
});

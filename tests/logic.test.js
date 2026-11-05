// اختبارات منطق ذيبان — تشتغل في Node بدون متصفح: node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const T = require('../js/logic.js');
const LEVEL1 = require('../js/level1.js');

const DT = 1 / 60;
function run(S, seconds, input) { for (let t = 0; t < seconds; t += DT) T.update(S, input || {}, DT); }

// مرحلة اختبار صغيرة: حارس واحد واقف يطالع جنوب (z+)
function testLevel(extra) {
  return T.makeLevel(Object.assign({
    size: { w: 30, d: 30 }, start: { x: 0, z: 10 }, objective: { x: 0, z: -12 }, checkpoints: [], radio: [],
    obstacles: [], guards: [{ type: 'scout', route: [[0, 0]], dir: 0, look: 0 }]
  }, extra || {}));
}

test('الحارس ينذر إذا شاف ذيبان واقف قدامه في المكشوف', () => {
  const S = T.newGame(testLevel()); S.player.x = 0; S.player.z = 5;
  run(S, 2.5);
  assert.strictEqual(S.guards[0].state, 'alert');
});

test('الصخرة العالية تخفي ذيبان واقف', () => {
  const S = T.newGame(testLevel({ obstacles: [{ kind: 'rock', x: 0, z: 3, w: 3, d: 1, h: 2.2 }] }));
  S.player.x = 0; S.player.z = 4.2;
  run(S, 3);
  assert.strictEqual(S.guards[0].state, 'calm');
  assert.strictEqual(S.guards[0].meter, 0);
});

test('الصندوق الواطي يخفيه منحني بس، مو واقف', () => {
  const lv = testLevel({ obstacles: [{ kind: 'crate', x: 0, z: 4, w: 1.6, d: 1.6, h: 1.0 }] });
  const A = T.newGame(lv); A.player.x = 0; A.player.z = 5.3; T.setStance(A, 'crouch');
  run(A, 3);
  assert.strictEqual(A.guards[0].state, 'calm', 'منحني ورا الصندوق ما ينشاف');
  const B = T.newGame(lv); B.player.x = 0; B.player.z = 5.3;
  run(B, 3);
  assert.notStrictEqual(B.guards[0].state, 'calm', 'واقف ورا الصندوق ينشاف');
});

test('الحارس ما يشوف اللي وراه', () => {
  const S = T.newGame(testLevel()); S.player.x = 0; S.player.z = -4;
  run(S, 3);
  assert.strictEqual(S.guards[0].state, 'calm');
});

test('الزحف يقلل مدى الرؤية', () => {
  const S = T.newGame(testLevel()); S.player.x = 0; S.player.z = 8; T.setStance(S, 'crawl');
  run(S, 3);
  assert.strictEqual(S.guards[0].state, 'calm', 'على بعد 8 م وهو زاحف ما ينشاف (مدى الكشاف 11 × 0.55)');
});

test('صوت الركض يخلي الحارس يشتبه ويروح يتحقق', () => {
  const S = T.newGame(testLevel()); S.player.x = 0; S.player.z = -4; // وراه
  run(S, 0.5, { x: 1, z: 0, run: true });
  assert.strictEqual(S.guards[0].state, 'suspicious');
  assert.ok(S.guards[0].target);
});

test('إذا انمسك يرجع لنقطة الحفظ والحراس يرجعون لمكانهم', () => {
  const S = T.newGame(testLevel({ checkpoints: [{ x: 0, z: 10, r: 1 }] }));
  run(S, 0.1); // يسجل نقطة الحفظ
  S.player.x = 0; S.player.z = 2;
  for (let t = 0; t < 8 && !S.events.some(e => e.t === 'respawn'); t += DT) T.update(S, {}, DT);
  assert.ok(S.catches >= 1, 'انمسك');
  assert.strictEqual(S.status, 'play');
  assert.ok(Math.abs(S.player.z - 10) < 0.01);
  assert.strictEqual(S.guards[0].state, 'calm');
});

test('ما يقدر يوقف أو ينحني تحت الأنبوب، والزاحف يعبر', () => {
  const lv = testLevel({ guards: [], obstacles: [{ kind: 'pipe', x: 0, z: 0, w: 4, d: 1.2, h: 0.8, y0: 0.6 }] });
  const S = T.newGame(lv); S.player.x = 0; S.player.z = 3;
  run(S, 3, { x: 0, z: -1 });
  assert.ok(S.player.z > 0.9, 'واقف ينصد');
  T.setStance(S, 'crawl');
  run(S, 6, { x: 0, z: -1 });
  assert.ok(S.player.z < -1, 'زاحف يعبر');
  S.player.z = 0;
  assert.strictEqual(T.setStance(S, 'stand'), false, 'ما يوقف تحت الأنبوب');
});

test('الحارس يمشي على مسار الدورية', () => {
  const S = T.newGame(testLevel({ guards: [{ type: 'tech', route: [[-5, -5], [5, -5]], wait: 0 }] }));
  S.player.z = 14;
  let maxX = -99;
  for (let t = 0; t < 6; t += DT) { T.update(S, {}, DT); maxX = Math.max(maxX, S.guards[0].x); }
  assert.ok(maxX > 4.8, 'وصل للنقطة الثانية');
});

test('المهمة الأولى: التسجيل يوصل له بالزحف تحت الأنابيب', () => {
  const L = T.makeLevel(LEVEL1);
  assert.ok(T.playerReachable(L, L.start, L.objective));
  // وبدون الأنابيب (لو كانت مسكّرة) ما فيه طريق إلا البوابة
  const S = T.newGame(L);
  assert.strictEqual(S.guards.length, 3);
});

test('المهمة الأولى: الحراس ما يعبرون تحت الأنابيب', () => {
  const L = T.makeLevel(LEVEL1);
  const p = T.findPath(L, 17, -6, 17, -13);
  assert.ok(p, 'فيه مسار');
  // المسار لازم يمر من البوابة (|x|<2) مو من الأنابيب
  const viaGate = p.some(([x, z]) => Math.abs(x) < 2.5 && Math.abs(z + 10) < 1.5);
  assert.ok(viaGate, 'يمر من البوابة: ' + JSON.stringify(p));
});

test('المهمة الأولى: أخذ التسجيل يفوز', () => {
  const S = T.newGame(T.makeLevel(LEVEL1));
  S.guards = []; S.player.x = 0; S.player.z = -13.2;
  assert.ok(T.canInteract(S));
  assert.ok(T.interact(S));
  assert.strictEqual(S.status, 'won');
});

test('المهمة الأولى: الحراس يشتغلون دقيقتين بدون أخطاء', () => {
  const S = T.newGame(T.makeLevel(LEVEL1));
  S.player.x = -18; S.player.z = 20; // بعيد ومخفي
  run(S, 120);
  for (const g of S.guards) { assert.ok(Number.isFinite(g.x) && Number.isFinite(g.z)); assert.ok(Math.abs(g.x) < 20 && Math.abs(g.z) < 22); }
});

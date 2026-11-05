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

test('الكشاف الضوئي: إذا وقف في البقعة مكشوف ينذر الحراس', () => {
  const lv = testLevel({ guards: [{ type: 'heavy', route: [[-12, -12]], dir: Math.PI }], searchlights: [{ sx: 0, sz: -14, sh: 10, cx: 0, cz: 5, ax: 0, az: 0, r: 2.5, speed: 0 }] });
  const S = T.newGame(lv); S.player.x = 0; S.player.z = 5;
  for (let t = 0; t < 1.5 && !S.events.some(e => e.t === 'spotted'); t += DT) T.update(S, {}, DT);
  assert.ok(S.events.some(e => e.t === 'spotted'));
  assert.strictEqual(S.guards[0].state, 'alert');
});

test('الكشاف الضوئي: الصخرة العالية تحجب الضوء', () => {
  const lv = testLevel({ guards: [], obstacles: [{ kind: 'rock', x: 0, z: 4, w: 3, d: 1, h: 2.2 }], searchlights: [{ sx: 0, sz: -14, sh: 10, cx: 0, cz: 5, ax: 0, az: 0, r: 2.5, speed: 0 }] });
  const S = T.newGame(lv); S.player.x = 0; S.player.z = 5.0;
  run(S, 3);
  assert.strictEqual(S.lights[0].meter, 0);
});

test('المهمة الأولى: الأغراض الجديدة ما تسكّر الطريق، والحراس يمرون من البوابة', () => {
  const L = T.makeLevel(LEVEL1);
  assert.ok(T.playerReachable(L, L.start, L.checkpoints[0]));
  assert.ok(T.playerReachable(L, L.checkpoints[0], L.checkpoints[1]));
  assert.ok(T.playerReachable(L, L.checkpoints[1], L.objective));
  assert.ok(T.findPath(L, 0, -6, 0, -12), 'البوابة مفتوحة للحراس');
});

test('التخدير: من ورا الحارس ينجح، والحارس ينام وبعدين يصحى مشتبه', () => {
  const S = T.newGame(testLevel()); // الحارس عند (0,0) يطالع جنوب
  S.player.x = 0; S.player.z = -1.1; // وراه
  run(S, 0.1);
  assert.ok(T.subdueTarget(S), 'يقدر يخدّره');
  assert.ok(T.startSubdue(S));
  run(S, 1);
  assert.strictEqual(S.guards[0].state, 'out');
  S.player.z = -14;
  run(S, T.OUT_TIME + 1);
  assert.strictEqual(S.guards[0].state, 'suspicious', 'صحى');
});

test('التخدير: ما ينفع من قدام الحارس', () => {
  const S = T.newGame(testLevel()); S.player.x = 0; S.player.z = 1.1;
  run(S, 0.05);
  assert.strictEqual(T.subdueTarget(S), null);
});

test('التخدير: الحارس الثاني إذا شاف زميله طايح يروح يتحقق', () => {
  const S = T.newGame(testLevel({ guards: [{ type: 'scout', route: [[0, 0]], dir: 0, look: 0 }, { type: 'tech', route: [[0, -6]], dir: 0, look: 0 }] }));
  S.player.x = 0; S.player.z = 13;
  S.guards[0].state = 'out'; S.guards[0].outT = 30;
  run(S, 0.5);
  assert.strictEqual(S.guards[1].state, 'suspicious');
  assert.ok(S.events.some(e => e.t === 'body') || S.guards[0].noticed);
});

test('الإنذار: الضوء يشغّله، ولوحة الإنذار تطفيه', () => {
  const lv = testLevel({ guards: [{ type: 'heavy', route: [[-12, -12]], dir: Math.PI }], panels: [{ x: 5, z: 5 }],
    searchlights: [{ sx: 0, sz: -14, sh: 10, cx: 0, cz: 5, ax: 0, az: 0, r: 2.5, speed: 0 }] });
  const S = T.newGame(lv); S.player.x = 0; S.player.z = 5;
  for (let t = 0; t < 2 && !S.alarm.on; t += DT) T.update(S, {}, DT);
  assert.ok(S.alarm.on, 'الإنذار اشتغل');
  assert.strictEqual(T.alertLevel(S).level, 2);
  S.player.x = 5; S.player.z = 5.5; S.lights[0].meter = 0;
  S.guards[0].x = -13; S.guards[0].z = -13; S.guards[0].dir = Math.PI; // بعيد
  const a = T.action(S);
  assert.ok(a && a.kind === 'panel', 'زر إطفاء الإنذار يطلع عند اللوحة');
  T.doAction(S); run(S, 1.2);
  assert.ok(!S.alarm.on, 'الإنذار انطفى');
});

test('المولد: قطع الكهربا يطفي الكشافات والإنذار، وحارس يجي يصلحه', () => {
  const lv = testLevel({ guards: [{ type: 'tech', route: [[-8, 0]], dir: Math.PI }], generator: { x: 6, z: 6 },
    obstacles: [{ kind: 'gen', x: 6, z: 7.1, w: 1.9, d: 1.2, h: 1.3 }],
    searchlights: [{ sx: 0, sz: -14, sh: 10, cx: 6, cz: 4, ax: 0, az: 0, r: 2.5, speed: 0 }] });
  const S = T.newGame(lv); S.player.x = 6; S.player.z = 13; // بعيد عن الضوء
  T.raiseAlarm(S, 0, 0);
  S.player.z = 6;
  run(S, 0.05);
  const a = T.action(S);
  assert.ok(a && a.kind === 'gen');
  T.doAction(S); run(S, 1.4);
  assert.ok(S.power.off, 'الكهربا مقطوعة');
  assert.ok(!S.alarm.on, 'الإنذار طفى مع الكهربا');
  S.player.x = 6; S.player.z = 4; // تحت الكشاف وهو طافي
  run(S, 1);
  assert.strictEqual(S.lights[0].meter, 0, 'الكشاف ما يشوف وهو طافي');
  S.player.x = 13; S.player.z = 13;
  for (let t = 0; t < 30 && S.power.off; t += DT) T.update(S, {}, DT);
  assert.ok(!S.power.off, 'رجعت الكهربا (الحارس صلحها أو خلص الوقت)');
});

test('المهمة الأولى: اللوحات والمولد في أماكن يوصل لها ذيبان', () => {
  const L = T.makeLevel(LEVEL1);
  for (const p of L.panels) assert.ok(T.playerReachable(L, L.start, p), JSON.stringify(p));
  assert.ok(T.playerReachable(L, L.start, L.generator));
  assert.ok(T.playerReachable(L, L.checkpoints[1], L.objective));
  assert.ok(T.findPath(L, 0, -6, 0, -12), 'البوابة مفتوحة للحراس');
});

// ذيبان — المهمة الثالثة: صوت بعيد
// مستودع معدات ومولدات بالليل. المهارة: التشتيت بالنبّاه — ترميه بعيد، الحارس يروح يتحقق، وتعبر.
// الهدف: وحدة التخزين في خزانة الخوادم داخل المستودع، وبعدين الطلوع من الساحة.
(function (root) {
  'use strict';
  const car = (x, z) => ({ id: 'car', x: x + 1.7, z: z - 1.5, face: -Math.PI / 2, seat: { x, z: z - 1.5, y: 0.75, dir: 0 } });
  const LEVEL3 = {
    id: 'm3', n: 3,
    title: 'المهمة الثالثة: صوت بعيد', wonTitle: 'السجلات معك',
    place: 'مستودع معدات روافد · ليلاً',
    env: { kind: 'night' },
    size: { w: 44, d: 40 },
    start: { x: 0, z: 18, dir: Math.PI },
    obstacles: [],
    props: [
      // المستودع: غرفة تخزين كبيرة مقطوعة السقف (الباب في الجدار الأمامي على x = -4)
      { id: 'tb_room', x: 0, z: -11, walls: true, p: { kind: 'storage', width: 16, depth: 12, height: 4.5 } },
      // الرفوف بالطول عشان الكاميرا تشوف بين الممرات
      { id: 'tb_shelving', x: -5, z: -12, rot: Math.PI / 2, col: [4.1, 1.2, 3.1] },
      { id: 'tb_shelving', x: -1.5, z: -12, rot: Math.PI / 2, p: { fill: 0.5 }, col: [4.1, 1.2, 3.1] },
      { id: 'tb_shelving', x: 2, z: -12, rot: Math.PI / 2, p: { fill: 0.8 }, col: [4.1, 1.2, 3.1] },
      { id: 'tb_server_rack', x: 6, z: -16.3, p: { count: 2, open: true, objective: true }, col: [2.05, 1.2, 2.2] },
      { id: 'tb_data_unit', x: 6, z: -15.9, y: 2.22, p: { size: 3 } },
      { id: 'tb_pallet', x: -6.6, z: -6.6, p: { load: 'bags', height: 0.7 }, col: [1.2, 1, 1.1] },
      { id: 'tb_crate', x: 6.5, z: -6.4, p: { stack: 'pair', kind: 'metal', size: 0.7 }, col: [1.4, 1, 1.4] },
      // الساحة
      { id: 'tb_generator', x: 12.5, z: -13, rot: Math.PI, col: [2.6, 3.6, 2.65] },
      { id: 'tb_container', x: -15, z: -12, col: [2.5, 6.2, 2.6] },
      { id: 'tb_container', x: -11.2, z: -12, p: { color: 'tbRed' }, col: [2.5, 6.2, 2.6] },
      { id: 'tb_container', x: 15, z: 1, rot: Math.PI / 2, p: { color: 'tbRawafid' }, col: [2.5, 6.2, 2.6] },
      { id: 'tb_crate', x: -6, z: 2, col: [1.9, 1, 1.9] },
      { id: 'tb_crate', x: 5, z: 0.5, p: { stack: 'pair' }, col: [1.9, 1, 1.9] },
      { id: 'tb_crate', x: 9, z: 12, col: [1.9, 1, 1.9] },
      { id: 'tb_crate', x: -12, z: 9, col: [1.9, 1, 1.9] },
      { id: 'tb_pallet', x: -2, z: 9, p: { load: 'water' }, col: [1.2, 1, 1.1] },
      { id: 'tb_pallet', x: 3, z: 7, col: [1.2, 1, 1.1] },
      { id: 'tb_barrel', x: 11, z: -3, col: [2.3, 1.4, 1.2] },
      { id: 'tb_barrel', x: -18, z: 11, col: [2.3, 1.4, 1.2] },
      { id: 'tb_barrier', x: 0, z: 13.5, col: [4, 0.6, 0.8] },
      { id: 'tb_barrier', x: -9, z: 15, col: [4, 0.6, 0.8] },
      { id: 'tb_car', x: -14, z: 1, p: { kind: 'pickup', color: 'tbSand2', livery: false }, col: [2.1, 5, 2] },
      { id: 'tb_floodlight', x: -20.5, z: -1, rot: -1.2 },
      { id: 'tb_floodlight', x: 19.5, z: 9, rot: 1.6 },
      { id: 'tb_clutter', x: 8, z: 7, p: { item: 'tires' } },
      { id: 'tb_clutter', x: -8, z: -3, p: { item: 'jerrycan' } },
      { id: 'tb_clutter', x: 14, z: -8, p: { item: 'scrap' } },
      { id: 'tb_fence', x: -16, z: -19.4, p: { length: 12 } },
      { id: 'tb_fence', x: 16, z: -19.4, p: { length: 12, style: 'panel' } }
    ],
    hideSpots: [car(-14, 1)],
    generator: { x: 12.5, z: -10.6 },
    searchlights: [
      { sx: -20.5, sz: -1, sh: 8, cx: -4, cz: 4, ax: 9, az: 3, r: 2.6, speed: 0.35, phase: 0.5 },
      { sx: 19.5, sz: 9, sh: 8, cx: 6, cz: 8, ax: 8, az: 3, r: 2.6, speed: 0.4, phase: 2.2 }
    ],
    objectives: [
      { kind: 'use', x: 6, z: -15.1, r: 1.4, need: 2.0, label: 'اسحب وحدة التخزين', btn: 'اسحب', done: 'وحدة التخزين معك' },
      { kind: 'exit', x: 0, z: 18.5, r: 1.8, label: 'اطلع من الساحة' }
    ],
    checkpoints: [{ x: 19.5, z: 16.5, r: 1.4 }, { x: -19, z: -8, r: 1.4 }],
    gasStart: 1,
    tools: { nabbah: 2 },
    gasPickups: [{ x: 8, z: 15, kind: 'nabbah' }, { x: -18, z: 15 }, { x: 18, z: -17, kind: 'nabbah' }],
    guards: [
      { type: 'scout', route: [[-16, 4.5], [16, 4.5]], wait: 1.4, look: 1.0 },
      { type: 'heavy', route: [[-4, -3.2]], dir: 0, look: 0.7 },
      { type: 'tech', route: [[-7, -7.6], [6.8, -7.6], [6.8, -12.3], [-7, -12.3]], wait: 1.0, look: 0.8 },
      { type: 'tech', route: [[-12, -18.8], [12, -18.8]], wait: 1.6, look: 0.9 }
    ],
    radio: [{ x: 0, z: 15, r: 2.5, who: 'نبض', text: 'الوحدة في خزانة الخوادم. لا تمر قدامهم… خلهم يروحون للصوت.' }],
    ending: [
      'نبض: «أوامر الإغلاق… تطلع من السديم نفسه. مو من السراب.»',
      'آخر سجل لعبدالله: «محاولة إيقاف أوامر الإغلاق — فشلت — البروتوكول يتطلب طرفاً ثانياً»',
      'العدو مو بس شخص.'
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = LEVEL3; else (root.LEVELS = root.LEVELS || {})[3] = LEVEL3;
})(typeof globalThis !== 'undefined' ? globalThis : this);

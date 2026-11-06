// ذيبان — المهمة الثانية: تحت الرمال
// أنفاق صيانة تحت المحطة، قبل الفجر. ممرات ضيقة وفنيين يمشون لحالهم — مكان التخدير من ورا.
// الهدف: أثر الأب في غرفة المضخات، وبعدين الرجوع لفتحة الدخول.
(function (root) {
  'use strict';
  const C = (i, j) => ({ x: -20 + 4 * i, z: -18 + 4 * j }); // مركز خلية النفق
  const LEVEL2 = {
    id: 'm2', n: 2,
    title: 'المهمة الثانية: تحت الرمال', wonTitle: 'بطاقة أبوك',
    place: 'أنفاق صيانة روافد · قبل الفجر',
    env: { kind: 'tunnel', vision: 0.9 },
    size: { w: 44, d: 40 },
    start: { x: 4, z: 17.2, dir: Math.PI },
    // # صخر · . نفق · P قاعة المضخات · D مجرى زحف · S فتحة الدخول
    tunnel: {
      cell: 4, ox: -22, oz: -20,
      map: [
        '###########',
        '#PPP...#..#',
        '#PPP#.##.##',
        '##.##.....#',
        '##.#####D##',
        '#....#....#',
        '#.##.#.##.#',
        '#.#..D..#.#',
        '#...##....#',
        '######S####'
      ],
      lights: { '6,9': 'warm', '6,7': 'off', '4,5': 'warm', '1,5': 'teal', '1,8': 'off', '2,3': 'warm', '5,3': 'teal', '9,3': 'off', '9,5': 'warm', '5,1': 'warm', '8,1': 'off' }
    },
    obstacles: [],
    props: [
      { id: 'tb_pump', x: -16, z: -10.5, col: [1.7, 3.8, 2.4] },
      { id: 'tb_pump', x: -8, z: -10.5, p: { running: false, color: 'tbRust' }, col: [1.7, 3.8, 2.4] },
      { id: 'tb_gauge_panel', x: -12, z: -15.5, p: { gauges: 6, state: 'suspect' }, col: [2, 0.45, 2] },
      { id: 'tb_maint_card', x: -11.4, z: -15.25, y: 1.02, p: { size: 4 } },
      { id: 'tb_pipes', x: -12, z: -7.2, rot: Math.PI / 2, p: { length: 3.6, count: 2, clear: 0.7 }, col: [0.6, 3.6, 0.9], y0: 0.6 },
      { id: 'tb_clutter', x: -13, z: 15.2, p: { item: 'reel' } },
      { id: 'tb_clutter', x: 17.2, z: -15, p: { item: 'toolbox' } },
      { id: 'tb_vent', x: 16, z: 2.9, p: { kind: 'grill', size: 0.8 } }
    ],
    objectives: [
      { kind: 'use', x: -12, z: -14.5, r: 1.6, need: 1.2, label: 'دوّر على أثر أبوك', btn: 'خذ', done: 'بطاقة صيانة باسم عبدالله' },
      { kind: 'exit', x: 4, z: 17.2, r: 1.6, label: 'ارجع لفتحة الدخول' }
    ],
    checkpoints: [{ x: -16, z: 14, r: 1.4 }, { x: 16, z: -14, r: 1.4 }],
    gasStart: 2,
    gasPickups: [{ x: -8, z: 14 }, { x: 12, z: -14 }],
    guards: [
      { type: 'tech', route: [[C(1, 5).x, C(1, 5).z], [C(4, 5).x, C(4, 5).z]], wait: 1.4, look: 0.9 },
      { type: 'tech', route: [[C(5, 3).x, C(5, 3).z], [C(9, 3).x, C(9, 3).z]], wait: 1.2, look: 0.9 },
      { type: 'scout', route: [[C(6, 7).x, C(6, 7).z], [C(6, 5).x, C(6, 5).z], [C(9, 5).x, C(9, 5).z]], wait: 1.0, look: 0.8 },
      { type: 'heavy', route: [[-14, -12.6]], dir: 0, look: 0.7 }
    ],
    radio: [{ x: 4, z: 14, r: 2.5, who: 'العم سند', text: 'الفنيين يمشون لحالهم هنا… قرّب من ورا.' }],
    ending: [
      'بطاقة أبوك… أول ما لمستها، اشتغلت مضخة.',
      '«تم التعرف على فني الصيانة: عبدالله»',
      '«بانتظار المساعد الميداني…»'
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = LEVEL2; else (root.LEVELS = root.LEVELS || {})[2] = LEVEL2;
})(typeof globalThis !== 'undefined' ? globalThis : this);

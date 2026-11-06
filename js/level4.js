// ذيبان — المهمة الرابعة: عين الصحراء
// مركز مراقبة وسط الصحراء أثناء عاصفة رملية ليلية. العاصفة تضيّق رؤية الحراس والكاميرات.
// المهارة: العازل — يعطّل كاميرا قريبة فترة محدودة. الهدف: منصة التحكم في غرفة المراقبة، وبعدين الطلوع.
(function (root) {
  'use strict';
  const car = (x, z) => ({ id: 'car', x: x + 1.7, z: z - 1.5, face: -Math.PI / 2, seat: { x, z: z - 1.5, y: 0.75, dir: 0 } });
  const LEVEL4 = {
    id: 'm4', n: 4,
    title: 'المهمة الرابعة: عين الصحراء', wonTitle: 'عين الصحراء طفت',
    place: 'مركز مراقبة روافد · عاصفة رملية',
    env: { kind: 'storm', vision: 0.7 },
    size: { w: 44, d: 44 },
    start: { x: 0, z: 20, dir: Math.PI },
    obstacles: [
      { kind: 'hidden', x: 13, z: -15, w: 3, d: 3, h: 20 },
      { kind: 'hidden', x: 18.5, z: -15, w: 4, d: 5, h: 3.2 },
      { kind: 'hidden', x: -15, z: -14, w: 3, d: 3, h: 1.2 }
    ],
    props: [
      { id: 'tb_room', x: 0, z: -15, walls: true, p: { kind: 'control', width: 12, depth: 9, height: 4 } },
      { id: 'tb_monitor_wall', x: 0, z: -19.3 },
      { id: 'tb_console', x: 0, z: -16.6, p: { screens: 3 }, col: [2.3, 0.9, 1.5] },
      { id: 'tb_chair', x: -0.7, z: -15.7, p: { turn: 20 } },
      { id: 'tb_radio_desk', x: -4.3, z: -18.9, col: [1.8, 0.8, 1.6] },
      { id: 'tb_server_rack', x: 4.4, z: -18.8, p: { count: 2 }, col: [2.05, 1.2, 2.2] },
      { id: 'tb_comms_tower', x: 13, z: -15, p: { height: 26, dishes: 4 } },
      { id: 'tb_watch_tower', x: -15, z: -14, rot: 0.3, p: { height: 8 } },
      { id: 'tb_rock', x: -6, z: 11, p: { size: 2.6 }, col: [2.6, 2.2, 1.85] },
      { id: 'tb_rock', x: 7, z: 12, p: { size: 2.6, seed: 4 }, col: [2.6, 2.2, 1.85] },
      { id: 'tb_rock', x: -15, z: 0.5, p: { size: 2.6, seed: 7 }, col: [2.6, 2.2, 1.85] },
      { id: 'tb_rock', x: 14.5, z: -1, p: { size: 2.6, seed: 9 }, col: [2.6, 2.2, 1.85] },
      { id: 'tb_rock', x: 3, z: -1, p: { size: 2.6, seed: 12 }, col: [2.6, 2.2, 1.85] },
      { id: 'tb_barrier', x: -3, z: -5, col: [4, 0.6, 0.8] },
      { id: 'tb_barrier', x: 6, z: -6, col: [4, 0.6, 0.8] },
      { id: 'tb_crate', x: -10.5, z: -6, col: [1.9, 1, 1.9] },
      { id: 'tb_crate', x: 10, z: -8.5, col: [1.9, 1, 1.9] },
      { id: 'tb_container', x: -17.5, z: 8, p: { color: 'tbOlive' }, col: [2.5, 6.2, 2.6] },
      { id: 'tb_car', x: 12, z: 16, p: { kind: 'pickup', color: 'tbOlive', livery: true }, col: [2.1, 5, 2] },
      { id: 'tb_alarm', x: -7, z: -9, p: { mount: 'pole' } },
      { id: 'tb_dune', x: -20, z: 20, p: { size: 16, height: 3 } },
      { id: 'tb_dune', x: 22, z: 6, rot: 1.2, p: { size: 14, height: 3 } }
    ],
    // الكاميرات: h ارتفاعها، dir اتجاهها (0 = جنوب)، amp مدى التلفت
    cameras: [
      { x: -9, z: 2, h: 3.4, dir: Math.PI / 2, amp: 0.7, speed: 0.5, fov: 60, range: 9 },
      { x: 9, z: -4, h: 3.4, dir: -Math.PI / 2, amp: 0.7, speed: 0.45, fov: 60, range: 9 },
      { x: 6.6, z: -9.9, h: 3.2, dir: -Math.PI / 4, amp: 0.45, speed: 0.4, fov: 60, range: 8, mount: 'wall' },
      { x: -5.7, z: -19.2, h: 3.2, dir: 0.6, amp: 0.35, speed: 0.35, fov: 60, range: 8, mount: 'wall' }
    ],
    hideSpots: [car(12, 16)],
    panels: [{ x: -7, z: -8.2, face: 0, wall: [-7, -8.75] }],
    searchlights: [{ sx: -15, sz: -14, sh: 8.5, cx: -4, cz: -3, ax: 10, az: 4, r: 2.6, speed: 0.3, phase: 1.2 }],
    objectives: [
      { kind: 'use', x: 0, z: -15.5, r: 1.3, need: 2.5, label: 'عطّل شبكة المراقبة', btn: 'عطّل', done: 'الكاميرات طفت', camsOff: true },
      { kind: 'exit', x: 0, z: 20.5, r: 1.8, label: 'اطلع قبل ما تهدأ العاصفة' }
    ],
    checkpoints: [{ x: -19, z: 18, r: 1.4 }, { x: 19, z: -20, r: 1.4 }],
    gasStart: 2,
    tools: { nabbah: 1, azil: 2 },
    gasPickups: [{ x: -19.5, z: -4, kind: 'azil' }, { x: 18, z: 10 }, { x: -2, z: 8, kind: 'azil' }],
    guards: [
      { type: 'scout', route: [[-14, 6], [14, 6]], wait: 1.4, look: 1.0 },
      { type: 'heavy', route: [[-3, -8.4]], dir: 0, look: 0.5 },
      { type: 'tech', route: [[-8.5, -8], [8.5, -8], [8.5, -21], [-8.5, -21]], wait: 1.0, look: 0.8 },
      { type: 'scout', route: [[17.5, -6], [17.5, 13]], wait: 1.2, look: 0.9 }
    ],
    radio: [{ x: 0, z: 17, r: 2.5, who: 'برق', text: 'العاصفة تعميهم… وتعميك بعد. الكاميرات؟ العازل.' }],
    ending: [
      'برق: «الصور اللي كانت توصلني… مزيفة. السديم كان شايفنا من البداية.»',
      'فيديو قديم لعبدالله: «يا ذيبان، إذا وصلت هنا، لا تطفئ السديم… اسمعني أولاً»',
      'العم سند: «أنا اللي وقّعت تقرير العاصفة… سامحني. خذ الزاحف، سويته من عدّة أبوك.»'
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = LEVEL4; else (root.LEVELS = root.LEVELS || {})[4] = LEVEL4;
})(typeof globalThis !== 'undefined' ? globalThis : this);

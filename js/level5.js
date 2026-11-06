// ذيبان — المهمة الخامسة: قلب السديم
// المنشأة المركزية تحت الأرض قبل الشروق. بدون لاسلكي، وبدون مهارة جديدة: اختبار لكل شيء + الزاحف.
// الهدف: فصل قفل الطوارئ من منصة الجناح الغربي (يطفي الكاميرات 25 ثانية)، وبعدين باب غرفة التحكم.
(function (root) {
  'use strict';
  const LEVEL5 = {
    id: 'm5', n: 5, final: true,
    title: 'المهمة الخامسة: قلب السديم',
    place: 'المحطة الخامسة · قبل الشروق',
    env: { kind: 'indoor' },
    size: { w: 44, d: 44 },
    start: { x: 0, z: 20.5, dir: Math.PI },
    obstacles: [
      // الجدران الخارجية
      { kind: 'wall', x: 0, z: -21.8, w: 44, d: 0.4, h: 4.5 },
      { kind: 'wall', x: -21.8, z: 0, w: 0.4, d: 44, h: 4.5 },
      { kind: 'wall', x: 21.8, z: 0, w: 0.4, d: 44, h: 4.5 },
      // الجدار الفاصل: فتحة في الوسط، ومجرى زحف تحت الأنابيب في الشرق
      { kind: 'wall', x: -15.6, z: 9, w: 12.4, d: 0.4, h: 4 },
      { kind: 'wall', x: 12, z: 9, w: 12, d: 0.4, h: 4 },
      { kind: 'pipe', x: 19.9, z: 9, w: 3.8, d: 1.0, h: 0.8, y0: 0.6 },
      { kind: 'wall', x: 19.9, z: 9, w: 3.8, d: 0.4, h: 2.6, y0: 1.4 }
    ],
    props: [
      { id: 'tb_sadeem_core', x: 0, z: -4, p: { size: 0.8, mode: 'lockdown', tanks: 4 }, col: [10.6, 10.6, 8] },
      { id: 'tb_room', x: 0, z: -18, walls: true, p: { kind: 'control', width: 10, depth: 6, height: 4 } },
      { id: 'tb_monitor_wall', x: 0, z: -20.8 },
      { id: 'tb_console', x: 0, z: -19.3, p: { screens: 3 }, col: [2.3, 0.9, 1.5] },
      { id: 'tb_console', x: -20.5, z: -10, rot: Math.PI / 2, p: { screens: 2 }, col: [2.3, 0.9, 1.5] },
      { id: 'tb_server_rack', x: 12, z: -14, p: { count: 2 }, col: [2.05, 1.2, 2.2] },
      { id: 'tb_server_rack', x: 12, z: -10, p: { count: 2 }, col: [2.05, 1.2, 2.2] },
      { id: 'tb_server_rack', x: 16, z: -14, p: { count: 2 }, col: [2.05, 1.2, 2.2] },
      { id: 'tb_server_rack', x: 16, z: -10, p: { count: 2 }, col: [2.05, 1.2, 2.2] },
      { id: 'tb_shelving', x: -14, z: -2, col: [4.1, 1.2, 3.1] },
      { id: 'tb_shelving', x: -14, z: -6, p: { fill: 0.5 }, col: [4.1, 1.2, 3.1] },
      { id: 'tb_locker', x: -12, z: 5, col: [1.8, 0.8, 1.9] },
      { id: 'tb_locker', x: -16, z: 5, col: [1.8, 0.8, 1.9] },
      { id: 'tb_console', x: 10, z: 3, col: [2.3, 0.9, 1.5] },
      { id: 'tb_console', x: 14, z: 3, p: { screens: 2 }, col: [2.3, 0.9, 1.5] },
      { id: 'tb_crate', x: -6, z: 15, p: { kind: 'metal' }, col: [1.9, 1, 1.9] },
      { id: 'tb_crate', x: 6, z: 14, col: [1.9, 1, 1.9] },
      { id: 'tb_crate', x: -14, z: 14, p: { stack: 'pair' }, col: [1.9, 1, 1.9] },
      { id: 'tb_barrier', x: 0, z: 12.6, col: [4, 0.6, 0.8] },
      { id: 'tb_pallet', x: 14, z: 15, p: { load: 'water' }, col: [1.2, 1, 1.1] },
      { id: 'tb_gauge_panel', x: -8, z: 8.6, rot: Math.PI, p: { state: 'alarm' } },
      { id: 'tb_alarm', x: 6.2, z: 8.6, p: { mount: 'wall' } }
    ],
    cameras: [
      { x: -6.4, z: 8.6, h: 3.6, dir: 0.35, amp: 0.5, speed: 0.45, fov: 60, range: 9 },
      { x: 21.4, z: -6, h: 3.4, dir: -Math.PI / 2, amp: 0.5, speed: 0.4, fov: 60, range: 9, mount: 'wall' },
      { x: -21.4, z: 0, h: 3.4, dir: Math.PI / 2, amp: 0.5, speed: 0.5, fov: 60, range: 9, mount: 'wall' },
      { x: 5.5, z: -15.2, h: 3.2, dir: -1.2, amp: 0.35, speed: 0.35, fov: 60, range: 8, mount: 'wall' }
    ],
    panels: [{ x: -20.8, z: 15, face: Math.PI / 2, wall: [-21.55, 15] }],
    objectives: [
      { kind: 'use', x: -19.4, z: -10, r: 1.3, need: 2.0, label: 'افصل قفل الطوارئ', btn: 'افصل', done: 'الكاميرات طفت… ٢٥ ثانية', power: 25 },
      { kind: 'use', x: -2.5, z: -14, r: 1.2, need: 3.0, label: 'افتح باب غرفة التحكم', btn: 'افتح', done: '' }
    ],
    checkpoints: [{ x: -19, z: 19, r: 1.4 }, { x: 20, z: 5.5, r: 1.4 }],
    gasStart: 3,
    tools: { nabbah: 2, azil: 2, zahif: 3 },
    gasPickups: [{ x: -19, z: 12 }, { x: 19.5, z: 1, kind: 'zahif' }, { x: 8, z: -19.5, kind: 'nabbah' }],
    guards: [
      { type: 'heavy', route: [[0, 10.5]], dir: 0, look: 0.8 },
      { type: 'scout', route: [[-8, 4], [8, 4], [8, -12], [-8, -12]], wait: 1.0, look: 0.9 },
      { type: 'heavy', route: [[1.5, -13.3]], dir: 0, look: 0.6 },
      { type: 'tech', route: [[-18.5, -18], [-18.5, -12.5]], wait: 1.5, look: 0.9 },
      { type: 'tech', route: [[19, -18], [19, -8]], wait: 1.4, look: 0.9 }
    ],
    radio: [],
    ending: []
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = LEVEL5; else (root.LEVELS = root.LEVELS || {})[5] = LEVEL5;
})(typeof globalThis !== 'undefined' ? globalThis : this);

// Aboden Assets — theeban/tb-props.js — أغراض الغطاء والتفاصيل: صناديق، براميل، طبلية محمّلة، حاجز خرساني، بكرة كابلات،
// صندوق عدة، إطارات، خردة وحطام، أكياس، جالون، لوحة تحذير
(function (g) {
  'use strict';
  const AA = g.AA, K = AA.kit, V = AA.v, TB = AA.tb, LP = AA.lp;
  const sh = TB.shade, ti = TB.tint;

  // صندوق خشبي بإطار مشطوف
  TB.crateInto = function (P, c, s, col, o, rz) {
    const [w, h, d] = s, B = P('wood'), dk = sh(col, 0.2);
    TB.box(B, [c[0], c[1] + h / 2, c[2]], [w - 0.03, h - 0.03, d - 0.03], col, 0.01, o, rz);
    for (const sy of [1, -1]) for (const sz of [1, -1]) TB.box(B, [c[0], c[1] + h / 2 + sy * (h / 2 - 0.035), c[2] + sz * (d / 2 - 0.035)], [w, 0.07, 0.07], dk, 0.012, o, rz);
    for (const sx of [1, -1]) for (const sz of [1, -1]) TB.box(B, [c[0] + sx * (w / 2 - 0.035), c[1] + h / 2, c[2] + sz * (d / 2 - 0.035)], [0.07, h - 0.1, 0.07], dk, 0.012, o, rz);
    for (const sx of [1, -1]) for (const sy of [1, -1]) TB.box(B, [c[0] + sx * (w / 2 - 0.035), c[1] + h / 2 + sy * (h / 2 - 0.035), c[2]], [0.07, 0.07, d - 0.1], dk, 0.012, o, rz);
    K.box(B, [c[0], c[1] + h / 2, c[2] + d / 2 - 0.012], [w * 0.95, 0.06, 0.012], dk, o, Math.atan2(h, w) * 0.9 + (rz || 0));
  };

  // ---------- صناديق ----------
  TB.def('crate', { name: 'صناديق', nameEn: 'Crates', group: 'tb_props',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['wood', 'خشبية'], ['metal', 'صناديق معدات'], ['plastic', 'صناديق بلاستيك']], def: 'wood' }, { key: 'stack', label: 'الترتيب', type: 'enum', options: [['one', 'واحد'], ['pair', 'اثنين'], ['stack', 'كومة'], ['wall', 'جدار غطاء']], def: 'stack' }, { key: 'size', label: 'حجم الصندوق', min: 0.4, max: 1.5, step: 0.05, def: 0.9, unit: 'م' }],
    presets: { 'كومة خشب': {}, 'معدات': { kind: 'metal', stack: 'pair', size: 0.7 }, 'جدار غطاء': { stack: 'wall' }, 'بلاستيك': { kind: 'plastic', stack: 'stack', size: 0.6 } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, rng = AA.rng(p.seed);
      const one = (c, rz) => {
        if (p.kind === 'wood') TB.crateInto(P, c, [s, s, s], ['tbWood', '#9c7a52', '#7f603f'][Math.floor(rng() * 3)], null, rz);
        else if (p.kind === 'metal') { const col = ['tbOlive', 'tbSteel', 'tbRawafid'][Math.floor(rng() * 3)], h = s * 0.6; const o = { at: [c[0], 0, c[2]], rot: rz || 0 }; TB.box(P('metal'), [0, c[1] + h / 2, 0], [s * 1.3, h, s * 0.75], col, 0.03, o); TB.box(P('metal'), [0, c[1] + h - 0.02, 0], [s * 1.3 + 0.02, 0.05, s * 0.75 + 0.02], sh(col, 0.25), 0.015, o); for (const sx of [1, -1]) { TB.box(P('metal'), [sx * s * 0.4, c[1] + h * 0.55, s * 0.38], [0.08, 0.06, 0.03], 'tbSteel2', 0.01, o); TB.box(P('metal'), [sx * (s * 0.65 + 0.02), c[1] + h * 0.6, 0], [0.03, 0.04, 0.18], 'tbGunmetal', 0.008, o); } K.box(P('paint'), [0, c[1] + h * 0.5, s * 0.376], [s * 0.4, 0.08, 0.004], 'tbYellow', o); }
        else { const col = ['tbRawafid', 'tbOrange', 'tbOlive'][Math.floor(rng() * 3)], h = s * 0.55, o = { at: [c[0], 0, c[2]], rot: rz || 0 }; TB.box(P('plastic'), [0, c[1] + h / 2, 0], [s, h, s * 0.7], col, 0.04, o); for (const sx of [1, -1]) K.box(P('dark'), [sx * (s / 2 + 0.003), c[1] + h * 0.7, 0], [0.006, 0.05, s * 0.3], 'tbBlack', o); TB.box(P('plastic'), [0, c[1] + h + 0.01, 0], [s * 0.95, 0.03, s * 0.66], sh(col, 0.15), 0.01, o); }
        return p.kind === 'wood' ? s : p.kind === 'metal' ? s * 0.6 + 0.02 : s * 0.55 + 0.03;
      };
      let W = s, H = s;
      if (p.stack === 'one') H = one([0, 0, 0]);
      else if (p.stack === 'pair') { one([-s * 0.55, 0, 0], 0.05); H = one([s * 0.6, 0, 0.05], -0.12); W = s * 2.2; }
      else if (p.stack === 'stack') { const h1 = one([-s * 0.55, 0, 0], 0.04); one([s * 0.55, 0, 0.1], -0.08); H = h1 + one([-s * 0.15, h1, 0.05], 0.2); W = s * 2.1; }
      else { let y = 0; for (let r = 0; r < 2; r++) { let hh = 0; for (let i = 0; i < 4 - r; i++) hh = one([(i - (3 - r) / 2) * s * 1.05, y, (rng() - 0.5) * 0.08], (rng() - 0.5) * 0.1); y += hh; } H = y; W = s * 4.2; }
      return TB.done('crate', P, { collider: K.boxCol(W, H, s), cover: H > 1.1 ? 'full' : 'crouch' }, { ao: 0.25, dust: 0.2 });
    } });

  // ---------- براميل ----------
  TB.def('barrel', { name: 'براميل', nameEn: 'Barrels', group: 'tb_props',
    schema: [{ key: 'count', label: 'العدد', min: 1, max: 9, step: 1, def: 4 }, { key: 'color', label: 'اللون', type: 'enum', options: [['mix', 'متنوع'], ['tbRed', 'أحمر'], ['tbRawafid', 'أزرق'], ['tbOlive', 'زيتي'], ['tbRust', 'صدئ'], ['tbYellow', 'أصفر خطر']], def: 'mix' }, { key: 'fallen', label: 'برميل مقلوب', type: 'bool', def: true }, { key: 'pallet', label: 'على طبلية', type: 'bool', def: false }],
    presets: { 'مجموعة': {}, 'أصفر خطر': { color: 'tbYellow', count: 3, fallen: false }, 'على طبلية': { count: 4, pallet: true, fallen: false } },
    generate: (p, q) => {
      const P = K.parts(), n = p.count, rng = AA.rng(p.seed), seg = K.sides(q, 14), r = 0.29, h = 0.88, y0 = p.pallet ? 0.15 : 0;
      if (p.pallet) palletInto(P, [0, 0, 0], 1.2, 1.2);
      const barrel = (c, col, lying, rz) => {
        const a = lying ? V.add(c, [-h / 2 * Math.cos(rz), r, -h / 2 * Math.sin(rz)]) : c, d = lying ? [Math.cos(rz), 0, Math.sin(rz)] : [0, 1, 0], b = V.madd(a, d, h), M = P('metal');
        TB.cyl(M, a, b, r, col, seg, 0.02);
        for (const t of [0.33, 0.66]) { const m = V.madd(a, d, h * t); K.cyl(M, V.madd(m, d, -0.015), V.madd(m, d, 0.015), r + 0.012, r + 0.012, seg, sh(col, 0.2)); }
        if (!lying) { K.cyl(M, V.madd(b, d, -0.004), V.madd(b, d, 0.004), r * 0.88, r * 0.88, seg, sh(col, 0.12)); K.cyl(M, V.add(b, [r * 0.5, 0, 0]), V.add(b, [r * 0.5, 0.015, 0]), 0.035, 0.035, 8, 'tbSteel2'); }
        if (col === 'tbYellow') { const m = V.madd(a, d, h * 0.5); K.box(P('paint'), V.add(m, lying ? [0, r + 0.002, 0] : [0, 0, r + 0.002]), lying ? [0.22, 0.004, 0.22] : [0.2, 0.2, 0.004], 'tbBlack', null, lying ? 0 : Math.PI / 4); }
      };
      const cols = ['tbRed', 'tbRawafid', 'tbOlive', 'tbRust', 'tbSteel'], pos = [];
      const cols2 = Math.ceil(Math.sqrt(n)); for (let i = 0; i < n - (p.fallen && n > 1 ? 1 : 0); i++) pos.push([(i % cols2 - (cols2 - 1) / 2) * 0.62 + (rng() - 0.5) * 0.05, y0, (Math.floor(i / cols2) - (Math.ceil(n / cols2) - 1) / 2) * 0.62 + (rng() - 0.5) * 0.05]);
      for (const c of pos) barrel(c, p.color === 'mix' ? cols[Math.floor(rng() * 5)] : p.color, false);
      if (p.fallen && n > 1) barrel([cols2 * 0.35 + 0.5, 0, 0.3], p.color === 'mix' ? 'tbRust' : p.color, true, 0.6);
      return TB.done('barrel', P, { collider: K.boxCol(cols2 * 0.62 + 0.4, h + y0, Math.ceil(n / cols2) * 0.62), cover: 'crouch' }, { ao: 0.3, dust: 0.25 });
    } });

  // طبلية
  function palletInto(P, c, w, d) { const B = P('wood'); for (const z of [-d / 2 + 0.05, 0, d / 2 - 0.05]) TB.box(B, [c[0], c[1] + 0.05, c[2] + z], [w, 0.1, 0.1], '#8a6d4c', 0.01); for (let i = 0; i < 7; i++) TB.box(B, [c[0] - w / 2 + 0.07 + i * (w - 0.14) / 6, c[1] + 0.125, c[2]], [0.12, 0.025, d], i % 2 ? '#a3845f' : '#94754f', 0.005); }
  TB.palletInto = palletInto;

  // ---------- طبلية محمّلة ----------
  TB.def('pallet', { name: 'طبلية محمّلة', nameEn: 'Loaded pallet', group: 'tb_props',
    schema: [{ key: 'load', label: 'الحمولة', type: 'enum', options: [['bags', 'أكياس'], ['boxes', 'كراتين ملفوفة'], ['water', 'قوارير ماء'], ['empty', 'فارغة']], def: 'boxes' }, { key: 'height', label: 'ارتفاع الحمولة', min: 0.3, max: 1.6, step: 0.1, def: 1.0, unit: 'م' }],
    presets: { 'كراتين': {}, 'أكياس': { load: 'bags', height: 0.7 }, 'قوارير ماء': { load: 'water' }, 'فارغة': { load: 'empty' } },
    generate: (p, q) => {
      const P = K.parts(), rng = AA.rng(p.seed), H = p.height; palletInto(P, [0, 0, 0], 1.2, 1.0);
      if (p.load === 'boxes') { const n = Math.max(1, Math.round(H / 0.33)); for (let l = 0; l < n; l++) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) TB.box(P('wood'), [-0.29 + i * 0.58, 0.14 + l * 0.33 + 0.165, -0.24 + j * 0.48], [0.56, 0.32, 0.46], ['#b48d5f', '#a8825a'][(i + j + l) % 2], 0.015); K.box(P.custom('wrap', LP.mat('glass', { roughness: 0.3, opacity: 0.25, doubleSided: true })), [0, 0.14 + n * 0.165, 0], [1.19, n * 0.33, 0.99], 'white'); }
      else if (p.load === 'bags') { const n = Math.max(1, Math.round(H / 0.14)); for (let l = 0; l < n; l++) for (let i = 0; i < 2; i++) { const rot = l % 2 ? Math.PI / 2 : 0; TB.box(P('cloth'), l % 2 ? [-0.25 + i * 0.5, 0.21 + l * 0.14, 0] : [0, 0.21 + l * 0.14, -0.25 + i * 0.5], l % 2 ? [0.45, 0.13, 0.95] : [1.1, 0.13, 0.45], rng() < 0.5 ? '#d8cfb6' : '#cbbf9e', 0.04); void rot; } }
      else if (p.load === 'water') { const n = Math.max(1, Math.round(H / 0.32)); const Wt = P.custom('bottle', LP.mat('glass', { roughness: 0.15, opacity: 0.55, emissive: [0.05, 0.2, 0.25], glow: 0.2 })); for (let l = 0; l < n; l++) for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const x = -0.43 + i * 0.29, z = -0.3 + j * 0.3, y = 0.14 + l * 0.32; K.cyl(Wt, [x, y, z], [x, y + 0.27, z], 0.12, 0.12, 8, '#7fc4d6'); K.cyl(P('plastic'), [x, y + 0.27, z], [x, y + 0.31, z], 0.04, 0.04, 6, 'tbRawafid'); } }
      return TB.done('pallet', P, { collider: K.boxCol(1.2, p.load === 'empty' ? 0.14 : H + 0.14, 1.0), cover: H > 1 ? 'full' : 'crouch' }, { ao: 0.25, dust: 0.2 });
    } });

  // ---------- حاجز خرساني ----------
  TB.def('barrier', { name: 'حاجز خرساني', nameEn: 'Concrete barrier', group: 'tb_props',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['jersey', 'حاجز طريق'], ['block', 'كتلة'], ['tall', 'جدار T عالي']], def: 'jersey' }, { key: 'count', label: 'العدد', min: 1, max: 6, step: 1, def: 2 }, { key: 'stripes', label: 'خطوط تحذير', type: 'bool', def: true }],
    presets: { 'طريق': {}, 'كتل': { kind: 'block', count: 3 }, 'عالي': { kind: 'tall', count: 3, stripes: false } },
    generate: (p, q) => {
      const P = K.parts(), n = p.count, rng = AA.rng(p.seed), L = p.kind === 'tall' ? 1.2 : 2.0, St = P('stone');
      for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * (L + 0.05), c = rng() < 0.4 ? 'tbConcrete2' : 'tbConcrete', rz = (rng() - 0.5) * 0.04;
        if (p.kind === 'jersey') { K.extrude(St, [[-0.3, 0], [0.3, 0], [0.3, 0.08], [0.1, 0.3], [0.08, 0.81], [-0.08, 0.81], [-0.1, 0.3], [-0.3, 0.08]], 'x', x - L / 2, x + L / 2, { side: c, cap: sh(c, 0.08) }); if (p.stripes) for (let k = 0; k < 3; k++) K.box(St, [x - L / 2 + 0.35 + k * 0.65, 0.6, 0.095], [0.3, 0.18, 0.01], k % 2 ? 'tbWhite' : 'tbRed', null, 0); K.box(St, [x, 0.06, 0], [0.3, 0.12, 0.62], '#4a463f'); }
        else if (p.kind === 'block') { TB.box(St, [x, 0.4, 0], [L * 0.6, 0.8, 0.8], c, 0.06, null, rz); if (p.stripes) K.box(St, [x, 0.6, 0.402], [L * 0.6 - 0.1, 0.12, 0.01], 'tbYellow'); }
        else { TB.box(St, [x, 1.9, 0], [L - 0.02, 3.2, 0.3], c, 0.04); K.extrude(St, [[-0.6, 0], [0.6, 0], [0.6, 0.2], [0.15, 0.45], [-0.15, 0.45], [-0.6, 0.2]], 'x', x - L / 2 + 0.01, x + L / 2 - 0.01, c); TB.box(P('metal'), [x, 3.45, 0], [0.12, 0.12, 0.34], 'tbSteel2', 0.01); }
      }
      const H = p.kind === 'tall' ? 3.5 : p.kind === 'block' ? 0.8 : 0.81;
      return TB.done('barrier', P, { collider: K.boxCol(n * (L + 0.05), H, 0.8), cover: H > 1.2 ? 'full' : 'crouch' }, { ao: 0.25, dust: 0.3 });
    } });

  // ---------- بكرة كابلات وصندوق عدة وإطارات وأكياس وجالون ----------
  TB.def('clutter', { name: 'أغراض متفرقة', nameEn: 'Site clutter', group: 'tb_props',
    schema: [{ key: 'item', label: 'الغرض', type: 'enum', options: [['reel', 'بكرة كابلات'], ['toolbox', 'صندوق عدة'], ['tires', 'إطارات'], ['sacks', 'أكياس'], ['jerrycan', 'جالونات'], ['scrap', 'خردة وحطام'], ['sign', 'لوحة تحذير'], ['cones', 'أقماع']], def: 'reel' }, { key: 'size', label: 'المقياس', min: 0.5, max: 2, step: 0.05, def: 1 }],
    presets: { 'بكرة': {}, 'عدة': { item: 'toolbox' }, 'إطارات': { item: 'tires' }, 'أكياس': { item: 'sacks' }, 'جالونات': { item: 'jerrycan' }, 'خردة': { item: 'scrap' }, 'لوحة': { item: 'sign' }, 'أقماع': { item: 'cones' } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, rng = AA.rng(p.seed), n = K.sides(q, 14), S = v => v.map(x => x * s);
      let H = 1;
      if (p.item === 'reel') { for (const z of [-0.35, 0.35]) K.cyl(P('wood'), S([0, 0.6, z]), S([0, 0.6, z + (z > 0 ? 0.06 : -0.06)]), 0.6 * s, 0.6 * s, n, 'tbWood'); K.cyl(P('rubber'), S([0, 0.6, -0.35]), S([0, 0.6, 0.35]), 0.42 * s, 0.42 * s, n, '#2e3034'); for (let k = 0; k < 5; k++) K.cyl(P('rubber'), S([0, 0.6, -0.33 + k * 0.165]), S([0, 0.6, -0.33 + k * 0.165 + 0.02]), 0.43 * s, 0.43 * s, n, '#3a3d42', null, { noCaps: true }); K.cyl(P('rubber'), S([0.3, 0.3, 0.2]), S([1.2, 0.03, 0.6]), 0.025 * s, 0.025 * s, 6, '#2e3034'); H = 1.2 * s; }
      else if (p.item === 'toolbox') { TB.box(P('metal'), S([0, 0.13, 0]), S([0.55, 0.26, 0.28]), 'tbRed', 0.015 * s); TB.box(P('metal'), S([0, 0.27, 0]), S([0.56, 0.03, 0.29]), sh('tbRed', 0.2), 0.008 * s); for (const x of [-0.2, 0.2]) K.cyl(P('metal'), S([x, 0.29, 0]), S([x, 0.35, 0]), 0.012 * s, 0.012 * s, 6, 'tbGunmetal'); K.cyl(P('metal'), S([-0.2, 0.35, 0]), S([0.2, 0.35, 0]), 0.015 * s, 0.015 * s, 6, 'tbGunmetal'); K.box(P('metal'), S([0.4, 0.015, 0.05]), S([0.25, 0.03, 0.05]), 'tbSteel', null, 0.3); H = 0.36 * s; }
      else if (p.item === 'tires') { for (let k = 0; k < 4; k++) { const c = S([(rng() - 0.5) * 0.06, 0.13 + k * 0.26, 0]); K.cyl(P('rubber'), V.add(c, [0, -0.12 * s, 0]), V.add(c, [0, 0.12 * s, 0]), 0.42 * s, 0.42 * s, n, 'tbRubber'); K.cyl(P('dark'), V.add(c, [0, -0.121 * s, 0]), V.add(c, [0, 0.121 * s, 0]), 0.24 * s, 0.24 * s, n, '#101113'); } K.cyl(P('rubber'), S([0.8, 0.42, 0.3]), S([0.62, 0.42, 0.5]), 0.42 * s, 0.42 * s, n, 'tbRubber'); H = 1.05 * s; }
      else if (p.item === 'sacks') { for (let k = 0; k < 7; k++) { const l = k < 4 ? 0 : 1, i = l ? k - 4 : k, c = S([(i - (l ? 1 : 1.5)) * 0.48 + (rng() - 0.5) * 0.05, 0.1 + l * 0.18, (rng() - 0.5) * 0.08]); TB.box(P('cloth'), c, S([0.45, 0.18, 0.7]), rng() < 0.5 ? '#c9bd9c' : '#b9ab88', 0.06 * s, null, (rng() - 0.5) * 0.1); } H = 0.48 * s; }
      else if (p.item === 'jerrycan') { for (let k = 0; k < 3; k++) { const o = { at: S([(k - 1) * 0.22, 0, (k % 2) * 0.06]), rot: (rng() - 0.5) * 0.3 }, col = ['tbOlive', 'tbRed', 'tbOlive'][k]; TB.box(P('metal'), [0, 0.24 * s, 0], S([0.17, 0.46, 0.35]), col, 0.025 * s, o); for (const z of [-0.08, 0.08]) K.box(P('metal'), [0, 0.24 * s, z * s], S([0.175, 0.3, 0.02]), sh(col, 0.15), o); K.cyl(P('metal'), K.X(S([0, 0.47, 0.12]), o), K.X(S([0, 0.53, 0.14]), o), 0.025 * s, 0.025 * s, 6, 'tbGunmetal'); TB.box(P('metal'), [0, 0.5 * s, -0.04 * s], S([0.05, 0.06, 0.16]), sh(col, 0.2), 0.01 * s, o); } H = 0.53 * s; }
      else if (p.item === 'scrap') { for (let k = 0; k < 9; k++) { const c = [(rng() - 0.5) * 1.6 * s, 0.03, (rng() - 0.5) * 1.2 * s]; const kind = rng(); if (kind < 0.4) TB.box(P('metal'), V.add(c, [0, 0.04 * s, 0]), [0.3 * s + rng() * 0.4 * s, 0.03, 0.2 * s + rng() * 0.3 * s], ['tbRust', 'tbRust2', 'tbSteel2'][Math.floor(rng() * 3)], 0.01, { at: [0, 0, 0], rot: rng() * 3 }, (rng() - 0.5) * 0.4); else if (kind < 0.7) K.cyl(P('metal'), V.add(c, [0, 0.06 * s, 0]), V.add(c, [0.5 * s * (rng() - 0.5), 0.06 * s, 0.5 * s]), 0.05 * s, 0.05 * s, 8, 'tbRust'); else TB.box(P('stone'), V.add(c, [0, 0.08 * s, 0]), [0.2 * s, 0.16 * s, 0.25 * s], 'tbConcrete2', 0.03, null, rng()); } H = 0.25 * s; }
      else if (p.item === 'sign') { for (const x of [-0.35, 0.35]) K.cyl(P('metal'), S([x, 0, 0]), S([x, 1.3, 0]), 0.025 * s, 0.025 * s, 6, 'tbSteel2'); TB.box(P('paint'), S([0, 1.15, 0.03]), S([1.0, 0.55, 0.03]), 'tbYellow', 0.01 * s); TB.box(P('paint'), S([0, 1.15, 0.047]), S([0.94, 0.49, 0.004]), 'tbYellow', 0.002); K.tri(P('stone'), S([-0.4, 0.95, 0.05]), S([-0.15, 0.95, 0.05]), S([-0.275, 1.18, 0.05]), 'tbBlack', [0, 0, 1]); K.text(P('stone'), 'DANGER', 0.13 * s, 1.18 * s, 0.05 * s, 0.022 * s, 'tbBlack'); K.text(P('stone'), 'NO ENTRY', 0.13 * s, 1.04 * s, 0.05 * s, 0.016 * s, 'tbRed'); H = 1.45 * s; }
      else { for (let k = 0; k < 4; k++) { const c = S([(k - 1.5) * 0.6, 0, (k % 2) * 0.1]); K.box(P('plastic'), V.add(c, [0, 0.02, 0]), S([0.38, 0.04, 0.38]), 'tbBlack'); K.cyl(P('plastic'), V.add(c, [0, 0.04, 0]), V.add(c, [0, 0.7 * s, 0]), 0.15 * s, 0.03 * s, 10, 'tbOrange'); for (const y of [0.3, 0.48]) K.cyl(P('plastic'), V.add(c, [0, y * s, 0]), V.add(c, [0, (y + 0.08) * s, 0]), (0.15 - y * 0.17) * s + 0.003, (0.15 - (y + 0.08) * 0.17) * s + 0.003, 10, 'tbWhite', null, { noCaps: true }); } H = 0.7 * s; }
      return TB.done('clutter', P, { collider: K.boxCol(s, H, s), cover: H > 1 ? 'crouch' : false }, { ao: 0.2, dust: 0.25 });
    } });
})(typeof window !== 'undefined' ? window : globalThis);

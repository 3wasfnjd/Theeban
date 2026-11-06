// Aboden Assets — theeban/tb-tunnel.js — «تحت الرمال»: قطع أنفاق الصيانة (مستقيم، زاوية، تقاطع، نهاية بسلّم)، مجرى زحف،
// فتحة صيانة أرضية، فتحة تهوية، ممشى معدني ودرج صناعي
(function (g) {
  'use strict';
  const AA = g.AA, K = AA.kit, V = AA.v, TB = AA.tb, LP = AA.lp;
  const sh = TB.shade;
  const SEG = 4; // طول القطعة (م) — القطع تتصل على شبكة 4 م

  // قطعة نفق: الأرضية على y=0، المدخل على +Z و -Z (والجوانب حسب النوع)
  TB.def('tunnel', { name: 'نفق صيانة', nameEn: 'Maintenance tunnel', group: 'tb_tunnel',
    schema: [{ key: 'kind', label: 'القطعة', type: 'enum', options: [['straight', 'مستقيم'], ['corner', 'زاوية'], ['tee', 'تقاطع T'], ['cross', 'تقاطع +'], ['end', 'نهاية بسلّم للأعلى']], def: 'straight' },
      { key: 'shape', label: 'المقطع', type: 'enum', options: [['box', 'مستطيل خرساني'], ['arch', 'مقوّس']], def: 'box' }, { key: 'lights', label: 'إضاءة', type: 'enum', options: [['teal', 'فيروزية'], ['warm', 'دافئة'], ['off', 'مطفأة'], ['alarm', 'إنذار']], def: 'teal' },
      { key: 'pipes', label: 'أنابيب على الجدار', type: 'bool', def: true }, { key: 'water', label: 'ماء على الأرض', type: 'bool', def: false }, { key: 'cutaway', label: 'بدون سقف (للكاميرا العلوية)', type: 'bool', def: true }],
    presets: { 'مستقيم': {}, 'زاوية': { kind: 'corner' }, 'تقاطع T': { kind: 'tee' }, 'تقاطع +': { kind: 'cross', water: true }, 'نهاية بسلّم': { kind: 'end', lights: 'warm' }, 'مقوّس مغلق': { shape: 'arch', cutaway: false, lights: 'alarm' } },
    generate: (p, q) => {
      const P = K.parts(), Wd = 3.0, H = 3.0, t = 0.3, St = P('stone'), rng = AA.rng(p.seed), h = SEG / 2;
      const open = { n: true, s: true, e: false, w: false };
      if (p.kind === 'corner') Object.assign(open, { n: false, s: true, e: true, w: false });
      if (p.kind === 'tee') Object.assign(open, { n: true, s: true, e: true, w: false });
      if (p.kind === 'cross') Object.assign(open, { n: true, s: true, e: true, w: true });
      if (p.kind === 'end') Object.assign(open, { n: false, s: true });
      // الأرضية
      TB.box(St, [0, -0.15, 0], [SEG, 0.3, SEG], 'tbConcreteDark', 0.02); K.box(St, [0, 0.005, 0], [Wd - 0.1, 0.01, SEG], 'tbConcrete2');
      for (const dir of ['e', 'w']) if (open[dir]) K.box(St, [dir === 'e' ? (Wd / 4 + SEG / 4) : -(Wd / 4 + SEG / 4), 0.005, 0], [h - Wd / 2, 0.01, Wd - 0.1], 'tbConcrete2');
      K.box(P('metal'), [0, 0.012, 0], [0.5, 0.01, SEG], 'tbGunmetal'); for (let k = 0; k < 8; k++) K.box(P('dark'), [0, 0.018, -h + 0.25 + k * 0.5], [0.46, 0.004, 0.02], 'tbBlack'); // مصرف في المنتصف
      if (p.water) K.box(TB.water(P), [0.6, 0.02, 0.4], [1.6, 0.01, 2.6], 'tbWater');
      // الجدران: كل جهة مغلقة جدار كامل، والمفتوحة لها زاويتان
      const wall = (o, x0, x1) => { const w = x1 - x0, cx = (x0 + x1) / 2; TB.box(St, [cx, H / 2, 0], [w, H, t], rng() < 0.3 ? 'tbConcrete2' : 'tbConcrete', 0.04, o); K.box(St, [cx, 0.25, t / 2 + 0.005], [w, 0.5, 0.01], 'tbYellow', o); for (let k = 0; k < 4; k++) K.box(St, [cx - w / 2 + 0.3 + k * 0.7 + 0.15, 0.25, t / 2 + 0.007], [0.18, 0.5, 0.01], 'tbBlack', o, 0.5); };
      const side = (dir, isOpen) => {
        const rot = { e: -Math.PI / 2, w: Math.PI / 2, n: Math.PI, s: 0 }[dir], dist = dir === 'e' || dir === 'w' ? Wd / 2 + t / 2 : Wd / 2 + t / 2;
        if (dir === 'n' || dir === 's') return; // الطرفان الأمامي والخلفي مفتوحان دائماً أو يغلق بجدار نهاية
        const o = { at: dir === 'e' ? [dist, 0, 0] : [-dist, 0, 0], rot: dir === 'e' ? Math.PI / 2 : -Math.PI / 2 };
        if (!isOpen) wall({ at: o.at, rot: dir === 'e' ? -Math.PI / 2 : Math.PI / 2 }, -h, h);
        else { wall({ at: o.at, rot: dir === 'e' ? -Math.PI / 2 : Math.PI / 2 }, -h, -Wd / 2); wall({ at: o.at, rot: dir === 'e' ? -Math.PI / 2 : Math.PI / 2 }, Wd / 2, h); }
        void rot;
      };
      side('e', open.e); side('w', open.w);
      // الأطراف المفتوحة على الجانبين تحتاج جدران الممر الجانبي
      for (const dir of ['e', 'w']) if (open[dir]) { const sx = dir === 'e' ? 1 : -1; for (const z of [Wd / 2 + t / 2, -Wd / 2 - t / 2]) TB.box(St, [sx * (Wd / 2 + (h - Wd / 2) / 2 + t / 2), H / 2, z], [h - Wd / 2 - t / 2, H, t], 'tbConcrete', 0.04); }
      // جدار النهاية (n مغلق)
      if (!open.n) TB.box(St, [0, H / 2, -h + t / 2], [Wd + 2 * t, H, t], 'tbConcrete', 0.04);
      // السقف (اختياري)
      if (!p.cutaway) { if (p.shape === 'arch') { const n = 8, prof = []; for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; prof.push([Math.cos(a) * (Wd / 2 + t), H + Math.sin(a) * 0.9]); } for (let i = n; i >= 0; i--) { const a = Math.PI * i / n; prof.push([Math.cos(a) * Wd / 2, H + Math.sin(a) * 0.7]); } K.extrude(St, prof, 'z', -h, h, { side: 'tbConcrete2', cap: 'tbConcreteDark' }); } else TB.box(St, [0, H + 0.15, 0], [Wd + 2 * t, 0.3, SEG], 'tbConcrete2', 0.03); }
      // أنابيب على الجدار الغربي وكابلات
      if (p.pipes && !open.w) { const x = -Wd / 2 + 0.25; for (const [y, r, c] of [[2.4, 0.14, 'tbRawafid'], [2.05, 0.1, 'tbSteel'], [1.75, 0.07, 'tbOlive']]) { K.cyl(P('metal'), [x, y, -h], [x, y, h], r, r, 10, c); for (const z of [-h + 0.6, h - 0.6]) TB.box(P('metal'), [x - 0.08, y, z], [0.12, r * 2 + 0.06, 0.08], 'tbSteel2', 0.01); } for (let k = 0; k < 3; k++) K.cyl(P('rubber'), [x + 0.05, 2.75 - k * 0.04, -h], [x + 0.05, 2.75 - k * 0.04, h], 0.02, 0.02, 4, 'tbRubber'); }
      if (p.pipes && !open.e) TB.box(P('metal'), [Wd / 2 - 0.2, 1.3, 0.8], [0.18, 0.8, 0.55], 'tbSteel2', 0.03); if (p.pipes && !open.e) TB.stateLamp(P, [Wd / 2 - 0.3, 1.55, 0.95], 0.025, 'calm');
      // إضاءة سقفية بقفص
      const lc = p.lights === 'teal' ? [0.2, 0.9, 0.85] : p.lights === 'warm' ? [1, 0.75, 0.42] : p.lights === 'alarm' ? [1, 0.12, 0.08] : null;
      const lamp = lc ? P.custom('tunnelLamp', LP.mat('lamp', { emissive: lc, glow: 1.4 })) : P('dark');
      for (const x of [Wd / 2 - 0.05]) { TB.box(P('metal'), [x - 0.08, 2.5, 0], [0.12, 0.2, 0.5], 'tbGunmetal', 0.01); K.box(lamp, [x - 0.15, 2.5, 0], [0.02, 0.12, 0.42], lc ? 'white' : 'tbBlack'); for (let k = 0; k < 3; k++) K.box(P('metal'), [x - 0.17, 2.5, -0.15 + k * 0.15], [0.02, 0.18, 0.015], 'tbSteel2'); }
      // نهاية: سلّم يصعد إلى فتحة
      let ladder = null; if (p.kind === 'end') { ladder = TB.ladder(P('metal'), 0, -h + t + 0.06, 0, H + 1.4, 0.5, 'tbYellow', null, true); K.cyl(P('stone'), [0, H, -h + t + 0.5], [0, H + 0.3, -h + t + 0.5], 0.55, 0.55, 12, 'tbConcrete2', null, { noCaps: true }); }
      return TB.done('tunnel', P, { snap: { size: SEG, open }, ladder, light: lc ? { at: [Wd / 2 - 0.3, 2.4, 0], color: lc, intensity: 1.6, distance: 6 } : null, interior: { floorTop: 0.01 } }, { ao: 0.35, dust: 0.15 });
    } });

  // ---------- مجرى زحف ----------
  TB.def('crawl_duct', { name: 'مجرى زحف', nameEn: 'Crawl duct', group: 'tb_tunnel',
    schema: [{ key: 'length', label: 'الطول', min: 1, max: 8, step: 0.5, def: 4, unit: 'م' }, { key: 'height', label: 'الارتفاع', min: 0.5, max: 1.0, step: 0.05, def: 0.7, unit: 'م' }, { key: 'kind', label: 'النوع', type: 'enum', options: [['duct', 'مجرى معدني'], ['grate', 'تحت شبكة أرضية'], ['concrete', 'عبّارة خرسانية']], def: 'duct' }, { key: 'cutaway', label: 'مقطوع من الأعلى', type: 'bool', def: true }],
    presets: { 'معدني': {}, 'شبكة': { kind: 'grate' }, 'عبّارة': { kind: 'concrete', height: 0.9 } },
    generate: (p, q) => {
      const P = K.parts(), L = p.length, H = p.height, Wd = 0.9, M = P('metal'), half = L / 2;
      if (p.kind === 'concrete') { const n = K.sides(q, 12); for (let k = 0; k < Math.round(L / 1.0); k++) { const z = -half + (k + 0.5) * L / Math.round(L / 1.0), r = H / 2 + 0.12; K.cyl(P('stone'), [0, r, z - 0.48], [0, r, z + 0.48], r, r, n, k % 2 ? 'tbConcrete' : 'tbConcrete2', null, { noCaps: true }); K.cyl(P('stone'), [0, r, z + 0.48], [0, r, z + 0.5], r + 0.04, r + 0.04, n, 'tbConcreteDark', null, { noCaps: true }); } K.box(P('ground'), [0, 0.06, 0], [0.5, 0.04, L], 'tbSand2'); }
      else {
        TB.box(M, [0, 0.03, 0], [Wd + 0.1, 0.06, L], 'tbSteel2', 0.01);
        for (const s of [1, -1]) TB.box(M, [s * (Wd / 2 + 0.03), H / 2, 0], [0.06, H, L], p.kind === 'grate' ? 'tbConcrete' : 'tbSteel', 0.01);
        for (let z = -half; z <= half + 0.01; z += 1.0) for (const s of [1, -1]) TB.box(M, [s * (Wd / 2 + 0.07), H / 2, Math.max(-half + 0.05, Math.min(half - 0.05, z))], [0.04, H + 0.04, 0.08], 'tbSteel2', 0.01);
        if (p.kind === 'grate') { for (let z = -half + 0.05; z < half; z += 0.12) K.box(M, [0, H + 0.02, z], [Wd + 0.14, 0.03, 0.025], 'tbGunmetal'); for (const s of [-0.3, 0, 0.3]) K.box(M, [s, H + 0.005, 0], [0.04, 0.03, L], 'tbGunmetal'); }
        else if (!p.cutaway) TB.box(M, [0, H + 0.03, 0], [Wd + 0.1, 0.06, L], 'tbSteel', 0.01);
        TB.box(M, [0, H * 0.8, half - 0.02], [Wd, 0.06, 0.04], 'tbYellow', 0.01);
      }
      return TB.done('crawl_duct', P, { collider: K.boxCol(Wd + 0.2, H + 0.1, L), crawl: { height: H, length: L } }, { ao: 0.3, dust: 0.2 });
    } });

  // ---------- فتحة صيانة أرضية ----------
  TB.def('hatch', { name: 'فتحة صيانة', nameEn: 'Maintenance hatch', group: 'tb_tunnel',
    schema: [{ key: 'open', label: 'فتح الغطاء', min: 0, max: 1, step: 0.05, def: 0 }, { key: 'kind', label: 'النوع', type: 'enum', options: [['round', 'دائرية'], ['square', 'مربعة بإطار']], def: 'square' }, { key: 'sand', label: 'مغطاة جزئياً بالرمل', type: 'bool', def: true }],
    presets: { 'مغلقة': {}, 'مفتوحة': { open: 1 }, 'دائرية': { kind: 'round' } },
    generate: (p, q) => {
      const P = K.parts(), n = K.sides(q, 16), M = P('metal'), a = p.open * 1.9, S = 1.0;
      if (p.kind === 'round') { K.cyl(P('stone'), [0, 0, 0], [0, 0.18, 0], 0.75, 0.75, n, 'tbConcrete'); K.cyl(P('dark'), [0, 0.18, 0], [0, 0.185, 0], 0.5, 0.5, n, '#07090b'); }
      else { TB.box(P('stone'), [0, 0.1, 0], [1.6, 0.2, 1.6], 'tbConcrete', 0.05); K.box(P('dark'), [0, 0.2, 0], [S, 0.01, S], '#07090b'); for (const s of [1, -1]) { TB.box(M, [s * (S / 2 + 0.04), 0.22, 0], [0.08, 0.06, S + 0.16], 'tbYellow', 0.01); TB.box(M, [0, 0.22, s * (S / 2 + 0.04)], [S, 0.06, 0.08], 'tbYellow', 0.01); } }
      // الغطاء يدور حول المفصل الخلفي
      const hp = [0, 0.24, -S / 2], lid = P.custom('lid', LP.mat('metal', { metalness: 0.5, roughness: 0.45, hinge: { pivot: hp, axis: 'x' } }));
      const cy = hp[1] + Math.sin(a) * S / 2, cz = hp[2] + Math.cos(a) * S / 2, up = [0, Math.cos(a), -Math.sin(a)], fwd = [0, Math.sin(a), Math.cos(a)];
      const corners = [[-S / 2, 0], [S / 2, 0], [S / 2, S], [-S / 2, S]].map(([x, d]) => V.add([x, hp[1], hp[2]], V.scale(fwd, d)));
      if (p.kind === 'round') { const C = [0, cy, cz]; K.cyl(lid, V.madd(C, up, -0.02), V.madd(C, up, 0.04), 0.52, 0.52, n, 'tbSteel2'); }
      else { K.quad(lid, corners[0], corners[1], corners[2], corners[3], 'tbSteel2', up); const t = corners.map(c => V.madd(c, up, 0.05)); K.quad(lid, t[0], t[1], t[2], t[3], 'tbSteel', up); for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 0]]) K.quad(lid, corners[i], corners[j], t[j], t[i], 'tbSteel2'); for (let k = 1; k < 5; k++) { const d0 = V.add(V.madd(corners[0], fwd, S * k / 5), V.scale(up, 0.055)), d1 = V.add(V.madd(corners[1], fwd, S * k / 5), V.scale(up, 0.055)); K.cyl(lid, d0, d1, 0.01, 0.01, 4, 'tbSteel2'); } }
      // سلم للأسفل
      TB.ladder(M, 0, -S / 2 + 0.08, -0.55, 0.2, 0.45, 'tbYellow', null, false); // يكمل تحت الأرض في اللعبة (meta.enter.down)
      if (p.sand) for (let k = 0; k < 3; k++) LP.ico(P('ground'), [0.9 - k * 0.25, 0.1, 0.5 + k * 0.3], [0.5, 0.18, 0.3], 0, () => K.c('tbSand'), { keep: d => d[1] > -0.1 });
      return TB.done('hatch', P, { collider: K.boxCol(1.6, 0.25, 1.6), enter: { at: [0, 0.2, 0], down: -3 }, open: p.open });
    } });

  // ---------- فتحة تهوية ----------
  TB.def('vent', { name: 'فتحة تهوية', nameEn: 'Ventilation shaft', group: 'tb_tunnel',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['shaft', 'برج تهوية بمروحة'], ['grill', 'شبكة جدارية'], ['mushroom', 'مدخنة فطرية']], def: 'shaft' }, { key: 'size', label: 'الحجم', min: 0.5, max: 2.5, step: 0.1, def: 1.2 }, { key: 'running', label: 'المروحة تعمل', type: 'bool', def: true }],
    presets: { 'برج': {}, 'شبكة': { kind: 'grill', size: 0.8 }, 'فطرية': { kind: 'mushroom', size: 0.9 } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, n = K.sides(q, 14), M = P('metal');
      if (p.kind === 'shaft') { TB.box(P('stone'), [0, 0.2 * s, 0], [1.6 * s, 0.4 * s, 1.6 * s], 'tbConcrete', 0.04); TB.box(M, [0, 0.4 * s + 0.6 * s, 0], [1.3 * s, 1.2 * s, 1.3 * s], 'tbSteel', 0.04); for (let k = 0; k < 6; k++) K.box(M, [0, 0.55 * s + k * 0.17 * s, 0.655 * s], [1.15 * s, 0.05 * s, 0.03], 'tbSteel2', null);
        const fan = p.running ? P.custom('fan', LP.mat('metal', { metalness: 0.5, roughness: 0.4, rotor: { pivot: [0, 0, 0], axis: 'y', speed: 7 } })) : M; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; K.box(fan, [Math.cos(a) * 0.25 * s, 1.62 * s, Math.sin(a) * 0.25 * s], [0.45 * s, 0.02, 0.14 * s], 'tbGunmetal', { at: [0, 0, 0], rot: -a }); } K.cyl(M, [0, 1.6 * s, 0], [0, 1.66 * s, 0], 0.1 * s, 0.1 * s, 8, 'tbGunmetal'); for (let k = 0; k < 7; k++) K.box(M, [-0.55 * s + k * 0.18 * s, 1.7 * s, 0], [0.02, 0.03, 1.2 * s], 'tbSteel2'); }
      else if (p.kind === 'grill') { TB.box(M, [0, 0.9, 0.04], [1.0 * s, 0.7 * s, 0.08], 'tbSteel2', 0.02); for (let k = 0; k < 6; k++) TB.box(M, [0, 0.9 - 0.25 * s + k * 0.1 * s, 0.09], [0.9 * s, 0.03, 0.06], 'tbSteel', 0.005, null, 0); K.box(P('dark'), [0, 0.9, 0.081], [0.9 * s, 0.6 * s, 0.002], '#07090b'); }
      else { K.cyl(M, [0, 0, 0], [0, 1.6 * s, 0], 0.25 * s, 0.25 * s, n, 'tbSteel'); K.cyl(M, [0, 1.6 * s, 0], [0, 1.75 * s, 0], 0.45 * s, 0.45 * s, n, 'tbSteel2'); K.cyl(M, [0, 1.75 * s, 0], [0, 1.95 * s, 0], 0.45 * s, 0.05, n, 'tbSteel2'); TB.box(P('stone'), [0, 0.1, 0], [0.8 * s, 0.2, 0.8 * s], 'tbConcrete', 0.03); }
      return TB.done('vent', P, { collider: K.boxCol(1.6 * s, 1.8 * s, 1.6 * s), noise: p.running ? 4 : 0 });
    } });

  // ---------- ممشى معدني ودرج ----------
  TB.def('catwalk', { name: 'ممشى معدني', nameEn: 'Catwalk', group: 'tb_tunnel',
    schema: [{ key: 'kind', label: 'القطعة', type: 'enum', options: [['walk', 'ممشى مرتفع'], ['stairs', 'درج'], ['platform', 'منصة']], def: 'walk' }, { key: 'length', label: 'الطول', min: 2, max: 12, step: 0.5, def: 6, unit: 'م' }, { key: 'height', label: 'الارتفاع', min: 0.5, max: 6, step: 0.25, def: 2.5, unit: 'م' }, { key: 'color', label: 'لون الدرابزين', type: 'enum', options: [['tbYellow', 'أصفر'], ['tbSteel', 'رمادي'], ['tbRawafid', 'أزرق'], ['tbRed', 'أحمر']], def: 'tbYellow' }],
    presets: { 'ممشى': {}, 'درج': { kind: 'stairs', length: 4 }, 'منصة': { kind: 'platform', length: 3, height: 1.5 } },
    generate: (p, q) => {
      const P = K.parts(), L = p.length, H = p.height, Wd = 1.2, M = P('metal'), rail = p.color;
      const deck = (y, z0, z1, w) => { TB.box(M, [0, y - 0.04, (z0 + z1) / 2], [w, 0.08, z1 - z0], 'tbSteel2', 0.015); for (let z = z0 + 0.06; z < z1; z += 0.1) K.box(M, [0, y + 0.003, z], [w - 0.06, 0.006, 0.02], 'tbGunmetal'); };
      const rails = (yAt, z0, z1, w) => { for (const s of [1, -1]) { const nP = Math.max(2, Math.round((z1 - z0) / 1.2) + 1); for (let i = 0; i < nP; i++) { const z = z0 + (z1 - z0) * i / (nP - 1); K.cyl(M, [s * w / 2, yAt(z), z], [s * w / 2, yAt(z) + 1.05, z], 0.025, 0.025, 6, rail); } K.cyl(M, [s * w / 2, yAt(z0) + 1.05, z0], [s * w / 2, yAt(z1) + 1.05, z1], 0.028, 0.028, 6, rail); K.cyl(M, [s * w / 2, yAt(z0) + 0.55, z0], [s * w / 2, yAt(z1) + 0.55, z1], 0.02, 0.02, 6, rail); } };
      if (p.kind === 'stairs') { const n = Math.round(H / 0.2), run = H / Math.tan(0.75); for (let i = 0; i < n; i++) { const y = (i + 1) * H / n, z = -run / 2 + i * run / n + run / n / 2; TB.box(M, [0, y - 0.03, z], [Wd, 0.05, run / n + 0.02], 'tbSteel2', 0.01); } for (const s of [1, -1]) K.cyl(M, [s * Wd / 2, 0, -run / 2], [s * Wd / 2, H, run / 2], 0.05, 0.05, 4, 'tbGunmetal', null, { rot: Math.PI / 4 }); rails(z => (z + run / 2) / run * H, -run / 2, run / 2, Wd + 0.05); return TB.done('catwalk', P, { collider: K.boxCol(Wd, H, run), stairs: { from: [0, 0, -run / 2], to: [0, H, run / 2] } }, { ao: 0.2, dust: 0.1 }); }
      const w = p.kind === 'platform' ? L : Wd;
      deck(H, -L / 2, L / 2, w); rails(() => H, -L / 2, L / 2, w);
      const nL = Math.max(2, Math.round(L / 3) + 1); for (let i = 0; i < nL; i++) { const z = -L / 2 + 0.1 + (L - 0.2) * i / (nL - 1); for (const s of [1, -1]) TB.box(M, [s * (w / 2 - 0.06), H / 2, z], [0.1, H, 0.1], 'tbGunmetal', 0.015); TB.box(P('stone'), [0, 0.06, z], [w + 0.2, 0.12, 0.3], 'tbConcrete', 0.02); }
      return TB.done('catwalk', P, { collider: { type: 'box', size: [w, 0.1, L], center: [0, H - 0.05, 0] }, top: H }, { ao: 0.2, dust: 0.1 });
    } });
})(typeof window !== 'undefined' ? window : globalThis);

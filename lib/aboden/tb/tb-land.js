// Aboden Assets — theeban/tb-land.js — «السهل الأصفر»: كثبان، صخور طبقية للاختباء، نباتات صحراوية جافة، أرض متشققة، كومة رمل
(function (g) {
  'use strict';
  const AA = g.AA, K = AA.kit, V = AA.v, TB = AA.tb, LP = AA.lp;

  // ---------- كثيب رملي ----------
  TB.def('dune', { name: 'كثيب رملي', nameEn: 'Sand dune', group: 'tb_land',
    schema: [{ key: 'kind', label: 'الشكل', type: 'enum', options: [['barchan', 'هلالي'], ['ridge', 'سيف (طولي)'], ['mound', 'تلّة']], def: 'barchan' },
      { key: 'size', label: 'الطول', min: 8, max: 60, step: 1, def: 22, unit: 'م' }, { key: 'height', label: 'الارتفاع', min: 1, max: 12, step: 0.5, def: 4, unit: 'م' }, { key: 'ripples', label: 'تموجات الريح', type: 'bool', def: true }],
    presets: { 'هلالي': {}, 'سيف طويل': { kind: 'ridge', size: 40, height: 6 }, 'تلّة صغيرة': { kind: 'mound', size: 10, height: 1.8 } },
    generate: (p, q) => {
      const P = K.parts(), L = p.size, H = p.height, N = q === 'low' ? 14 : q === 'high' ? 34 : 24, rng = AA.rng(p.seed), B = P('ground');
      const W = p.kind === 'ridge' ? L * 0.35 : L * 0.8;
      const hAt = (x, z) => {
        const u = x / (L / 2), v = z / (W / 2);
        let h;
        if (p.kind === 'ridge') { const crest = 0.25 * Math.sin(u * 2.2 + 0.4); const dv = v - crest; h = Math.max(0, 1 - Math.abs(u) ** 4) * (dv > 0 ? Math.max(0, 1 - dv / 0.55) ** 1.6 : Math.max(0, 1 + dv / 0.9) ** 1.2); }
        else if (p.kind === 'mound') { const r = Math.hypot(u, v); h = Math.max(0, 1 - r * r) ** 1.4; }
        else { const r = Math.hypot(u * 1.1, v + 0.25 * u * u); const lee = v > 0.1 ? Math.max(0, 1 - (v - 0.1) / 0.35) : 1; h = Math.max(0, 1 - r * r) ** 1.3 * lee; const horn = Math.max(0, 1 - ((Math.abs(u) - 0.75) ** 2 * 30 + (v - 0.55) ** 2 * 18)) * 0.3; h = Math.max(h, horn); }
        let y = H * h; if (p.ripples && y > 0.05) y += 0.06 * Math.sin((x * 0.9 + z * 0.35) * 3.1) * Math.min(1, y);
        return y;
      };
      const pts = []; for (let i = 0; i <= N; i++) { const row = []; for (let j = 0; j <= N; j++) { const x = -L / 2 + L * i / N + (i % N ? (rng() - 0.5) * L / N * 0.35 : 0), z = -W / 2 + W * j / N + (j % N ? (rng() - 0.5) * W / N * 0.35 : 0); row.push([x, hAt(x, z), z]); } pts.push(row); }
      const col = (a, b, c) => { const n = V.norm(V.cross(V.sub(b, a), V.sub(c, a))), y = (a[1] + b[1] + c[1]) / 3, lit = 0.5 + 0.5 * V.dot(n, V.norm([-0.4, 0.8, 0.45])); return AA.mixc(AA.mixc(K.c('tbSandDark'), K.c('tbDune'), Math.min(1, lit)), K.c('tbSand'), y / H * 0.3); };
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const a = pts[i][j], b = pts[i + 1][j], c = pts[i + 1][j + 1], d = pts[i][j + 1]; if (a[1] + b[1] + c[1] + d[1] < 0.02) continue; K.tri(B, a, c, b, col(a, c, b), [0, 1, 0]); K.tri(B, a, d, c, col(a, d, c), [0, 1, 0]); }
      return TB.done('dune', P, { collider: { type: 'heightfield', size: [L, H, W] }, cover: false }, { ao: 0.12, dust: 0 });
    } });

  // ---------- صخرة طبقية (غطاء للاختباء) ----------
  TB.def('rock', { name: 'صخرة', nameEn: 'Rock', group: 'tb_land',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['boulder', 'صخرة مفردة'], ['strata', 'صخرة طبقية'], ['cluster', 'مجموعة صخور'], ['slab', 'لوح مائل'], ['arch', 'قوس صخري']], def: 'strata' },
      { key: 'size', label: 'الحجم', min: 0.6, max: 6, step: 0.1, def: 1.8, unit: 'م' }, { key: 'tint', label: 'اللون', type: 'enum', options: [['tbRock', 'بني صخري'], ['tbRockLight', 'رملي فاتح'], ['tbRock2', 'غامق'], ['#8c6a52', 'أحمر صحراوي']], def: 'tbRock' }],
    presets: { 'طبقية': {}, 'مفردة': { kind: 'boulder', size: 1.2 }, 'مجموعة': { kind: 'cluster', size: 2.6 }, 'لوح مائل': { kind: 'slab', size: 2.4 }, 'قوس': { kind: 'arch', size: 5, tint: '#8c6a52' } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, rng = AA.rng(p.seed), B = P('stone'), base = K.c(p.tint);
      const cols = [AA.mixc(base, [0, 0, 0], 0.12), base, AA.mixc(base, [1, 1, 1], 0.12)];
      // كتلة صخرية: مضلع عشوائي مشطوف ببثق، بطبقات تضيق للأعلى
      const layerRock = (cx, cz, r, h, layers, rot) => {
        let y = 0;
        for (let k = 0; k < layers; k++) {
          const n = 6 + Math.floor(rng() * 3), th = h / layers * (0.6 + rng() * 0.8), sc = 1 - (k / layers) ** 1.5 * 0.55 - rng() * 0.1, poly = [];
          for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + (rng() - 0.5) * 0.5, rr = r * sc * (0.6 + rng() * 0.55) * (1 + 0.35 * Math.cos(a)); poly.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.8]); }
          const ox = (rng() - 0.5) * r * 0.35, oz = (rng() - 0.5) * r * 0.3, lr = rot + (rng() - 0.5) * 0.3;
          K.extrude(B, poly, 'y', y, y + th * 0.88, { side: cols[k % 3], cap: AA.mixc(cols[2], [1, 1, 1], 0.06) }, { at: [cx + ox, 0, cz + oz], rot: lr });
          const inset = poly.map(([x, z]) => [x * 0.93, z * 0.93]);
          K.extrude(B, inset, 'y', y + th * 0.88, y + th, cols[0], { at: [cx + ox, 0, cz + oz], rot: lr });
          y += th;
        }
        return y;
      };
      const boulder = (c, r) => LP.ico(B, c, [r, r * 0.72, r * 0.9], 1, d => cols[Math.min(2, Math.max(0, Math.round(1 + d[1] + (rng() - 0.5))))], { shape: d => { const k = 0.85 + 0.25 * TB.hash3(d); return [d[0] * k, Math.max(d[1] * k, -0.35), d[2] * k]; } });
      let H = s;
      if (p.kind === 'strata') H = layerRock(0, 0, s * 0.6, s, 4 + Math.floor(rng() * 2), rng() * 6);
      else if (p.kind === 'boulder') { boulder([0, s * 0.3, 0], s * 0.55); H = s * 0.7; }
      else if (p.kind === 'cluster') { layerRock(0, 0, s * 0.42, s * 0.8, 3, 0); boulder([s * 0.55, s * 0.18, s * 0.25], s * 0.3); boulder([-s * 0.45, s * 0.12, s * 0.35], s * 0.22); boulder([s * 0.15, s * 0.08, -s * 0.5], s * 0.18); H = s * 0.8; }
      else if (p.kind === 'slab') { const poly = [[-s * 0.5, 0], [s * 0.5, 0], [s * 0.42, s * 0.12], [s * 0.1, s * 0.95], [-s * 0.3, s * 0.85], [-s * 0.5, s * 0.25]]; K.extrude(B, poly, 'z', -s * 0.18, s * 0.18, { side: cols[0], cap: cols[1] }, { at: [0, 0, 0], rot: 0.3 }); boulder([s * 0.45, s * 0.12, s * 0.2], s * 0.2); H = s * 0.95; }
      else { for (const sd of [1, -1]) layerRock(sd * s * 0.42, 0, s * 0.2, s * 0.85, 4, rng() * 6); const arch = []; const n = 9; for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; arch.push([Math.cos(a) * s * 0.55, s * 0.75 + Math.sin(a) * s * 0.28]); } for (let i = n; i >= 0; i--) { const a = Math.PI * i / n; arch.push([Math.cos(a) * s * 0.38, s * 0.7 + Math.sin(a) * s * 0.12]); } K.extrude(B, arch, 'z', -s * 0.18, s * 0.18, { side: cols[1], cap: cols[0] }); H = s * 1.05; }
      // حصى حول القاعدة
      for (let i = 0; i < 6; i++) { const a = rng() * Math.PI * 2, d = s * (0.55 + rng() * 0.4); LP.ico(B, [Math.cos(a) * d, 0.03, Math.sin(a) * d], [0.08 + rng() * 0.08, 0.05, 0.08 + rng() * 0.08], 0, () => cols[Math.floor(rng() * 3)]); }
      return TB.done('rock', P, { collider: K.boxCol(s * 1.2, H, s * 1.2), cover: H > 0.9 ? 'full' : 'crouch' }, { ao: 0.25, dust: 0.3 });
    } });

  // ---------- نبات صحراوي جاف ----------
  TB.def('shrub', { name: 'نبات صحراوي', nameEn: 'Desert plant', group: 'tb_land',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['shrub', 'شجيرة جافة'], ['acacia', 'سمرة (أكاسيا)'], ['dead', 'شجرة ميتة'], ['grass', 'عشب جاف'], ['tumble', 'عشبة متدحرجة']], def: 'shrub' }, { key: 'size', label: 'الحجم', min: 0.4, max: 6, step: 0.1, def: 1, unit: 'م' }],
    presets: { 'شجيرة': {}, 'سمرة': { kind: 'acacia', size: 4.5 }, 'ميتة': { kind: 'dead', size: 3 }, 'عشب': { kind: 'grass', size: 0.7 }, 'متدحرجة': { kind: 'tumble', size: 0.8 } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, rng = AA.rng(p.seed), Wd = P('wood'), Lf = P.custom('leaves', LP.mat('leaves', { roughness: 1, doubleSided: true }));
      const twig = (a, dir, len, r, depth) => { const b = V.add(a, V.scale(V.norm(dir), len)); K.cyl(Wd, a, b, r, r * 0.6, 5, depth > 1 ? 'tbBrown' : 'tbWoodDark'); if (depth <= 0) return [b]; let ends = []; const n = 2 + (rng() < 0.4 ? 1 : 0); for (let i = 0; i < n; i++) { const d2 = V.norm(V.add(V.norm(dir), [(rng() - 0.5) * 1.4, 0.25 + rng() * 0.4, (rng() - 0.5) * 1.4])); ends = ends.concat(twig(b, d2, len * 0.68, r * 0.62, depth - 1)); } return ends; };
      const dry = ['#8f8558', '#a39467', '#7a6f48', '#6d7346'];
      if (p.kind === 'shrub') { for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; twig([0, 0, 0], [Math.cos(a) * 0.6, 1, Math.sin(a) * 0.6], s * 0.35, s * 0.025, 2); } for (let i = 0; i < 7; i++) { const a = rng() * Math.PI * 2, d = rng() * s * 0.35; LP.ico(Lf, [Math.cos(a) * d, s * (0.35 + rng() * 0.35), Math.sin(a) * d], [s * 0.22, s * 0.15, s * 0.22], 0, () => K.c(dry[Math.floor(rng() * 4)]), { shape: dd => dd.map(x => x * (0.85 + TB.hash3(dd) * 0.3)) }); } }
      else if (p.kind === 'acacia') { const top = [s * 0.08, s * 0.62, 0]; K.cyl(Wd, [0, 0, 0], top, s * 0.06, s * 0.045, 6, 'tbBrown2'); for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 0.3; const e = V.add(top, [Math.cos(a) * s * 0.42, s * 0.18, Math.sin(a) * s * 0.42]); K.cyl(Wd, top, e, s * 0.035, s * 0.02, 5, 'tbBrown2'); } for (let i = 0; i < 9; i++) { const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * s * 0.5; LP.ico(Lf, [Math.cos(a) * d, s * (0.82 + rng() * 0.06), Math.sin(a) * d], [s * 0.26, s * 0.07, s * 0.26], 0, () => K.c(['#6f7a45', '#5f6a3c', '#7d8650'][Math.floor(rng() * 3)])); } }
      else if (p.kind === 'dead') { twig([0, 0, 0], [0.1, 1, 0.05], s * 0.4, s * 0.05, 3); }
      else if (p.kind === 'grass') { for (let i = 0; i < 18; i++) { const a = rng() * Math.PI * 2, d = rng() * s * 0.35, b = [Math.cos(a) * d, 0, Math.sin(a) * d], t = V.add(b, [(rng() - 0.5) * s * 0.3, s * (0.5 + rng() * 0.5), (rng() - 0.5) * s * 0.3]), w = [0.02 * s, 0, 0]; K.tri(Lf, V.sub(b, w), V.add(b, w), t, dry[Math.floor(rng() * 4)]); } }
      else { for (let i = 0; i < 26; i++) { const a = rng() * Math.PI * 2, e = (rng() - 0.5) * Math.PI, d = [Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)]; K.cyl(Wd, V.add([0, s * 0.45, 0], V.scale(d, s * 0.1)), V.add([0, s * 0.45, 0], V.scale(d, s * 0.45)), s * 0.012, s * 0.006, 4, i % 3 ? '#a0875c' : '#8b744c'); } }
      return TB.done('shrub', P, { collider: p.kind === 'acacia' || p.kind === 'dead' ? { type: 'box', size: [s * 0.12, s * 0.6, s * 0.12], center: [0, s * 0.3, 0] } : null, cover: p.kind === 'shrub' ? 'crouch' : false }, { ao: 0.15, dust: 0.1 });
    } });

  // ---------- أرض: رمل، أرض متشققة، حصى ----------
  TB.def('ground', { name: 'أرضية صحراوية', nameEn: 'Desert ground', group: 'tb_land',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['cracked', 'طين متشقق'], ['gravel', 'حصى'], ['tracks', 'رمل بآثار عجلات'], ['drift', 'كومة رمل']], def: 'cracked' }, { key: 'size', label: 'المقاس', min: 2, max: 20, step: 0.5, def: 6, unit: 'م' }],
    presets: { 'متشقق': {}, 'حصى': { kind: 'gravel' }, 'آثار عجلات': { kind: 'tracks', size: 10 }, 'كومة رمل': { kind: 'drift', size: 3 } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, rng = AA.rng(p.seed), B = P('ground');
      if (p.kind === 'cracked') { const n = Math.round(s / 0.7); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const cx = -s / 2 + (i + 0.5) * s / n + (rng() - 0.5) * 0.2, cz = -s / 2 + (j + 0.5) * s / n + (rng() - 0.5) * 0.2, poly = []; const m = 5 + Math.floor(rng() * 2); for (let k = 0; k < m; k++) { const a = k / m * Math.PI * 2 + rng() * 0.4, r = s / n * (0.5 + rng() * 0.08); poly.push([Math.cos(a) * r, Math.sin(a) * r]); } K.extrude(B, poly, 'y', 0, 0.03 + rng() * 0.03, { side: 'tbSandDark', cap: AA.mixc(K.c('#b39a73'), K.c('#a58a62'), rng()) }, { at: [cx, 0, cz], rot: rng() * 3 }); } K.box(P('dark'), [0, 0.008, 0], [s, 0.016, s], '#5c4a36'); }
      else if (p.kind === 'gravel') { K.box(B, [0, 0.01, 0], [s, 0.02, s], 'tbSand2'); for (let i = 0; i < s * s * 4; i++) LP.ico(P('stone'), [(rng() - 0.5) * s, 0.025, (rng() - 0.5) * s], [0.05 + rng() * 0.06, 0.03, 0.05 + rng() * 0.06], 0, () => K.c(['tbRock', 'tbRockLight', 'tbRock2'][Math.floor(rng() * 3)])); }
      else if (p.kind === 'tracks') { K.box(B, [0, 0.01, 0], [s, 0.02, s], 'tbSand'); for (const x of [-0.85, 0.85]) for (let k = 0; k < Math.round(s / 0.3); k++) K.box(P('dark'), [x + Math.sin(k * 0.2) * 0.1, 0.022, -s / 2 + k * 0.3 + 0.15], [0.3, 0.008, 0.12], 'tbSandDark', null, 0); }
      else { const n = 12, poly = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; poly.push([Math.cos(a) * s / 2 * (0.8 + rng() * 0.3), Math.sin(a) * s / 4 * (0.8 + rng() * 0.3)]); } let y = 0; for (let k = 0; k < 4; k++) { const sc = 1 - k * 0.22, th = s * 0.07; K.extrude(B, poly.map(([x, z]) => [x * sc, z * sc - k * 0.06 * s]), 'y', y, y + th, { side: k % 2 ? 'tbSand2' : 'tbSand', cap: 'tbDune' }); y += th; } }
      return TB.done('ground', P, { top: 0.03, walkable: true }, { ao: 0, dust: 0 });
    } });
})(typeof window !== 'undefined' ? window : globalThis);

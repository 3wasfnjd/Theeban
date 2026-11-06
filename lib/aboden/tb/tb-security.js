// Aboden Assets — theeban/tb-security.js — الأمن والمراقبة: سور أمني، برج مراقبة بسلم فولاذي، كشاف بشعاع، كاميرا مراقبة بمجال رؤية،
// بوابة ونقطة حراسة، ضوء إنذار، عمود إنارة، برج اتصالات بغرفة اتصالات
(function (g) {
  'use strict';
  const AA = g.AA, K = AA.kit, V = AA.v, TB = AA.tb, LP = AA.lp;
  const sh = TB.shade;
  const beamMat = P => P.custom('beam', LP.mat('glass', { roughness: 1, opacity: 0.16, emissive: [0.9, 0.95, 1], glow: 0.35, doubleSided: true, noShadow: true }));

  // ---------- سور أمني ----------
  TB.def('fence', { name: 'سور أمني', nameEn: 'Security fence', group: 'tb_security',
    schema: [{ key: 'length', label: 'الطول', min: 2, max: 16, step: 0.5, def: 6, unit: 'م' }, { key: 'height', label: 'الارتفاع', min: 1.5, max: 4, step: 0.1, def: 2.6, unit: 'م' },
      { key: 'style', label: 'النوع', type: 'enum', options: [['mesh', 'شبك بأسلاك'], ['panel', 'ألواح صاج'], ['concrete', 'جدار خرساني'], ['broken', 'شبك مقطوع (ثغرة)']], def: 'mesh' }, { key: 'sign', label: 'لوحة تحذير', type: 'bool', def: true }],
    presets: { 'شبك': {}, 'صاج': { style: 'panel' }, 'خرساني': { style: 'concrete', height: 3 }, 'ثغرة': { style: 'broken' } },
    generate: (p, q) => {
      const P = K.parts(), L = p.length, H = p.height, M = P('metal'), n = Math.max(1, Math.round(L / 2.5)), rng = AA.rng(p.seed);
      if (p.style === 'concrete') {
        for (let i = 0; i < n; i++) { const x = -L / 2 + L * (i + 0.5) / n, w = L / n - 0.04; TB.box(P('stone'), [x, H / 2, 0], [w, H, 0.28], rng() < 0.4 ? 'tbConcrete2' : 'tbConcrete', 0.04); TB.box(P('stone'), [x, H + 0.06, 0], [w + 0.02, 0.12, 0.34], 'tbConcreteLight', 0.03); for (let k = 0; k < 3; k++) K.box(P('dark'), [x - w / 2 + 0.3 + rng() * (w - 0.6), 0.2 + rng() * (H - 0.6), 0.142], [0.02 + rng() * 0.02, 0.3 + rng() * 0.5, 0.004], 'tbConcreteDark', null, (rng() - 0.5) * 0.6); TB.box(P('stone'), [x, 0.12, 0], [w, 0.24, 0.36], 'tbConcrete2', 0.03); }
      } else {
        for (let i = 0; i <= n; i++) { const x = -L / 2 + L * i / n; TB.box(M, [x, H / 2, 0], [0.09, H, 0.09], 'tbSteel2', 0.015); TB.box(P('stone'), [x, 0.12, 0], [0.3, 0.24, 0.3], 'tbConcrete', 0.03); K.cyl(M, [x, H, 0], [x, H + 0.45, -0.28], 0.025, 0.025, 6, 'tbSteel2'); }
        for (const y of [0.15, H - 0.05]) TB.box(M, [0, y, 0], [L, 0.05, 0.05], 'tbSteel', 0.01);
        for (const k of [0.15, 0.3, 0.45]) K.cyl(M, [-L / 2, H + k * 0.85, -k * 0.6], [L / 2, H + k * 0.85, -k * 0.6], 0.006, 0.006, 3, 'tbSteel');
        if (p.style === 'panel') for (let i = 0; i < Math.round(L / 1.0); i++) { const w = L / Math.round(L / 1.0), x = -L / 2 + w * (i + 0.5); TB.box(M, [x, H / 2 + 0.05, 0.05], [w - 0.03, H - 0.25, 0.03], i % 3 === 1 ? 'tbRust2' : 'tbSteel', 0.01); for (let k = 1; k < 5; k++) K.box(M, [x - w / 2 + w * k / 5, H / 2 + 0.05, 0.068], [0.03, H - 0.3, 0.01], 'tbSteel2'); }
        else {
          const mesh = P.custom('mesh', LP.mat('metal', { metalness: 0.5, roughness: 0.5, opacity: 0.55, doubleSided: true }));
          if (p.style === 'broken') { const gx = (rng() - 0.5) * L * 0.4; for (const [a, b] of [[-L / 2, gx - 0.5], [gx + 0.5, L / 2]]) if (b - a > 0.05) K.box(mesh, [(a + b) / 2, H / 2 + 0.05, 0.03], [b - a, H - 0.2, 0.008], 'tbSteel'); K.quad(mesh, [gx - 0.5, 0.95, 0.03], [gx + 0.5, 0.95, 0.03], [gx + 0.5, H - 0.15, 0.03], [gx - 0.5, H - 0.15, 0.03], 'tbSteel', [0, 0, 1]); K.quad(mesh, [gx - 0.5, 0.15, 0.03], [gx, 0.1, 0.55], [gx + 0.1, 0.95, 0.45], [gx - 0.5, 0.95, 0.03], 'tbSteel', [0, 0, 1]); }
          else K.box(mesh, [0, H / 2 + 0.05, 0.03], [L, H - 0.2, 0.008], 'tbSteel');
        }
        TB.wire(M, -L / 2, L / 2, H + 0.3, -0.2, 0.16);
      }
      if (p.sign) { const x = -L / 2 + 1.0; TB.box(P('paint'), [x, 1.5, 0.12], [0.6, 0.42, 0.02], 'tbYellow', 0.008); K.tri(P('stone'), [x - 0.13, 1.39, 0.132], [x + 0.13, 1.39, 0.132], [x, 1.62, 0.132], 'tbBlack', [0, 0, 1]); K.box(P('stone'), [x, 1.5, 0.133], [0.025, 0.09, 0.004], 'tbYellow'); TB.logo(P('stone'), [x + 0.5, 1.5, 0.11], 0.18, 'tbRawafid'); }
      return TB.done('fence', P, { collider: K.boxCol(L, H + 0.5, 0.4), gap: p.style === 'broken' ? 'crawl' : null, snap: { length: L } });
    } });

  // ---------- برج مراقبة ----------
  TB.def('watch_tower', { name: 'برج مراقبة', nameEn: 'Watch tower', group: 'tb_security',
    schema: [{ key: 'height', label: 'ارتفاع الكابينة', min: 3, max: 12, step: 0.5, def: 6.5, unit: 'م' }, { key: 'cabin', label: 'الكابينة', type: 'enum', options: [['closed', 'مغلقة بزجاج'], ['open', 'مفتوحة بسقف'], ['ruined', 'مهجورة']], def: 'closed' },
      { key: 'light', label: 'كشاف', type: 'bool', def: true }, TB.stateOpt('calm'), { key: 'color', label: 'اللون', type: 'enum', options: [['tbSteel', 'رمادي'], ['tbOlive', 'زيتي'], ['tbRust', 'صدئ'], ['tbPaint', 'فاتح']], def: 'tbSteel' }],
    presets: { 'مغلقة': {}, 'مفتوحة': { cabin: 'open', height: 5, color: 'tbOlive' }, 'مهجورة صدئة': { cabin: 'ruined', color: 'tbRust', light: false, state: 'off' }, 'إنذار': { state: 'alarm' } },
    generate: (p, q) => {
      const P = K.parts(), H = p.height, M = P('metal'), W0 = 3.0, W1 = 2.2, c = p.color, dk = sh(c, 0.3), rng = AA.rng(p.seed);
      const leg = (sx, sz, y) => { const t = y / H, w = (W0 + (W1 - W0) * t) / 2; return [sx * w, y, sz * w]; };
      for (const sx of [1, -1]) for (const sz of [1, -1]) { K.cyl(M, leg(sx, sz, 0), leg(sx, sz, H), 0.08, 0.07, 6, c); TB.box(P('stone'), [sx * W0 / 2, 0.15, sz * W0 / 2], [0.45, 0.3, 0.45], 'tbConcrete', 0.04); }
      const seg = Math.max(2, Math.round(H / 2.2));
      for (let i = 0; i < seg; i++) { const y0 = 0.4 + (H - 0.4) * i / seg, y1 = 0.4 + (H - 0.4) * (i + 1) / seg; for (const [a, b] of [[[1, 1], [-1, 1]], [[1, -1], [-1, -1]], [[1, 1], [1, -1]], [[-1, 1], [-1, -1]]]) { K.cyl(M, leg(a[0], a[1], y0), leg(b[0], b[1], y1), 0.03, 0.03, 4, dk); K.cyl(M, leg(b[0], b[1], y0), leg(a[0], a[1], y1), 0.03, 0.03, 4, dk); K.cyl(M, leg(a[0], a[1], y1), leg(b[0], b[1], y1), 0.035, 0.035, 4, c); } }
      // أرضية الكابينة
      const CW = W1 + 0.9; TB.box(M, [0, H + 0.08, 0], [CW, 0.16, CW], sh(c, 0.15), 0.03);
      for (let k = -2; k <= 2; k++) K.box(M, [k * CW / 5, H - 0.02, 0], [0.05, 0.12, CW], dk);
      // الكابينة
      const ch = 2.3, y0 = H + 0.16;
      if (p.cabin === 'closed' || p.cabin === 'ruined') {
        for (const [rot] of [[0], [Math.PI / 2], [Math.PI], [-Math.PI / 2]]) { const o = { at: [0, y0, 0], rot }; TB.box(M, [0, 0.5, CW / 2 - 0.05], [CW, 1.0, 0.08], c, 0.02, o); TB.box(M, [0, ch - 0.15, CW / 2 - 0.05], [CW, 0.3, 0.08], c, 0.02, o); for (const s of [1, -1]) TB.box(M, [s * (CW / 2 - 0.06), ch / 2, CW / 2 - 0.05], [0.12, ch, 0.1], sh(c, 0.1), 0.02, o);
          if (p.cabin === 'closed' || rng() < 0.5) K.box(P('glass'), [0, 1.42, CW / 2 - 0.06], [CW - 0.2, 0.84, 0.02], 'glassDark', o); else for (let k = 0; k < 3; k++) K.tri(P('glass'), [-CW / 2 + 0.1 + k * 0.5, 1.0, CW / 2 - 0.06], [-CW / 2 + 0.5 + k * 0.5, 1.0, CW / 2 - 0.06], [-CW / 2 + 0.25 + k * 0.5, 1.3 + rng() * 0.3, CW / 2 - 0.06], 'glassDark', [0, 0, 1], o); }
        TB.box(M, [0, y0 + ch + 0.08, 0], [CW + 0.5, 0.16, CW + 0.5], dk, 0.04); TB.box(M, [0, y0 + ch + 0.22, 0], [CW - 0.4, 0.12, CW - 0.4], sh(dk, 0.2), 0.03);
        TB.box(P('wood'), [0, y0 + 0.75, -CW / 2 + 0.35], [1.2, 0.06, 0.5], 'tbWoodDark', 0.01);
      } else {
        for (const [rot] of [[0], [Math.PI / 2], [Math.PI], [-Math.PI / 2]]) { const o = { at: [0, y0, 0], rot }; K.cyl(M, [-CW / 2, 1.0, CW / 2 - 0.05], [CW / 2, 1.0, CW / 2 - 0.05], 0.035, 0.035, 6, c, o); K.cyl(M, [-CW / 2, 0.5, CW / 2 - 0.05], [CW / 2, 0.5, CW / 2 - 0.05], 0.025, 0.025, 6, c, o); }
        for (const sx of [1, -1]) for (const sz of [1, -1]) K.cyl(M, [sx * (CW / 2 - 0.05), y0, sz * (CW / 2 - 0.05)], [sx * (CW / 2 - 0.05), y0 + ch, sz * (CW / 2 - 0.05)], 0.05, 0.05, 6, c);
        K.extrude(M, [[-CW / 2 - 0.3, 0], [CW / 2 + 0.3, 0], [CW / 2 + 0.3, 0.08], [0, 0.6], [-CW / 2 - 0.3, 0.08]], 'z', -CW / 2 - 0.3, CW / 2 + 0.3, { side: dk, cap: sh(dk, 0.1) }, { at: [0, y0 + ch, 0] });
      }
      // سلّم فولاذي بقفص (للتسلق)
      const lad = TB.ladder(M, 0, CW / 2 + 0.05, 0, H + 0.16, 0.5, 'tbSteel2', null, true);
      if (p.light) { const at = [CW / 2 - 0.25, y0 + ch + 0.4, CW / 2 - 0.25]; K.cyl(M, V.add(at, [0, -0.25, 0]), at, 0.04, 0.04, 6, 'tbGunmetal'); K.cyl(M, V.add(at, [0, 0.05, -0.2]), V.add(at, [0, 0.05, 0.2]), 0.2, 0.24, 10, 'tbGunmetal'); K.cyl(P('lamp'), V.add(at, [0, 0.05, 0.2]), V.add(at, [0, 0.05, 0.22]), 0.2, 0.2, 10, 'white'); }
      TB.stateLamp(P, [-CW / 2 + 0.2, y0 + ch + 0.35, CW / 2 - 0.2], 0.09, p.state);
      return TB.done('watch_tower', P, { collider: K.boxCol(W0 + 0.4, H + ch + 0.6, W0 + 0.4), ladder: lad, lookout: [0, y0, 0], light: p.light ? { at: [CW / 2 - 0.25, y0 + ch + 0.45, CW / 2], color: [0.85, 0.92, 1], intensity: 3, distance: 22 } : null }, { ao: 0.2, dust: 0.25 });
    } });

  // ---------- كشاف بشعاع ----------
  TB.def('searchlight', { name: 'كشاف دوّار', nameEn: 'Searchlight', group: 'tb_security',
    schema: [{ key: 'aim', label: 'زاوية الميل للأسفل', min: 5, max: 60, step: 5, def: 25, unit: '°' }, { key: 'beam', label: 'شعاع ظاهر', type: 'bool', def: true }, { key: 'reach', label: 'مدى الشعاع', min: 4, max: 30, step: 1, def: 14, unit: 'م' }, { key: 'height', label: 'ارتفاع العمود', min: 0.5, max: 6, step: 0.5, def: 3.5, unit: 'م' }, { key: 'sweep', label: 'يدور', type: 'bool', def: true }],
    presets: { 'على عمود': {}, 'أرضي': { height: 0.5, aim: 5, reach: 10 }, 'ثابت': { sweep: false } },
    generate: (p, q) => {
      const P = K.parts(), H = p.height, a = p.aim * Math.PI / 180, R = p.reach, n = K.sides(q, 12);
      TB.box(P('stone'), [0, 0.1, 0], [0.7, 0.2, 0.7], 'tbConcrete', 0.03); if (H > 0.6) TB.cyl(P('metal'), [0, 0.2, 0], [0, H, 0], 0.08, 'tbSteel2', 8);
      const head = p.sweep ? P.custom('head', LP.mat('metal', { metalness: 0.5, roughness: 0.4, rotor: { pivot: [0, 0, 0], axis: 'y', speed: 0.45 } })) : P('metal');
      const c = [0, H + 0.35, 0], d = [0, -Math.sin(a), Math.cos(a)];
      TB.box(head, [0, H + 0.08, 0], [0.5, 0.12, 0.3], 'tbGunmetal', 0.02); for (const s of [1, -1]) TB.box(head, [s * 0.32, H + 0.3, 0], [0.06, 0.45, 0.12], 'tbGunmetal', 0.015);
      K.cyl(head, V.madd(c, d, -0.35), V.madd(c, d, 0.3), 0.26, 0.3, n, 'tbSteel2'); K.cyl(head, V.madd(c, d, -0.45), V.madd(c, d, -0.35), 0.15, 0.24, n, 'tbGunmetal');
      const lens = p.sweep ? P.custom('lens', LP.mat('lamp', { emissive: [1, 0.97, 0.88], glow: 1.6, rotor: { pivot: [0, 0, 0], axis: 'y', speed: 0.45 } })) : P('lamp');
      K.cyl(lens, V.madd(c, d, 0.3), V.madd(c, d, 0.32), 0.27, 0.27, n, 'white');
      if (p.beam) { const B = p.sweep ? P.custom('beamS', LP.mat('glass', { roughness: 1, opacity: 0.14, emissive: [0.9, 0.95, 1], glow: 0.3, doubleSided: true, noShadow: true, rotor: { pivot: [0, 0, 0], axis: 'y', speed: 0.45 } })) : beamMat(P); const Lb = Math.max(1, Math.min(R, (c[1] + 0.3) / (Math.sin(a) + Math.tan(0.16) * Math.cos(a)))); K.cyl(B, V.madd(c, d, 0.33), V.madd(c, d, Lb), 0.27, Math.tan(0.16) * Lb, n, 'white', null, { noCaps: true }); }
      return TB.done('searchlight', P, { collider: K.boxCol(0.7, H + 0.7, 0.7), light: { at: V.madd(c, d, 0.5), color: [1, 0.97, 0.88], intensity: 3, distance: R }, beam: { dir: d, reach: R, cone: 0.16 } });
    } });

  // ---------- كاميرا مراقبة ----------
  TB.def('camera', { name: 'كاميرا مراقبة', nameEn: 'Security camera', group: 'tb_security',
    schema: [{ key: 'mount', label: 'التثبيت', type: 'enum', options: [['wall', 'على جدار'], ['pole', 'على عمود'], ['ceiling', 'سقف (قبة)']], def: 'wall' }, { key: 'cone', label: 'مجال الرؤية ظاهر', type: 'bool', def: true }, { key: 'range', label: 'المدى', min: 3, max: 15, step: 0.5, def: 7, unit: 'م' }, TB.stateOpt('calm'), { key: 'sweep', label: 'تتحرك يمين ويسار', type: 'bool', def: true }],
    presets: { 'جدارية': {}, 'عمود': { mount: 'pole' }, 'قبة سقف': { mount: 'ceiling', cone: false }, 'إنذار': { state: 'alarm' }, 'معطلة بالعازل': { state: 'off', cone: false } },
    generate: (p, q) => {
      const P = K.parts(), n = K.sides(q, 10), R = p.range;
      const col = p.state === 'alarm' ? [1, 0.2, 0.15] : p.state === 'suspect' ? [1, 0.75, 0.15] : [0.2, 1, 0.5];
      let base = [0, 2.8, 0];
      if (p.mount === 'pole') { TB.box(P('stone'), [0, 0.1, 0], [0.5, 0.2, 0.5], 'tbConcrete', 0.03); TB.cyl(P('metal'), [0, 0.2, 0], [0, 3.6, 0], 0.06, 'tbSteel2', 8); base = [0, 3.5, 0.05]; K.cyl(P('metal'), [0, 3.5, 0], [0, 3.5, 0.3], 0.03, 0.03, 6, 'tbSteel2'); base = [0, 3.5, 0.3]; }
      else if (p.mount === 'wall') { TB.box(P('metal'), [0, 2.8, 0.03], [0.18, 0.24, 0.06], 'tbPaint', 0.01); K.cyl(P('metal'), [0, 2.8, 0.06], [0, 2.8, 0.3], 0.03, 0.03, 6, 'tbPaint'); base = [0, 2.8, 0.3]; }
      if (p.mount === 'ceiling') { K.cyl(P('metal'), [0, 3.0, 0], [0, 2.98, 0], 0.16, 0.16, n, 'tbPaint'); K.ball(P('glassSolid'), [0, 2.97, 0], [0.14, 0.11, 0.14], 'tbBlack', null, 1, d => d[1] < 0.05); TB.stateLamp(P, [0.12, 2.94, 0], 0.015, p.state); return TB.done('camera', P, { sensor: { at: [0, 2.9, 0], range: R, fov: 360 } }, { ao: 0, dust: 0 }); }
      const head = P('plastic');
      const d = V.norm([0, -0.35, 1]);
      TB.box(head, V.add(base, [0, 0.05, 0.12]), [0.16, 0.14, 0.38], 'tbPaint', 0.03); TB.box(head, V.add(base, [0, 0.13, 0.15]), [0.2, 0.025, 0.46], 'tbPaint', 0.01);
      K.cyl(head, V.add(base, [0, 0.05, 0.31]), V.add(base, [0, 0.05, 0.33]), 0.05, 0.05, n, 'tbBlack'); K.ball(P('lamp'), V.add(base, [0, 0.05, 0.33]), 0.025, 'tbTeal');
      TB.stateLamp(P, V.add(base, [0.06, 0.1, 0.32]), 0.014, p.state);
      if (p.cone && p.state !== 'off') { const C = P.custom('cone', LP.mat('glass', { roughness: 1, opacity: 0.16, emissive: col, glow: 0.4, doubleSided: true, noShadow: true })), o0 = V.add(base, [0, 0.05, 0.34]), sa = -d[1], ca = Math.hypot(d[0], d[2]), Lc = Math.max(0.8, Math.min(R, (o0[1] + 0.3) / (sa + Math.tan(0.42) * 1.4 * ca))); K.cyl(C, o0, V.madd(o0, d, Lc), 0.02, Math.tan(0.42) * Lc, 4, AA.mixc(col, [1, 1, 1], 0.2), null, { noCaps: true, rot: Math.PI / 4, sx: 1.4 }); }
      return TB.done('camera', P, { sensor: { at: V.add(base, [0, 0.05, 0.34]), dir: d, range: R, fov: 48, sweep: p.sweep ? 0.8 : 0 } }, { ao: 0, dust: 0 });
    } });

  // ---------- بوابة ونقطة حراسة ----------
  TB.def('gate', { name: 'بوابة ونقطة حراسة', nameEn: 'Gate & guard post', group: 'tb_security',
    schema: [{ key: 'width', label: 'عرض البوابة', min: 3, max: 8, step: 0.5, def: 5, unit: 'م' }, { key: 'open', label: 'فتح البوابة', min: 0, max: 1, step: 0.05, def: 0 }, { key: 'booth', label: 'كشك الحارس', type: 'bool', def: true }, TB.stateOpt('calm')],
    presets: { 'مغلقة': {}, 'مفتوحة': { open: 1 }, 'إنذار': { state: 'alarm', open: 0 } },
    generate: (p, q) => {
      const P = K.parts(), Wd = p.width, H = 2.6, M = P('metal');
      for (const s of [1, -1]) { TB.box(P('stone'), [s * (Wd / 2 + 0.35), H / 2 + 0.2, 0], [0.6, H + 0.4, 0.6], 'tbConcrete', 0.05); TB.box(P('stone'), [s * (Wd / 2 + 0.35), H + 0.45, 0], [0.7, 0.1, 0.7], 'tbConcreteLight', 0.03); TB.stateLamp(P, [s * (Wd / 2 + 0.35), H + 0.6, 0], 0.08, p.state); }
      // بوابة منزلقة
      const gate = P.custom('gate', LP.mat('metal', { metalness: 0.5, roughness: 0.45 })), sl = p.open * (Wd + 0.2);
      const gx = -sl; TB.box(gate, [gx, H / 2 + 0.1, -0.15], [Wd, 0.08, 0.06], 'tbSteel', 0.01);
      for (const y of [0.15, H]) TB.box(gate, [gx, y, -0.15], [Wd, 0.08, 0.08], 'tbSteel2', 0.01);
      for (let k = 0; k <= Math.round(Wd / 0.18); k++) K.box(gate, [gx - Wd / 2 + k * Wd / Math.round(Wd / 0.18), H / 2 + 0.07, -0.15], [0.03, H - 0.15, 0.03], 'tbSteel');
      K.cyl(gate, [gx - Wd / 2, 0.15, -0.15], [gx + Wd / 2, H, -0.15], 0.025, 0.025, 4, 'tbSteel2'); for (const x of [gx - Wd / 2 + 0.3, gx + Wd / 2 - 0.3]) K.cyl(P('rubber'), [x, 0.06, -0.2], [x, 0.06, -0.1], 0.07, 0.07, 8, 'tbRubber');
      TB.box(P('metal'), [-Wd / 2 - 0.9, 0.04, -0.15], [Wd + 1.0, 0.08, 0.12], 'tbSteel2', 0.01);
      TB.box(P('paint'), [gx + 0.6, 1.4, -0.11], [0.8, 0.55, 0.02], 'tbWhite', 0.008); TB.logo(P('stone'), [gx + 0.6, 1.4, -0.1], 0.2, 'tbRawafid');
      if (p.booth) {
        const bx = Wd / 2 + 2.2, o = { at: [bx, 0, 0.8], rot: 0 };
        TB.box(P('stone'), [0, 0.1, 0], [2.4, 0.2, 2.4], 'tbConcrete', 0.04, o);
        TB.box(P('paint'), [0, 0.2 + 0.5, 0], [2.0, 1.0, 2.0], 'tbPaint', 0.04, o);
        for (const s of [1, -1]) for (const t of [1, -1]) TB.box(P('paint'), [s * 0.95, 1.65, t * 0.95], [0.12, 0.9, 0.12], 'tbPaint', 0.02, o);
        K.box(P('glass'), [0, 1.65, 0], [1.86, 0.86, 1.86], 'glassDark', o); TB.box(P('paint'), [0, 2.2, 0], [2.0, 0.2, 2.0], 'tbPaint', 0.03, o); TB.box(P('metal'), [0, 2.38, 0], [2.4, 0.15, 2.4], 'tbSteel2', 0.04, o);
        TB.box(P('lamp'), [0, 2.29, 1.02], [0.6, 0.05, 0.04], 'white', 0, o); K.acInto(P, [bx - 1.25, 0.9, 0.8], -Math.PI / 2);
        TB.box(P('wood'), [0, 1.18, 0.7], [1.6, 0.05, 0.4], 'tbWoodDark', 0.01, o);
      }
      // حاجز خرساني ومطب
      for (const x of [-Wd / 2 - 2, Wd / 2 + 4.2]) { const o = { at: [x, 0, 3], rot: Math.PI / 2 }; K.extrude(P('stone'), [[-0.35, 0], [0.35, 0], [0.12, 0.25], [0.1, 0.8], [-0.1, 0.8], [-0.12, 0.25]], 'x', -1.0, 1.0, { side: 'tbConcrete', cap: 'tbConcrete2' }, o); for (const k of [-0.5, 0.5]) K.box(P('stone'), [k, 0.55, 0.115], [0.3, 0.15, 0.01], 'tbRed', o); }
      return TB.done('gate', P, { collider: K.boxCol(Wd + 1.4, H, 0.4), passage: { at: [0, 0, 0], width: Wd, open: p.open } });
    } });

  // ---------- ضوء إنذار ----------
  TB.def('alarm', { name: 'ضوء إنذار', nameEn: 'Alarm beacon', group: 'tb_security',
    schema: [TB.stateOpt('alarm'), { key: 'mount', label: 'التثبيت', type: 'enum', options: [['wall', 'جدار'], ['pole', 'عمود'], ['ceiling', 'سقف']], def: 'wall' }, { key: 'siren', label: 'صفارة', type: 'bool', def: true }],
    presets: { 'إنذار': {}, 'مشتبه': { state: 'suspect' }, 'هادئ': { state: 'calm', siren: false }, 'على عمود': { mount: 'pole' } },
    generate: (p, q) => {
      const P = K.parts(), n = K.sides(q, 10), nm = p.state === 'alarm' ? 'sigRed' : p.state === 'suspect' ? 'sigAmber' : p.state === 'calm' ? 'sigGreen' : 'dark';
      let at = [0, 2.6, 0.12];
      if (p.mount === 'pole') { TB.cyl(P('metal'), [0, 0, 0], [0, 3.2, 0], 0.06, 'tbSteel2', 8); at = [0, 3.2, 0]; }
      else if (p.mount === 'wall') { TB.box(P('metal'), [0, 2.6, 0.04], [0.2, 0.2, 0.08], 'tbGunmetal', 0.015); K.box(P('metal'), [0, 2.6, 0.1], [0.06, 0.06, 0.1], 'tbGunmetal'); at = [0, 2.56, 0.18]; }
      else at = [0, 2.85, 0];
      const up = p.mount === 'ceiling' ? -1 : 1;
      K.cyl(P('metal'), at, V.add(at, [0, up * 0.06, 0]), 0.1, 0.1, n, 'tbGunmetal');
      const L = P.custom('beacon', LP.mat(nm === 'dark' ? 'dark' : 'lamp', nm === 'dark' ? {} : { emissive: p.state === 'alarm' ? [1, 0.1, 0.06] : p.state === 'suspect' ? [1, 0.65, 0.08] : [0.15, 1, 0.45], glow: 1.8, rotor: { pivot: [at[0], 0, at[2]], axis: 'y', speed: 6 } }));
      K.cyl(L, V.add(at, [0, up * 0.06, 0]), V.add(at, [0, up * 0.22, 0]), 0.085, 0.07, n, p.state === 'off' ? 'tbBlack' : 'white'); K.ball(L, V.add(at, [0, up * 0.22, 0]), [0.07, 0.04, 0.07], 'white');
      if (p.siren) { TB.box(P('metal'), V.add(at, [0.22, up * 0.05, 0]), [0.14, 0.14, 0.14], 'tbGunmetal', 0.02); K.cyl(P('metal'), V.add(at, [0.22, up * 0.05, 0.07]), V.add(at, [0.22, up * 0.05, 0.14]), 0.05, 0.08, 8, 'tbGunmetal'); }
      return TB.done('alarm', P, { light: p.state === 'off' ? null : { at: V.add(at, [0, up * 0.15, 0.1]), color: p.state === 'alarm' ? [1, 0.15, 0.1] : p.state === 'suspect' ? [1, 0.7, 0.15] : [0.2, 1, 0.5], intensity: 1.5, distance: 7 } }, { ao: 0, dust: 0 });
    } });

  // ---------- عمود إنارة صناعي ----------
  TB.def('floodlight', { name: 'عمود إنارة', nameEn: 'Floodlight pole', group: 'tb_security',
    schema: [{ key: 'height', label: 'الارتفاع', min: 3, max: 14, step: 0.5, def: 8, unit: 'م' }, { key: 'heads', label: 'الكشافات', min: 1, max: 4, step: 1, def: 2 }, { key: 'tone', label: 'لون الضوء', type: 'enum', options: [['warm', 'صوديوم دافئ'], ['cool', 'أبيض بارد'], ['teal', 'فيروزي تقني']], def: 'warm' }, { key: 'on', label: 'مضاء', type: 'bool', def: true }],
    presets: { 'دافئ': {}, 'بارد عالي': { tone: 'cool', height: 12, heads: 4 }, 'تقني': { tone: 'teal', height: 5, heads: 1 }, 'مطفأ': { on: false } },
    generate: (p, q) => {
      const P = K.parts(), H = p.height, col = p.tone === 'warm' ? [1, 0.72, 0.38] : p.tone === 'teal' ? [0.18, 0.88, 0.82] : [0.86, 0.93, 1];
      TB.box(P('stone'), [0, 0.2, 0], [0.7, 0.4, 0.7], 'tbConcrete', 0.04); TB.cyl(P('metal'), [0, 0.4, 0], [0, H, 0], 0.11, 'tbSteel2', 10); K.cyl(P('metal'), [0, H * 0.5, 0], [0, 0.4, 0], 0.1, 0.14, 10, 'tbSteel2');
      TB.box(P('metal'), [0, 1.2, 0.13], [0.22, 0.36, 0.08], 'tbGunmetal', 0.01); TB.box(P('metal'), [0, H + 0.05, 0], [1.4, 0.08, 0.1], 'tbGunmetal', 0.01);
      const L = p.on ? P.custom('flood', LP.mat('lamp', { emissive: col, glow: 1.5 })) : P('dark');
      for (let k = 0; k < p.heads; k++) { const x = p.heads === 1 ? 0 : -0.6 + 1.2 * k / (p.heads - 1); TB.box(P('metal'), [x, H + 0.25, 0.08], [0.3, 0.3, 0.14], 'tbGunmetal', 0.02, null, 0); K.box(L, [x, H + 0.25, 0.155], [0.25, 0.25, 0.01], p.on ? 'white' : 'tbBlack', null); }
      return TB.done('floodlight', P, { collider: K.boxCol(0.7, H + 0.4, 0.7), light: p.on ? { at: [0, H, 0.6], color: col, intensity: 3.2, distance: H * 2.6 } : null });
    } });

  // ---------- برج اتصالات وغرفة الاتصالات ----------
  TB.def('comms_tower', { name: 'برج اتصالات', nameEn: 'Comms tower', group: 'tb_security',
    schema: [{ key: 'height', label: 'ارتفاع البرج', min: 8, max: 40, step: 1, def: 20, unit: 'م' }, { key: 'shelter', label: 'غرفة الاتصالات', type: 'bool', def: true }, { key: 'dishes', label: 'الصحون', min: 0, max: 4, step: 1, def: 2 }, { key: 'door', label: 'فتح باب الغرفة', min: 0, max: 1, step: 0.05, def: 0 }, { key: 'worn', label: 'مهجور جزئياً', type: 'bool', def: true }],
    presets: { 'المهمة الأولى': {}, 'عين الصحراء': { height: 34, dishes: 4, worn: false }, 'صغير': { height: 10, dishes: 1, shelter: false } },
    generate: (p, q) => {
      const P = K.parts(), H = p.height, M = P('metal'), rng = AA.rng(p.seed), w0 = 2.0, w1 = 0.7, c = p.worn ? 'tbRust' : 'tbSteel', c2 = p.worn ? 'tbRust2' : 'tbSteel2';
      const at = (sx, sz, y) => { const w = w0 + (w1 - w0) * y / H; return [sx * w / 2, y, sz * w / 2]; };
      const cs = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
      TB.box(P('stone'), [0, 0.2, 0], [w0 + 0.8, 0.4, w0 + 0.8], 'tbConcrete', 0.05);
      for (const [sx, sz] of cs) K.cyl(M, at(sx, sz, 0.4), at(sx, sz, H), 0.06, 0.045, 5, c);
      const seg = Math.round(H / 1.8);
      for (let i = 0; i < seg; i++) { const y0 = 0.4 + (H - 0.4) * i / seg, y1 = 0.4 + (H - 0.4) * (i + 1) / seg; for (let k = 0; k < 4; k++) { const [a, b] = [cs[k], cs[(k + 1) % 4]]; K.cyl(M, at(a[0], a[1], y0), at(b[0], b[1], y1), 0.022, 0.022, 4, c2); K.cyl(M, at(a[0], a[1], y1), at(b[0], b[1], y1), 0.025, 0.025, 4, c); } }
      K.cyl(M, [0, H, 0], [0, H + 3, 0], 0.05, 0.02, 6, c2); TB.stateLamp(P, [0, H + 3.05, 0], 0.08, 'alarm');
      for (let k = 0; k < p.dishes; k++) { const y = H * (0.5 + 0.13 * k), a = k * 1.9 + 0.3, d = [Math.cos(a), 0, Math.sin(a)], c0 = V.add([0, y, 0], V.scale(d, (w0 + (w1 - w0) * y / H) / 2 + 0.15)); K.cyl(P('paint'), c0, V.add(c0, V.scale(d, 0.3)), 0.06, 0.55, 12, 'tbWhite'); K.cyl(P('metal'), V.add(c0, V.scale(d, 0.3)), V.add(c0, V.scale(d, 0.75)), 0.015, 0.015, 4, 'tbSteel2'); }
      for (let k = 0; k < 3; k++) { const y = H * (0.7 + 0.08 * k), a = k * 2.1; TB.box(P('paint'), V.add([0, y, 0], [Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55]), [0.18, 1.2, 0.08], 'tbWhite', 0.02, { at: [0, 0, 0], rot: -a }); }
      // سلّم داخلي حتى منتصف البرج
      TB.ladder(M, 0, 0, 0.4, H * 0.92, 0.45, c2, null, false);
      let door = null;
      if (p.shelter) {
        const o = { at: [w0 + 3.2, 0, 0], rot: -Math.PI / 2 };
        TB.box(P('stone'), [0, 0.15, 0], [4.4, 0.3, 3.4], 'tbConcrete', 0.05, o);
        TB.box(P('stone'), [0, 1.65, 0], [4.0, 2.7, 3.0], p.worn ? 'tbConcrete2' : 'tbPaint', 0.08, o); TB.box(P('stone'), [0, 3.08, 0], [4.3, 0.2, 3.3], 'tbConcreteDark', 0.05, o);
        TB.seams(P('stone'), [0, 1.65, 1.505], 4.0, 2.7, 'x', 4, 'tbConcreteDark', o);
        const dv = P.custom('shelterDoor', LP.mat('metal', { metalness: 0.45, roughness: 0.5, hinge: { pivot: K.X([-0.5, 0, 1.52], o), axis: 'y' } }));
        K.box(P('dark'), [0, 1.3, 1.505], [0.98, 2.0, 0.01], '#0d1014', o);
        const da = -p.door * 1.6, hp = [-0.5, 0, 1.52];
        TB.box(dv, [0, 0, 0], [0.96, 2.0, 0.06], 'tbSteel2', 0.015, { at: K.X(V.add(hp, [Math.cos(da) * 0.48, 1.3, -Math.sin(da) * 0.48]), o), rot: o.rot + da });
        TB.box(P('paint'), [0.9, 1.45, 1.52], [0.2, 0.3, 0.04], 'tbGunmetal', 0.01, o); K.box(P('screen'), [0.9, 1.5, 1.545], [0.12, 0.1, 0.01], 'white', o); TB.stateLamp(P, [0.9, 1.36, 1.545], 0.02, 'alarm', o);
        TB.sign(P, 'COMMS', [0, 2.6, 1.52], 0.05, 'tbRawafid', 'tbWhite', o);
        K.acInto(P, K.X([1.2, 0.3, -1.75], o), o.rot + Math.PI);
        for (let k = 0; k < 3; k++) K.cyl(P('rubber'), K.X([-1.5 + k * 0.15, 3.1, 0], o), at(1, 1, 3 + k * 0.6), 0.025, 0.025, 4, 'tbRubber');
        door = K.X([0, 0, 1.9], o);
      }
      return TB.done('comms_tower', P, { collider: K.boxCol(w0 + 0.8, H + 3, w0 + 0.8), ladder: { bottom: [0, 0.4, 0.35], top: [0, H * 0.92, 0] }, door, objective: p.shelter ? 'recorder' : null }, { ao: 0.2, dust: 0.3 });
    } });
})(typeof window !== 'undefined' ? window : globalThis);

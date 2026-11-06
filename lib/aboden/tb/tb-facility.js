// Aboden Assets — theeban/tb-facility.js — منشآت مشروع «روافد»: محطة مياه (عاملة أو مهجورة)، خزانات مياه، مضخة، أنابيب وحوامل،
// مستودع معدات ومولدات، مولد صناعي، حاوية شحن، سيارة يختبئ فيها ذيبان
(function (g) {
  'use strict';
  const AA = g.AA, K = AA.kit, V = AA.v, TB = AA.tb, LP = AA.lp;
  const sh = TB.shade, ti = TB.tint;

  // صمام بعجلة
  TB.valveInto = function (P, at, axis, r, col) { const B = P('metal'), d = axis === 'x' ? [1, 0, 0] : axis === 'z' ? [0, 0, 1] : [0, 1, 0]; K.cyl(B, at, V.madd(at, d, 0.25), r * 0.3, r * 0.3, 6, 'tbSteel2'); const c = V.madd(at, d, 0.25); K.cyl(B, c, V.madd(c, d, 0.04), r, r, 10, col || 'tbRed'); K.cyl(B, V.madd(c, d, -0.01), V.madd(c, d, 0.05), r * 0.75, r * 0.75, 10, sh(col || 'tbRed', 0.35)); };
  // أنبوب بحلقات وصل
  TB.pipeInto = function (P, a, b, r, col, flanges) { const B = P('metal'); K.cyl(B, a, b, r, r, 10, col); if (flanges !== false) { const d = V.norm(V.sub(b, a)), L = V.len(V.sub(b, a)), n = Math.max(1, Math.round(L / 3)); for (let i = 0; i <= n; i++) { const c = V.madd(a, d, L * i / n); K.cyl(B, V.madd(c, d, -0.04), V.madd(c, d, 0.04), r * 1.25, r * 1.25, 10, sh(col, 0.2)); } } };
  // كوع أنبوب 90°
  TB.elbowInto = function (P, c, r, R, a0, col, up) { const B = P('metal'), n = 4; let prev = null; for (let k = 0; k <= n; k++) { const a = a0 + Math.PI / 2 * k / n, p = up ? [c[0] + Math.cos(a) * R, c[1] + Math.sin(a) * R, c[2]] : [c[0] + Math.cos(a) * R, c[1], c[2] + Math.sin(a) * R]; if (prev) K.cyl(B, prev, p, r, r, 10, col); prev = p; } };

  // ---------- محطة مياه ----------
  TB.def('water_station', { name: 'محطة مياه', nameEn: 'Water station', group: 'tb_facility',
    schema: [{ key: 'state', label: 'الحالة', type: 'enum', options: [['active', 'عاملة'], ['abandoned', 'مهجورة'], ['sealed', 'مغلقة بقوة أمنية']], def: 'abandoned' }, { key: 'width', label: 'العرض', min: 8, max: 24, step: 1, def: 14, unit: 'م' }, { key: 'tower', label: 'خزان علوي', type: 'bool', def: true }, { key: 'number', label: 'رقم المحطة', min: 1, max: 9, step: 1, def: 3 }],
    presets: { 'مهجورة': {}, 'عاملة': { state: 'active' }, 'مغلقة': { state: 'sealed', number: 5 } },
    generate: (p, q) => {
      const P = K.parts(), W = p.width, D = 9, H = 4.2, St = P('stone'), rng = AA.rng(p.seed), ab = p.state === 'abandoned', wall = ab ? 'tbConcrete2' : 'tbConcrete';
      TB.box(St, [0, 0.2, 0], [W + 1, 0.4, D + 1], 'tbConcreteDark', 0.06);
      TB.box(St, [0, 0.4 + H / 2, 0], [W, H, D], wall, 0.1);
      for (let i = 0; i < Math.round(W / 3); i++) TB.box(St, [-W / 2 + (i + 0.5) * W / Math.round(W / 3), 0.4 + H / 2, D / 2 + 0.02], [0.25, H, 0.12], sh(wall, 0.08), 0.03);
      TB.box(St, [0, 0.4 + H + 0.2, 0], [W + 0.3, 0.4, D + 0.3], sh(wall, 0.15), 0.06);
      // نوافذ صناعية عالية (مكسورة في المهجورة)
      for (let i = 0; i < Math.round(W / 3); i++) { const x = -W / 2 + (i + 0.5) * W / Math.round(W / 3) + W / Math.round(W / 3) / 2 - 0.1; if (x > W / 2 - 1) continue; const o = { at: [0, 0, D / 2], rot: 0 }; TB.box(P('metal'), [x - 0.7, 3.4, 0.06], [1.6, 0.9, 0.06], 'tbSteel2', 0.01, o); if (ab && rng() < 0.6) { K.box(P('dark'), [x - 0.7, 3.4, 0.07], [1.45, 0.75, 0.01], '#0b0d10', o); K.tri(P('glass'), [x - 1.4, 3.05, 0.09], [x - 0.9, 3.05, 0.09], [x - 1.3, 3.5, 0.09], 'glassDark', [0, 0, 1], o); } else K.box(p.state === 'active' ? P('lampCool') : P('glassSolid'), [x - 0.7, 3.4, 0.09], [1.45, 0.75, 0.01], p.state === 'active' ? '#9fd7e8' : 'glassDark', o); }
      // باب لفّاف كبير وباب صغير
      const o = { at: [0, 0.4, D / 2], rot: 0 };
      TB.box(P('metal'), [W * 0.18, 1.7, 0.08], [3.6, 3.4, 0.08], ab ? 'tbRust2' : 'tbSteel', 0.02, o); for (let k = 1; k < 12; k++) K.box(P('metal'), [W * 0.18, k * 0.28, 0.125], [3.5, 0.03, 0.01], ab ? 'tbRust' : 'tbSteel2', o);
      if (ab) K.box(P('dark'), [W * 0.18 + 0.6, 0.2, 0.13], [1.6, 0.4, 0.01], '#0b0d10', o);
      K.door(P, -W * 0.3, 1.0, 2.2, o, ab ? 'tbRust2' : 'tbSteel2');
      TB.sign(P, 'RAWAFID ' + p.number, [-W * 0.18, H - 0.35, 0.06], 0.07, 'tbRawafid', 'tbWhite', o);
      TB.logo(P('stone'), [-W * 0.18 - (('RAWAFID ' + p.number).length * 4 + 1) * 0.035 - 0.4, H - 0.35, 0.06 + D / 2], 0.3, 'tbRawafid');
      // أنابيب خارجية تدخل المبنى
      for (let k = 0; k < 3; k++) { const z = -D / 2 + 2 + k * 1.2, r = 0.22 - k * 0.04; TB.pipeInto(P, [W / 2 + 4, 0.8 + k * 0.6, z], [W / 2, 0.8 + k * 0.6, z], r, ab ? 'tbRust' : ['tbRawafid', 'tbSteel', 'tbOlive'][k]); TB.box(P('stone'), [W / 2 + 2.5, (0.8 + k * 0.6) / 2, z], [0.3, 0.8 + k * 0.6, 0.5], 'tbConcrete', 0.03); }
      TB.valveInto(P, [W / 2 + 1.2, 0.8, -D / 2 + 2], 'y', 0.18, 'tbRed');
      // خزان علوي على السطح
      if (p.tower) { const tc = [-W / 2 + 2.5, 0.4 + H + 0.4, -D / 2 + 2.5]; for (const sx of [1, -1]) for (const sz of [1, -1]) K.cyl(P('metal'), V.add(tc, [sx * 0.9, 0, sz * 0.9]), V.add(tc, [sx * 0.8, 2.2, sz * 0.8]), 0.06, 0.06, 6, 'tbSteel2'); TB.cyl(P('metal'), V.add(tc, [0, 2.2, 0]), V.add(tc, [0, 4.4, 0]), 1.35, ab ? 'tbRust' : 'tbPaint', 14, 0.08); K.cyl(P('metal'), V.add(tc, [0, 4.4, 0]), V.add(tc, [0, 4.9, 0]), 1.35, 0.3, 14, ab ? 'tbRust2' : 'tbSteel'); TB.ladder(P('metal'), 1.4, 0, 0.4 + H, 0.4 + H + 4.4, 0.4, 'tbSteel2', { at: [tc[0], 0, tc[2]], rot: Math.PI / 2 }); }
      // معدات السطح
      for (let k = 0; k < 2; k++) K.acInto(P, [W / 2 - 2 - k * 1.4, 0.4 + H + 0.4, D / 2 - 1.2], 0);
      if (ab) { for (let k = 0; k < 4; k++) { const x = -W / 2 + rng() * W; LP.ico(P('ground'), [x, 0.4, D / 2 + 0.5 + rng() * 0.6], [1.2 + rng(), 0.35 + rng() * 0.3, 0.8], 0, () => K.c('tbSand'), { keep: d => d[1] > -0.1 }); } }
      if (p.state === 'sealed') { for (const x of [-W / 2 - 1, W / 2 + 1]) K.box(P('paint'), [x, 0.5, D / 2 + 2], [0.3, 1, 2.5], 'tbYellow'); TB.box(P('paint'), [0, 0.5, D / 2 + 3], [W, 0.08, 0.05], 'tbYellow', 0.01); }
      return TB.done('water_station', P, { collider: K.boxCol(W, H + 0.8, D), door: [-W * 0.3, 0.4, D / 2 + 0.3], rollDoor: [W * 0.18, 0.4, D / 2 + 0.3], interior: { floorTop: 0.4 } });
    } });

  // ---------- خزان مياه ----------
  TB.def('water_tank', { name: 'خزان مياه', nameEn: 'Water tank', group: 'tb_facility',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['ground', 'أرضي كبير'], ['elevated', 'برج مياه'], ['horizontal', 'أفقي'], ['glass', 'زجاجي مضيء (قلب السديم)']], def: 'ground' }, { key: 'size', label: 'القطر', min: 2, max: 16, step: 0.5, def: 8, unit: 'م' }, { key: 'worn', label: 'صدئ', type: 'bool', def: false }, { key: 'level', label: 'منسوب الماء', min: 0, max: 1, step: 0.05, def: 0.7 }],
    presets: { 'أرضي': {}, 'برج مياه': { kind: 'elevated', size: 5 }, 'أفقي صدئ': { kind: 'horizontal', size: 3, worn: true }, 'زجاجي': { kind: 'glass', size: 3 } },
    generate: (p, q) => {
      const P = K.parts(), D = p.size, R = D / 2, n = K.sides(q, 18), M = P('metal'), c = p.worn ? 'tbRust' : 'tbPaint', c2 = p.worn ? 'tbRust2' : 'tbSteel';
      let H = 0;
      if (p.kind === 'ground') { H = D * 0.75; TB.cyl(P('stone'), [0, 0, 0], [0, 0.3, 0], R + 0.4, 'tbConcrete', n, 0.05); TB.cyl(M, [0, 0.3, 0], [0, 0.3 + H, 0], R, c, n, 0.06); for (let k = 1; k < 4; k++) K.cyl(M, [0, 0.3 + H * k / 4 - 0.03, 0], [0, 0.3 + H * k / 4 + 0.03, 0], R + 0.02, R + 0.02, n, sh(c, 0.12)); K.cyl(M, [0, 0.3 + H, 0], [0, 0.3 + H + R * 0.25, 0], R, 0.3, n, c2); const lad = TB.ladder(M, 0, R + 0.08, 0.3, 0.3 + H, 0.45, 'tbSteel2', null, true); TB.box(P('paint'), [0, 0.3 + H * 0.55, R + 0.01], [R * 0.9, 0.9, 0.02], 'tbRawafid', 0.01, { at: [0, 0, 0], rot: 0 }); H += R * 0.25 + 0.3; TB.valveInto(P, [R * 0.7, 0.6, R * 0.75], 'z', 0.15); return TB.done('water_tank', P, { collider: { type: 'cylinder', radius: R, height: H }, ladder: lad }); }
      if (p.kind === 'elevated') { const y0 = D * 1.3; for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + Math.PI / 4, b = [Math.cos(a) * R * 0.9, 0, Math.sin(a) * R * 0.9], t = [Math.cos(a) * R * 0.75, y0, Math.sin(a) * R * 0.75]; K.cyl(M, b, t, 0.12, 0.1, 6, c2); TB.box(P('stone'), V.add(b, [0, 0.2, 0]), [0.6, 0.4, 0.6], 'tbConcrete', 0.04); } for (let k = 1; k < 3; k++) for (let j = 0; j < 4; j++) { const a0 = j / 4 * Math.PI * 2 + Math.PI / 4, a1 = (j + 1) / 4 * Math.PI * 2 + Math.PI / 4, y = y0 * k / 3, rr = R * (0.9 - 0.15 * k / 3); K.cyl(M, [Math.cos(a0) * rr, y, Math.sin(a0) * rr], [Math.cos(a1) * rr, y, Math.sin(a1) * rr], 0.04, 0.04, 4, c2); } K.cyl(M, [0, y0, 0], [0, y0 + 0.3, 0], R * 0.5, R, n, c); TB.cyl(M, [0, y0 + 0.3, 0], [0, y0 + 0.3 + D * 0.55, 0], R, c, n, 0.06); K.cyl(M, [0, y0 + 0.3 + D * 0.55, 0], [0, y0 + 0.6 + D * 0.7, 0], R, 0.15, n, c2); TB.box(M, [0, y0 + 0.25, 0], [D + 1, 0.06, D + 1], 'tbSteel2', 0.01); TB.ladder(M, R * 0.95, 0, 0, y0 + 0.25, 0.4, 'tbSteel2', { at: [0, 0, 0], rot: Math.PI / 2 }, true); TB.pipeInto(P, [0, 0, 0], [0, y0, 0], 0.15, 'tbSteel2', false); H = y0 + 0.6 + D * 0.7; return TB.done('water_tank', P, { collider: { type: 'cylinder', radius: R, height: H } }); }
      if (p.kind === 'horizontal') { const L = D * 2.4; for (const z of [-L * 0.3, L * 0.3]) TB.box(P('stone'), [0, R * 0.5, z], [D * 0.9, R, 0.4], 'tbConcrete', 0.04); TB.cyl(M, [0, R + 0.15, -L / 2], [0, R + 0.15, L / 2], R, c, n, 0.1); for (const s of [1, -1]) K.cyl(M, [0, R + 0.15, s * L / 2], [0, R + 0.15, s * (L / 2 + R * 0.3)], R, R * 0.4, n, c2); K.cyl(M, [0, D + 0.15, 0], [0, D + 0.4, 0], 0.3, 0.3, 10, c2); TB.pipeInto(P, [R * 0.6, 0.6, L / 2 + R * 0.3], [R * 0.6, 0.6, L / 2 + 1.5], 0.1, 'tbSteel2'); H = D + 0.4; return TB.done('water_tank', P, { collider: K.boxCol(D, H, L + R) }); }
      // زجاجي مضيء: أسطوانة ماء فيروزي بإطار معدني
      H = D * 1.6; TB.cyl(M, [0, 0, 0], [0, 0.5, 0], R + 0.25, 'tbGunmetal', n, 0.06); TB.cyl(M, [0, H + 0.5, 0], [0, H + 1.0, 0], R + 0.25, 'tbGunmetal', n, 0.06);
      K.cyl(P('glass'), [0, 0.5, 0], [0, H + 0.5, 0], R, R, n, 'glass', null, { noCaps: true });
      K.cyl(TB.water(P), [0, 0.5, 0], [0, 0.5 + H * p.level, 0], R - 0.04, R - 0.04, n, 'tbWater');
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; K.cyl(M, [Math.cos(a) * (R + 0.08), 0.5, Math.sin(a) * (R + 0.08)], [Math.cos(a) * (R + 0.08), H + 0.5, Math.sin(a) * (R + 0.08)], 0.06, 0.06, 6, 'tbSteel2'); }
      for (const y of [0.55, H + 0.45]) K.cyl(TB.teal(P), [0, y, 0], [0, y + 0.06, 0], R + 0.27, R + 0.27, n, 'white', null, { noCaps: true });
      for (let k = 0; k < 5; k++) K.ball(P.custom('bubbles', LP.mat('glass', { opacity: 0.5, roughness: 0.1, emissive: [0.6, 1, 1], glow: 0.6 })), [Math.cos(k * 2.4) * R * 0.4, 0.8 + k * H * p.level / 6, Math.sin(k * 2.4) * R * 0.4], 0.08 + k * 0.01, 'white');
      return TB.done('water_tank', P, { collider: { type: 'cylinder', radius: R + 0.25, height: H + 1 }, light: { at: [0, H * 0.5, 0], color: [0.2, 0.85, 0.8], intensity: 2.5, distance: D * 3 } }, { ao: 0.1, dust: 0 });
    } });

  // ---------- مضخة صناعية ----------
  TB.def('pump', { name: 'مضخة مياه', nameEn: 'Water pump', group: 'tb_facility',
    schema: [{ key: 'size', label: 'الحجم', min: 0.6, max: 2.5, step: 0.1, def: 1.2 }, { key: 'running', label: 'تعمل', type: 'bool', def: true }, { key: 'color', label: 'اللون', type: 'enum', options: [['tbRawafid', 'أزرق روافد'], ['tbOlive', 'زيتي'], ['tbSteel', 'رمادي'], ['tbRust', 'صدئ']], def: 'tbRawafid' }],
    presets: { 'روافد': {}, 'كبيرة': { size: 2.2 }, 'متوقفة صدئة': { running: false, color: 'tbRust' } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, n = K.sides(q, 14), M = P('metal'), c = p.color, S = v => v.map(x => x * s);
      TB.box(P('stone'), S([0, 0.12, 0]), S([1.4, 0.24, 3.0]), 'tbConcrete', 0.04 * s); TB.box(M, S([0, 0.3, 0]), S([1.0, 0.12, 2.6]), 'tbGunmetal', 0.02 * s);
      // المحرك
      TB.cyl(M, S([0, 0.75, -1.15]), S([0, 0.75, 0.1]), 0.42 * s, c, n, 0.05 * s); for (let k = 0; k < 8; k++) K.box(M, S([0, 0.75, -1.05 + k * 0.14]), S([0.92, 0.92, 0.03]), sh(c, 0.18), null, 0);
      K.cyl(M, S([0, 0.75, -1.25]), S([0, 0.75, -1.15]), 0.3 * s, 0.38 * s, n, 'tbGunmetal'); TB.box(M, S([0.45, 0.95, -0.5]), S([0.18, 0.3, 0.4]), 'tbGunmetal', 0.02 * s); TB.box(M, S([0, 0.38, -0.5]), S([0.7, 0.12, 1.2]), sh(c, 0.2), 0.02 * s);
      // المحور والقارنة
      const sp = p.running ? P.custom('shaft', LP.mat('metal', { metalness: 0.6, roughness: 0.35, rotor: { pivot: S([0, 0.75, 0]), axis: 'z', speed: 9 } })) : M;
      K.cyl(sp, S([0, 0.75, 0.1]), S([0, 0.75, 0.55]), 0.09 * s, 0.09 * s, 8, 'tbSteel'); K.cyl(sp, S([0, 0.75, 0.28]), S([0, 0.75, 0.38]), 0.2 * s, 0.2 * s, 8, 'tbYellow');
      // الحلزون (جسم المضخة)
      K.cyl(M, S([0, 0.75, 0.55]), S([0, 0.75, 1.0]), 0.55 * s, 0.55 * s, n, c); K.cyl(M, S([0, 0.75, 1.0]), S([0, 0.75, 1.08]), 0.5 * s, 0.4 * s, n, sh(c, 0.15)); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; K.cyl(M, S([Math.cos(a) * 0.5, 0.75 + Math.sin(a) * 0.5, 0.52]), S([Math.cos(a) * 0.5, 0.75 + Math.sin(a) * 0.5, 0.58]), 0.04 * s, 0.04 * s, 6, 'tbSteel'); }
      TB.pipeInto(P, S([0, 0.75, 1.08]), S([0, 0.75, 1.6]), 0.25 * s, 'tbSteel2'); TB.pipeInto(P, S([0, 1.3, 0.78]), S([0, 2.0, 0.78]), 0.2 * s, 'tbSteel2'); K.cyl(M, S([0, 1.25, 0.78]), S([0, 1.32, 0.78]), 0.26 * s, 0.26 * s, 10, sh('tbSteel2', 0.2));
      // عداد ضغط
      K.cyl(M, S([0.35, 1.6, 0.78]), S([0.35, 1.6, 0.86]), 0.09 * s, 0.09 * s, 10, 'tbGunmetal'); K.cyl(P('stone'), S([0.35, 1.6, 0.86]), S([0.35, 1.6, 0.865]), 0.075 * s, 0.075 * s, 10, 'tbWhite'); K.box(P('dark'), S([0.37, 1.61, 0.868]), S([0.06, 0.008, 0.002]), 'tbRed', null, 0.6);
      TB.stateLamp(P, S([0.52, 0.98, -0.5]), 0.03 * s, p.running ? 'calm' : 'alarm');
      return TB.done('pump', P, { collider: K.boxCol(1.4 * s, 2 * s, 3.2 * s), interactive: 'pump', running: p.running });
    } });

  // ---------- أنابيب على حوامل (يزحف تحتها) ----------
  TB.def('pipes', { name: 'أنابيب', nameEn: 'Pipe run', group: 'tb_facility',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['rack', 'على حامل (زحف تحته)'], ['ground', 'على الأرض'], ['corner', 'زاوية'], ['riser', 'صاعد للأعلى']], def: 'rack' }, { key: 'length', label: 'الطول', min: 2, max: 20, step: 0.5, def: 8, unit: 'م' }, { key: 'count', label: 'عدد الأنابيب', min: 1, max: 4, step: 1, def: 3 }, { key: 'clear', label: 'الارتفاع تحته', min: 0.5, max: 3, step: 0.1, def: 0.75, unit: 'م' }, { key: 'worn', label: 'صدئة', type: 'bool', def: false }],
    presets: { 'حامل زحف': {}, 'على الأرض': { kind: 'ground', count: 2 }, 'زاوية': { kind: 'corner', length: 5 }, 'صاعد': { kind: 'riser', length: 4, count: 2 }, 'صدئة': { worn: true, count: 4, clear: 1.1 } },
    generate: (p, q) => {
      const P = K.parts(), L = p.length, n = p.count, cols = p.worn ? ['tbRust', 'tbRust2', 'tbSteel2', 'tbRust'] : ['tbRawafid', 'tbSteel', 'tbOlive', 'tbYellow'], rs = [0.22, 0.16, 0.12, 0.09];
      const y0 = p.kind === 'rack' ? p.clear + 0.3 : 0.3, M = P('metal');
      if (p.kind === 'rack' || p.kind === 'ground') {
        const ns = Math.max(2, Math.round(L / 3) + 1);
        for (let i = 0; i < ns; i++) { const x = -L / 2 + L * i / (ns - 1); if (p.kind === 'rack') { for (const z of [-0.6, 0.6]) TB.box(M, [x, (y0 - 0.1) / 2, z], [0.12, y0 - 0.1, 0.12], 'tbSteel2', 0.015); TB.box(M, [x, y0 - 0.12, 0], [0.14, 0.12, 1.5], 'tbSteel2', 0.02); TB.box(P('stone'), [x, 0.05, 0], [0.4, 0.1, 1.6], 'tbConcrete', 0.02); } else TB.box(P('stone'), [x, 0.12, 0], [0.4, 0.24, 1.4], 'tbConcrete', 0.03); }
        for (let k = 0; k < n; k++) { const z = -0.45 + 0.9 * (n === 1 ? 0.5 : k / (n - 1)), r = rs[k % 4], y = y0 + r; TB.pipeInto(P, [-L / 2 - 0.3, y, z], [L / 2 + 0.3, y, z], r, cols[k % 4]); }
        if (n > 1) TB.valveInto(P, [L * 0.2, y0 + rs[0] * 2, -0.45], 'y', 0.16, 'tbRed');
        return TB.done('pipes', P, { collider: p.kind === 'rack' ? { type: 'box', size: [L, 0.6, 1.5], center: [0, y0 + 0.2, 0] } : K.boxCol(L, 0.7, 1.5), crawl: p.kind === 'rack' ? { height: p.clear, length: L } : null });
      }
      if (p.kind === 'corner') { for (let k = 0; k < n; k++) { const r = rs[k % 4], off = -0.45 + 0.9 * (n === 1 ? 0.5 : k / (n - 1)), y = 0.3 + r, R = 0.8 + off; TB.pipeInto(P, [-L, y, -R], [0, y, -R], r, cols[k % 4], false); TB.elbowInto(P, [0, y, 0], r, R, -Math.PI / 2, cols[k % 4]); TB.pipeInto(P, [R, y, 0], [R, y, L], r, cols[k % 4], false); } for (const pos of [[-L * 0.5, 0.12, -0.8], [0.8, 0.12, L * 0.5]]) TB.box(P('stone'), pos, [0.6, 0.24, 0.6], 'tbConcrete', 0.03); return TB.done('pipes', P, { collider: K.boxCol(L, 0.7, L) }); }
      // صاعد
      for (let k = 0; k < n; k++) { const r = rs[k % 4], x = -0.4 + 0.8 * (n === 1 ? 0.5 : k / (n - 1)); TB.pipeInto(P, [x, 0.3 + r, 2], [x, 0.3 + r, 0.6], r, cols[k % 4], false); TB.elbowInto(P, [x, 0.3 + r + 0.6, 0.6], r, 0.6, -Math.PI / 2, cols[k % 4], true); TB.pipeInto(P, [x, 0.9 + r, 0], [x, L, 0], r, cols[k % 4]); }
      for (let y = 1.5; y < L; y += 1.8) TB.box(M, [0, y, -0.25], [1.3, 0.1, 0.1], 'tbSteel2', 0.015);
      return TB.done('pipes', P, { collider: K.boxCol(1.2, L, 2) });
    } });

  // ---------- مستودع معدات ومولدات ----------
  TB.def('warehouse', { name: 'مستودع معدات', nameEn: 'Equipment warehouse', group: 'tb_facility',
    schema: [{ key: 'width', label: 'العرض', min: 10, max: 30, step: 1, def: 16, unit: 'م' }, { key: 'length', label: 'العمق', min: 10, max: 40, step: 1, def: 20, unit: 'م' }, { key: 'open', label: 'فتح الباب اللفّاف', min: 0, max: 1, step: 0.05, def: 0.35 }, { key: 'color', label: 'لون الصاج', type: 'enum', options: [['tbSand2', 'رملي'], ['tbOlive', 'زيتي'], ['tbSteel', 'رمادي'], ['tbBrown', 'بني']], def: 'tbSand2' }, { key: 'cutaway', label: 'بدون سقف (للعرض)', type: 'bool', def: false }],
    presets: { 'رملي': {}, 'زيتي كبير': { color: 'tbOlive', width: 24, length: 30 }, 'مقطوع السقف': { cutaway: true, open: 1 } },
    generate: (p, q) => {
      const P = K.parts(), W = p.width, L = p.length, H = 6.5, c = p.color, M = P('metal'), St = P('stone');
      TB.box(St, [0, 0.1, 0], [W + 0.6, 0.2, L + 0.6], 'tbConcreteDark', 0.04); K.box(St, [0, 0.205, 0], [W - 0.4, 0.01, L - 0.4], 'tbConcrete');
      for (let i = 0; i < 4; i++) K.box(P('stone'), [-W / 2 + 1.5 + i * 0.2 * 0, 0.212, -L / 2 + 2 + i * (L - 4) / 3], [W - 3, 0.005, 0.1], 'tbYellow');
      const wall = (o, w, h, door) => { TB.box(M, [0, 0.2 + h / 2, 0], [w, h, 0.12], c, 0.02, o); for (let k = 0; k <= Math.round(w / 0.9); k++) K.box(M, [-w / 2 + k * w / Math.round(w / 0.9), 0.2 + h / 2, 0.07], [0.05, h, 0.02], sh(c, 0.15), o); void door; };
      if (!p.cutaway) { for (const [o, w] of [[{ at: [0, 0, -L / 2], rot: Math.PI }, W], [{ at: [W / 2, 0, 0], rot: Math.PI / 2 }, L], [{ at: [-W / 2, 0, 0], rot: -Math.PI / 2 }, L]]) wall(o, w, H); }
      else for (const [o, w] of [[{ at: [0, 0, -L / 2], rot: Math.PI }, W], [{ at: [-W / 2, 0, 0], rot: -Math.PI / 2 }, L]]) { TB.box(M, [0, 0.2 + 1.1, 0], [w, 2.2, 0.12], c, 0.02, o); }
      // الواجهة الأمامية بباب لفّاف
      const dw = W * 0.45, dh = 4.6, fo = { at: [0, 0, L / 2], rot: 0 };
      if (!p.cutaway) { TB.box(M, [-(W / 2 + dw / 2) / 2, 0.2 + H / 2, 0], [W / 2 - dw / 2, H, 0.12], c, 0.02, fo); TB.box(M, [(W / 2 + dw / 2) / 2, 0.2 + H / 2, 0], [W / 2 - dw / 2, H, 0.12], c, 0.02, fo); TB.box(M, [0, 0.2 + dh + (H - dh) / 2, 0], [dw, H - dh, 0.12], c, 0.02, fo);
        const rh = dh * (1 - p.open); if (rh > 0.05) { TB.box(M, [0, 0.2 + dh - rh / 2, 0.1], [dw - 0.1, rh, 0.06], 'tbSteel', 0.01, fo); for (let y = 0.3; y < rh; y += 0.25) K.box(M, [0, 0.2 + dh - y, 0.135], [dw - 0.2, 0.025, 0.01], 'tbSteel2', fo); }
        TB.box(M, [0, 0.2 + dh + 0.25, 0.2], [dw + 0.4, 0.5, 0.4], 'tbSteel2', 0.03, fo); K.door(P, W / 2 - 1.8, 1.0, 2.2, { at: [0, 0.2, L / 2], rot: 0 }, 'tbSteel2'); TB.sign(P, 'STORE B', [-W / 2 + 2.6, 0.2 + dh - 0.5, 0.07], 0.07, 'tbRawafid', 'tbWhite', fo);
        // سقف جملوني
        K.extrude(M, [[-W / 2 - 0.4, 0], [W / 2 + 0.4, 0], [W / 2 + 0.4, 0.12], [0, 1.6], [-W / 2 - 0.4, 0.12]], 'z', -L / 2 - 0.3, L / 2 + 0.3, { side: sh(c, 0.25), cap: sh(c, 0.12) }, { at: [0, 0.2 + H, 0] });
        for (const z of [L / 2, -L / 2]) K.extrude(M, [[-W / 2, 0], [W / 2, 0], [0, 1.45]], 'z', z - 0.05, z + 0.05, c, { at: [0, 0.2 + H, 0] });
        for (let k = 0; k < 3; k++) K.box(P('lampCool'), [-W / 2 + 0.5, 0.2 + H - 0.6, -L / 2 + 3 + k * (L - 6) / 2], [0.06, 0.15, 1.0], '#c8e8f0');
        K.cyl(P('lamp'), [0, 0.2 + dh + 0.65, L / 2 + 0.25], [0, 0.2 + dh + 0.65, L / 2 + 0.4], 0.18, 0.12, 10, 'white');
      }
      // هيكل داخلي: أعمدة
      if (!p.cutaway) for (const x of [-W / 4, W / 4]) for (let k = 1; k < 4; k++) TB.box(M, [x, 0.2 + H / 2, -L / 2 + k * L / 4], [0.3, H, 0.3], 'tbSteel2', 0.03);
      return TB.done('warehouse', P, { collider: K.boxCol(W, H + 1.8, L), interior: { floorTop: 0.21 }, door: [W / 2 - 1.8, 0.2, L / 2 + 0.3], rollDoor: { at: [0, 0.2, L / 2], width: dw, height: dh, open: p.open }, light: p.cutaway ? null : { at: [0, 0.2 + dh + 0.7, L / 2 + 0.8], color: [1, 0.8, 0.5], intensity: 2.2, distance: 12 } });
    } });

  // ---------- مولد صناعي ----------
  TB.def('generator', { name: 'مولد كهرباء', nameEn: 'Generator', group: 'tb_facility',
    schema: [{ key: 'size', label: 'الحجم', min: 0.6, max: 2, step: 0.1, def: 1 }, { key: 'running', label: 'شغّال', type: 'bool', def: true }, { key: 'color', label: 'اللون', type: 'enum', options: [['tbYellow', 'أصفر'], ['tbOlive', 'زيتي'], ['tbRawafid', 'أزرق روافد'], ['tbSteel', 'رمادي']], def: 'tbYellow' }],
    presets: { 'أصفر': {}, 'كبير زيتي': { size: 1.7, color: 'tbOlive' }, 'متوقف': { running: false, color: 'tbSteel' } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, M = P('metal'), c = p.color, S = v => v.map(x => x * s);
      TB.box(M, S([0, 0.12, 0]), S([1.5, 0.24, 3.2]), 'tbGunmetal', 0.03 * s);
      TB.box(M, S([0, 1.1, -0.2]), S([1.4, 1.75, 2.6]), c, 0.08 * s); TB.box(M, S([0, 2.0, -0.2]), S([1.3, 0.1, 2.5]), sh(c, 0.18), 0.03 * s);
      for (const sx of [1, -1]) { for (let k = 0; k < 6; k++) K.box(P('dark'), S([sx * 0.705, 0.7 + k * 0.12, -0.9]), S([0.01, 0.05, 0.8]), 'tbBlack'); TB.box(M, S([sx * 0.705, 1.1, 0.5]), S([0.02, 1.2, 0.9]), sh(c, 0.08), 0.01 * s); K.box(M, S([sx * 0.72, 1.1, 0.12]), S([0.03, 0.18, 0.04]), 'tbSteel', null); }
      TB.box(M, S([0, 1.15, 1.15]), S([1.2, 1.5, 0.2]), 'tbGunmetal', 0.03 * s); K.box(P('screen'), S([0, 1.5, 1.26]), S([0.4, 0.22, 0.01]), 'white'); for (let k = 0; k < 3; k++) TB.stateLamp(P, S([-0.3 + k * 0.3, 1.2, 1.27]), 0.03 * s, p.running ? ['calm', 'calm', 'suspect'][k] : 'off');
      K.cyl(M, S([0.4, 2.0, -1.0]), S([0.4, 2.6, -1.0]), 0.1 * s, 0.1 * s, 8, 'tbGunmetal'); K.cyl(M, S([0.4, 2.6, -1.0]), S([0.4, 2.65, -1.0]), 0.13 * s, 0.13 * s, 8, 'tbGunmetal');
      TB.cyl(M, S([-0.8, 0.5, 0.9]), S([-0.8, 0.5, -1.2]), 0.28 * s, 'tbSteel2', 12, 0.04 * s);
      K.cyl(P('rubber'), S([0.75, 0.3, 1.25]), S([1.5, 0.05, 2.0]), 0.04 * s, 0.04 * s, 6, 'tbRubber');
      return TB.done('generator', P, { collider: K.boxCol(1.6 * s, 2.7 * s, 3.3 * s), noise: p.running ? 6 : 0, interactive: 'power' });
    } });

  // ---------- حاوية شحن (غطاء) ----------
  TB.def('container', { name: 'حاوية شحن', nameEn: 'Shipping container', group: 'tb_facility',
    schema: [{ key: 'length', label: 'الطول', type: 'enum', options: [['20', '20 قدم'], ['40', '40 قدم']], def: '20' }, { key: 'color', label: 'اللون', type: 'enum', options: [['tbRawafid', 'أزرق'], ['tbRed', 'أحمر'], ['tbOlive', 'زيتي'], ['tbSand2', 'رملي'], ['tbOrange', 'برتقالي'], ['tbWhite', 'أبيض']], def: 'tbRawafid' }, { key: 'open', label: 'فتح الأبواب', min: 0, max: 1, step: 0.05, def: 0 }, { key: 'worn', label: 'صدأ', type: 'bool', def: true }],
    presets: { 'أزرق': {}, 'أحمر مفتوح': { color: 'tbRed', open: 1 }, '40 قدم زيتي': { length: '40', color: 'tbOlive' } },
    generate: (p, q) => {
      const P = K.parts(), L = p.length === '40' ? 12.19 : 6.06, W = 2.44, H = 2.59, c = p.color, M = P('metal'), rng = AA.rng(p.seed);
      TB.box(M, [0, H / 2, 0], [W, H, L], c, 0.05);
      const nr = Math.round(L / 0.28); for (let k = 0; k < nr; k++) for (const s of [1, -1]) K.box(M, [s * (W / 2 + 0.012), H / 2, -L / 2 + 0.15 + k * (L - 0.3) / (nr - 1)], [0.025, H - 0.25, 0.12], sh(c, 0.12));
      for (const y of [0.08, H - 0.08]) for (const s of [1, -1]) TB.box(M, [s * (W / 2 - 0.05), y, 0], [0.12, 0.16, L + 0.02], sh(c, 0.25), 0.02);
      for (const sx of [1, -1]) for (const sy of [0.1, H - 0.1]) for (const sz of [1, -1]) TB.box(M, [sx * (W / 2 - 0.08), sy, sz * (L / 2 - 0.08)], [0.18, 0.18, 0.18], 'tbGunmetal', 0.02);
      if (p.worn) for (let k = 0; k < 6; k++) { const s = rng() < 0.5 ? 1 : -1; K.box(P('stone'), [s * (W / 2 + 0.03), 0.3 + rng() * (H - 0.6), -L / 2 + 0.5 + rng() * (L - 1)], [0.004, 0.2 + rng() * 0.6, 0.2 + rng() * 0.8], 'tbRust', null, 0); }
      // الأبواب الخلفية تدور حول مفصلاتها
      for (const s of [1, -1]) { const a = p.open * 2.4, hp = [s * W / 2, 0, L / 2 + 0.02], u = [-s * Math.cos(a), Math.sin(a)], cx = hp[0] + u[0] * W / 4, cz = hp[2] + u[1] * W / 4; const dv = P.custom('door' + (s > 0 ? 'R' : 'L'), LP.mat('metal', { metalness: 0.45, roughness: 0.5, hinge: { pivot: hp, axis: 'y' } }));
        TB.box(dv, [0, 0, 0], [W / 2 - 0.04, H - 0.2, 0.05], sh(c, 0.05), 0.01, { at: [cx, H / 2, cz + 0.03], rot: Math.atan2(-u[1], u[0]) }); }
      if (p.open > 0.1) K.box(P('dark'), [0, H / 2, L / 2 - 0.01], [W - 0.2, H - 0.2, 0.01], '#0b0d10');
      TB.box(P('paint'), [W / 2 + 0.03, H * 0.6, -L * 0.2], [0.02, 0.5, 1.6], 'tbWhite', 0.01);
      return TB.done('container', P, { collider: K.boxCol(W, H, L), cover: 'full', enter: p.open > 0.5 ? [0, 0, L / 2 - 0.6] : null });
    } });

  // ---------- سيارة (يختبئ فيها ذيبان) ----------
  TB.def('car', { name: 'سيارة', nameEn: 'Car', group: 'tb_facility',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['suv', 'جيب دورية'], ['pickup', 'ونيت'], ['wreck', 'سيارة مهجورة']], def: 'suv' }, { key: 'color', label: 'اللون', type: 'enum', options: [['tbWhite', 'أبيض'], ['tbSand2', 'رملي'], ['tbOlive', 'زيتي'], ['tbGunmetal', 'رمادي غامق'], ['tbRawafid', 'أزرق روافد']], def: 'tbWhite' },
      { key: 'door', label: 'فتح باب السائق', min: 0, max: 1, step: 0.05, def: 0 }, { key: 'lights', label: 'الأنوار', type: 'bool', def: false }, { key: 'livery', label: 'شعار روافد الأمني', type: 'bool', def: true }],
    presets: { 'دورية': {}, 'ونيت رملي': { kind: 'pickup', color: 'tbSand2', livery: false }, 'مهجورة': { kind: 'wreck', color: 'tbRust', livery: false }, 'باب مفتوح': { door: 1, lights: true } },
    generate: (p, q) => {
      const P = K.parts(), wreck = p.kind === 'wreck', c = wreck ? 'tbRust' : p.color, Bd = P('paint'), Ln = 4.8, W = 1.95, n = K.sides(q, 12);
      const R = 0.4, cab = p.kind === 'pickup' ? [-0.2, 1.6] : [-1.9, 1.45];
      // الهيكل السفلي: مقطع جانبي مبثوق
      const side = [[-Ln / 2, 0.42], [Ln / 2, 0.42], [Ln / 2 + 0.05, 0.75], [Ln / 2 - 0.05, 1.05], [Ln / 2 - 1.0, 1.12], [-Ln / 2 + 0.05, 1.12], [-Ln / 2, 0.8]];
      K.extrude(Bd, side.map(([z, y]) => [z, y]), 'x', -W / 2, W / 2, { side: c, cap: c });
      for (const s of [1, -1]) for (const z of [1.45, -1.45]) { const pts = []; for (let k = 0; k <= 6; k++) { const a = Math.PI * k / 6; pts.push([z + Math.cos(a) * (R + 0.08), 0.42 + Math.sin(a) * (R + 0.08) * 0.9]); } K.extrude(P('dark'), pts.concat([[z - R - 0.08, 0.6]]), 'x', s * W / 2 - 0.02, s * W / 2 + 0.005, 'tbBlack'); }
      // الكابينة: جسم زجاجي بأعمدة
      const z0 = cab[0], z1 = p.kind === 'pickup' ? 1.3 : 1.25, top = p.kind === 'pickup' ? 1.85 : 1.9;
      const cabProf = [[z0, 1.12], [z1, 1.12], [z1 - 0.55, top], [z0 + 0.12, top]];
      K.extrude(Bd, cabProf, 'x', -W / 2 + 0.06, W / 2 - 0.06, { side: c, cap: c });
      for (const s of [1, -1]) { const g = [[z0 + 0.25, 1.2], [z1 - 0.15, 1.2], [z1 - 0.6, top - 0.08], [z0 + 0.3, top - 0.08]]; K.extrude(P('glassSolid'), g, 'x', s * (W / 2 - 0.05), s * (W / 2 - 0.035), 'glassDark'); }
      K.quad(P('glassSolid'), [-W / 2 + 0.12, 1.16, z1 - 0.02], [W / 2 - 0.12, 1.16, z1 - 0.02], [W / 2 - 0.12, top - 0.06, z1 - 0.57], [-W / 2 + 0.12, top - 0.06, z1 - 0.57], 'glassDark', [0, 0.6, 1]);
      if (p.kind === 'pickup') { for (const s of [1, -1]) TB.box(Bd, [s * (W / 2 - 0.05), 1.35, -1.45], [0.08, 0.45, 2.1], c, 0.02); TB.box(Bd, [0, 1.35, -2.4], [W, 0.45, 0.08], c, 0.02); K.box(P('dark'), [0, 1.14, -1.45], [W - 0.2, 0.02, 2.0], 'tbBlack'); }
      // العجلات
      if (!wreck) K.wheels(P, [{ z: 1.45, x: W / 2 - 0.12, R, w: 0.28, steer: true }, { z: -1.45, x: W / 2 - 0.12, R, w: 0.28 }], q, 'tbSteel2');
      else { for (const [x, z, tilt] of [[W / 2 - 0.12, 1.45, 0], [-W / 2 + 0.12, -1.45, 0.25]]) K.cyl(P('rubber'), [x - 0.14, R * 0.8, z], [x + 0.14, R * 0.8, z], R, R, n, 'tbRubber'); for (const [x, z] of [[-W / 2 + 0.3, 1.45], [W / 2 - 0.3, -1.45]]) TB.box(P('stone'), [x, 0.25, z], [0.3, 0.5, 0.3], 'tbConcreteDark', 0.03); LP.ico(P('ground'), [0.6, 0.3, -0.5], [1.4, 0.4, 1.3], 0, () => K.c('tbSand'), { keep: d => d[1] > -0.1 }); }
      // الواجهة
      TB.box(P('metal'), [0, 0.7, Ln / 2 + 0.03], [W - 0.2, 0.3, 0.06], 'tbGunmetal', 0.02); for (let k = 0; k < 4; k++) K.box(P('dark'), [0, 0.62 + k * 0.06, Ln / 2 + 0.065], [W * 0.5, 0.02, 0.01], 'tbBlack');
      for (const s of [1, -1]) { K.box(P(p.lights && !wreck ? 'lamp' : 'glassSolid'), [s * (W / 2 - 0.25), 0.88, Ln / 2 - 0.0], [0.32, 0.12, 0.05], 'white'); K.box(P(wreck ? 'dark' : 'tail'), [s * (W / 2 - 0.12), 0.95, -Ln / 2 - 0.01], [0.15, 0.22, 0.03], 'white'); }
      TB.box(P('metal'), [0, 0.5, Ln / 2 + 0.05], [W, 0.16, 0.12], 'tbGunmetal', 0.03); TB.box(P('metal'), [0, 0.5, -Ln / 2 - 0.05], [W, 0.16, 0.12], 'tbGunmetal', 0.03);
      if (p.livery && !wreck) { for (const s of [1, -1]) { K.box(P('stone'), [s * (W / 2 + 0.006), 0.8, 0.2], [0.004, 0.12, Ln - 0.6], 'tbRawafid'); } TB.box(P('sigRed'), [0.25, top + 0.06, -0.3], [0.35, 0.1, 0.18], 'white', 0.02); TB.box(P('lampCool'), [-0.25, top + 0.06, -0.3], [0.35, 0.1, 0.18], '#6aa8ff', 0.02); }
      // باب السائق (يدور على المفصل الأمامي) — ذيبان يدخل ويختبئ
      const hp = [W / 2, 0, 1.0], a = p.door * 1.1, dv = P.custom('doorL', LP.mat('paint', { roughness: 0.5, hinge: { pivot: hp, axis: 'y' } }));
      const dz = 0.55, cx = hp[0] + Math.sin(a) * dz, cz = hp[2] - Math.cos(a) * dz;
      TB.box(dv, [0, 0, 0], [0.06, 0.7, 1.1], c, 0.015, { at: [cx, 0.8, cz], rot: -a });
      if (p.door > 0.1) K.box(P('dark'), [W / 2 - 0.03, 0.85, 0.45], [0.01, 0.6, 1.0], '#121417');
      // المقاعد (تظهر من الزجاج)
      for (const s of [1, -1]) TB.box(P('cloth'), [s * 0.42, 1.2, 0.0], [0.5, 0.15, 0.55], 'tbBlack', 0.03);
      return TB.done('car', P, { collider: K.boxCol(W, top, Ln), hide: { enter: [W / 2 + 0.6, 0, 0.45], seat: [0.42, 0.95, 0], crouchY: 0.9 }, seats: [[0.42, 1.0, 0], [-0.42, 1.0, 0]], walkSpeed: wreck ? 0 : 12 }, { ao: 0.18, dust: 0.25 });
    } });
})(typeof window !== 'undefined' ? window : globalThis);

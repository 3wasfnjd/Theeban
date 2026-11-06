// Aboden Assets — theeban/tb-rooms.js — الغرف والأجهزة: غرفة (اتصالات، مضخات، تحكم، تخزين) بجدران مقطوعة للكاميرا العلوية،
// منصة تحكم، خزانة خوادم (وحدة التخزين)، جدار شاشات المراقبة، طاولة اللاسلكي، باب أمني بقارئ بطاقة، خزائن، رفوف، لوحة عدادات،
// طاولة خرائط، كرسي، وقلب السديم
(function (g) {
  'use strict';
  const AA = g.AA, K = AA.kit, V = AA.v, TB = AA.tb, LP = AA.lp;
  const sh = TB.shade;
  const screenMat = (P, col, name) => P.custom(name || 'scr', LP.mat('lamp', { emissive: col || [0.2, 0.75, 0.85], glow: 0.9 }));

  // شاشة بإطار: at المركز، w,h، o تحويل، col لون الإضاءة
  TB.screenInto = function (P, at, w, h, o, col, rng) {
    TB.box(P('plastic'), at, [w + 0.06, h + 0.06, 0.05], 'tbBlack', 0.01, o);
    const S = screenMat(P, col), c = [at[0], at[1], at[2] + 0.028];
    K.box(S, c, [w, h, 0.004], 'white', o);
    // خطوط واجهة (بيانات) أغمق فوق الشاشة
    const D = P.custom('scrInk', LP.mat('lamp', { emissive: (col || [0.2, 0.75, 0.85]).map(x => x * 0.35), glow: 0.4 }));
    for (let k = 0; k < 4; k++) K.box(D, [c[0] - w * 0.2 + (rng ? rng() * 0.1 : 0), c[1] + h * 0.3 - k * h * 0.17, c[2] + 0.004], [w * (0.35 + (rng ? rng() * 0.3 : 0.2)), h * 0.05, 0.002], 'white', o);
  };

  // ---------- غرفة ----------
  TB.def('room', { name: 'غرفة', nameEn: 'Room', group: 'tb_rooms',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['comms', 'غرفة الاتصالات'], ['pump', 'غرفة المضخات'], ['control', 'غرفة التحكم'], ['storage', 'غرفة التخزين'], ['office', 'مكتب']], def: 'comms' },
      { key: 'width', label: 'العرض', min: 4, max: 20, step: 0.5, def: 7, unit: 'م' }, { key: 'depth', label: 'العمق', min: 4, max: 20, step: 0.5, def: 6, unit: 'م' }, { key: 'height', label: 'الارتفاع', min: 2.6, max: 6, step: 0.1, def: 3.2, unit: 'م' },
      { key: 'cutaway', label: 'جداران أماميان منخفضان (كاميرا علوية)', type: 'bool', def: true }, { key: 'door', label: 'فتحة باب', type: 'bool', def: true }],
    presets: { 'اتصالات': {}, 'مضخات': { kind: 'pump', width: 12, depth: 9, height: 4.5 }, 'تحكم': { kind: 'control', width: 12, depth: 10, height: 4 }, 'تخزين': { kind: 'storage', width: 9, depth: 7 }, 'مكتب': { kind: 'office', width: 5, depth: 4.5 } },
    generate: (p, q) => {
      const P = K.parts(), W = p.width, D = p.depth, H = p.height, t = 0.25, St = P('stone'), k = p.kind, rng = AA.rng(p.seed);
      const floorC = k === 'pump' ? 'tbConcrete2' : k === 'control' ? '#3a4148' : k === 'storage' ? 'tbConcrete' : '#596068', wallC = k === 'control' ? '#4a535c' : k === 'pump' ? 'tbConcrete' : 'tbPaint';
      TB.box(St, [0, -0.1, 0], [W + 2 * t, 0.2, D + 2 * t], 'tbConcreteDark', 0.02);
      // بلاط الأرضية
      const ts = k === 'control' ? 1.0 : 1.5, nx = Math.round(W / ts), nz = Math.round(D / ts);
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) K.box(St, [-W / 2 + (i + 0.5) * W / nx, 0.005, -D / 2 + (j + 0.5) * D / nz], [W / nx - 0.02, 0.01, D / nz - 0.02], (i + j) % 2 ? floorC : sh(floorC, 0.06));
      if (k === 'pump') { K.box(P('stone'), [0, 0.012, 0], [0.4, 0.01, D - 1], 'tbYellow'); }
      if (k === 'control') { for (let i = 0; i < 3; i++) K.box(TB.teal(P), [-W / 2 + 0.4, 0.015, -D / 2 + 1 + i * (D - 2) / 2], [0.05, 0.01, (D - 2) / 2 - 0.4], 'white'); K.box(TB.teal(P), [W / 2 - 0.4, 0.015, 0], [0.05, 0.01, D - 2], 'white'); }
      // الجدران: خلفي ويسار كاملة، أمامي ويمين منخفضة إذا cutaway
      const lowH = p.cutaway ? 0.9 : H;
      const walls = [[{ at: [0, 0, -D / 2 - t / 2], rot: 0 }, W + 2 * t, H], [{ at: [-W / 2 - t / 2, 0, 0], rot: Math.PI / 2 }, D, H], [{ at: [0, 0, D / 2 + t / 2], rot: Math.PI }, W + 2 * t, lowH], [{ at: [W / 2 + t / 2, 0, 0], rot: -Math.PI / 2 }, D, lowH]];
      walls.forEach(([o, w, h], wi) => {
        const dw = 1.2, dx = wi === 2 ? W * 0.25 : null;
        if (p.door && dx != null) { const a = -w / 2, b = dx - dw / 2, c = dx + dw / 2, d = w / 2; TB.box(St, [(a + b) / 2, h / 2, 0], [b - a, h, t], wallC, 0.03, o); TB.box(St, [(c + d) / 2, h / 2, 0], [d - c, h, t], wallC, 0.03, o); if (h > 2.3) TB.box(St, [dx, (h + 2.3) / 2, 0], [dw, h - 2.3, t], wallC, 0.03, o); }
        else TB.box(St, [0, h / 2, 0], [w, h, t], wallC, 0.03, o);
        K.box(St, [0, 0.08, t / 2 + 0.01], [w - 0.02, 0.16, 0.02], sh(wallC, 0.3), o); // وزرة
        if (h > 2) for (let i = 1; i < Math.round(w / 2.4); i++) K.box(St, [-w / 2 + i * w / Math.round(w / 2.4), h / 2, t / 2 + 0.006], [0.03, h - 0.3, 0.01], sh(wallC, 0.08), o);
      });
      // أنابيب وكابلات تحت السقف على الجدار الخلفي
      const oB = walls[0][0];
      if (k === 'pump') for (const [y, r, c] of [[H - 0.6, 0.25, 'tbRawafid'], [H - 1.2, 0.18, 'tbSteel'], [H - 1.7, 0.12, 'tbOlive']]) { K.cyl(P('metal'), [-W / 2, y, -D / 2 + r + 0.15], [W / 2, y, -D / 2 + r + 0.15], r, r, 10, c); }
      else K.box(P('metal'), [0, H - 0.2, -D / 2 + 0.2], [W, 0.12, 0.25], 'tbSteel2');
      // إضاءة سقفية (معلقة على الجدار الخلفي لأن السقف مفتوح)
      const lc = k === 'control' ? [0.25, 0.9, 0.9] : k === 'pump' ? [0.85, 0.95, 1] : [1, 0.86, 0.6];
      for (let i = 0; i < Math.max(1, Math.round(W / 4)); i++) { const x = -W / 2 + (i + 0.5) * W / Math.max(1, Math.round(W / 4)); TB.box(P('metal'), [x, H - 0.45, 0.1], [0.9, 0.08, 0.22], 'tbGunmetal', 0.01, oB); K.box(P.custom('roomLamp', LP.mat('lamp', { emissive: lc, glow: 1.2 })), [x, H - 0.5, 0.12], [0.8, 0.02, 0.16], 'white', oB); }
      if (k === 'comms' || k === 'office') { TB.box(P('paint'), [W * 0.15, 1.7, 0.14], [1.4, 0.9, 0.03], 'tbWhite', 0.01, oB); for (let i = 0; i < 6; i++) K.box(P('stone'), [W * 0.15 - 0.55 + rng() * 1.1, 1.5 + rng() * 0.5, 0.157], [0.06, 0.06, 0.004], ['tbRed', 'tbRawafid', 'tbBlack'][i % 3], oB); }
      TB.sign(P, k === 'pump' ? 'PUMP ROOM' : k === 'control' ? 'CONTROL' : k === 'storage' ? 'STORAGE' : k === 'office' ? 'OFFICE' : 'COMMS', [-W * 0.25, H - 1.0, 0.14], 0.05, 'tbRawafid', 'tbWhite', oB);
      TB.logo(P('stone'), [-W * 0.25 - 1.3, H - 1.0, 0.13 - D / 2 - t / 2 + 0.0], 0.22, 'tbRawafid');
      return TB.done('room', P, { interior: { floorTop: 0.01 }, door: p.door ? [W * 0.25 * -1, 0, D / 2 + t] : null, size: [W, H, D] }, { ao: 0.25, dust: 0.05 });
    } });

  // ---------- منصة تحكم ----------
  TB.def('console', { name: 'منصة تحكم', nameEn: 'Control console', group: 'tb_rooms',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['desk', 'مكتب بشاشات'], ['curved', 'منصة مقوسة'], ['station', 'محطة واقفة']], def: 'desk' }, { key: 'screens', label: 'الشاشات', min: 1, max: 5, step: 1, def: 3 }, TB.stateOpt('calm'), { key: 'glow', label: 'لون الشاشات', type: 'enum', options: [['teal', 'فيروزي'], ['amber', 'كهرماني'], ['red', 'أحمر']], def: 'teal' }],
    presets: { 'مكتب': {}, 'مقوسة': { kind: 'curved', screens: 5 }, 'واقفة': { kind: 'station', screens: 1 }, 'إنذار': { state: 'alarm', glow: 'red' } },
    generate: (p, q) => {
      const P = K.parts(), rng = AA.rng(p.seed), col = p.glow === 'amber' ? [1, 0.62, 0.2] : p.glow === 'red' ? [1, 0.2, 0.15] : [0.2, 0.85, 0.85], n = p.screens;
      if (p.kind === 'station') { TB.box(P('metal'), [0, 0.55, 0], [0.7, 1.1, 0.5], 'tbSteel2', 0.03); K.extrude(P('metal'), [[-0.25, 0], [0.25, 0], [0.25, 0.08], [-0.2, 0.25]], 'x', -0.35, 0.35, 'tbGunmetal', { at: [0, 1.1, 0] }); TB.screenInto(P, [0, 1.55, -0.1], 0.6, 0.4, { at: [0, 0, 0], rot: 0 }, col, rng); TB.box(P('metal'), [0, 1.25, -0.15], [0.08, 0.3, 0.08], 'tbGunmetal', 0.01); for (let k = 0; k < 6; k++) TB.stateLamp(P, [-0.2 + (k % 3) * 0.2, 1.2 + Math.floor(k / 3) * 0.08, 0.15], 0.018, k === 0 ? p.state : 'calm'); return TB.done('console', P, { collider: K.boxCol(0.7, 1.8, 0.6), interactive: 'terminal', use: [0, 0, 0.6] }, { ao: 0.2, dust: 0 }); }
      const curved = p.kind === 'curved', R = 2.4, span = curved ? 1.3 : 0, Wd = curved ? 0 : Math.max(1.6, n * 0.75);
      const place = (t) => curved ? { at: [Math.sin((t - 0.5) * span) * R, 0, R - Math.cos((t - 0.5) * span) * R], rot: -(t - 0.5) * span } : { at: [(t - 0.5) * (Wd - 0.6), 0, 0], rot: 0 };
      const segs = curved ? n : 1;
      for (let i = 0; i < segs; i++) { const o = curved ? place((i + 0.5) / segs) : { at: [0, 0, 0], rot: 0 }, w = curved ? R * span / segs + 0.02 : Wd; TB.box(P('metal'), [0, 0.37, 0], [w, 0.74, 0.7], 'tbSteel2', 0.03, o); TB.box(P('metal'), [0, 0.76, 0.05], [w + 0.02, 0.05, 0.85], 'tbGunmetal', 0.015, o); K.extrude(P('metal'), [[0.42, 0], [0.48, 0], [0.48, 0.03], [0.1, 0.12], [0.1, 0.09]], 'x', -w / 2, w / 2, 'tbGunmetal', { at: K.X([0, 0.78, 0], o), rot: o.rot }); for (let k = 0; k < 8; k++) TB.stateLamp(P, [-w / 2 + 0.15 + k * (w - 0.3) / 7, 0.835, 0.3], 0.012, rng() < 0.15 ? p.state : 'calm', o); K.box(P('plastic'), [0, 0.8, 0.12], [Math.min(0.5, w * 0.6), 0.02, 0.18], 'tbBlack', o); }
      for (let i = 0; i < n; i++) { const o = place((i + 0.5) / n); TB.box(P('metal'), [0, 0.95, -0.25], [0.06, 0.35, 0.06], 'tbGunmetal', 0.01, o); TB.screenInto(P, [0, 1.25, -0.25], 0.62, 0.38, o, col, rng); }
      // زر كبير (للإجراء الحاسم)
      const big = place(0.5); TB.box(P('metal'), [0.35, 0.8, 0.25], [0.18, 0.06, 0.18], 'tbYellow', 0.01, big); K.cyl(P(p.state === 'alarm' ? 'sigRed' : 'sigGreen'), K.X([0.35, 0.83, 0.25], big), K.X([0.35, 0.87, 0.25], big), 0.05, 0.05, 10, 'white');
      return TB.done('console', P, { collider: curved ? K.boxCol(R * span + 0.6, 1.6, 1.2) : K.boxCol(Wd, 1.6, 0.9), interactive: 'terminal', use: curved ? [0, 0, R * 0.08 + 0.7] : [0, 0, 0.8] }, { ao: 0.2, dust: 0 });
    } });

  // ---------- خزانة خوادم (فيها وحدة التخزين) ----------
  TB.def('server_rack', { name: 'خزانة خوادم', nameEn: 'Server rack', group: 'tb_rooms',
    schema: [{ key: 'count', label: 'عدد الخزائن', min: 1, max: 6, step: 1, def: 3 }, { key: 'open', label: 'باب مفتوح (الأولى)', type: 'bool', def: false }, TB.stateOpt('calm'), { key: 'objective', label: 'وحدة التخزين ظاهرة', type: 'bool', def: false }],
    presets: { 'صف': {}, 'مفتوحة بوحدة التخزين': { count: 2, open: true, objective: true }, 'إنذار': { state: 'alarm', count: 4 } },
    generate: (p, q) => {
      const P = K.parts(), n = p.count, W = 0.65, H = 2.1, D = 1.0, rng = AA.rng(p.seed);
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * (W + 0.03), o = { at: [x, 0, 0], rot: 0 };
        TB.box(P('metal'), [0, H / 2, 0], [W, H, D], 'tbGunmetal', 0.02, o); TB.box(P('metal'), [0, H + 0.02, 0], [W - 0.04, 0.04, D - 0.04], 'tbSteel2', 0.01, o);
        for (let u = 0; u < 14; u++) { const y = 0.2 + u * 0.13; K.box(P('metal'), [0, y, D / 2 - 0.04], [W - 0.12, 0.11, 0.02], u % 4 === 3 ? 'tbSteel2' : '#262a2e', o); for (let l = 0; l < 3; l++) if (rng() < 0.6) K.box(P(rng() < 0.12 ? (p.state === 'alarm' ? 'sigRed' : 'sigAmber') : 'sigGreen'), [-W / 2 + 0.12 + l * 0.04, y + 0.02, D / 2 - 0.028], [0.015, 0.015, 0.005], 'white', o); K.box(TB.teal(P), [W / 2 - 0.12, y, D / 2 - 0.028], [0.08, 0.008, 0.004], 'white', o); }
        if (i === 0 && p.open) { const dv = P.custom('rackDoor', LP.mat('glass', { opacity: 0.4, roughness: 0.2, doubleSided: true, hinge: { pivot: [x - W / 2, 0, D / 2], axis: 'y' } })); TB.box(dv, [0, 0, 0], [0.03, H - 0.1, W - 0.04], 'glassDark', 0.005, { at: [x - W / 2 - 0.02, H / 2, D / 2 + W / 2 - 0.02], rot: 0 }); }
        else K.box(P('glass'), [0, H / 2, D / 2 + 0.01], [W - 0.06, H - 0.1, 0.01], 'glassDark', o);
        TB.stateLamp(P, [0, H - 0.08, D / 2 + 0.02], 0.02, p.state, o);
      }
      if (p.objective) { const x = -(n - 1) / 2 * (W + 0.03); TB.dataUnitInto(P, [x, 1.05, D / 2 + 0.03]); }
      K.cyl(P('rubber'), [-(n * (W + 0.03)) / 2, H + 0.05, -0.2], [(n * (W + 0.03)) / 2, H + 0.05, -0.2], 0.05, 0.05, 6, 'tbRubber');
      return TB.done('server_rack', P, { collider: K.boxCol(n * (W + 0.03), H, D), objective: p.objective ? 'data_unit' : null }, { ao: 0.2, dust: 0 });
    } });

  // ---------- جدار شاشات المراقبة ----------
  TB.def('monitor_wall', { name: 'جدار شاشات المراقبة', nameEn: 'CCTV wall', group: 'tb_rooms',
    schema: [{ key: 'cols', label: 'الأعمدة', min: 2, max: 6, step: 1, def: 4 }, { key: 'rows', label: 'الصفوف', min: 1, max: 4, step: 1, def: 3 }, { key: 'map', label: 'خريطة الشبكة في المنتصف', type: 'bool', def: true }, TB.stateOpt('calm')],
    presets: { '٤×٣': {}, 'كبير': { cols: 6, rows: 4 }, 'إنذار': { state: 'alarm' } },
    generate: (p, q) => {
      const P = K.parts(), cw = 0.9, ch = 0.55, C = p.cols, Rr = p.rows, W = C * (cw + 0.05), H0 = 0.9, rng = AA.rng(p.seed), o = { at: [0, 0, 0], rot: 0 };
      TB.box(P('metal'), [0, H0 + Rr * (ch + 0.05) / 2, -0.08], [W + 0.2, Rr * (ch + 0.05) + 0.2, 0.12], 'tbGunmetal', 0.02);
      const alarm = p.state === 'alarm';
      for (let i = 0; i < C; i++) for (let j = 0; j < Rr; j++) {
        const x = -W / 2 + (i + 0.5) * (cw + 0.05), y = H0 + (j + 0.5) * (ch + 0.05), mid = p.map && Rr >= 2 && C >= 3 && (i === Math.floor(C / 2) || i === Math.floor(C / 2) - 1) && j >= Rr - 2;
        if (mid) continue;
        const red = alarm && rng() < 0.4; TB.screenInto(P, [x, y, 0], cw, ch, o, red ? [1, 0.2, 0.12] : [0.35 + rng() * 0.1, 0.6, 0.62], rng);
      }
      if (p.map && Rr >= 2 && C >= 3) { const x = -W / 2 + Math.floor(C / 2) * (cw + 0.05), y = H0 + (Rr - 1) * (ch + 0.05), w = 2 * cw + 0.05, h = 2 * ch + 0.05; TB.box(P('plastic'), [x, y, 0], [w + 0.06, h + 0.06, 0.05], 'tbBlack', 0.01); K.box(screenMat(P, [0.04, 0.2, 0.25], 'mapBg'), [x, y, 0.028], [w, h, 0.004], 'white'); const T = TB.teal(P); for (let k = 0; k < 6; k++) { const a = [x - w * 0.4 + rng() * w * 0.8, y - h * 0.4 + rng() * h * 0.8], b = [x - w * 0.4 + rng() * w * 0.8, y - h * 0.4 + rng() * h * 0.8], d = V.len(V.sub([...a, 0], [...b, 0])); K.box(T, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.032], [d, 0.012, 0.002], 'white', null, Math.atan2(b[1] - a[1], b[0] - a[0])); K.cyl(P(k === 4 ? 'sigRed' : 'sigGreen'), [a[0], a[1], 0.03], [a[0], a[1], 0.037], 0.035, 0.035, 8, 'white'); } }
      return TB.done('monitor_wall', P, { collider: K.boxCol(W + 0.2, H0 + Rr * (ch + 0.05) + 0.1, 0.3) }, { ao: 0.1, dust: 0 });
    } });

  // ---------- طاولة اللاسلكي ----------
  TB.def('radio_desk', { name: 'طاولة اللاسلكي', nameEn: 'Radio desk', group: 'tb_rooms',
    schema: [{ key: 'recorder', label: 'جهاز التسجيل عليها', type: 'bool', def: true }, { key: 'worn', label: 'مهجورة (غبار)', type: 'bool', def: true }],
    presets: { 'مع التسجيل': {}, 'نظيفة': { recorder: false, worn: false } },
    generate: (p, q) => {
      const P = K.parts(), rng = AA.rng(p.seed), Wd = P('wood');
      TB.box(Wd, [0, 0.76, 0], [1.8, 0.05, 0.8], 'tbWoodDark', 0.01); for (const s of [1, -1]) TB.box(P('metal'), [s * 0.82, 0.37, 0], [0.06, 0.74, 0.7], 'tbSteel2', 0.01); TB.box(P('metal'), [0.55, 0.45, 0], [0.5, 0.55, 0.65], 'tbSteel2', 0.02); for (let k = 0; k < 3; k++) K.box(P('metal'), [0.55, 0.3 + k * 0.17, 0.33], [0.42, 0.13, 0.01], 'tbSteel', null);
      // أجهزة اللاسلكي
      TB.box(P('metal'), [-0.35, 0.95, -0.2], [0.75, 0.33, 0.35], 'tbOlive2', 0.02); for (let k = 0; k < 4; k++) { K.cyl(P('metal'), [-0.6 + k * 0.15, 0.97, -0.02], [-0.6 + k * 0.15, 0.97, 0.0], 0.035, 0.035, 8, 'tbBlack'); } K.box(screenMat(P, [1, 0.62, 0.2], 'radioScr'), [-0.2, 1.05, -0.02], [0.3, 0.08, 0.004], 'white'); TB.box(P('metal'), [0.25, 0.9, -0.25], [0.35, 0.22, 0.3], 'tbGunmetal', 0.02); K.cyl(P('metal'), [0.35, 1.0, -0.3], [0.35, 1.6, -0.3], 0.008, 0.004, 4, 'tbSteel');
      // سماعة وميكروفون وورق
      K.cyl(P('plastic'), [0.0, 0.8, 0.15], [0.0, 0.85, 0.15], 0.07, 0.07, 8, 'tbBlack'); K.cyl(P('plastic'), [0.18, 0.8, 0.15], [0.18, 0.85, 0.15], 0.07, 0.07, 8, 'tbBlack'); K.cyl(P('plastic'), [0.0, 0.85, 0.15], [0.18, 0.85, 0.15], 0.01, 0.01, 4, 'tbBlack');
      for (let k = 0; k < 3; k++) K.box(P('paint'), [-0.55 + k * 0.08, 0.79 + k * 0.003, 0.2], [0.21, 0.002, 0.3], 'tbWhite', null, 0);
      if (p.recorder) TB.recorderInto(P, [0.55, 0.785, 0.1], 0.4);
      if (p.worn) for (let k = 0; k < 5; k++) K.box(P('ground'), [-0.8 + rng() * 1.6, 0.787, -0.3 + rng() * 0.6], [0.1 + rng() * 0.2, 0.002, 0.1 + rng() * 0.15], 'tbSand', null, rng() * 3);
      return TB.done('radio_desk', P, { collider: K.boxCol(1.8, 1.2, 0.8), objective: p.recorder ? 'recorder' : null, pickup: p.recorder ? [0.55, 0.8, 0.1] : null }, { ao: 0.2, dust: 0.05 });
    } });

  // ---------- باب أمني بقارئ بطاقة ----------
  TB.def('door', { name: 'باب أمني', nameEn: 'Security door', group: 'tb_rooms',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['sliding', 'منزلق مزدوج'], ['hinged', 'مفصلي'], ['blast', 'باب مصفّح ضخم']], def: 'sliding' }, { key: 'open', label: 'الفتح', min: 0, max: 1, step: 0.05, def: 0 }, TB.stateOpt('alarm'), { key: 'wall', label: 'جدار حوله', type: 'bool', def: true }],
    presets: { 'منزلق مغلق': {}, 'منزلق مفتوح': { open: 1, state: 'calm' }, 'مفصلي': { kind: 'hinged', state: 'suspect' }, 'مصفّح': { kind: 'blast', open: 0.3 } },
    generate: (p, q) => {
      const P = K.parts(), blast = p.kind === 'blast', dw = blast ? 3.2 : p.kind === 'hinged' ? 1.0 : 1.8, dh = blast ? 3.0 : 2.3, M = P('metal'), St = P('stone');
      if (p.wall) { const ww = dw + 2.4, H = dh + 1.0; for (const s of [1, -1]) TB.box(St, [s * (dw / 2 + 0.6), H / 2, 0], [1.2, H, 0.3], blast ? 'tbConcrete2' : 'tbPaint', 0.03); TB.box(St, [0, dh + 0.5, 0], [dw, 1.0, 0.3], blast ? 'tbConcrete2' : 'tbPaint', 0.03); void ww; }
      TB.box(M, [0, dh / 2, 0.16], [dw + 0.2, dh + 0.1, 0.06], 'tbGunmetal', 0.02); K.box(P('dark'), [0, dh / 2, 0.0], [dw, dh, 0.3], '#090b0d');
      if (p.kind === 'sliding') { const sl = p.open * dw / 2; for (const s of [1, -1]) { const L = P.custom('door' + (s > 0 ? 'R' : 'L'), LP.mat('metal', { metalness: 0.5, roughness: 0.4 })); TB.box(L, [s * (dw / 4 + sl), dh / 2, 0.08], [dw / 2 - 0.02, dh - 0.02, 0.1], 'tbSteel', 0.02); K.box(L, [s * (dw / 4 + sl), dh * 0.62, 0.135], [0.25, 0.6, 0.01], 'glassDark'); K.box(L, [s * (sl + 0.02), dh / 2, 0.135], [0.03, dh - 0.1, 0.01], 'tbYellow'); } }
      else if (p.kind === 'hinged') { const a = p.open * 1.5, hp = [-dw / 2, 0, 0.1], c = [hp[0] + Math.cos(a) * dw / 2, dh / 2, hp[2] + Math.sin(a) * dw / 2], L = P.custom('door', LP.mat('metal', { metalness: 0.45, roughness: 0.45, hinge: { pivot: hp, axis: 'y' } })); TB.box(L, [0, 0, 0], [dw - 0.02, dh - 0.02, 0.06], 'tbSteel2', 0.015, { at: c, rot: -a }); K.box(L, [0, 0.0, 0.035], [0.3, 0.4, 0.01], 'glassDark', { at: [c[0], c[1] + 0.4, c[2]], rot: -a }); TB.box(L, [0, 0, 0.05], [0.12, 0.04, 0.04], 'tbSteel', 0.005, { at: K.X([dw / 2 - 0.15, 0, 0], { at: c, rot: -a }), rot: -a }); }
      else { const lift = p.open * (dh - 0.2), L = P.custom('blast', LP.mat('metal', { metalness: 0.55, roughness: 0.45 })); TB.box(L, [0, dh / 2 + lift, 0.08], [dw - 0.02, dh - 0.02, 0.25], 'tbSteel2', 0.05); for (let k = 0; k < 6; k++) K.box(L, [-dw / 2 + 0.25 + k * (dw - 0.5) / 5, 0.25 + lift, 0.215], [0.28, 0.3, 0.01], k % 2 ? 'tbYellow' : 'tbBlack', null, 0.6); for (const s of [1, -1]) TB.box(M, [s * (dw / 2 + 0.15), dh / 2, 0.15], [0.2, dh, 0.2], 'tbGunmetal', 0.02); TB.sign(P, 'SECTOR 5', [0, dh + 0.55, 0.16], 0.06, 'tbRawafid', 'tbWhite'); }
      // قارئ بطاقة وضوء حالة
      const rx = dw / 2 + 0.35; TB.box(M, [rx, 1.3, 0.17], [0.16, 0.26, 0.05], 'tbBlack', 0.01); K.box(screenMat(P, p.state === 'alarm' ? [1, 0.2, 0.15] : p.state === 'suspect' ? [1, 0.7, 0.2] : [0.2, 1, 0.5], 'reader'), [rx, 1.34, 0.197], [0.1, 0.08, 0.004], 'white'); K.box(P('dark'), [rx, 1.24, 0.197], [0.11, 0.008, 0.004], 'tbSteel'); TB.stateLamp(P, [0, dh + 0.12, 0.2], 0.05, p.state);
      return TB.done('door', P, { collider: K.boxCol(dw + 2.4, dh + 1, 0.3), passage: { width: dw, height: dh, open: p.open }, reader: [rx, 1.3, 0.25], state: p.state }, { ao: 0.2, dust: 0.05 });
    } });

  // ---------- خزائن ----------
  TB.def('locker', { name: 'خزائن', nameEn: 'Lockers', group: 'tb_rooms',
    schema: [{ key: 'count', label: 'العدد', min: 1, max: 8, step: 1, def: 4 }, { key: 'color', label: 'اللون', type: 'enum', options: [['tbOlive', 'زيتي'], ['tbSteel', 'رمادي'], ['tbRawafid', 'أزرق'], ['tbRust', 'صدئ']], def: 'tbSteel' }, { key: 'open', label: 'خزانة مفتوحة', type: 'bool', def: true }],
    presets: { 'صف': {}, 'زيتي': { color: 'tbOlive', count: 6 }, 'مغلقة': { open: false } },
    generate: (p, q) => {
      const P = K.parts(), n = p.count, W = 0.45, H = 1.85, D = 0.5, c = p.color, M = P('metal'), rng = AA.rng(p.seed), oi = p.open ? Math.floor(rng() * n) : -1;
      for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * W; TB.box(M, [x, H / 2 + 0.05, 0], [W - 0.01, H, D], sh(c, 0.12), 0.015); if (i === oi) { K.box(P('dark'), [x, H / 2 + 0.05, D / 2 - 0.01], [W - 0.06, H - 0.06, 0.01], '#14171a'); TB.box(M, [0, 0, 0], [W - 0.05, H - 0.05, 0.025], c, 0.008, { at: [x - W / 2 + 0.02 + 0.18, H / 2 + 0.05, D / 2 + W / 2 - 0.08], rot: -1.3 }); TB.box(P('cloth'), [x, H * 0.55, 0], [0.3, 0.6, 0.15], 'tbOlive2', 0.03); TB.box(M, [x, H * 0.82, 0], [W - 0.08, 0.02, D - 0.08], sh(c, 0.2), 0.005); } else { TB.box(M, [x, H / 2 + 0.05, D / 2 + 0.005], [W - 0.04, H - 0.04, 0.02], c, 0.008); for (let k = 0; k < 4; k++) K.box(P('dark'), [x, H - 0.15 - k * 0.04, D / 2 + 0.017], [W * 0.5, 0.015, 0.004], sh(c, 0.4)); K.box(M, [x + W / 2 - 0.08, H * 0.5, D / 2 + 0.025], [0.025, 0.14, 0.02], 'tbSteel2'); K.box(P('stone'), [x, H - 0.4, D / 2 + 0.018], [0.12, 0.06, 0.004], 'tbWhite'); } TB.box(M, [x, 0.025, 0], [W - 0.02, 0.05, D - 0.04], 'tbGunmetal', 0.005); }
      return TB.done('locker', P, { collider: K.boxCol(n * W, H, D), hide: p.open ? null : null });
    } });

  // ---------- رفوف صناعية ----------
  TB.def('shelving', { name: 'رفوف صناعية', nameEn: 'Industrial shelving', group: 'tb_rooms',
    schema: [{ key: 'length', label: 'الطول', min: 1.5, max: 10, step: 0.5, def: 4, unit: 'م' }, { key: 'levels', label: 'الأدوار', min: 2, max: 5, step: 1, def: 4 }, { key: 'height', label: 'الارتفاع', min: 1.8, max: 6, step: 0.1, def: 3, unit: 'م' }, { key: 'fill', label: 'الامتلاء', min: 0, max: 1, step: 0.05, def: 0.75 }],
    presets: { 'رف': {}, 'عالي': { height: 5.5, levels: 5, length: 6 }, 'فارغ': { fill: 0.15 } },
    generate: (p, q) => {
      const P = K.parts(), L = p.length, H = p.height, Dp = 1.1, n = p.levels, rng = AA.rng(p.seed), M = P('metal');
      const bays = Math.max(1, Math.round(L / 2));
      for (let i = 0; i <= bays; i++) { const x = -L / 2 + L * i / bays; for (const z of [Dp / 2, -Dp / 2]) TB.box(M, [x, H / 2, z], [0.08, H, 0.08], 'tbRawafid', 0.012); for (let k = 0; k < Math.round(H / 0.8); k++) K.cyl(M, [x, 0.3 + k * 0.8, Dp / 2], [x, 0.7 + k * 0.8, -Dp / 2], 0.015, 0.015, 4, 'tbRawafid'); }
      for (let l = 0; l < n; l++) { const y = 0.15 + l * (H - 0.3) / (n - 1); for (const z of [Dp / 2, -Dp / 2]) TB.box(M, [0, y, z], [L, 0.1, 0.06], 'tbOrange', 0.01); K.box(M, [0, y + 0.06, 0], [L - 0.05, 0.02, Dp - 0.05], 'tbSteel2');
        if (l === n - 1) continue;
        for (let b = 0; b < bays; b++) { let x = -L / 2 + L * b / bays + 0.1; const end = -L / 2 + L * (b + 1) / bays - 0.1; while (x < end - 0.3) { const w = 0.35 + rng() * 0.5, h = Math.min(0.2 + rng() * 0.45, (H - 0.3) / (n - 1) - 0.2), d = 0.4 + rng() * 0.5; if (x + w > end) break; if (rng() < p.fill) { const kind = rng(); if (kind < 0.5) TB.box(P('wood'), [x + w / 2, y + 0.07 + h / 2, (rng() - 0.5) * 0.2], [w, h, d], ['#b48d5f', '#a07a4c', '#c29d6c'][Math.floor(rng() * 3)], 0.015); else if (kind < 0.8) TB.box(P('plastic'), [x + w / 2, y + 0.07 + h / 2, 0], [w, h, d], ['tbOlive', 'tbSteel', 'tbRawafid'][Math.floor(rng() * 3)], 0.02); else K.cyl(P('metal'), [x + w / 2, y + 0.07, 0], [x + w / 2, y + 0.07 + Math.min(h, 0.5), 0], Math.min(w, d) / 2.2, Math.min(w, d) / 2.2, 10, ['tbRed', 'tbYellow', 'tbSteel'][Math.floor(rng() * 3)]); } x += w + 0.05; } }
      }
      return TB.done('shelving', P, { collider: K.boxCol(L, H, Dp), cover: 'full' }, { ao: 0.25, dust: 0.1 });
    } });

  // ---------- لوحة عدادات وصمامات ----------
  TB.def('gauge_panel', { name: 'لوحة عدادات', nameEn: 'Gauge panel', group: 'tb_rooms',
    schema: [{ key: 'gauges', label: 'العدادات', min: 2, max: 8, step: 1, def: 4 }, TB.stateOpt('calm'), { key: 'message', label: 'شاشة رسالة', type: 'bool', def: true }],
    presets: { 'عادية': {}, 'رسالة التعرف': { state: 'suspect', message: true, gauges: 6 } },
    generate: (p, q) => {
      const P = K.parts(), n = p.gauges, W = Math.max(1.4, n * 0.4 + 0.4), M = P('metal'), rng = AA.rng(p.seed);
      TB.box(M, [0, 1.4, 0.06], [W, 1.2, 0.12], 'tbSteel', 0.03); for (const s of [1, -1]) TB.box(M, [s * (W / 2 - 0.05), 0.4, 0.06], [0.08, 0.8, 0.08], 'tbSteel2', 0.01);
      for (let i = 0; i < n; i++) { const x = -W / 2 + 0.3 + i * (W - 0.6) / Math.max(1, n - 1), y = 1.65; K.cyl(M, [x, y, 0.12], [x, y, 0.16], 0.13, 0.13, 12, 'tbGunmetal'); K.cyl(P('stone'), [x, y, 0.16], [x, y, 0.163], 0.11, 0.11, 12, 'tbWhite'); K.box(P('dark'), [x, y, 0.165], [0.09, 0.008, 0.003], 'tbRed', null, rng() * 2 - 0.5); K.box(P('stone'), [x - 0.05, y - 0.06, 0.164], [0.04, 0.025, 0.002], 'tbGreen', null, 0); }
      if (p.message) { TB.box(P('plastic'), [0, 1.2, 0.13], [Math.min(W - 0.3, 1.0), 0.28, 0.03], 'tbBlack', 0.01); K.box(screenMat(P, p.state === 'suspect' ? [1, 0.75, 0.25] : [0.2, 0.85, 0.85], 'msg'), [0, 1.2, 0.149], [Math.min(W - 0.3, 1.0) - 0.06, 0.22, 0.003], 'white'); K.text(P.custom('msgInk', LP.mat('lamp', { emissive: [0.05, 0.1, 0.1], glow: 0.2 })), 'ID OK', 0, 1.2, 0.153, 0.022, 'white'); }
      for (let i = 0; i < 3; i++) TB.stateLamp(P, [W / 2 - 0.2 - i * 0.12, 1.92, 0.13], 0.025, i === 0 ? p.state : 'calm');
      TB.valveInto(P, [-W / 2 + 0.3, 0.9, 0.12], 'z', 0.12, 'tbRed'); TB.valveInto(P, [W / 2 - 0.3, 0.9, 0.12], 'z', 0.12, 'tbRawafid');
      return TB.done('gauge_panel', P, { collider: K.boxCol(W, 2, 0.3), interactive: 'panel' }, { ao: 0.1, dust: 0 });
    } });

  // ---------- طاولة خرائط ----------
  TB.def('map_table', { name: 'طاولة خرائط', nameEn: 'Map table', group: 'tb_rooms',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['paper', 'خرائط ورقية'], ['holo', 'طاولة رقمية مضيئة']], def: 'holo' }, { key: 'size', label: 'الطول', min: 1.2, max: 3, step: 0.1, def: 2, unit: 'م' }],
    presets: { 'رقمية': {}, 'ورقية': { kind: 'paper', size: 1.6 } },
    generate: (p, q) => {
      const P = K.parts(), L = p.size, W = L * 0.6, rng = AA.rng(p.seed);
      TB.box(P('metal'), [0, 0.45, 0], [L * 0.7, 0.9, W * 0.6], 'tbGunmetal', 0.04); TB.box(P('metal'), [0, 0.93, 0], [L, 0.06, W], 'tbSteel2', 0.02);
      if (p.kind === 'holo') { K.box(screenMat(P, [0.04, 0.22, 0.26], 'tableScr'), [0, 0.965, 0], [L - 0.1, 0.004, W - 0.1], 'white'); const T = TB.teal(P); for (let k = 0; k < 7; k++) { const a = [(rng() - 0.5) * (L - 0.3), (rng() - 0.5) * (W - 0.3)], b = [(rng() - 0.5) * (L - 0.3), (rng() - 0.5) * (W - 0.3)], d = Math.hypot(b[0] - a[0], b[1] - a[1]); K.box(T, [(a[0] + b[0]) / 2, 0.969, (a[1] + b[1]) / 2], [d, 0.003, 0.012], 'white', { at: [0, 0, 0], rot: -Math.atan2(b[1] - a[1], b[0] - a[0]) }); K.cyl(P(k < 5 ? 'sigGreen' : 'sigRed'), [a[0], 0.967, a[1]], [a[0], 0.975 + (k === 6 ? 0.25 : 0), a[1]], 0.03, 0.02, 8, 'white'); } K.box(TB.teal(P), [0, 0.95, W / 2 + 0.005], [L - 0.05, 0.02, 0.01], 'white'); }
      else { for (let k = 0; k < 4; k++) K.box(P('paint'), [(rng() - 0.5) * 0.6, 0.963 + k * 0.002, (rng() - 0.5) * 0.3], [0.7, 0.002, 0.5], ['#d9cfb4', '#cfc29f', '#e2d9c2', '#c4b791'][k], null, 0); for (let k = 0; k < 6; k++) { const x = (rng() - 0.5) * (L - 0.4), z = (rng() - 0.5) * (W - 0.3); K.cyl(P('plastic'), [x, 0.966, z], [x, 1.02, z], 0.012, 0.012, 6, 'tbRed'); } TB.box(P('plastic'), [L * 0.3, 0.98, W * 0.25], [0.3, 0.02, 0.2], 'tbBlack', 0.005); }
      return TB.done('map_table', P, { collider: K.boxCol(L, 1, W), interactive: 'map' }, { ao: 0.15, dust: 0 });
    } });

  // ---------- كرسي مكتب ----------
  TB.def('chair', { name: 'كرسي مكتب', nameEn: 'Office chair', group: 'tb_rooms',
    schema: [{ key: 'color', label: 'اللون', type: 'enum', options: [['tbBlack', 'أسود'], ['tbOlive', 'زيتي'], ['tbRawafid', 'أزرق']], def: 'tbBlack' }, { key: 'turn', label: 'الدوران', min: -180, max: 180, step: 5, def: 0, unit: '°' }],
    presets: { 'أسود': {}, 'مائل': { turn: 35, color: 'tbRawafid' } },
    generate: (p, q) => {
      const P = K.parts(), o = { at: [0, 0, 0], rot: p.turn * Math.PI / 180 }, M = P('metal');
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; K.cyl(M, [0, 0.08, 0], [Math.cos(a) * 0.3, 0.05, Math.sin(a) * 0.3], 0.02, 0.02, 4, 'tbGunmetal'); K.ball(P('rubber'), [Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3], 0.03, 'tbRubber'); }
      K.cyl(M, [0, 0.08, 0], [0, 0.42, 0], 0.03, 0.03, 8, 'tbSteel2'); TB.box(P('cloth'), [0, 0.47, 0], [0.5, 0.09, 0.48], p.color, 0.035, o); TB.box(P('cloth'), [0, 0.85, -0.23], [0.46, 0.6, 0.08], p.color, 0.035, o); TB.box(M, [0, 0.55, -0.22], [0.06, 0.2, 0.04], 'tbGunmetal', 0.01, o); for (const s of [1, -1]) { TB.box(M, [s * 0.27, 0.62, 0], [0.04, 0.2, 0.04], 'tbGunmetal', 0.01, o); TB.box(P('plastic'), [s * 0.27, 0.73, 0.02], [0.06, 0.04, 0.28], 'tbBlack', 0.01, o); }
      return TB.done('chair', P, { seat: [0, 0.5, 0] }, { ao: 0.1, dust: 0 });
    } });

  // ---------- قلب السديم ----------
  TB.def('sadeem_core', { name: 'قلب السديم', nameEn: 'Sadeem core', group: 'tb_rooms',
    schema: [{ key: 'size', label: 'المقياس', min: 0.6, max: 2, step: 0.05, def: 1 }, { key: 'mode', label: 'الحالة', type: 'enum', options: [['central', 'تحكم مركزي (فيروزي)'], ['lockdown', 'إغلاق نهائي (أحمر)'], ['local', 'شبكة محلية (أخضر)']], def: 'central' }, { key: 'tanks', label: 'خزانات حوله', min: 0, max: 6, step: 1, def: 4 }, { key: 'bridge', label: 'جسر الوصول', type: 'bool', def: true }],
    presets: { 'مركزي': {}, 'إغلاق': { mode: 'lockdown' }, 'محلي': { mode: 'local', tanks: 6 } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, n = K.sides(q, 20), M = P('metal'), S = v => v.map(x => x * s);
      const glowC = p.mode === 'lockdown' ? [1, 0.2, 0.12] : p.mode === 'local' ? [0.3, 1, 0.5] : [0.18, 0.88, 0.82];
      const Gl = P.custom('coreGlow', LP.mat('lamp', { emissive: glowC, glow: 1.8 })), Wt = P.custom('coreWater', LP.mat('water', { roughness: 0.1, opacity: 0.6, emissive: glowC.map(x => x * 0.45), glow: 0.8, doubleSided: true }));
      // حوض دائري وقاعدة متدرجة
      TB.cyl(P('stone'), [0, 0, 0], S([0, 0.4, 0]), 6.5 * s, 'tbConcreteDark', n, 0.08 * s); TB.cyl(P('stone'), S([0, 0.4, 0]), S([0, 0.8, 0]), 5.6 * s, 'tbConcrete2', n, 0.06 * s);
      K.cyl(Wt, S([0, 0.8, 0]), S([0, 0.85, 0]), 5.1 * s, 5.1 * s, n, 'white'); K.cyl(Gl, S([0, 0.8, 0]), S([0, 0.83, 0]), 5.62 * s, 5.62 * s, n, 'white', null, { noCaps: true });
      // العمود المركزي: ماء متوهج داخل زجاج بحلقات
      const H = 9 * s; TB.cyl(M, S([0, 0.85, 0]), S([0, 1.6, 0]), 1.9 * s, 'tbGunmetal', n, 0.08 * s);
      K.cyl(P('glass'), S([0, 1.6, 0]), [0, H - 0.6 * s, 0], 1.35 * s, 1.35 * s, n, 'glass', null, { noCaps: true }); K.cyl(Wt, S([0, 1.6, 0]), [0, H - 0.6 * s, 0], 1.25 * s, 1.25 * s, n, 'white');
      K.cyl(Gl, S([0, 1.6, 0]), [0, H - 0.6 * s, 0], 0.35 * s, 0.35 * s, 10, 'white');
      for (let k = 0; k < 5; k++) { const y = 2.2 * s + k * (H - 3 * s) / 4; K.cyl(M, [0, y, 0], [0, y + 0.25 * s, 0], 1.55 * s, 1.55 * s, n, 'tbSteel2'); K.cyl(Gl, [0, y + 0.08 * s, 0], [0, y + 0.17 * s, 0], 1.57 * s, 1.57 * s, n, 'white', null, { noCaps: true }); }
      TB.cyl(M, [0, H - 0.6 * s, 0], [0, H + 0.3 * s, 0], 1.9 * s, 'tbGunmetal', n, 0.08 * s); K.cyl(M, [0, H + 0.3 * s, 0], [0, H + 1.2 * s, 0], 1.2 * s, 0.4 * s, n, 'tbSteel2');
      // أذرع وأنابيب ضخمة تتصل بالجدران
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.26, d = [Math.cos(a), 0, Math.sin(a)], y = H - 1.2 * s + (k % 2) * 0.7 * s; K.cyl(M, V.add([0, y, 0], V.scale(d, 1.8 * s)), V.add([0, y + 1.6 * s, 0], V.scale(d, 7.5 * s)), 0.28 * s, 0.28 * s, 10, k % 2 ? 'tbRawafid' : 'tbSteel'); K.cyl(Gl, V.add([0, y + 0.4 * s, 0], V.scale(d, 3.3 * s)), V.add([0, y + 0.42 * s, 0], V.scale(d, 3.32 * s)), 0.3 * s, 0.3 * s, 10, 'white'); }
      // خزانات زجاجية حول القلب
      for (let k = 0; k < p.tanks; k++) { const a = k / Math.max(1, p.tanks) * Math.PI * 2, c = [Math.cos(a) * 4.4 * s, 0.85 * s, Math.sin(a) * 4.4 * s], r = 0.55 * s, h = 2.6 * s; TB.cyl(M, c, V.add(c, [0, 0.3 * s, 0]), r + 0.12 * s, 'tbGunmetal', 12, 0.03 * s); K.cyl(P('glass'), V.add(c, [0, 0.3 * s, 0]), V.add(c, [0, 0.3 * s + h, 0]), r, r, 12, 'glass', null, { noCaps: true }); K.cyl(Wt, V.add(c, [0, 0.3 * s, 0]), V.add(c, [0, 0.3 * s + h * (0.5 + 0.08 * k), 0]), r - 0.03, r - 0.03, 12, 'white'); TB.cyl(M, V.add(c, [0, 0.3 * s + h, 0]), V.add(c, [0, 0.55 * s + h, 0]), r + 0.12 * s, 'tbGunmetal', 12, 0.03 * s); K.cyl(Gl, V.add(c, [0, 0.32 * s, 0]), V.add(c, [0, 0.36 * s, 0]), r + 0.13 * s, r + 0.13 * s, 12, 'white', null, { noCaps: true }); }
      // جسر الوصول إلى منصة التحكم عند القاعدة
      if (p.bridge) { const z0 = 1.9 * s, z1 = 7.5 * s, y = 1.6 * s; TB.box(M, [0, y, (z0 + z1) / 2], [1.4 * s, 0.12, z1 - z0], 'tbSteel2', 0.02); for (const sx of [1, -1]) { K.cyl(M, [sx * 0.7 * s, y + 1.0, z0], [sx * 0.7 * s, y + 1.0, z1], 0.025, 0.025, 6, 'tbYellow'); for (let z = z0; z <= z1 + 0.01; z += 1.2) K.cyl(M, [sx * 0.7 * s, y, z], [sx * 0.7 * s, y + 1.0, z], 0.025, 0.025, 6, 'tbYellow'); } K.box(Gl, [0, y + 0.065, (z0 + z1) / 2], [0.05, 0.005, z1 - z0], 'white'); TB.box(M, [0, 0.8 * s + (y - 0.8 * s) / 2, z1], [1.6 * s, y - 0.8 * s, 0.6], 'tbGunmetal', 0.03); }
      return TB.done('sadeem_core', P, { collider: { type: 'cylinder', radius: 6.5 * s, height: H }, light: { at: [0, H * 0.5, 2 * s], color: glowC, intensity: 4, distance: 18 * s }, objective: 'core', use: p.bridge ? [0, 1.6 * s, 2.3 * s] : null }, { ao: 0.15, dust: 0 });
    } });
})(typeof window !== 'undefined' ? window : globalThis);

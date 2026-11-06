// Aboden Assets — kit/kit-tools.js — الأشغال اليدوية: عدد يدوية، عدد كهربائية، قياس، تثبيت، صندوق عدة وطاولة شغل، دهان، بناء، سباكة، كهرباء
// العدد الصغيرة مستلقية على الأرض: المقبض نحو -Z والرأس نحو +Z، وmeta.grip = نقطة المسك واتجاه المقبض (لربطها بيد شخصية في اللعبة).
(function (g) {
  'use strict';
  const AA = g.AA, K = AA.kit, V = AA.v, LP = AA.lp, lerp = AA.lerp, mixc = AA.mixc;
  const HANDLE = [['red', 'أحمر'], ['yellow', 'أصفر'], ['blue', 'أزرق'], ['black', 'أسود'], ['orange', 'برتقالي'], ['green', 'أخضر'], ['wood', 'خشب']];
  const grip = (z0, z1, y) => ({ at: [0, y, (z0 + z1) / 2], dir: [0, 0, 1], length: z1 - z0 });
  // مقبض بلاستيك بحلقات مطاط
  function handle(P, z0, z1, r, col, y, q) {
    const n = K.sides(q, 8), wood = col === 'wood';
    K.cyl(P(wood ? 'wood' : 'plastic'), [0, y, z0], [0, y, z1], r * 0.9, r, n, wood ? 'woodLight' : col);
    if (!wood) for (let k = 0; k < 3; k++) { const z = lerp(z0 + 0.02, z1 - 0.02, (k + 0.5) / 3); K.cyl(P('rubber'), [0, y, z - 0.008], [0, y, z + 0.008], r * 1.04, r * 1.04, n, 'black', null, { noCaps: true }); }
  }

  // ---------- مفك ----------
  K.def('screwdriver', { name: 'مفك', nameEn: 'Screwdriver', group: 'tools',
    schema: [{ key: 'tip', label: 'الرأس', type: 'enum', options: [['phillips', 'صليبة (+)'], ['flat', 'مسطح (−)'], ['hex', 'سداسي']], def: 'phillips' }, { key: 'length', label: 'الطول', min: 0.12, max: 0.4, step: 0.01, def: 0.22, unit: 'م' }, { key: 'color', label: 'لون المقبض', type: 'enum', options: HANDLE, def: 'red' }],
    presets: { 'مسطح أصفر': { tip: 'flat', color: 'yellow' }, 'طويل': { length: 0.36, color: 'blue' } },
    generate: (p, q) => { const P = K.parts(), L = p.length, hL = L * 0.42, r = 0.016, y = r * 1.05, z0 = -L / 2, z1 = z0 + hL;
      handle(P, z0, z1, r, p.color, y, q); K.cyl(P('plastic'), [0, y, z0 - 0.004], [0, y, z0], r * 0.7, r * 0.9, 8, p.color === 'wood' ? 'woodDark' : p.color);
      const M = P('chrome'), tipZ = L / 2 - 0.012; K.cyl(M, [0, y, z1], [0, y, tipZ], 0.0045, 0.0045, 6, 'chrome');
      if (p.tip === 'flat') K.box(M, [0, y, tipZ + 0.006], [0.009, 0.0018, 0.012], 'chrome'); else if (p.tip === 'hex') K.cyl(M, [0, y, tipZ], [0, y, tipZ + 0.012], 0.0042, 0.0042, 6, 'steel'); else { K.cyl(M, [0, y, tipZ], [0, y, tipZ + 0.012], 0.0045, 0.0005, 4, 'chrome'); }
      return K.done('screwdriver', P, { collider: K.boxCol(0.04, 0.035, L), grip: grip(z0, z1, y), tool: 'screwdriver' }); } });

  // ---------- مطرقة ----------
  K.def('hammer', { name: 'مطرقة', nameEn: 'Hammer', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['claw', 'شاكوش بمخلب'], ['sledge', 'مرزبة'], ['mallet', 'مطرقة خشب'], ['rubber', 'مطرقة مطاط']], def: 'claw' }, { key: 'color', label: 'لون المقبض', type: 'enum', options: HANDLE, def: 'wood' }],
    presets: { 'مرزبة': { kind: 'sledge' }, 'مطرقة مطاط': { kind: 'rubber', color: 'black' }, 'خشب': { kind: 'mallet' } },
    generate: (p, q) => { const P = K.parts(), k = p.kind, L = k === 'sledge' ? 0.8 : 0.32, r = k === 'sledge' ? 0.02 : 0.016, z0 = -L / 2, hz = L / 2 - 0.03, n = K.sides(q, 8);
      const hw = k === 'sledge' ? 0.22 : k === 'claw' ? 0.13 : 0.12, hr = k === 'sledge' ? 0.045 : k === 'claw' ? 0.016 : 0.035, y = hr * 1.05;
      handle(P, z0, hz - hr, r, p.color, y, q);
      if (k === 'claw') { const M = P('metal'); K.cyl(M, [0.01, y, hz], [0.065, y, hz], hr, hr, n, 'steel'); K.cyl(M, [0.065, y, hz], [0.075, y, hz], hr * 1.1, hr * 1.1, n, 'chrome'); K.box(M, [0.0, y, hz], [0.03, hr * 2, 0.03], 'steel');
        for (const s of [1, -1]) K.extrude(M, [[-0.01, -0.004], [-0.06, 0.006], [-0.065, 0.01], [-0.02, 0.006]].map(([x, yy]) => [x, yy]), 'y', y - 0.006 + s * 0.004, y + 0.006 + s * 0.004, 'steel', { at: [0, 0, hz + s * 0.006] }); }
      else { const B = k === 'mallet' ? P('wood') : k === 'rubber' ? P('rubber') : P('metal'), col = k === 'mallet' ? 'woodLight' : k === 'rubber' ? 'black' : 'steel'; K.cyl(B, [-hw / 2, y, hz], [hw / 2, y, hz], hr, hr, n, col); if (k === 'rubber') K.cyl(P('plastic'), [hw / 2, y, hz], [hw / 2 + 0.005, y, hz], hr * 0.9, hr * 0.9, n, 'offwhite'); }
      return K.done('hammer', P, { collider: K.boxCol(hw + 0.03, hr * 2.2, L), grip: grip(z0, z0 + L * 0.5, y), tool: 'hammer' }); } });

  // ---------- مفاتيح ----------
  K.def('wrench', { name: 'مفتاح ربط', nameEn: 'Wrench', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['open', 'مفتاح شق'], ['adjustable', 'إنجليزي'], ['pipe', 'مفتاح مواسير'], ['allen', 'مفاتيح ألن']], def: 'adjustable' }, { key: 'size', label: 'المقاس', min: 0.6, max: 2, step: 0.05, def: 1, pct: true }],
    presets: { 'مواسير': { kind: 'pipe', size: 1.4 }, 'شق': { kind: 'open' }, 'ألن': { kind: 'allen' } },
    generate: (p, q) => { const P = K.parts(), s = p.size, M = P('chrome'), k = p.kind, t = 0.008 * s, y = t / 2 + 0.002;
      if (k === 'allen') { const H = P('plastic'); for (let i = 0; i < 6; i++) { const L = (0.06 + i * 0.012) * s, x = (i - 2.5) * 0.012 * s, r = (0.0018 + i * 0.0006) * s; K.cyl(M, [x, r, -L / 2], [x, r, L / 2], r, r, 6, i % 2 ? 'dark' : 'steel'); K.cyl(M, [x, r, L / 2], [x + 0.025 * s, r, L / 2], r, r, 6, i % 2 ? 'dark' : 'steel'); } K.box(H, [0, 0.006 * s, -0.035 * s], [0.085 * s, 0.012 * s, 0.025 * s], 'red'); return K.done('wrench', P, { collider: K.boxCol(0.1 * s, 0.02, 0.15 * s), tool: 'allen' }); }
      const L = (k === 'pipe' ? 0.35 : 0.22) * s, w = (k === 'pipe' ? 0.03 : 0.022) * s, z0 = -L / 2;
      K.extrude(M, [[-w / 2, z0], [w / 2, z0], [w * 0.6, L / 2 - 0.05 * s], [-w * 0.6, L / 2 - 0.05 * s]], 'y', 0.002, 0.002 + t, k === 'pipe' ? 'red' : 'chrome');
      if (k === 'open') { for (const [z, a] of [[L / 2 - 0.02 * s, 0.3], [z0 + 0.004, -0.3]]) { const R = 0.022 * s; const pts = []; for (let i = 0; i <= 8; i++) { const b = a + (0.35 + i / 8 * 1.3) * Math.PI; pts.push([Math.cos(b) * R, z + Math.sin(b) * R]); } for (let i = 8; i >= 0; i--) { const b = a + (0.35 + i / 8 * 1.3) * Math.PI; pts.push([Math.cos(b) * R * 0.5, z + Math.sin(b) * R * 0.5]); } K.extrude(M, pts, 'y', 0.002, 0.002 + t, 'chrome'); } }
      else { const hz = L / 2 - 0.03 * s, J = P('metal'); K.box(J, [0, y, hz], [0.05 * s, t * 1.4, 0.05 * s], k === 'pipe' ? 'steel' : 'chrome'); K.box(J, [0.018 * s, y, hz + 0.045 * s], [0.014 * s, t * 1.4, 0.04 * s], 'steel'); K.box(J, [-0.012 * s, y, hz + 0.04 * s], [0.012 * s, t * 1.3, 0.03 * s], 'steel'); K.cyl(J, [-0.03 * s, y, hz - 0.01 * s], [0.03 * s, y, hz - 0.01 * s], 0.006 * s, 0.006 * s, 8, 'dark'); if (k === 'pipe') for (let i = 0; i < 5; i++) K.box(P('dark'), [0.018 * s, y + 0.006 * s, hz + 0.03 * s + i * 0.006 * s], [0.014 * s, 0.002, 0.002], 'dark'); }
      return K.done('wrench', P, { collider: K.boxCol(0.06 * s, 0.02, L + 0.06 * s), grip: grip(z0, z0 + L * 0.5, y), tool: k }); } });

  K.def('pliers', { name: 'زرادية', nameEn: 'Pliers', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['combination', 'عادية'], ['needle', 'بوز طويل'], ['cutter', 'قطاعة']], def: 'combination' }, { key: 'color', label: 'لون المقبض', type: 'enum', options: HANDLE.slice(0, 6), def: 'red' }],
    presets: { 'بوز طويل': { kind: 'needle', color: 'yellow' }, 'قطاعة': { kind: 'cutter', color: 'blue' } },
    generate: (p, q) => { const P = K.parts(), M = P('chrome'), H = P('plastic'), t = 0.009, n = K.sides(q, 6);
      for (const s of [1, -1]) { K.cyl(H, [s * 0.012, 0.008, 0.0], [s * 0.035, 0.008, -0.14], 0.009, 0.011, n, p.color); K.cyl(M, [s * 0.004, 0.006, 0.02], [s * 0.012, 0.006, 0.0], 0.006, 0.006, 4, 'steel'); }
      K.cyl(M, [0, 0.002, 0.02], [0, 0.012, 0.02], 0.012, 0.012, 8, 'steel');
      const jl = p.kind === 'needle' ? 0.08 : 0.045, jw = p.kind === 'needle' ? 0.006 : 0.012;
      K.extrude(M, [[-jw, 0.025], [jw, 0.025], [jw * (p.kind === 'cutter' ? 1.2 : 0.3), 0.025 + jl], [-jw * (p.kind === 'cutter' ? 1.2 : 0.3), 0.025 + jl]], 'y', 0.002, 0.002 + t, 'chrome');
      K.box(P('dark'), [0, 0.002 + t + 0.0005, 0.025 + jl * 0.55], [0.001, 0.001, jl * 0.8], 'dark');
      return K.done('pliers', P, { collider: K.boxCol(0.08, 0.02, 0.2 + jl), grip: grip(-0.14, 0, 0.008), tool: p.kind }); } });

  K.def('saw', { name: 'منشار', nameEn: 'Saw', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['hand', 'منشار خشب'], ['hack', 'منشار حديد']], def: 'hand' }, { key: 'color', label: 'لون المقبض', type: 'enum', options: HANDLE, def: 'wood' }],
    presets: { 'منشار حديد': { kind: 'hack', color: 'blue' } },
    generate: (p, q) => { const P = K.parts(), M = P('chrome'), t = 0.0015, hc = p.color === 'wood' ? 'woodLight' : p.color, Hb = P(p.color === 'wood' ? 'wood' : 'plastic');
      if (p.kind === 'hand') { const L = 0.5; K.extrude(M, [[-0.07, -0.05], [0.0, -0.05], [0.03, L], [-0.03, L]], 'y', 0.004, 0.004 + t, 'chrome'); const teeth = 30; for (let i = 0; i < teeth; i++) { const z0 = -0.05 + i / teeth * (L + 0.05), z1 = -0.05 + (i + 1) / teeth * (L + 0.05), x0 = lerp(0.0, 0.03, (z0 + 0.05) / (L + 0.05)); K.tri(M, [x0, 0.0048, z0], [x0 + 0.006, 0.0048, (z0 + z1) / 2], [x0, 0.0048, z1], 'steel', [0, 1, 0]); }
        const pts = [[-0.09, -0.04], [0.01, -0.04], [0.02, -0.16], [-0.08, -0.17], [-0.1, -0.1]]; K.extrude(Hb, pts, 'y', 0.0, 0.025, hc); K.box(P('dark'), [-0.04, 0.0275, -0.11], [0.06, 0.004, 0.04], 'black'); }
      else { K.extrude(M, [[-0.004, -0.15], [0.004, -0.15], [0.004, 0.17], [-0.004, 0.17]].map(([x, z]) => [x + 0.04, z]), 'y', 0.002, 0.004, 'steel'); K.extrude(P('paint'), [[-0.05, -0.15], [0.05, -0.15], [0.05, 0.17], [0.03, 0.17], [0.03, -0.12], [-0.03, -0.12], [-0.03, 0.17], [-0.05, 0.17]].map(([x, z]) => [x - 0.0, z]), 'y', 0.0, 0.012, p.color === 'wood' ? 'blue' : p.color, { at: [-0.04, 0, 0] }); K.cyl(Hb, [-0.04, 0.012, -0.16], [-0.04, 0.012, -0.28], 0.016, 0.018, 8, 'black'); }
      return K.done('saw', P, { collider: K.boxCol(0.15, 0.03, 0.7), grip: grip(-0.17, -0.05, 0.012), tool: 'saw' }); } });

  // ---------- عدد كهربائية ----------
  K.def('power_tool', { name: 'عدة كهربائية', nameEn: 'Power tool', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['drill', 'دريل'], ['grinder', 'صاروخ (جلخ)'], ['jigsaw', 'منشار كهربائي'], ['glue', 'مسدس شمع']], def: 'drill' }, K.color('color', 'اللون', 'yellow', [['#2f8f4a', 'أخضر'], ['teal', 'فيروزي']])],
    presets: { 'صاروخ': { kind: 'grinder', color: 'red' }, 'منشار كهربائي': { kind: 'jigsaw', color: 'blue' }, 'مسدس شمع': { kind: 'glue', color: 'orange' } },
    generate: (p, q) => { const P = K.parts(), B = P('plastic'), D = P('rubber'), M = P('chrome'), c = p.color, n = K.sides(q, 10), k = p.kind;
      if (k === 'drill' || k === 'glue') { // يقف على البطارية
        K.box(D, [0, 0.03, 0], [0.07, 0.06, 0.1], 'black'); K.box(B, [0, 0.065, 0], [0.072, 0.012, 0.1], c);
        K.extrude(D, [[-0.02, 0.07], [0.02, 0.07], [0.028, 0.18], [-0.012, 0.18]], 'x', -0.018, 0.018, 'black', { at: [0, 0, -0.02] });
        K.box(B, [0, 0.215, 0.0], [0.05, 0.07, 0.17], c); K.cyl(B, [0, 0.215, 0.085], [0, 0.215, 0.11], 0.03, 0.026, n, c);
        if (k === 'drill') { K.cyl(M, [0, 0.215, 0.11], [0, 0.215, 0.15], 0.018, 0.012, 8, 'dark'); K.cyl(M, [0, 0.215, 0.15], [0, 0.215, 0.24], 0.003, 0.003, 6, 'chrome'); K.box(P('dark'), [0, 0.165, 0.02], [0.012, 0.03, 0.015], 'black'); }
        else { K.cyl(M, [0, 0.215, 0.11], [0, 0.215, 0.16], 0.012, 0.004, 8, 'chrome'); K.cyl(P('ceramic'), [0, 0.215, -0.085], [0, 0.215, -0.2], 0.006, 0.006, 6, 'offwhite'); } }
      else if (k === 'grinder') { K.cyl(B, [0, 0.04, -0.2], [0, 0.04, 0.05], 0.035, 0.04, n, c); K.cyl(D, [0, 0.04, -0.25], [0, 0.04, -0.2], 0.03, 0.035, n, 'black'); K.box(M, [0, 0.04, 0.09], [0.06, 0.05, 0.08], 'steel'); K.cyl(P('stone'), [0, 0.07, 0.12], [0, 0.076, 0.12], 0.0625, 0.0625, n, 'grey'); K.cyl(M, [0, 0.077, 0.12], [0, 0.08, 0.12], 0.07, 0.07, n, 'steel', null, { noCaps: true }); K.cyl(D, [0.04, 0.04, 0.08], [0.1, 0.04, 0.08], 0.012, 0.012, 6, 'black'); }
      else { K.box(B, [0, 0.11, 0], [0.06, 0.12, 0.24], c); K.extrude(D, [[-0.08, 0.17], [0.08, 0.17], [0.06, 0.24], [-0.06, 0.24]], 'x', -0.02, 0.02, 'black'); K.box(M, [0, 0.025, 0], [0.08, 0.01, 0.22], 'steel'); K.box(M, [0, 0.0, 0.08], [0.004, 0.05, 0.01], 'chrome'); }
      return K.done('power_tool', P, { collider: K.boxCol(0.1, 0.25, 0.3), tool: k, grip: k === 'drill' || k === 'glue' ? { at: [0, 0.12, -0.02], dir: [0, 1, 0], length: 0.1 } : grip(-0.25, -0.05, 0.04) }); } });

  // ---------- قياس وتعليم ----------
  K.def('measure', { name: 'أدوات قياس', nameEn: 'Measuring tools', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['tape', 'متر'], ['level', 'ميزان ماء'], ['square', 'زاوية قائمة'], ['pencil', 'قلم نجار']], def: 'tape' }, K.color('color', 'اللون', 'yellow')],
    presets: { 'ميزان ماء': { kind: 'level', color: 'orange' }, 'زاوية': { kind: 'square' }, 'قلم نجار': { kind: 'pencil', color: 'red' } },
    generate: (p, q) => { const P = K.parts(), k = p.kind, B = P('plastic'), M = P('chrome'), n = K.sides(q, 12);
      if (k === 'tape') { K.cyl(B, [-0.02, 0.035, 0], [0.02, 0.035, 0], 0.035, 0.035, n, p.color); K.box(B, [0, 0.015, -0.005], [0.04, 0.03, 0.06], p.color); K.cyl(P('rubber'), [-0.021, 0.035, 0], [-0.019, 0.035, 0], 0.025, 0.025, n, 'black'); K.box(M, [0, 0.003, 0.08], [0.019, 0.002, 0.12], 'yellow'); for (let i = 0; i < 10; i++) K.box(P('dark'), [0.006, 0.0042, 0.03 + i * 0.012], [0.006, 0.0005, 0.0012], 'black'); K.box(M, [0, 0.008, 0.141], [0.02, 0.012, 0.002], 'chrome'); }
      else if (k === 'level') { const L = 0.6; K.box(B, [0, 0.02, 0], [0.025, 0.04, L], p.color); for (const z of [0, -0.22]) { K.box(P('dark'), [0, 0.041, z], [0.02, 0.002, 0.06], 'black'); K.cyl(P.custom('bubble', LP.mat('glass', { roughness: 0.1, emissive: [0.2, 0.5, 0.1], glow: 0.3 })), [-0.006, 0.042, z], [0.006, 0.042, z], 0.006, 0.006, 6, '#9ad04a'); } K.box(M, [0, 0.02, L / 2 + 0.005], [0.027, 0.042, 0.01], 'dark'); K.box(M, [0, 0.02, -L / 2 - 0.005], [0.027, 0.042, 0.01], 'dark'); }
      else if (k === 'square') { K.box(M, [0, 0.002, 0.05], [0.025, 0.003, 0.3], 'chrome'); K.box(B, [0.06, 0.006, -0.1], [0.15, 0.012, 0.03], p.color); for (let i = 0; i < 12; i++) K.box(P('dark'), [-0.008, 0.0036, -0.08 + i * 0.022], [0.008, 0.0004, 0.0012], 'black'); }
      else { K.box(B, [0, 0.004, 0], [0.012, 0.007, 0.17], p.color); K.extrude(P('wood'), [[-0.006, 0.085], [0.006, 0.085], [0.001, 0.105], [-0.001, 0.105]], 'y', 0.0005, 0.0075, 'woodLight'); K.box(P('dark'), [0, 0.004, 0.106], [0.003, 0.003, 0.004], 'black'); }
      return K.done('measure', P, { collider: K.boxCol(0.1, 0.08, k === 'level' ? 0.6 : 0.3), tool: k }); } });

  // ---------- مسامير وبراغي ----------
  K.def('fasteners', { name: 'مسامير وبراغي', nameEn: 'Fasteners', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['screws', 'براغي'], ['nails', 'مسامير'], ['bolts', 'صواميل وبراغي'], ['box', 'علبة منظمة']], def: 'box' }, { key: 'count', label: 'العدد', min: 1, max: 20, step: 1, def: 8 }],
    presets: { 'مسامير': { kind: 'nails' }, 'صواميل': { kind: 'bolts' }, 'براغي': { kind: 'screws' } },
    generate: (p, q) => { const P = K.parts(), rng = AA.rng(p.seed), M = P('chrome'), k = p.kind;
      const one = (B, x, z, a, kind) => { const d = [Math.sin(a), 0, Math.cos(a)], L = kind === 'nails' ? 0.06 : 0.04, r = 0.0022, c = [x, r + 0.0005, z];
        if (kind === 'bolts') { K.cyl(B, V.add([x, 0.004, z], [0, 0, 0]), [x, 0.01, z], 0.009, 0.009, 6, 'steel'); K.cyl(B, [x + 0.03, 0.004, z], [x + 0.03, 0.006, z], 0.006, 0.006, 6, 'chrome'); K.cyl(B, [x + 0.03, 0.006, z], [x + 0.03, 0.03, z], 0.004, 0.004, 6, 'steel'); return; }
        K.cyl(B, V.add(c, V.scale(d, -L / 2)), V.add(c, V.scale(d, L / 2 - 0.004)), r, r, 5, kind === 'nails' ? 'greyLight' : 'gold'); K.cyl(B, V.add(c, V.scale(d, L / 2 - 0.004)), V.add(c, V.scale(d, L / 2)), r, 0.0003, 5, kind === 'nails' ? 'greyLight' : 'gold'); K.cyl(B, V.add(c, V.scale(d, -L / 2 - 0.0015)), V.add(c, V.scale(d, -L / 2)), r * 2.4, r * 2.4, 6, kind === 'nails' ? 'greyLight' : 'gold'); };
      if (k === 'box') { const W = 0.26, D = 0.18, Bx = P('plastic'); K.box(Bx, [0, 0.005, 0], [W, 0.01, D], 'blue'); for (const [x, z, w, d2] of [[0, D / 2 - 0.003, W, 0.006], [0, -D / 2 + 0.003, W, 0.006], [W / 2 - 0.003, 0, 0.006, D - 0.012], [-W / 2 + 0.003, 0, 0.006, D - 0.012]]) K.box(Bx, [x, 0.025, z], [w, 0.04, d2], 'blue');
        for (let i = 1; i < 3; i++) K.box(Bx, [-W / 2 + i * W / 3, 0.02, 0], [0.004, 0.03, D - 0.012], 'blue'); K.box(Bx, [0, 0.02, 0], [W - 0.012, 0.03, 0.004], 'blue');
        const kinds = ['screws', 'nails', 'bolts', 'screws', 'nails', 'screws']; for (let c = 0; c < 6; c++) { const cx = -W / 2 + (c % 3 + 0.5) * W / 3, cz = (c < 3 ? 1 : -1) * D / 4; for (let i = 0; i < 4; i++) one(M, cx + (rng() - 0.5) * 0.04, cz + (rng() - 0.5) * 0.03, rng() * 6.28, kinds[c] === 'bolts' ? 'screws' : kinds[c]); }
        K.box(P('glass'), [0, 0.047, 0], [W, 0.004, D], 'glass'); }
      else for (let i = 0; i < p.count; i++) one(M, (rng() - 0.5) * 0.15, (rng() - 0.5) * 0.15, rng() * 6.28, k);
      return K.done('fasteners', P, { collider: K.boxCol(0.27, 0.05, 0.19), tool: k }); } });

  // ---------- صندوق عدة وطاولة شغل ----------
  K.def('toolbox', { name: 'صندوق عدة', nameEn: 'Toolbox', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['box', 'صندوق يدوي'], ['cabinet', 'خزانة بعجلات'], ['bag', 'شنطة قماش']], def: 'box' }, K.color('color', 'اللون', 'red'), { key: 'open', label: 'مفتوح', type: 'bool', def: false }],
    presets: { 'خزانة عدة': { kind: 'cabinet' }, 'شنطة': { kind: 'bag', color: 'navy' }, 'مفتوح': { open: true, color: 'orange' } },
    generate: (p, q) => { const P = K.parts(), c = p.color, B = P('paint'), M = P('chrome'), rng = AA.rng(p.seed);
      if (p.kind === 'cabinet') { const W = 0.7, H = 0.85, D = 0.45; K.box(B, [0, 0.08 + H / 2, 0], [W, H, D], c); for (let i = 0; i < 5; i++) { const y = 0.14 + i * (H - 0.04) / 5; K.box(B, [0, y + 0.07, D / 2 + 0.005], [W - 0.04, (H - 0.04) / 5 - 0.012, 0.01], mixc(K.c(c), [0, 0, 0], 0.08)); K.box(M, [0, y + 0.12, D / 2 + 0.015], [W * 0.6, 0.015, 0.012], 'chrome'); }
        for (const x of [1, -1]) for (const z of [1, -1]) { K.cyl(P('rubber'), [x * (W / 2 - 0.06) - 0.015, 0.045, z * (D / 2 - 0.06)], [x * (W / 2 - 0.06) + 0.015, 0.045, z * (D / 2 - 0.06)], 0.045, 0.045, 8, 'black'); K.box(M, [x * (W / 2 - 0.06), 0.085, z * (D / 2 - 0.06)], [0.05, 0.02, 0.05], 'steel'); }
        K.box(P('dark'), [0, 0.08 + H + 0.01, 0], [W + 0.02, 0.02, D + 0.02], 'black'); K.rod(M, [-W / 2 - 0.04, 0.08 + H * 0.8, -0.1], [-W / 2 - 0.04, 0.08 + H * 0.8, 0.1], 0.012, 'chrome'); for (const z of [-0.1, 0.1]) K.rod(M, [-W / 2, 0.08 + H * 0.8, z], [-W / 2 - 0.04, 0.08 + H * 0.8, z], 0.01, 'chrome');
        return K.done('toolbox', P, { collider: K.boxCol(W, H + 0.1, D) }); }
      if (p.kind === 'bag') { const C = P('cloth'), W = 0.45, H = 0.25, D = 0.22; K.extrude(C, [[-D / 2, 0], [D / 2, 0], [D / 2 - 0.02, H], [-D / 2 + 0.02, H]], 'x', -W / 2, W / 2, c); K.box(P('dark'), [0, 0.01, 0], [W + 0.01, 0.02, D + 0.01], 'black'); for (const s of [1, -1]) K.rod(P('rubber'), [s * 0.12, H, 0], [s * 0.05, H + 0.12, 0], 0.012, 'black'); K.rod(P('rubber'), [-0.05, H + 0.12, 0], [0.05, H + 0.12, 0], 0.014, 'black');
        for (let i = 0; i < 3; i++) K.box(C, [-W / 2 + 0.08 + i * 0.14, H * 0.45, D / 2 + 0.008], [0.11, H * 0.5, 0.015], mixc(K.c(c), [0, 0, 0], 0.15)); K.cyl(P('plastic'), [0.08, H - 0.02, 0.0], [0.08, H + 0.08, 0.02], 0.012, 0.012, 6, 'yellow'); K.cyl(P('wood'), [-0.06, H - 0.02, 0.02], [-0.07, H + 0.1, 0.04], 0.012, 0.012, 6, 'woodLight');
        return K.done('toolbox', P, { collider: K.boxCol(W, H, D) }); }
      const W = 0.5, H = 0.2, D = 0.22; K.box(B, [0, H / 2, 0], [W, H, D], c); K.box(M, [0, H * 0.7, D / 2 + 0.006], [0.06, 0.04, 0.012], 'chrome');
      if (p.open) { K.box(P('dark'), [0, H - 0.002, 0], [W - 0.03, 0.003, D - 0.03], 'black'); const lid = 0.08; K.box(B, [0, H + lid / 2 * 0.2, -D / 2 - lid * 0.45], [W, lid * 0.2 + 0.02, lid], c); K.box(P('plastic'), [0.05, H + 0.03, 0], [0.04, 0.03, 0.16], 'yellow'); K.cyl(P('chrome'), [-0.12, H + 0.015, -0.06], [-0.12, H + 0.015, 0.08], 0.008, 0.008, 6, 'chrome'); K.cyl(P('plastic'), [-0.06, H + 0.012, -0.08], [-0.06, H + 0.012, 0.04], 0.012, 0.012, 6, 'blue'); }
      else { K.extrude(B, [[-D / 2, H], [D / 2, H], [D / 2 - 0.02, H + 0.04], [-D / 2 + 0.02, H + 0.04]], 'x', -W / 2, W / 2, c); K.rod(P('rubber'), [-0.1, H + 0.04, 0], [-0.1, H + 0.1, 0], 0.012, 'black'); K.rod(P('rubber'), [0.1, H + 0.04, 0], [0.1, H + 0.1, 0], 0.012, 'black'); K.rod(P('rubber'), [-0.1, H + 0.1, 0], [0.1, H + 0.1, 0], 0.016, 'black'); }
      return K.done('toolbox', P, { collider: K.boxCol(W, H + 0.1, D) }); } });

  K.def('workbench', { name: 'طاولة شغل', nameEn: 'Workbench', group: 'tools',
    schema: [{ key: 'length', label: 'الطول', min: 1, max: 3, step: 0.1, def: 1.8, unit: 'م' }, { key: 'vise', label: 'منجلة', type: 'bool', def: true }, { key: 'pegboard', label: 'لوحة تعليق عدة', type: 'bool', def: true }],
    presets: { 'بدون لوحة': { pegboard: false }, 'قصيرة': { length: 1.2 } },
    generate: (p, q) => { const P = K.parts(), L = p.length, W = P('wood'), M = P('metal'), H = 0.9, D = 0.7;
      K.box(W, [0, H - 0.03, 0], [L, 0.06, D], 'woodLight'); for (const x of [1, -1]) for (const z of [1, -1]) K.box(W, [x * (L / 2 - 0.06), (H - 0.06) / 2, z * (D / 2 - 0.06)], [0.08, H - 0.06, 0.08], 'wood'); K.box(W, [0, 0.18, 0], [L - 0.2, 0.03, D - 0.15], 'wood');
      if (p.vise) { const x = L / 2 - 0.25, z = D / 2 - 0.05; K.box(M, [x, H + 0.04, z - 0.05], [0.16, 0.08, 0.1], 'blue'); K.box(M, [x, H + 0.06, z + 0.06], [0.16, 0.1, 0.04], 'blue'); K.rod(M, [x, H + 0.05, z + 0.08], [x, H + 0.05, z + 0.22], 0.012, 'chrome'); K.rod(M, [x - 0.08, H + 0.05, z + 0.22], [x + 0.08, H + 0.05, z + 0.22], 0.008, 'chrome'); }
      if (p.pegboard) { const PB = P('wood'); K.box(PB, [0, H + 0.55, -D / 2 + 0.02], [L, 1.0, 0.02], '#c9a874'); for (let i = 0; i < Math.round(L / 0.1); i++) for (let j = 0; j < 9; j++) K.box(P('dark'), [-L / 2 + 0.05 + i * 0.1, H + 0.1 + j * 0.1, -D / 2 + 0.031], [0.008, 0.008, 0.002], 'woodDark');
        const z = -D / 2 + 0.05; K.cyl(P('plastic'), [-L / 2 + 0.25, H + 0.75, z], [-L / 2 + 0.25, H + 0.6, z], 0.016, 0.018, 8, 'red'); K.cyl(P('chrome'), [-L / 2 + 0.25, H + 0.6, z], [-L / 2 + 0.25, H + 0.45, z], 0.005, 0.005, 6, 'chrome'); K.cyl(P('plastic'), [-L / 2 + 0.35, H + 0.75, z], [-L / 2 + 0.35, H + 0.62, z], 0.016, 0.018, 8, 'yellow'); K.cyl(P('chrome'), [-L / 2 + 0.35, H + 0.62, z], [-L / 2 + 0.35, H + 0.48, z], 0.005, 0.005, 6, 'chrome');
        K.cyl(P('wood'), [-L / 2 + 0.55, H + 0.8, z], [-L / 2 + 0.55, H + 0.55, z], 0.015, 0.015, 6, 'woodLight'); K.box(P('metal'), [-L / 2 + 0.55, H + 0.82, z], [0.11, 0.03, 0.03], 'steel'); K.box(P('chrome'), [-L / 2 + 0.8, H + 0.65, z], [0.04, 0.3, 0.008], 'chrome'); K.cyl(P('plastic'), [L / 2 - 0.5, H + 0.62, z + 0.03], [L / 2 - 0.42, H + 0.62, z + 0.03], 0.07, 0.07, 10, 'yellow'); }
      K.box(P('lamp'), [0, H + 1.12, -D / 2 + 0.15], [L * 0.6, 0.03, 0.08], 'white');
      return K.done('workbench', P, { collider: K.boxCol(L, H, D), top: H, light: { at: [0, H + 1.05, 0], color: [1, 0.97, 0.9], intensity: 1, distance: 3 } }); } });

  // ---------- دهان ----------
  K.def('paint_set', { name: 'أدوات دهان', nameEn: 'Painting tools', group: 'tools',
    schema: [{ key: 'item', label: 'القطعة', type: 'enum', options: [['bucket', 'سطل بوية'], ['roller', 'رولة'], ['brush', 'فرشاة'], ['tray', 'صينية رولة'], ['spray', 'بخاخ']], def: 'bucket' }, K.color('color', 'لون البوية', 'teal', [['white', 'أبيض']])],
    presets: { 'رولة': { item: 'roller' }, 'فرشاة': { item: 'brush', color: 'red' }, 'صينية': { item: 'tray' }, 'بخاخ': { item: 'spray', color: 'orange' } },
    generate: (p, q) => { const P = K.parts(), it = p.item, n = K.sides(q, 12), M = P('metal'), pc = p.color;
      if (it === 'bucket') { K.cyl(M, [0, 0, 0], [0, 0.3, 0], 0.13, 0.15, n, 'white'); K.cyl(P('paint'), [0, 0.1, 0], [0, 0.22, 0], 0.142, 0.147, n, pc, null, { noCaps: true }); K.cyl(P('paint'), [0, 0.28, 0], [0, 0.285, 0], 0.14, 0.14, n, pc); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; K.rod(P('paint'), [Math.cos(a) * 0.15, 0.3, Math.sin(a) * 0.15], [Math.cos(a) * 0.153, 0.25 - k % 2 * 0.04, Math.sin(a) * 0.153], 0.008, pc, null, 4); }
        const hp = []; for (let k = 0; k <= 8; k++) { const a = k / 8 * Math.PI; hp.push([Math.cos(a) * 0.15, 0.28 + Math.sin(a) * 0.12, 0]); } for (let k = 0; k < 8; k++) K.rod(M, hp[k], hp[k + 1], 0.004, 'steel', null, 4); }
      else if (it === 'roller') { K.cyl(P('cloth'), [-0.11, 0.03, 0.2], [0.11, 0.03, 0.2], 0.03, 0.03, n, pc); const fr = [[0.12, 0.03, 0.2], [0.13, 0.03, 0.2], [0.13, 0.03, 0.1], [0.0, 0.03, 0.06], [0.0, 0.03, -0.02]]; for (let k = 0; k < fr.length - 1; k++) K.rod(M, fr[k], fr[k + 1], 0.004, 'chrome', null, 4); handle(P, -0.15, -0.02, 0.015, 'yellow', 0.03, q); }
      else if (it === 'brush') { handle(P, -0.15, -0.02, 0.012, 'wood', 0.012, q); K.box(M, [0, 0.012, 0.0], [0.07, 0.018, 0.035], 'chrome'); K.box(P('cloth'), [0, 0.012, 0.045], [0.068, 0.014, 0.06], 'woodLight'); K.box(P('paint'), [0, 0.012, 0.07], [0.069, 0.015, 0.014], pc); }
      else if (it === 'tray') { K.extrude(P('plastic'), [[-0.18, 0.0], [0.18, 0.0], [0.18, 0.07], [0.16, 0.07], [0.12, 0.02], [-0.16, 0.0]].map(([z, y]) => [z, y]), 'x', -0.15, 0.15, 'greyLight'); K.extrude(P('paint'), [[0.12, 0.022], [0.17, 0.05], [0.17, 0.052], [0.1, 0.022]].map(([z, y]) => [z, y]), 'x', -0.14, 0.14, pc); }
      else { K.cyl(M, [0, 0, 0], [0, 0.17, 0], 0.033, 0.033, n, pc); K.cyl(M, [0, 0.17, 0], [0, 0.2, 0], 0.033, 0.015, n, pc); K.cyl(P('plastic'), [0, 0.2, 0], [0, 0.23, 0], 0.016, 0.016, 8, 'white'); K.box(P('plastic'), [0, 0.225, 0.015], [0.012, 0.01, 0.012], 'black'); K.cyl(P('paint'), [0, 0.07, 0.0], [0, 0.12, 0.0], 0.0335, 0.0335, n, 'white', null, { noCaps: true }); }
      return K.done('paint_set', P, { collider: K.boxCol(0.35, it === 'bucket' ? 0.42 : 0.2, 0.4) }); } });

  // ---------- بناء ----------
  K.def('masonry', { name: 'أدوات بناء', nameEn: 'Masonry tools', group: 'tools',
    schema: [{ key: 'item', label: 'القطعة', type: 'enum', options: [['trowel', 'مسطرين'], ['shovel', 'مجرفة'], ['pickaxe', 'فأس'], ['bucket', 'سطل مونة'], ['cement', 'كيس إسمنت'], ['wheelbarrow', 'عربية'], ['mixer', 'خلاطة']], def: 'trowel' }],
    presets: { 'مجرفة': { item: 'shovel' }, 'فأس': { item: 'pickaxe' }, 'عربية': { item: 'wheelbarrow' }, 'خلاطة': { item: 'mixer' }, 'كيس إسمنت': { item: 'cement' } },
    generate: (p, q) => { const P = K.parts(), it = p.item, n = K.sides(q, 10), M = P('metal');
      if (it === 'trowel') { handle(P, -0.2, -0.08, 0.016, 'wood', 0.05, q); K.rod(M, [0, 0.05, -0.08], [0, 0.012, -0.05], 0.005, 'steel'); K.extrude(M, [[-0.06, -0.05], [0.06, -0.05], [0.0, 0.12]], 'y', 0.004, 0.007, 'chrome'); }
      else if (it === 'shovel') { const y = 0.02; K.cyl(P('wood'), [0, y, -0.65], [0, y, 0.25], 0.017, 0.017, 8, 'woodLight'); K.box(P('plastic'), [0, y, -0.68], [0.12, 0.03, 0.03], 'black'); K.extrude(M, [[-0.12, 0.25], [0.12, 0.25], [0.12, 0.45], [0.0, 0.55], [-0.12, 0.45]], 'y', 0.005, 0.01, 'steel'); }
      else if (it === 'pickaxe') { const y = 0.03; K.cyl(P('wood'), [0, y, -0.4], [0, y, 0.35], 0.02, 0.022, 8, 'woodLight'); const hz = 0.35; for (const s of [1, -1]) K.cyl(M, [0, y, hz], [s * 0.3, y, hz - 0.08], 0.025, 0.006, 5, 'steel'); K.box(M, [0, y, hz], [0.07, 0.05, 0.05], 'steel'); }
      else if (it === 'bucket') { K.cyl(P('rubber'), [0, 0, 0], [0, 0.25, 0], 0.15, 0.18, n, 'black'); K.cyl(P('stone'), [0, 0.2, 0], [0, 0.22, 0], 0.17, 0.17, n, 'concreteDark'); for (const s of [1, -1]) K.box(P('rubber'), [s * 0.18, 0.22, 0], [0.04, 0.03, 0.06], 'black'); }
      else if (it === 'cement') { LP.ico(P('cloth'), [0, 0.07, 0], [0.3, 0.07, 0.2], 0, () => K.c('#bdb6a6')); K.box(P('cloth'), [0, 0.13, 0], [0.4, 0.002, 0.15], 'green'); }
      else if (it === 'wheelbarrow') { const Bd = P('paint'); K.extrude(Bd, [[-0.35, 0.42], [0.35, 0.42], [0.25, 0.75], [-0.42, 0.72]].map(([z, y]) => [z, y]), 'x', -0.3, 0.3, 'green'); K.box(P('dark'), [0, 0.725, -0.05], [0.56, 0.01, 0.6], 'dark');
        for (const s of [1, -1]) { K.rod(M, [s * 0.25, 0.4, 0.45], [s * 0.28, 0.6, -0.95], 0.018, 'dark'); K.rod(M, [s * 0.25, 0.42, -0.25], [s * 0.25, 0.0, -0.3], 0.016, 'dark'); K.cyl(P('rubber'), [s * 0.28, 0.6, -0.95], [s * 0.28, 0.6, -1.08], 0.022, 0.022, 6, 'black'); }
        const spin = { pivot: [0, 0.2, 0.5], axis: 'x', radius: 0.2 }; const T = P.custom('tire0', LP.mat('rubber', { spin })), Rm = P.custom('rim0', LP.mat('metal', { metalness: 0.3, spin })); K.wheelInto(T, Rm, [0, 0.2, 0.5], 0.2, 0.08, 1, q, K.c('greyLight')); K.rod(M, [-0.25, 0.4, 0.45], [0.25, 0.4, 0.45], 0.015, 'dark');
        return K.done('masonry', P, { collider: K.boxCol(0.7, 0.8, 1.6), walkSpeed: 1, physics: { wheelbase: 1 } }); }
      else { const Dr = P('paint'); K.cyl(Dr, [0, 0.7, -0.05], [0, 1.2, 0.3], 0.35, 0.4, n, 'orange'); K.cyl(Dr, [0, 1.2, 0.3], [0, 1.4, 0.45], 0.4, 0.22, n, 'orange'); K.cyl(P('dark'), [0, 0.6, -0.15], [0, 0.72, -0.05], 0.1, 0.1, 8, 'dark'); for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2; K.rod(M, [0, 0.65, -0.12], [Math.cos(a) * 0.45, 0.0, Math.sin(a) * 0.45 - 0.1], 0.02, 'dark'); } K.box(P('metal'), [0.35, 0.55, -0.3], [0.25, 0.3, 0.3], 'grey'); K.rod(M, [0, 1.0, -0.2], [0, 1.25, -0.55], 0.02, 'dark'); }
      return K.done('masonry', P, { collider: K.boxCol(0.6, it === 'mixer' ? 1.5 : 0.3, it === 'shovel' ? 1.3 : 0.8), tool: it }); } });

  // ---------- سباكة ----------
  const PIPEM = [['pvc', 'بلاستيك PVC'], ['ppr', 'PPR أخضر'], ['copper', 'نحاس'], ['steel', 'حديد مجلفن']];
  const pipeCol = m => ({ pvc: 'offwhite', ppr: '#3f8a5a', copper: '#c27a45', steel: 'greyLight' }[m]);
  K.def('pipe', { name: 'مواسير وقطع', nameEn: 'Pipe fittings', group: 'tools',
    schema: [{ key: 'piece', label: 'القطعة', type: 'enum', options: [['straight', 'ماسورة'], ['elbow', 'كوع'], ['tee', 'تي'], ['cross', 'صليب'], ['valve', 'محبس'], ['union', 'رقبة/جلبة']], def: 'straight' }, { key: 'material', label: 'الخامة', type: 'enum', options: PIPEM, def: 'pvc' }, { key: 'diameter', label: 'القطر', min: 0.015, max: 0.2, step: 0.005, def: 0.05, unit: 'م' }, { key: 'length', label: 'الطول', min: 0.2, max: 3, step: 0.1, def: 1, unit: 'م' }],
    presets: { 'كوع نحاس': { piece: 'elbow', material: 'copper', diameter: 0.025 }, 'تي أخضر': { piece: 'tee', material: 'ppr', diameter: 0.032 }, 'محبس': { piece: 'valve', material: 'steel', diameter: 0.03 }, 'ماسورة صرف': { diameter: 0.11, length: 2 } },
    generate: (p, q) => { const P = K.parts(), r = p.diameter / 2, c = pipeCol(p.material), B = P(p.material === 'pvc' || p.material === 'ppr' ? 'plastic' : 'chrome'), n = K.sides(q, 10), y = r * 1.25, sock = r * 1.22, sl = r * 2.2;
      const run = (a, b, ends) => { K.cyl(B, a, b, r, r, n, c); for (const [e, f] of ends) { const d = V.norm(V.sub(f, e)); K.cyl(B, e, V.add(e, V.scale(d, sl)), sock, sock, n, mixc(K.c(c), [0, 0, 0], 0.08)); } };
      const C = [0, y, 0], arm = Math.max(sl * 1.6, 0.05);
      if (p.piece === 'straight') { const L = p.length; K.cyl(B, [0, r, -L / 2], [0, r, L / 2], r, r, n, c); for (let k = 0; k < 3; k++) K.box(P('dark'), [r * 0.7, r + r * 0.7, -L / 4 + k * 0.08], [0.002, 0.002, 0.05], 'black'); return K.done('pipe', P, { collider: K.boxCol(2 * r, 2 * r, L), ends: [[0, r, -L / 2], [0, r, L / 2]] }); }
      const dirs = { elbow: [[0, 0, 1], [1, 0, 0]], tee: [[0, 0, 1], [0, 0, -1], [1, 0, 0]], cross: [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0]], valve: [[0, 0, 1], [0, 0, -1]], union: [[0, 0, 1], [0, 0, -1]] }[p.piece];
      LP.ico(B, C, sock, 0, () => K.c(c));
      for (const d of dirs) { const e = V.add(C, V.scale(d, arm)); K.cyl(B, C, V.add(C, V.scale(d, arm - sl)), sock * 0.95, sock * 0.95, n, c); K.cyl(B, V.add(C, V.scale(d, arm - sl)), e, sock, sock, n, mixc(K.c(c), [0, 0, 0], 0.08)); }
      if (p.piece === 'valve') { K.cyl(P('chrome'), C, V.add(C, [0, sock * 2.2, 0]), r * 0.4, r * 0.4, 6, 'chrome'); K.box(P('paint'), V.add(C, [0, sock * 2.3, 0]), [r * 5, r * 0.5, r * 0.9], 'red'); }
      if (p.piece === 'union') K.cyl(P('chrome'), V.add(C, [0, 0, -sl * 0.5]), V.add(C, [0, 0, sl * 0.5]), sock * 1.25, sock * 1.25, 6, 'chrome');
      return K.done('pipe', P, { collider: K.boxCol(arm * 2, sock * 2, arm * 2), ends: dirs.map(d => V.add(C, V.scale(d, arm))) }); } });
  K.def('faucet', { name: 'حنفية', nameEn: 'Faucet', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['sink', 'خلاط مغسلة'], ['wall', 'حنفية جدار'], ['garden', 'حنفية حديقة'], ['shower', 'خلاط دش']], def: 'sink' }, { key: 'water', label: 'الماء يجري', type: 'bool', def: false }],
    presets: { 'حنفية حديقة': { kind: 'garden' }, 'جدار': { kind: 'wall' }, 'دش': { kind: 'shower' }, 'تجري': { water: true } },
    generate: (p, q) => { const P = K.parts(), M = P('chrome'), n = K.sides(q, 10), k = p.kind; let mouth;
      if (k === 'sink') { K.cyl(M, [0, 0, 0], [0, 0.02, 0], 0.03, 0.03, n, 'chrome'); K.cyl(M, [0, 0.02, 0], [0, 0.2, 0], 0.016, 0.016, n, 'chrome'); const ar = AA.bezier([[0, 0.2, 0], [0, 0.28, 0.02], [0, 0.26, 0.12]], 5); for (let i = 0; i < ar.length - 1; i++) K.cyl(M, ar[i], ar[i + 1], 0.012, 0.012, 8, 'chrome'); K.box(M, [0, 0.21, -0.04], [0.016, 0.012, 0.07], 'chrome'); mouth = [0, 0.25, 0.12]; }
      else if (k === 'wall' || k === 'garden') { K.cyl(M, [0, 0.3, 0], [0, 0.3, 0.02], 0.025, 0.025, n, 'chrome'); K.cyl(M, [0, 0.3, 0.02], [0, 0.3, 0.09], 0.012, 0.012, 8, k === 'garden' ? 'gold' : 'chrome'); K.cyl(M, [0, 0.3, 0.09], [0, 0.25, 0.11], 0.012, 0.012, 8, k === 'garden' ? 'gold' : 'chrome'); K.cyl(M, [0, 0.3, 0.06], [0, 0.34, 0.06], 0.005, 0.005, 6, 'chrome'); if (k === 'garden') { K.box(P('paint'), [0, 0.345, 0.06], [0.05, 0.008, 0.012], 'red'); K.box(P('paint'), [0, 0.345, 0.06], [0.012, 0.008, 0.05], 'red'); } else K.box(M, [0, 0.345, 0.06], [0.06, 0.008, 0.012], 'chrome'); mouth = [0, 0.245, 0.11]; }
      else { K.box(M, [0, 1.1, 0.01], [0.14, 0.14, 0.02], 'chrome'); K.cyl(M, [0, 1.1, 0.02], [0, 1.1, 0.06], 0.02, 0.025, n, 'chrome'); K.box(M, [0, 1.1, 0.07], [0.08, 0.012, 0.016], 'chrome'); K.rod(M, [0, 1.15, 0.02], [0, 1.95, 0.02], 0.012, 'chrome'); K.rod(M, [0, 1.95, 0.02], [0, 1.95, 0.25], 0.012, 'chrome'); K.cyl(M, [0, 1.95, 0.3], [0, 1.92, 0.3], 0.1, 0.1, n, 'chrome'); mouth = [0, 1.91, 0.3]; }
      if (p.water) { const W = P('water'), L = mouth[1] - 0.0; K.cyl(W, mouth, [mouth[0], Math.max(0.001, mouth[1] - (k === 'shower' ? 1.9 : 0.25)), mouth[2] + (k === 'shower' ? 0 : 0.01)], k === 'shower' ? 0.09 : 0.006, k === 'shower' ? 0.2 : 0.008, 8, 'water2', null, { noCaps: true }); }
      return K.done('faucet', P, { collider: K.boxCol(0.15, k === 'shower' ? 2 : 0.35, 0.3), mouth, wallMount: k !== 'sink' }); } });
  K.def('plumbing', { name: 'أدوات سباكة', nameEn: 'Plumbing items', group: 'tools',
    schema: [{ key: 'item', label: 'القطعة', type: 'enum', options: [['plunger', 'شفاط'], ['heater', 'سخان'], ['meter', 'عداد ماء'], ['pump', 'دينمو ماء'], ['tape', 'شريط تفلون']], def: 'plunger' }],
    presets: { 'سخان': { item: 'heater' }, 'عداد ماء': { item: 'meter' }, 'دينمو': { item: 'pump' }, 'تفلون': { item: 'tape' } },
    generate: (p, q) => { const P = K.parts(), it = p.item, n = K.sides(q, 12), M = P('chrome');
      if (it === 'plunger') { K.cyl(P('rubber'), [0, 0, 0], [0, 0.08, 0], 0.075, 0.05, n, 'red'); K.cyl(P('rubber'), [0, 0.08, 0], [0, 0.1, 0], 0.05, 0.02, n, 'red'); K.cyl(P('wood'), [0, 0.08, 0], [0, 0.6, 0], 0.013, 0.013, 8, 'woodLight'); }
      else if (it === 'heater') { K.cyl(P('ceramic'), [0, 0.3, 0.25], [0, 1.1, 0.25], 0.25, 0.25, n, 'white'); K.cyl(P('ceramic'), [0, 1.1, 0.25], [0, 1.18, 0.25], 0.25, 0.18, n, 'white'); K.cyl(P('ceramic'), [0, 0.3, 0.25], [0, 0.22, 0.25], 0.25, 0.18, n, 'white'); K.box(P('plastic'), [0, 0.5, 0.505], [0.12, 0.12, 0.02], 'greyLight'); K.cyl(P('plastic'), [0, 0.5, 0.515], [0, 0.5, 0.53], 0.03, 0.03, 8, 'black'); K.box(P('sigRed'), [0.04, 0.56, 0.516], [0.012, 0.012, 0.004], 'white'); for (const x of [-0.08, 0.08]) { K.cyl(M, [x, 0.22, 0.25], [x, 0.05, 0.25], 0.012, 0.012, 6, x < 0 ? 'red' : 'blue'); } K.box(P('metal'), [0, 1.0, 0.0], [0.2, 0.05, 0.02], 'steel'); }
      else if (it === 'meter') { for (const s of [1, -1]) K.cyl(M, [s * 0.05, 0.05, 0], [s * 0.15, 0.05, 0], 0.016, 0.016, 8, 'gold'); K.cyl(M, [0, 0.03, 0], [0, 0.09, 0], 0.05, 0.05, n, 'gold'); K.cyl(P('glassSolid'), [0, 0.09, 0], [0, 0.1, 0], 0.045, 0.045, n, 'glass'); K.cyl(P('ceramic'), [0, 0.088, 0], [0, 0.091, 0], 0.04, 0.04, n, 'white'); K.box(P('dark'), [0, 0.092, 0.01], [0.04, 0.002, 0.012], 'black'); }
      else if (it === 'pump') { K.box(P('metal'), [0, 0.02, 0], [0.3, 0.04, 0.22], 'grey'); K.cyl(P('paint'), [-0.12, 0.13, 0], [0.08, 0.13, 0], 0.08, 0.08, n, 'blue'); K.cyl(P('paint'), [0.08, 0.13, 0], [0.15, 0.13, 0], 0.09, 0.07, n, 'blue'); K.cyl(M, [0.12, 0.13, 0], [0.12, 0.28, 0], 0.025, 0.025, 8, 'chrome'); K.cyl(M, [0.17, 0.13, 0], [0.26, 0.13, 0], 0.025, 0.025, 8, 'chrome'); K.box(P('plastic'), [-0.04, 0.22, 0], [0.08, 0.04, 0.08], 'black'); }
      else { K.cyl(P('plastic'), [-0.006, 0.025, 0], [0.006, 0.025, 0], 0.025, 0.025, n, 'white'); K.cyl(P('plastic'), [-0.007, 0.025, 0], [0.007, 0.025, 0], 0.01, 0.01, 8, 'greyLight'); }
      return K.done('plumbing', P, { collider: K.boxCol(0.55, it === 'heater' ? 1.2 : it === 'plunger' ? 0.6 : 0.3, 0.55), wallMount: it === 'heater' }); } });

  // ---------- كهرباء ----------
  K.def('wall_plate', { name: 'مفتاح وفيش', nameEn: 'Switch / socket', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['switch', 'مفتاح إنارة'], ['switch2', 'مفتاحين'], ['socket', 'فيش'], ['socket2', 'فيش مزدوج'], ['usb', 'فيش مع USB']], def: 'switch' }, K.color('color', 'اللون', 'white', [['gold', 'ذهبي']])],
    presets: { 'فيش': { kind: 'socket' }, 'مفتاحين': { kind: 'switch2' }, 'فيش مزدوج أسود': { kind: 'socket2', color: 'black' } },
    generate: (p, q) => { const P = K.parts(), k = p.kind, W = k === 'socket2' ? 0.15 : 0.086, B = P('plastic'), y = 1.2, dk = p.color === 'black' ? 'grey' : 'greyLight';
      K.box(B, [0, y, 0.005], [W, 0.086, 0.01], p.color);
      if (k === 'switch') K.box(B, [0, y, 0.013], [0.05, 0.05, 0.008], p.color === 'gold' ? 'white' : p.color);
      else if (k === 'switch2') for (const s of [1, -1]) K.box(B, [s * 0.0135, y, 0.013], [0.024, 0.05, 0.008], p.color === 'gold' ? 'white' : p.color);
      else { const sockets = k === 'socket2' ? [-0.035, 0.035] : [0]; for (const x of sockets) { K.box(B, [x, y, 0.0115], [0.052, 0.052, 0.003], dk); for (const [dx, dy] of [[-0.011, 0.007], [0.011, 0.007], [0, -0.012]]) K.box(P('dark'), [x + dx, y + dy, 0.0135], [0.004, 0.008, 0.001], 'black'); }
        if (k === 'usb') { K.box(P('dark'), [0, y - 0.034, 0.0115], [0.012, 0.004, 0.002], 'black'); K.box(P('sigGreen'), [0.03, y - 0.034, 0.0112], [0.003, 0.003, 0.002], 'white'); } }
      return K.done('wall_plate', P, { collider: K.boxCol(W, 0.09, 0.02, y), wallMount: true, mountHeight: y }); } });
  K.def('bulb', { name: 'لمبة', nameEn: 'Light bulb', group: 'tools',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['bulb', 'لمبة عادية'], ['led', 'LED'], ['tube', 'لمبة فلورسنت'], ['spot', 'سبوت سقف']], def: 'bulb' }, { key: 'on', label: 'مضيئة', type: 'bool', def: true }, K.color('glow', 'لون الضوء', 'white', [['yellow', 'أصفر دافئ']])],
    presets: { 'فلورسنت': { kind: 'tube' }, 'سبوت': { kind: 'spot' }, 'مطفية': { on: false } },
    generate: (p, q) => { const P = K.parts(), k = p.kind, n = K.sides(q, 12), gc = K.c(p.glow), G = P.custom('glass', p.on ? LP.mat('lamp', { emissive: mixc(gc, [1, 1, 1], 0.4), glow: 1.4 }) : LP.mat('glass', { roughness: 0.1, opacity: 0.7 })), M = P('chrome');
      if (k === 'tube') { K.cyl(G, [0, 0.02, -0.6], [0, 0.02, 0.6], 0.013, 0.013, 8, 'white'); for (const s of [1, -1]) K.cyl(M, [0, 0.02, s * 0.6], [0, 0.02, s * 0.62], 0.014, 0.014, 8, 'steel'); }
      else if (k === 'spot') { K.cyl(P('plastic'), [0, 0, 0], [0, 0.04, 0], 0.05, 0.05, n, 'white'); K.cyl(P('plastic'), [0, 0.04, 0], [0, 0.045, 0], 0.07, 0.07, n, 'white'); K.cyl(G, [0, -0.001, 0], [0, 0.002, 0], 0.04, 0.04, n, 'white'); }
      else { K.cyl(M, [0, 0, 0], [0, 0.03, 0], 0.013, 0.014, 8, 'steel'); for (let i = 0; i < 3; i++) K.cyl(M, [0, 0.004 + i * 0.008, 0], [0, 0.008 + i * 0.008, 0], 0.0145, 0.0145, 8, 'chrome', null, { noCaps: true }); K.cyl(P('plastic'), [0, 0.03, 0], [0, 0.04, 0], 0.016, 0.02, 8, 'white');
        if (k === 'led') { K.cyl(P('plastic'), [0, 0.04, 0], [0, 0.065, 0], 0.02, 0.03, n, 'white'); LP.ico(G, [0, 0.085, 0], [0.032, 0.025, 0.032], 1, () => [1, 1, 1], { keep: d => d[1] > -0.2 }); }
        else LP.ico(G, [0, 0.08, 0], [0.032, 0.04, 0.032], 1, () => [1, 1, 1], { shape: d => [d[0] * (d[1] < 0 ? 1 - 0.45 * -d[1] : 1), d[1], d[2] * (d[1] < 0 ? 1 - 0.45 * -d[1] : 1)] }); }
      return K.done('bulb', P, { collider: K.boxCol(0.07, 0.12, k === 'tube' ? 1.24 : 0.07), light: p.on ? { at: [0, k === 'spot' ? -0.1 : 0.08, 0], color: gc, intensity: 1.2, distance: 5 } : null }); } });
  K.def('electrical', { name: 'أدوات كهرباء', nameEn: 'Electrical items', group: 'tools',
    schema: [{ key: 'item', label: 'القطعة', type: 'enum', options: [['cable', 'بكرة سلك'], ['strip', 'توصيلة'], ['panel', 'طبلون كهرباء'], ['meter', 'عداد كهرباء'], ['multimeter', 'ملتيميتر'], ['tester', 'مفك فحص'], ['box', 'علبة توزيع']], def: 'cable' }, K.color('color', 'اللون', 'red', [['white', 'أبيض']])],
    presets: { 'توصيلة': { item: 'strip', color: 'white' }, 'طبلون': { item: 'panel' }, 'عداد': { item: 'meter' }, 'ملتيميتر': { item: 'multimeter', color: 'yellow' }, 'مفك فحص': { item: 'tester' } },
    generate: (p, q) => { const P = K.parts(), it = p.item, n = K.sides(q, 14), B = P('plastic'), M = P('chrome'), c = p.color;
      if (it === 'cable') { for (const s of [1, -1]) K.cyl(B, [s * 0.1, 0.15, 0], [s * 0.115, 0.15, 0], 0.15, 0.15, n, 'black'); K.cyl(B, [-0.1, 0.15, 0], [0.1, 0.15, 0], 0.05, 0.05, n, 'black'); const W = P('rubber'); for (let i = 0; i < 8; i++) K.cyl(W, [-0.1 + i * 0.025, 0.15, 0], [-0.1 + (i + 1) * 0.025, 0.15, 0], 0.11, 0.11, n, i % 2 ? c : AA.mixc(K.c(c), [0, 0, 0], 0.15), null, { noCaps: true });
        const tail = [[0.0, 0.26, 0.04], [0.05, 0.1, 0.2], [0.1, 0.01, 0.35], [0.3, 0.01, 0.45]]; for (let i = 0; i < tail.length - 1; i++) K.rod(W, tail[i], tail[i + 1], 0.006, c, null, 5); }
      else if (it === 'strip') { K.box(B, [0, 0.02, 0], [0.07, 0.04, 0.34], c); for (let i = 0; i < 4; i++) { const z = -0.12 + i * 0.075; K.cyl(P('dark'), [0, 0.04, z], [0, 0.042, z], 0.022, 0.022, 8, 'greyLight'); for (const dx of [-0.008, 0.008]) K.box(P('dark'), [dx, 0.0425, z], [0.004, 0.001, 0.004], 'black'); } K.box(P('sigRed'), [0, 0.042, 0.155], [0.03, 0.006, 0.02], 'white'); const tl = [[0, 0.02, -0.17], [0, 0.01, -0.3], [0.1, 0.006, -0.45]]; for (let i = 0; i < 2; i++) K.rod(P('rubber'), tl[i], tl[i + 1], 0.005, c, null, 5); }
      else if (it === 'panel') { const y = 1.5; K.box(P('metal'), [0, y, 0.05], [0.5, 0.6, 0.1], 'offwhite'); K.box(P('dark'), [0, y, 0.101], [0.42, 0.42, 0.002], 'dark'); for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++) { const x = -0.18 + i * 0.05, yy = y + 0.1 - r * 0.2; K.box(B, [x, yy, 0.11], [0.04, 0.12, 0.02], 'white'); K.box(P('dark'), [x, yy + (i % 3 ? 0.02 : -0.02), 0.122], [0.012, 0.03, 0.006], 'black'); } K.box(P('glass'), [0, y, 0.13], [0.46, 0.46, 0.01], 'glass'); }
      else if (it === 'meter') { const y = 1.6; K.box(B, [0, y, 0.05], [0.2, 0.3, 0.1], 'greyLight'); K.box(P('glassSolid'), [0, y + 0.05, 0.101], [0.16, 0.14, 0.004], 'glass'); K.box(P('screen'), [0, y + 0.07, 0.1], [0.1, 0.035, 0.003], 'white'); K.box(P('dark'), [0, y - 0.11, 0.08], [0.18, 0.06, 0.05], 'black'); for (let i = 0; i < 3; i++) K.rod(P('rubber'), [-0.05 + i * 0.05, y - 0.14, 0.08], [-0.05 + i * 0.05, y - 0.4, 0.04], 0.01, 'black', null, 5); }
      else if (it === 'multimeter') { K.box(B, [0, 0.02, 0], [0.09, 0.04, 0.17], c); K.box(P('dark'), [0, 0.04, 0.0], [0.08, 0.004, 0.16], 'black'); K.box(P('screen'), [0, 0.043, 0.045], [0.06, 0.002, 0.035], 'white'); K.cyl(P('plastic'), [0, 0.042, -0.02], [0, 0.05, -0.02], 0.025, 0.025, 10, 'grey'); K.box(P('dark'), [0, 0.051, -0.02], [0.004, 0.002, 0.04], 'white'); for (const [x, col] of [[-0.02, 'red'], [0.02, 'black']]) { K.cyl(P('rubber'), [x, 0.042, -0.065], [x, 0.046, -0.065], 0.006, 0.006, 6, col); K.rod(P('rubber'), [x, 0.046, -0.065], [x * 3, 0.006, -0.2], 0.003, col, null, 4); K.cyl(P('rubber'), [x * 3, 0.006, -0.2], [x * 3.4, 0.006, -0.3], 0.006, 0.004, 6, col); } }
      else if (it === 'tester') { handle(P, -0.09, 0.0, 0.009, 'red', 0.009, q); K.cyl(P.custom('neonTest', LP.mat('lamp', { emissive: [1, 0.3, 0.1], glow: 0.6 })), [0, 0.009, -0.06], [0, 0.009, -0.03], 0.006, 0.006, 6, 'white'); K.cyl(M, [0, 0.009, 0], [0, 0.009, 0.06], 0.0025, 0.0025, 6, 'chrome'); K.box(M, [0, 0.009, 0.064], [0.005, 0.0012, 0.008], 'chrome'); }
      else { K.box(B, [0, 0.04, 0], [0.12, 0.08, 0.12], 'greyLight'); for (const d of [[1, 0, 0], [-1, 0, 0], [0, 0, 1]]) K.cyl(B, V.add([0, 0.04, 0], V.scale(d, 0.06)), V.add([0, 0.04, 0], V.scale(d, 0.25)), 0.012, 0.012, 8, 'greyLight'); K.box(P('dark'), [0, 0.081, 0], [0.1, 0.002, 0.1], 'grey'); }
      return K.done('electrical', P, { collider: K.boxCol(0.5, it === 'panel' || it === 'meter' ? 1.9 : 0.3, 0.5), wallMount: it === 'panel' || it === 'meter' }); } });
})(typeof window !== 'undefined' ? window : globalThis);

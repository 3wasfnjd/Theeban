// Aboden Assets — kit/kit-home.js — البيت من الداخل: غرفة (أرضية وجدران بفتحات)، كنب، سرير، طاولة، كرسي، دولاب، تلفزيون، ثلاجة، مطبخ، رف كتب، أباجورة، نبتة، زولية، مكتب وكمبيوتر، غسالة، مكيف سبليت، حمام (كرسي ومغسلة ودش)، باب، شباك
// الأثاث: الأصل على الأرض في منتصف القطعة، والوجه الأمامي (اللي يقعد عليه الشخص أو يفتح منه) إلى +Z.
(function (g) {
  'use strict';
  const AA = g.AA, K = AA.kit, V = AA.v, lerp = AA.lerp;
  const FAB = [['fabric', 'أزرق'], ['fabric2', 'طوبي'], ['fabric3', 'زيتي'], ['greyLight', 'رمادي'], ['cream', 'كريمي'], ['black', 'أسود']];
  const WOOD = [['wood', 'خشب'], ['woodLight', 'خشب فاتح'], ['woodDark', 'خشب غامق'], ['white', 'أبيض'], ['black', 'أسود']];
  const leg = (B, x, z, h, col, r) => K.box(B, [x, h / 2, z], [r || 0.05, h, r || 0.05], col);
  // مخدة/مرتبة بحواف مشطوفة (منشور مثمن مسطح)
  const cushion = (B, c, w, h, d, col) => { const b = Math.min(0.04, h * 0.3, w * 0.15, d * 0.15); K.extrude(B, [[-w / 2 + b, -h / 2], [w / 2 - b, -h / 2], [w / 2, -h / 2 + b], [w / 2, h / 2 - b], [w / 2 - b, h / 2], [-w / 2 + b, h / 2], [-w / 2, h / 2 - b], [-w / 2, -h / 2 + b]], 'z', -d / 2, d / 2, col, { at: c }); };
  K.cushion = cushion;

  // ---------- غرفة ----------
  K.def('room', { name: 'غرفة', nameEn: 'Room shell', group: 'home',
    schema: [{ key: 'width', label: 'العرض', min: 3, max: 10, step: 0.5, def: 5, unit: 'م' }, { key: 'depth', label: 'العمق', min: 3, max: 10, step: 0.5, def: 4.5, unit: 'م' }, { key: 'height', label: 'الارتفاع', min: 2.6, max: 4, step: 0.1, def: 3, unit: 'م' },
      { key: 'floor', label: 'الأرضية', type: 'enum', options: [['wood', 'باركيه'], ['tiles', 'بلاط'], ['marble', 'رخام'], ['concrete', 'خرسانة']], def: 'wood' }, K.color('wallColor', 'لون الجدران', 'plaster', [['plaster', 'كريمي'], ['#d7e3e8', 'أزرق فاتح'], ['#e8d7d0', 'وردي فاتح'], ['#dfe6d2', 'أخضر فاتح']]),
      { key: 'walls', label: 'الجدران', type: 'enum', options: [['back2', 'جداران (للعرض)'], ['all', 'أربعة'], ['none', 'بدون']], def: 'back2' }, { key: 'window', label: 'شباك', type: 'bool', def: true }, { key: 'door', label: 'باب', type: 'bool', def: true }, { key: 'ceilingLight', label: 'إضاءة سقف', type: 'bool', def: true }],
    presets: { 'غرفة كاملة': { walls: 'all' }, 'مطبخ بلاط': { floor: 'tiles', wallColor: '#dfe6d2' }, 'صالة رخام': { floor: 'marble', width: 8, depth: 6 } },
    generate: (p, q) => { const P = K.parts(), rng = AA.rng(p.seed), W = p.width, D = p.depth, H = p.height, t = 0.15, col = p.wallColor;
      K.floorInto(P, W, D, 0.1, p.floor, rng, q);
      const walls = p.walls === 'none' ? [] : p.walls === 'all' ? [0, 1, 2, 3] : [2, 3]; // 0 أمام، 1 يمين، 2 خلف، 3 يسار
      const face = [[W, [0, 0, D / 2 + t / 2], 0], [D + 2 * t, [W / 2 + t / 2, 0, 0], Math.PI / 2], [W, [0, 0, -D / 2 - t / 2], Math.PI], [D + 2 * t, [-W / 2 - t / 2, 0, 0], -Math.PI / 2]];
      for (const k of walls) { const [L, at, rot] = face[k], o = { at, rot }, B = P('stone');
        let hole = null; if (p.window && k === 2) hole = [-0.8, 0.8, 1.0, 2.2]; if (p.door && k === 3) hole = [-D / 4 - 0.5, -D / 4 + 0.5, 0, 2.15];
        const sub = (c, s) => K.box(B, c, s, col, o);
        if (!hole) sub([0, H / 2 + 0.1, 0], [L, H, t]); else { const [x0, x1, y0, y1] = hole; sub([(-L / 2 + x0) / 2, H / 2 + 0.1, 0], [x0 + L / 2, H, t]); sub([(x1 + L / 2) / 2, H / 2 + 0.1, 0], [L / 2 - x1, H, t]); if (y0) sub([(x0 + x1) / 2, y0 / 2 + 0.1, 0], [x1 - x0, y0, t]); sub([(x0 + x1) / 2, (y1 + H) / 2 + 0.1, 0], [x1 - x0, H - y1, t]); }
        K.box(P('wood'), [0, 0.16, 0.08], [L - 0.02, 0.12, 0.02], 'white', { at, rot: rot + Math.PI }); // وزرة من الداخل
        if (hole && k === 2) K.windowInto(P, hole[0], hole[1], hole[2] + 0.1, hole[3] + 0.1, t, 'white', o);
        if (hole && k === 3) { K.box(P('plastic'), [hole[0] - 0.03, 1.18, 0], [0.08, 2.14, t + 0.04], 'white', o); K.box(P('plastic'), [hole[1] + 0.03, 1.18, 0], [0.08, 2.14, t + 0.04], 'white', o); K.box(P('plastic'), [(hole[0] + hole[1]) / 2, 2.29, 0], [1.16, 0.08, t + 0.04], 'white', o); }
      }
      if (p.ceilingLight) { K.cyl(P('lamp'), [0, H + 0.02, 0], [0, H - 0.04, 0], 0.3, 0.26, 12, 'white'); }
      return K.done('room', P, { collider: K.boxCol(W, 0.1, D), interior: { width: W, depth: D, height: H, floorTop: 0.1 }, light: p.ceilingLight ? { at: [0, H - 0.2, 0], color: [1, 0.92, 0.8], intensity: 1.6, distance: Math.max(W, D) * 1.4 } : null });
    } });

  // ---------- جلسات ----------
  K.def('sofa', { name: 'كنب', nameEn: 'Sofa', group: 'home',
    schema: [{ key: 'seats', label: 'المقاعد', min: 1, max: 4, step: 1, def: 3 }, { key: 'color', label: 'القماش', type: 'enum', options: FAB, def: 'fabric' }, { key: 'corner', label: 'زاوية (L)', type: 'bool', def: false }],
    presets: { 'كرسي فردي': { seats: 1, color: 'fabric2' }, 'كنب زاوية': { corner: true, seats: 3, color: 'greyLight' } },
    generate: (p, q) => { const P = K.parts(), C = P('cloth'), n = p.seats, sw = 0.72, W = n * sw + 0.36, D = 0.9, col = p.color, dk = AA.mixc(K.c(col), [0, 0, 0], 0.15);
      cushion(C, [0, 0.25, 0], W, 0.28, D, dk); for (const s of [1, -1]) cushion(C, [s * (W / 2 - 0.09), 0.42, 0], 0.18, 0.62, D + 0.02, col);
      cushion(C, [0, 0.62, -D / 2 + 0.12], W - 0.36, 0.5, 0.21, col);
      for (let k = 0; k < n; k++) { const x = -W / 2 + 0.18 + (k + 0.5) * sw; cushion(C, [x, 0.46, 0.06], sw - 0.03, 0.16, D - 0.3, col); cushion(C, [x, 0.7, -D / 2 + 0.3], sw - 0.08, 0.38, 0.14, AA.mixc(K.c(col), [1, 1, 1], 0.08)); }
      for (const [x, z] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) leg(P('wood'), x * (W / 2 - 0.1), z * (D / 2 - 0.1), 0.12, 'woodDark');
      if (p.corner) { const x = W / 2 - 0.45, L = 1.6; cushion(C, [x, 0.25, D / 2 + L / 2 - 0.1], 0.9, 0.28, L, dk); cushion(C, [x, 0.46, D / 2 + L / 2 - 0.1], 0.86, 0.16, L - 0.05, col); cushion(C, [x + 0.36, 0.42, D / 2 + L / 2 - 0.1], 0.18, 0.62, L, col); }
      return K.done('sofa', P, { collider: K.boxCol(W, 0.9, D), seats: Array.from({ length: n }, (_, k) => [-W / 2 + 0.18 + (k + 0.5) * sw, 0.47, 0.1]) }); } });

  K.def('bed', { name: 'سرير', nameEn: 'Bed', group: 'home',
    schema: [{ key: 'size', label: 'المقاس', type: 'enum', options: [['double', 'مزدوج'], ['single', 'مفرد'], ['bunk', 'دورين']], def: 'double' }, { key: 'color', label: 'المفرش', type: 'enum', options: FAB, def: 'fabric2' }, { key: 'wood', label: 'الخشب', type: 'enum', options: WOOD, def: 'woodDark' }],
    presets: { 'مفرد': { size: 'single', color: 'fabric' }, 'دورين للأطفال': { size: 'bunk', color: 'fabric3', wood: 'white' } },
    generate: (p, q) => { const P = K.parts(), C = P('cloth'), Wd = P('wood'), W = p.size === 'double' ? 1.8 : 1.0, L = 2.05;
      const bunk = (y0) => { K.box(Wd, [0, y0 + 0.2, 0], [W + 0.08, 0.16, L + 0.08], p.wood); cushion(C, [0, y0 + 0.36, 0.02], W, 0.2, L - 0.04, 'white'); cushion(C, [0, y0 + 0.48, 0.22], W + 0.02, 0.06, L * 0.75, p.color); for (const s of (W > 1.2 ? [1, -1] : [0])) cushion(C, [s * W / 4, y0 + 0.52, -L / 2 + 0.3], W > 1.2 ? W / 2 - 0.1 : W - 0.2, 0.14, 0.38, 'cream'); };
      bunk(0); K.box(Wd, [0, 0.55, -L / 2 - 0.04], [W + 0.12, 1.1, 0.06], p.wood); for (const s of [1, -1]) leg(Wd, s * (W / 2 - 0.01), L / 2 - 0.01, 0.3, p.wood, 0.08);
      if (p.size === 'bunk') { bunk(1.2); for (const [x, z] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) leg(Wd, x * W / 2, z * L / 2, 2.0, p.wood, 0.07); for (let k = 0; k < 5; k++) K.box(Wd, [W / 2 + 0.06, 0.35 + k * 0.3, L / 2 - 0.25], [0.04, 0.04, 0.4], p.wood); K.box(Wd, [0, 1.85, 0], [0.04, 0.2, L], p.wood); }
      return K.done('bed', P, { collider: K.boxCol(W, p.size === 'bunk' ? 2 : 1.1, L), sleep: [0, 0.48, 0] }); } });

  K.def('table', { name: 'طاولة', nameEn: 'Table', group: 'home',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['dining', 'طعام'], ['coffee', 'قهوة'], ['round', 'دائرية'], ['side', 'جانبية']], def: 'dining' }, { key: 'chairs', label: 'الكراسي', min: 0, max: 8, step: 2, def: 4 }, { key: 'wood', label: 'الخشب', type: 'enum', options: WOOD, def: 'wood' }],
    presets: { 'طاولة قهوة': { kind: 'coffee', chairs: 0 }, 'دائرية': { kind: 'round', chairs: 4, wood: 'white' }, 'طاولة 8': { chairs: 8 } },
    generate: (p, q) => { const P = K.parts(), Wd = P('wood'), k = p.kind, n = K.sides(q, 12);
      const sz = { dining: [1.4 + Math.max(0, p.chairs - 4) * 0.3, 0.76, 0.9], coffee: [1.1, 0.42, 0.6], round: [1.1, 0.76, 1.1], side: [0.5, 0.55, 0.5] }[k], [W, H, D] = sz;
      if (k === 'round') { K.cyl(Wd, [0, H - 0.04, 0], [0, H, 0], W / 2, W / 2, n, p.wood); K.cyl(Wd, [0, 0, 0], [0, H - 0.04, 0], 0.06, 0.06, 6, p.wood); K.cyl(Wd, [0, 0, 0], [0, 0.04, 0], 0.3, 0.3, n, p.wood); }
      else { K.box(Wd, [0, H - 0.025, 0], [W, 0.05, D], p.wood); for (const [x, z] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) leg(Wd, x * (W / 2 - 0.06), z * (D / 2 - 0.06), H - 0.05, p.wood, 0.06); if (k === 'coffee') K.box(Wd, [0, 0.12, 0], [W - 0.15, 0.03, D - 0.15], p.wood); }
      const chairs = k === 'coffee' || k === 'side' ? 0 : p.chairs, seats = [];
      for (let i = 0; i < chairs; i++) { let at, rot;
        if (k === 'round') { const a = i / chairs * Math.PI * 2; at = [Math.sin(a) * 0.85, 0, Math.cos(a) * 0.85]; rot = a + Math.PI; }
        else { const per = Math.max(1, chairs / 2), side = i < per ? 1 : -1, j = i % per; at = [-W / 2 + (j + 0.5) * W / per, 0, side * (D / 2 + 0.3)]; rot = side > 0 ? Math.PI : 0; }
        K.chairInto(P, { at, rot }, p.wood, 'fabric'); seats.push(at); }
      return K.done('table', P, { collider: K.boxCol(W, H, D), top: H, seats }); } });

  K.chairInto = function (P, o, wood, fab) { const Wd = P('wood');
    for (const [x, z] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) K.box(Wd, [x * 0.19, 0.22, z * 0.19], [0.04, 0.44, 0.04], wood, o);
    K.box(Wd, [0, 0.45, 0], [0.44, 0.04, 0.44], wood, o); K.box(P('cloth'), [0, 0.48, 0.01], [0.4, 0.04, 0.38], fab, o);
    for (const s of [1, -1]) K.box(Wd, [s * 0.19, 0.7, -0.2], [0.04, 0.5, 0.04], wood, o); K.box(Wd, [0, 0.82, -0.2], [0.36, 0.18, 0.03], wood, o); };
  K.def('chair', { name: 'كرسي', nameEn: 'Chair', group: 'home',
    schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['dining', 'طعام'], ['office', 'مكتب'], ['stool', 'كرسي بار'], ['plastic', 'بلاستيك']], def: 'dining' }, { key: 'wood', label: 'الخشب', type: 'enum', options: WOOD, def: 'wood' }, { key: 'color', label: 'القماش', type: 'enum', options: FAB, def: 'fabric' }],
    presets: { 'كرسي مكتب': { kind: 'office', color: 'black' }, 'كرسي بار': { kind: 'stool' }, 'بلاستيك أبيض': { kind: 'plastic' } },
    generate: (p, q) => { const P = K.parts(), M = P('metal'), n = K.sides(q, 10);
      if (p.kind === 'dining') K.chairInto(P, null, p.wood, p.color);
      else if (p.kind === 'office') { for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, e = [Math.sin(a) * 0.3, 0.06, Math.cos(a) * 0.3]; K.rod(M, [0, 0.1, 0], e, 0.025, 'dark'); K.ball(P('dark'), [e[0], 0.04, e[2]], 0.04, 'black'); }
        K.cyl(M, [0, 0.1, 0], [0, 0.45, 0], 0.035, 0.035, 8, 'chrome'); cushion(P('cloth'), [0, 0.5, 0], 0.5, 0.1, 0.48, p.color); cushion(P('cloth'), [0, 0.88, -0.24], 0.46, 0.6, 0.08, p.color); K.rod(M, [0, 0.5, -0.2], [0, 0.6, -0.26], 0.025, 'dark'); for (const s of [1, -1]) { K.rod(M, [s * 0.24, 0.5, 0], [s * 0.26, 0.68, 0], 0.02, 'dark'); K.box(P('plastic'), [s * 0.26, 0.69, 0.02], [0.06, 0.03, 0.28], 'black'); } }
      else if (p.kind === 'stool') { K.cyl(M, [0, 0, 0], [0, 0.03, 0], 0.22, 0.22, n, 'chrome'); K.cyl(M, [0, 0.03, 0], [0, 0.72, 0], 0.03, 0.03, 8, 'chrome'); K.cyl(M, [0, 0.3, 0], [0, 0.32, 0], 0.17, 0.17, n, 'chrome'); K.cyl(P('cloth'), [0, 0.72, 0], [0, 0.8, 0], 0.2, 0.19, n, p.color); }
      else { const B = P('plastic'); for (const [x, z] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) K.cyl(B, [x * 0.2, 0, z * 0.2], [x * 0.18, 0.44, z * 0.18], 0.025, 0.022, 6, 'white'); K.box(B, [0, 0.45, 0], [0.46, 0.04, 0.46], 'white'); K.extrude(B, [[-0.23, 0.45], [0.23, 0.45], [0.25, 0.85], [-0.25, 0.85]], 'z', -0.24, -0.21, 'white'); for (const s of [1, -1]) K.box(B, [s * 0.24, 0.62, 0], [0.03, 0.05, 0.44], 'white'); }
      return K.done('chair', P, { collider: K.boxCol(0.5, 0.9, 0.5), seat: [0, p.kind === 'stool' ? 0.8 : 0.48, 0] }); } });

  // ---------- تخزين ----------
  K.def('wardrobe', { name: 'دولاب', nameEn: 'Wardrobe', group: 'home', schema: [{ key: 'doors', label: 'الأبواب', min: 2, max: 4, step: 1, def: 2 }, { key: 'wood', label: 'الخشب', type: 'enum', options: WOOD, def: 'woodLight' }, { key: 'mirror', label: 'مرآة', type: 'bool', def: true }], presets: { 'أبيض 3 أبواب': { doors: 3, wood: 'white' } },
    generate: (p, q) => { const P = K.parts(), Wd = P('wood'), n = p.doors, W = n * 0.55, H = 2.1, D = 0.6, dk = AA.mixc(K.c(p.wood), [0, 0, 0], 0.1);
      K.box(Wd, [0, H / 2 + 0.05, 0], [W, H, D], p.wood); K.box(Wd, [0, 0.025, 0], [W - 0.04, 0.05, D - 0.04], 'dark');
      for (let k = 0; k < n; k++) { const x = -W / 2 + (k + 0.5) * W / n; K.box(Wd, [x, H / 2 + 0.05, D / 2 + 0.01], [W / n - 0.02, H - 0.06, 0.02], dk); K.box(P('metal'), [x + (k % 2 ? -1 : 1) * (W / n / 2 - 0.06), H / 2 + 0.05, D / 2 + 0.035], [0.03, 0.3, 0.03], 'chrome'); if (p.mirror && k === 0) K.box(P('mirror'), [x, H / 2 + 0.2, D / 2 + 0.024], [W / n - 0.14, H - 0.6, 0.01], 'chrome'); }
      return K.done('wardrobe', P, { collider: K.boxCol(W, H, D) }); } });
  K.def('bookshelf', { name: 'رف كتب', nameEn: 'Bookshelf', group: 'home', schema: [{ key: 'width', label: 'العرض', min: 0.6, max: 2.4, step: 0.2, def: 1.2, unit: 'م' }, { key: 'shelves', label: 'الرفوف', min: 2, max: 6, step: 1, def: 5 }, { key: 'wood', label: 'الخشب', type: 'enum', options: WOOD, def: 'wood' }, { key: 'books', label: 'كتب', type: 'bool', def: true }], presets: { 'فاضي': { books: false } },
    generate: (p, q) => { const P = K.parts(), Wd = P('wood'), rng = AA.rng(p.seed), W = p.width, n = p.shelves, H = n * 0.38 + 0.05, D = 0.32;
      for (const s of [1, -1]) K.box(Wd, [s * (W / 2 - 0.015), H / 2, 0], [0.03, H, D], p.wood); K.box(Wd, [0, H / 2, -D / 2 + 0.01], [W - 0.04, H - 0.01, 0.02], AA.mixc(K.c(p.wood), [0, 0, 0], 0.2));
      for (let k = 0; k <= n; k++) K.box(Wd, [0, 0.03 + k * (H - 0.05) / n, 0], [W - 0.03, 0.03, D], p.wood);
      if (p.books) for (let k = 0; k < n; k++) { let x = -W / 2 + 0.05; const y0 = 0.045 + k * (H - 0.05) / n; while (x < W / 2 - 0.12) { const bw = 0.03 + rng() * 0.04, bh = 0.2 + rng() * 0.12; if (rng() < 0.12) { x += 0.08; continue; } K.box(P('cloth'), [x + bw / 2, y0 + bh / 2, 0.01], [bw, bh, 0.22], ['red', 'navy', 'green', 'cream', 'orange', 'teal', 'brown'][Math.floor(rng() * 7)]); x += bw + 0.003; } }
      return K.done('bookshelf', P, { collider: K.boxCol(W, H, D) }); } });

  // ---------- أجهزة ----------
  K.def('tv', { name: 'تلفزيون', nameEn: 'TV', group: 'home', schema: [{ key: 'size', label: 'المقاس', min: 0.8, max: 2, step: 0.1, def: 1.3, unit: 'م' }, { key: 'stand', label: 'طاولة', type: 'bool', def: true }, { key: 'on', label: 'شغال', type: 'bool', def: true }], presets: { 'معلق بدون طاولة': { stand: false } },
    generate: (p, q) => { const P = K.parts(), W = p.size, H = W * 0.57, y = p.stand ? 0.55 + H / 2 + 0.08 : 1.3;
      if (p.stand) { const Wd = P('wood'); K.box(Wd, [0, 0.25, 0], [W + 0.5, 0.45, 0.45], 'woodDark'); K.box(Wd, [0, 0.025, 0], [W + 0.4, 0.05, 0.4], 'black'); for (const s of [1, -1]) K.box(Wd, [s * (W + 0.5) / 4, 0.25, 0.226], [(W + 0.5) / 2 - 0.03, 0.38, 0.01], 'wood'); K.box(P('metal'), [0, 0.5, 0], [0.3, 0.04, 0.2], 'dark'); K.box(P('metal'), [0, 0.5 + 0.08 / 2 + 0.03, -0.02], [0.06, 0.12, 0.04], 'dark'); K.box(P('dark'), [W / 2 + 0.05, 0.6, 0.05], [0.12, 0.12, 0.1], 'black'); }
      K.box(P('dark'), [0, y, 0], [W, H, 0.05], 'black'); K.box(P(p.on ? 'screen' : 'dark'), [0, y, 0.028], [W - 0.04, H - 0.04, 0.005], p.on ? 'white' : 'dark');
      return K.done('tv', P, { collider: K.boxCol(W + 0.5, y + H / 2, 0.45), light: p.on ? { at: [0, y, 0.5], color: [0.5, 0.65, 1], intensity: 0.6, distance: 3 } : null }); } });
  K.def('fridge', { name: 'ثلاجة', nameEn: 'Fridge', group: 'home', schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['double', 'بابين'], ['single', 'باب واحد'], ['side', 'جنب لجنب']], def: 'double' }, K.color('color', 'اللون', 'white', [['steel', 'ستانلس']])], presets: { 'ستانلس جنب لجنب': { kind: 'side', color: 'steel' } },
    generate: (p, q) => { const P = K.parts(), B = P('paint'), W = p.kind === 'side' ? 0.9 : 0.7, H = 1.8, D = 0.7, c = p.color;
      K.box(B, [0, H / 2 + 0.03, 0], [W, H, D], c); K.box(P('dark'), [0, 0.015, 0], [W - 0.05, 0.03, D - 0.05], 'dark');
      const M = P('chrome');
      if (p.kind === 'double') { K.box(P('dark'), [0, H * 0.68, D / 2 + 0.003], [W, 0.012, 0.006], 'dark'); K.box(M, [W / 2 - 0.08, H * 0.82, D / 2 + 0.03], [0.03, 0.35, 0.03], 'chrome'); K.box(M, [W / 2 - 0.08, H * 0.42, D / 2 + 0.03], [0.03, 0.5, 0.03], 'chrome'); }
      else if (p.kind === 'side') { K.box(P('dark'), [0, H / 2, D / 2 + 0.003], [0.012, H - 0.02, 0.006], 'dark'); for (const s of [1, -1]) K.box(M, [s * 0.06, H * 0.55, D / 2 + 0.03], [0.03, 0.8, 0.03], 'chrome'); K.box(P('screen'), [-0.22, H * 0.68, D / 2 + 0.006], [0.18, 0.3, 0.01], 'white'); }
      else K.box(M, [W / 2 - 0.08, H * 0.6, D / 2 + 0.03], [0.03, 0.6, 0.03], 'chrome');
      return K.done('fridge', P, { collider: K.boxCol(W, H, D) }); } });
  K.def('kitchen', { name: 'مطبخ', nameEn: 'Kitchen counter', group: 'home',
    schema: [{ key: 'length', label: 'الطول', min: 1.2, max: 5, step: 0.6, def: 3, unit: 'م' }, { key: 'color', label: 'لون الأبواب', type: 'enum', options: WOOD.concat([['#5f7f6a', 'أخضر'], ['navy', 'كحلي']]), def: 'white' }, { key: 'upper', label: 'خزائن علوية', type: 'bool', def: true }, { key: 'stove', label: 'فرن وغاز', type: 'bool', def: true }, { key: 'sink', label: 'مغسلة', type: 'bool', def: true }],
    presets: { 'خشب': { color: 'woodLight' }, 'كحلي قصير': { color: 'navy', length: 1.8, upper: false } },
    generate: (p, q) => { const P = K.parts(), L = p.length, Wd = P('wood'), D = 0.62, H = 0.9, n = Math.round(L / 0.6), dk = AA.mixc(K.c(p.color), [0, 0, 0], 0.06);
      K.box(Wd, [0, H / 2, 0], [L, H - 0.04, D], p.color); K.box(P('dark'), [0, 0.05, 0.02], [L - 0.04, 0.1, D - 0.04], 'dark'); K.box(P('stone'), [0, H - 0.02, 0.025], [L + 0.02, 0.04, D + 0.03], 'greyLight');
      for (let k = 0; k < n; k++) { const x = -L / 2 + (k + 0.5) * L / n; K.box(Wd, [x, 0.5, D / 2 + 0.01], [L / n - 0.02, 0.76, 0.02], dk); K.box(P('metal'), [x, 0.78, D / 2 + 0.03], [0.2, 0.02, 0.02], 'chrome'); }
      const sk = p.sink ? -L / 2 + 0.9 : null, st = p.stove ? L / 2 - 0.6 : null;
      if (sk != null) { K.box(P('metal'), [sk, H + 0.005, 0.02], [0.7, 0.01, 0.45], 'chrome'); K.box(P('dark'), [sk, H + 0.012, 0.02], [0.6, 0.005, 0.36], 'steel'); K.rod(P('chrome'), [sk, H, -0.22], [sk, H + 0.3, -0.22], 0.02, 'chrome'); K.rod(P('chrome'), [sk, H + 0.3, -0.22], [sk, H + 0.3, -0.05], 0.018, 'chrome'); }
      if (st != null) { K.box(P('dark'), [st, H + 0.006, 0.02], [0.6, 0.012, 0.55], 'black'); for (const [dx, dz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) K.cyl(P('metal'), [st + dx * 0.15, H + 0.012, 0.02 + dz * 0.13], [st + dx * 0.15, H + 0.025, 0.02 + dz * 0.13], 0.07, 0.07, 8, 'grey'); K.box(P('glassSolid'), [st, 0.48, D / 2 + 0.025], [0.56, 0.4, 0.02], 'black'); K.box(P('metal'), [st, 0.75, D / 2 + 0.04], [0.5, 0.025, 0.025], 'chrome');
        if (p.upper) { K.extrude(P('metal'), [[-0.3, 1.6], [0.3, 1.6], [0.12, 1.85], [-0.12, 1.85]], 'z', -D / 2, -D / 2 + 0.5, 'steel', { at: [st, 0, 0] }); } }
      if (p.upper) for (let k = 0; k < n; k++) { const x = -L / 2 + (k + 0.5) * L / n; if (st != null && Math.abs(x - st) < 0.35) continue; K.box(Wd, [x, 1.85, -D / 2 + 0.18], [L / n - 0.01, 0.7, 0.35], p.color); K.box(Wd, [x, 1.85, -D / 2 + 0.36], [L / n - 0.03, 0.66, 0.015], dk); K.box(P('metal'), [x, 1.56, -D / 2 + 0.375], [0.16, 0.02, 0.02], 'chrome'); }
      K.box(P('ceramic'), [0, 1.2, -D / 2 + 0.005], [L, 0.6, 0.01], 'offwhite');
      return K.done('kitchen', P, { collider: K.boxCol(L, H, D) }); } });
  K.def('washer', { name: 'غسالة', nameEn: 'Washing machine', group: 'home', schema: [K.color('color', 'اللون', 'white', [['steel', 'ستانلس']])], presets: {},
    generate: (p, q) => { const P = K.parts(), n = K.sides(q, 14); K.box(P('paint'), [0, 0.43, 0], [0.6, 0.84, 0.6], p.color); K.box(P('dark'), [0, 0.76, 0.302], [0.56, 0.12, 0.01], 'greyLight'); K.cyl(P('metal'), [0, 0.38, 0.3], [0, 0.38, 0.33], 0.22, 0.22, n, 'chrome'); K.cyl(P('glassSolid'), [0, 0.38, 0.33], [0, 0.38, 0.345], 0.17, 0.17, n, 'glassDark'); K.cyl(P('metal'), [0.2, 0.76, 0.305], [0.2, 0.76, 0.33], 0.04, 0.04, 8, 'grey');
      return K.done('washer', P, { collider: K.boxCol(0.6, 0.86, 0.6) }); } });
  K.def('ac_split', { name: 'مكيف سبليت', nameEn: 'Split AC (indoor)', group: 'home', schema: [{ key: 'width', label: 'العرض', min: 0.7, max: 1.2, step: 0.05, def: 0.9, unit: 'م' }], presets: {},
    generate: (p, q) => { const P = K.parts(), W = p.width, y = 2.3; K.extrude(P('plastic'), [[0, -0.15], [0.16, -0.12], [0.2, 0.0], [0.17, 0.14], [0, 0.15]], 'x', -W / 2, W / 2, 'white', { at: [0, y, 0] }); K.box(P('dark'), [0, y - 0.11, 0.17], [W - 0.1, 0.03, 0.05], 'greyLight'); K.box(P('sigGreen'), [W / 2 - 0.1, y - 0.04, 0.2], [0.03, 0.015, 0.01], 'white');
      return K.done('ac_split', P, { collider: K.boxCol(W, 0.3, 0.2, y), wallMount: true }); } });
  K.def('desk', { name: 'مكتب وكمبيوتر', nameEn: 'Desk with computer', group: 'home', schema: [{ key: 'width', label: 'العرض', min: 1, max: 2, step: 0.1, def: 1.4, unit: 'م' }, { key: 'wood', label: 'الخشب', type: 'enum', options: WOOD, def: 'woodLight' }, { key: 'computer', label: 'كمبيوتر', type: 'enum', options: [['desktop', 'شاشة'], ['laptop', 'لابتوب'], ['none', 'بدون']], def: 'desktop' }], presets: { 'لابتوب': { computer: 'laptop', wood: 'white' } },
    generate: (p, q) => { const P = K.parts(), W = p.width, H = 0.75, D = 0.7, Wd = P('wood');
      K.box(Wd, [0, H - 0.02, 0], [W, 0.04, D], p.wood); K.box(Wd, [W / 2 - 0.25, (H - 0.04) / 2, 0], [0.45, H - 0.04, D - 0.04], p.wood); for (let k = 0; k < 3; k++) K.box(Wd, [W / 2 - 0.25, 0.12 + k * 0.23, D / 2 - 0.01], [0.41, 0.2, 0.02], AA.mixc(K.c(p.wood), [0, 0, 0], 0.1)); leg(Wd, -W / 2 + 0.04, D / 2 - 0.04, H - 0.04, p.wood); leg(Wd, -W / 2 + 0.04, -D / 2 + 0.04, H - 0.04, p.wood);
      if (p.computer === 'desktop') { K.box(P('dark'), [0, H + 0.01, -0.15], [0.22, 0.02, 0.16], 'dark'); K.box(P('dark'), [0, H + 0.13, -0.18], [0.04, 0.22, 0.03], 'dark'); K.box(P('dark'), [0, H + 0.33, -0.16], [0.62, 0.38, 0.03], 'black'); K.box(P('screen'), [0, H + 0.33, -0.143], [0.58, 0.34, 0.004], 'white'); K.box(P('dark'), [0, H + 0.01, 0.12], [0.45, 0.02, 0.15], 'dark'); K.box(P('dark'), [0.32, H + 0.01, 0.12], [0.06, 0.02, 0.1], 'dark'); K.box(P('dark'), [-W / 2 + 0.3, 0.25, -0.1], [0.2, 0.45, 0.45], 'black'); }
      else if (p.computer === 'laptop') { K.box(P('metal'), [0, H + 0.01, 0.05], [0.34, 0.02, 0.24], 'greyLight'); K.box(P('metal'), [0, H + 0.13, -0.08], [0.34, 0.23, 0.012], 'greyLight', null, 0); K.box(P('screen'), [0, H + 0.13, -0.073], [0.31, 0.2, 0.004], 'white'); }
      K.chairInto(P, { at: [-0.1, 0, 0.6], rot: Math.PI }, 'black', 'black');
      return K.done('desk', P, { collider: K.boxCol(W, H, D) }); } });

  // ---------- إضاءة وديكور ----------
  K.def('floor_lamp', { name: 'أباجورة', nameEn: 'Lamp', group: 'home', schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['floor', 'أرضية'], ['table', 'طاولة'], ['pendant', 'معلقة']], def: 'floor' }, K.color('shade', 'لون الغطاء', 'cream')], presets: { 'أباجورة طاولة': { kind: 'table' }, 'معلقة': { kind: 'pendant', shade: 'black' } },
    generate: (p, q) => { const P = K.parts(), n = K.sides(q, 10), M = P('metal');
      let y; if (p.kind === 'floor') { K.cyl(M, [0, 0, 0], [0, 0.03, 0], 0.18, 0.18, n, 'dark'); K.rod(M, [0, 0.03, 0], [0, 1.45, 0], 0.015, 'dark'); y = 1.45; } else if (p.kind === 'table') { K.cyl(P('ceramic'), [0, 0, 0], [0, 0.3, 0], 0.08, 0.1, n, 'teal'); K.rod(M, [0, 0.3, 0], [0, 0.42, 0], 0.01, 'gold'); y = 0.42; } else { K.rod(M, [0, 2.6, 0], [0, 1.9, 0], 0.008, 'black'); y = 1.75; }
      K.cyl(P('cloth2'), [0, y, 0], [0, y + (p.kind === 'table' ? 0.22 : 0.32), 0], p.kind === 'pendant' ? 0.28 : 0.22, p.kind === 'pendant' ? 0.05 : 0.14, n, p.shade, null, { noCaps: true }); K.ball(P('lamp'), [0, y + 0.1, 0], 0.06, 'white');
      return K.done('floor_lamp', P, { collider: K.boxCol(0.45, y + 0.3, 0.45), light: { at: [0, y + 0.1, 0], color: [1, 0.85, 0.6], intensity: 1.1, distance: 4.5 } }); } });
  K.def('plant_pot', { name: 'نبتة', nameEn: 'Potted plant', group: 'home', schema: [{ key: 'kind', label: 'النوع', type: 'enum', options: [['leafy', 'ورقية'], ['tall', 'طويلة'], ['cactus', 'صبار'], ['flowers', 'ورد']], def: 'leafy' }, K.color('pot', 'لون الحوض', 'white', [['#c26a3e', 'فخار']])], presets: { 'صبار': { kind: 'cactus', pot: '#c26a3e' }, 'طويلة': { kind: 'tall', pot: 'black' }, 'ورد': { kind: 'flowers' } },
    generate: (p, q) => { const P = K.parts(), rng = AA.rng(p.seed), n = K.sides(q, 10), L = P('leaves');
      const ph = p.kind === 'tall' ? 0.5 : 0.32; K.cyl(P('ceramic'), [0, 0, 0], [0, ph, 0], 0.15, 0.2, n, p.pot); K.cyl(P('ground'), [0, ph - 0.03, 0], [0, ph - 0.01, 0], 0.19, 0.19, n, 'soilDark');
      if (p.kind === 'cactus') { K.cyl(L, [0, ph, 0], [0, ph + 0.55, 0], 0.08, 0.06, 7, 'grassDark'); K.cyl(L, [0.06, ph + 0.25, 0], [0.16, ph + 0.28, 0], 0.04, 0.04, 6, 'grassDark'); K.cyl(L, [0.16, ph + 0.28, 0], [0.16, ph + 0.45, 0], 0.04, 0.035, 6, 'grassDark'); }
      else if (p.kind === 'tall') { K.rod(P('wood'), [0, ph, 0], [0, ph + 1.1, 0], 0.025, 'trunk'); for (let k = 0; k < 9; k++) { const a = k * 2.4, y = ph + 0.5 + k * 0.08, tip = [Math.cos(a) * 0.45, y + 0.15, Math.sin(a) * 0.45], b = [0, y, 0], sd = [-Math.sin(a) * 0.1, 0, Math.cos(a) * 0.1]; K.tri(L, b, V.add(V.scale(V.add(b, tip), 0.5), sd), tip, 'leaf', null); K.tri(L, b, tip, V.sub(V.scale(V.add(b, tip), 0.5), sd), 'leaf3', null); } }
      else { const cols = p.kind === 'flowers' ? ['leaf3', 'leaf'] : ['leaf3', 'leaf', 'leaf2']; AA.lp.clump(L, [0, ph + 0.18, 0], [0.24, 0.2, 0.24], cols.map(K.c), rng, { jitter: 0.3, detail: 0 }); if (p.kind === 'flowers') for (let k = 0; k < 7; k++) { const a = rng() * 6.28, r = 0.1 + rng() * 0.1; K.ball(P('flower'), [Math.cos(a) * r, ph + 0.32 + rng() * 0.06, Math.sin(a) * r], 0.05, ['red', 'pink', 'yellow'][k % 3]); } }
      return K.done('plant_pot', P, { collider: K.boxCol(0.4, ph + 0.5, 0.4) }); } });
  K.def('rug', { name: 'زولية', nameEn: 'Rug', group: 'home', schema: [{ key: 'width', label: 'العرض', min: 1, max: 4, step: 0.2, def: 2.4, unit: 'م' }, { key: 'depth', label: 'الطول', min: 1, max: 4, step: 0.2, def: 1.6, unit: 'م' }, { key: 'pattern', label: 'النقشة', type: 'enum', options: [['border', 'إطار'], ['stripes', 'خطوط'], ['round', 'دائرية'], ['plain', 'سادة']], def: 'border' }, K.color('color', 'اللون', 'red', [['#8a2c2c', 'عنابي']])], presets: { 'دائرية': { pattern: 'round', color: 'teal' }, 'خطوط': { pattern: 'stripes', color: 'navy' } },
    generate: (p, q) => { const P = K.parts(), B = P('cloth'), W = p.width, D = p.depth, c = p.color, lt = AA.mixc(K.c(c), [1, 1, 1], 0.5);
      if (p.pattern === 'round') { const n = K.sides(q, 16); K.slab(B, K.circle(W / 2, n), 0, 0.012, c); K.slab(B, K.circle(W / 2 * 0.75, n), 0.012, 0.016, lt); K.slab(B, K.circle(W / 2 * 0.45, n), 0.016, 0.02, c); }
      else { K.box(B, [0, 0.006, 0], [W, 0.012, D], c);
        if (p.pattern === 'border') { K.box(B, [0, 0.014, 0], [W - 0.2, 0.004, D - 0.2], lt); K.box(B, [0, 0.018, 0], [W - 0.4, 0.004, D - 0.4], c); K.slab(B, [[0, -D * 0.25], [W * 0.2, 0], [0, D * 0.25], [-W * 0.2, 0]], 0.02, 0.024, lt); }
        else if (p.pattern === 'stripes') { const n = Math.round(W / 0.25); for (let k = 0; k < n; k += 2) K.box(B, [-W / 2 + (k + 0.5) * W / n, 0.014, 0], [W / n, 0.004, D], lt); } }
      return K.done('rug', P, { collider: K.boxCol(W, 0.02, D) }); } });

  // ---------- حمام ----------
  K.def('bathroom', { name: 'أدوات الحمام', nameEn: 'Bathroom set', group: 'home', schema: [{ key: 'item', label: 'القطعة', type: 'enum', options: [['toilet', 'كرسي حمام'], ['sink', 'مغسلة'], ['shower', 'دش'], ['bathtub', 'بانيو']], def: 'toilet' }], presets: { 'مغسلة': { item: 'sink' }, 'دش': { item: 'shower' }, 'بانيو': { item: 'bathtub' } },
    generate: (p, q) => { const P = K.parts(), C = P('ceramic'), n = K.sides(q, 12), it = p.item;
      if (it === 'toilet') { K.cyl(C, [0, 0, 0.05], [0, 0.38, 0.1], 0.14, 0.2, n, 'white'); K.cyl(C, [0, 0.38, 0.12], [0, 0.42, 0.12], 0.21, 0.21, n, 'white'); K.box(C, [0, 0.62, -0.18], [0.42, 0.4, 0.18], 'white'); K.box(C, [0, 0.83, -0.18], [0.44, 0.03, 0.2], 'white'); K.box(P('metal'), [0.15, 0.86, -0.18], [0.06, 0.02, 0.06], 'chrome'); }
      else if (it === 'sink') { K.cyl(C, [0, 0, 0], [0, 0.75, 0], 0.08, 0.1, n, 'white'); K.extrude(C, [[-0.28, 0], [0.28, 0], [0.3, 0.12], [-0.3, 0.12]], 'z', -0.22, 0.22, 'white', { at: [0, 0.75, 0] }); K.box(P('dark'), [0, 0.875, 0.02], [0.4, 0.005, 0.3], 'greyLight'); K.rod(P('chrome'), [0, 0.87, -0.18], [0, 1.0, -0.18], 0.015, 'chrome'); K.rod(P('chrome'), [0, 1.0, -0.18], [0, 1.0, -0.08], 0.013, 'chrome'); K.box(P('mirror'), [0, 1.5, -0.24], [0.6, 0.7, 0.02], 'chrome'); }
      else if (it === 'shower') { K.box(C, [0, 0.05, 0], [0.9, 0.1, 0.9], 'white'); K.box(P('glass'), [0, 1.05, 0.45], [0.9, 1.9, 0.02], 'glass'); K.box(P('glass'), [0.45, 1.05, 0], [0.02, 1.9, 0.9], 'glass'); K.rod(P('chrome'), [-0.4, 0.1, -0.4], [-0.4, 1.95, -0.4], 0.015, 'chrome'); K.rod(P('chrome'), [-0.4, 1.95, -0.4], [-0.2, 1.95, -0.2], 0.015, 'chrome'); K.cyl(P('chrome'), [-0.2, 1.95, -0.2], [-0.2, 1.92, -0.2], 0.1, 0.1, 8, 'chrome'); }
      else { K.extrude(C, [[-0.85, 0], [0.85, 0], [0.85, 0.55], [-0.85, 0.55]], 'z', -0.38, 0.38, 'white'); K.box(P('water'), [0, 0.5, 0], [1.55, 0.04, 0.6], 'water2'); K.rod(P('chrome'), [-0.75, 0.55, 0], [-0.75, 0.7, 0], 0.02, 'chrome'); }
      return K.done('bathroom', P, { collider: K.boxCol(it === 'bathtub' ? 1.7 : 0.9, it === 'shower' ? 2 : 0.9, it === 'bathtub' ? 0.76 : 0.9) }); } });

  // ---------- باب وشباك مستقلين ----------
  K.def('door', { name: 'باب', nameEn: 'Door', group: 'home', schema: [{ key: 'width', label: 'العرض', min: 0.8, max: 2, step: 0.1, def: 0.9, unit: 'م' }, { key: 'style', label: 'النوع', type: 'enum', options: [['panel', 'حشوات'], ['flat', 'سادة'], ['glass', 'زجاج'], ['double', 'دفتين']], def: 'panel' }, K.color('color', 'اللون', 'wood', [['wood', 'خشب'], ['woodDark', 'خشب غامق']]), { key: 'open', label: 'فتحة الباب', min: 0, max: 1, step: 0.05, def: 0, pct: true }],
    presets: { 'باب دفتين': { style: 'double', width: 1.6, color: 'woodDark' }, 'باب زجاج': { style: 'glass', color: 'dark' }, 'نصف مفتوح': { open: 0.5 } },
    generate: (p, q) => { const P = K.parts(), W = p.width, H = 2.15, Fr = P('plastic');
      for (const s of [1, -1]) K.box(Fr, [s * (W / 2 + 0.04), H / 2, 0], [0.08, H, 0.14], 'white'); K.box(Fr, [0, H + 0.04, 0], [W + 0.16, 0.08, 0.14], 'white');
      const leaves = p.style === 'double' ? [[-W / 2, W / 2, 1], [W / 2, W / 2, -1]] : [[-W / 2, W, 1]];
      leaves.forEach(([hx, lw, s], k) => { const hinge = { id: 'leaf' + k, pivot: [hx, 0, 0], axis: 'y', sign: s, max: 1.6 };
        const B = P.custom('leaf' + k, AA.lp.mat(p.style === 'glass' ? 'glass' : 'wood', p.style === 'glass' ? { roughness: 0.1, opacity: 0.7, doubleSided: true, hinge } : { hinge })), x0 = s > 0 ? hx : hx - lw, x1 = s > 0 ? hx + lw : hx;
        if (p.style === 'glass') { K.box(B, [(x0 + x1) / 2, H / 2, 0], [lw - 0.02, H - 0.01, 0.03], 'glass'); }
        else K.doorLeafInto(B, x0, x1, H, 0.05, p.color, null, p.style === 'flat' ? 'flat' : 'panel'); });
      return K.done('door', P, { collider: K.boxCol(W + 0.16, H, 0.14), pose: { doors: p.open } }); } });
  K.def('window', { name: 'شباك', nameEn: 'Window', group: 'home', schema: [{ key: 'width', label: 'العرض', min: 0.5, max: 2.5, step: 0.1, def: 1.2, unit: 'م' }, { key: 'height', label: 'الارتفاع', min: 0.5, max: 2, step: 0.1, def: 1.2, unit: 'م' }, K.color('frame', 'لون الإطار', 'white', [['wood', 'خشب']]), { key: 'bars', label: 'حماية', type: 'bool', def: false }, { key: 'curtain', label: 'ستارة', type: 'bool', def: false }], presets: { 'بحماية': { bars: true, frame: 'dark' }, 'بستارة': { curtain: true } },
    generate: (p, q) => { const P = K.parts(), W = p.width, H = p.height; K.windowInto(P, -W / 2, W / 2, 0, H, 0.14, p.frame, { at: [0, 0.03, 0] }, p.bars);
      if (p.curtain) { K.rod(P('metal'), [-W / 2 - 0.25, H + 0.15, 0.15], [W / 2 + 0.25, H + 0.15, 0.15], 0.015, 'dark'); for (const s of [1, -1]) { const n = 6; for (let k = 0; k < n; k++) K.box(P('cloth2'), [s * (W / 2 + 0.05 - k * 0.07), H / 2 + 0.05, 0.18 + (k % 2) * 0.02], [0.08, H + 0.15, 0.02], k % 2 ? 'cream' : '#e7dcc4'); } }
      return K.done('window', P, { collider: K.boxCol(W + 0.12, H + 0.12, 0.14) }); } });
})(typeof window !== 'undefined' ? window : globalThis);

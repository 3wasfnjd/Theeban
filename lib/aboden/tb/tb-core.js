// Aboden Assets — theeban/tb-core.js — أصول لعبة «ذيبان» (تسلل تكتيكي في صحراء الخليج، 2041) بنمط Premium Stylized 3D
// لو-بولي عالي الجودة: حواف مشطوفة تلتقط الضوء، تفاصيل متوسطة، خامات واقعية مبسطة (تدرّج إطباق محيطي مخبوز في الألوان،
// وتفاوت لوني خفيف، وصدأ وغبار رمل عند القواعد)، وألوان الرمل والبني والزيتي والرمادي مع إضاءة تقنية فيروزية.
// كل أصل اسمه tb_X. المحاور: الأمام +Z، Y للأعلى، المتر. يعتمد على أدوات حزمة الأساسيات (AA.kit).
// الشخصيات خارج هذه الحزمة (نماذج اللعبة نفسها).
(function (g) {
  'use strict';
  const AA = g.AA, K = AA.kit, V = AA.v, LP = AA.lp;
  const TB = AA.tb = {};
  // لوحة ألوان ذيبان (تضاف للوحة الحزمة باسم tb*)
  TB.PAL = {
    tbSand: '#c9a878', tbSand2: '#b8935f', tbSandDark: '#8f6f47', tbDune: '#d4b183', tbRock: '#8a7563', tbRock2: '#6f5c4d', tbRockLight: '#a68f78',
    tbConcrete: '#9c968b', tbConcrete2: '#857f75', tbConcreteDark: '#615c55', tbConcreteLight: '#b5afa3',
    tbSteel: '#6c7378', tbSteel2: '#545a5f', tbSteelDark: '#33383c', tbGunmetal: '#2a2e32', tbRust: '#8a4f2c', tbRust2: '#6d3d22',
    tbOlive: '#5c6440', tbOlive2: '#474e31', tbBrown: '#6b4f36', tbBrown2: '#54402c', tbWood: '#8a6a48', tbWoodDark: '#5d4630',
    tbCanvas: '#9a8f72', tbPaint: '#c8c2b4', tbWhite: '#e4e0d6', tbBlack: '#1b1d20', tbRubber: '#202124',
    tbTeal: '#2fd6c9', tbTealDark: '#14857e', tbWater: '#2aa3b5', tbYellow: '#e2b42f', tbHazard: '#d9a321', tbRed: '#d0392f', tbGreen: '#3bbf6a', tbOrange: '#d9772b',
    tbRawafid: '#1f6f8b' // لون شعار مشروع روافد
  };
  Object.assign(K.PAL, TB.PAL);
  TB.GROUPS = { tb_land: 'الصحراء والغطاء', tb_security: 'الأمن والمراقبة', tb_facility: 'المنشآت والمحطات', tb_tunnel: 'الأنفاق', tb_rooms: 'الغرف والأجهزة', tb_props: 'الأغراض والغطاء', tb_items: 'أغراض المهمات والأدوات' };
  Object.assign(K.GROUPS, TB.GROUPS);
  // ألوان الحالات: هادئ / مشتبه / إنذار
  TB.STATE = { calm: 'tbGreen', suspect: 'tbYellow', alarm: 'tbRed' };
  TB.stateOpt = def => ({ key: 'state', label: 'الحالة', type: 'enum', options: [['calm', 'هادئ (أخضر)'], ['suspect', 'مشتبه (أصفر)'], ['alarm', 'إنذار (أحمر)'], ['off', 'مطفأ']], def: def || 'calm' });
  TB.def = (id, o) => { AA.assets['tb_' + id] = Object.assign({ id: 'tb_' + id, category: 'theeban', group: o.group, schema: [], presets: {} }, o, { id: 'tb_' + id }); };
  const sh = (c, k) => AA.mixc(K.c(c), [0, 0, 0], k), ti = (c, k) => AA.mixc(K.c(c), [1, 1, 1], k);
  TB.shade = sh; TB.tint = ti;
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // ---------- أشكال مشطوفة (الحافة تلتقط الضوء) ----------
  // صندوق مشطوف: c المركز، s المقاس، bv الشطف، o تحويل {at, rot}، rz دوران حول Z
  TB.box = function (B, c, s, col, bv, o, rz) {
    const hx = s[0] / 2, hy = s[1] / 2, hz = s[2] / 2, b = Math.min(bv == null ? 0.03 : bv, hx * 0.45, hy * 0.45, hz * 0.45);
    if (b <= 0.002) return K.box(B, c, s, col, o, rz);
    const base = K.c(col), cz = Math.cos(rz || 0), sz = Math.sin(rz || 0);
    const W = p => { const q = [p[0] * cz - p[1] * sz, p[0] * sz + p[1] * cz, p[2]]; return K.X([c[0] + q[0], c[1] + q[1], c[2] + q[2]], o); };
    const ctr = W([0, 0, 0]);
    // نقاط كل زاوية: واحدة على كل وجه
    const Pt = (sx, sy, sz2, ax) => W(ax === 0 ? [sx * hx, sy * (hy - b), sz2 * (hz - b)] : ax === 1 ? [sx * (hx - b), sy * hy, sz2 * (hz - b)] : [sx * (hx - b), sy * (hy - b), sz2 * hz]);
    const face = (pts, cc) => { const ids = pts.map(p => B.v(p, cc, 0, 0, 0)); const n = V.cross(V.sub(pts[1], pts[0]), V.sub(pts[2], pts[0])), m = pts.reduce((a, p) => V.add(a, p), [0, 0, 0]).map(x => x / pts.length), out = V.dot(n, V.sub(m, ctr)) >= 0; for (let k = 1; k < ids.length - 1; k++) out ? B.t(ids[0], ids[k], ids[k + 1]) : B.t(ids[0], ids[k + 1], ids[k]); };
    const S = [1, -1];
    // الأوجه الستة
    for (const sx of S) face([Pt(sx, 1, 1, 0), Pt(sx, -1, 1, 0), Pt(sx, -1, -1, 0), Pt(sx, 1, -1, 0)], base);
    for (const sy of S) face([Pt(1, sy, 1, 1), Pt(-1, sy, 1, 1), Pt(-1, sy, -1, 1), Pt(1, sy, -1, 1)], sy > 0 ? AA.mixc(base, [1, 1, 1], 0.04) : sh(base, 0.12));
    for (const sz2 of S) face([Pt(1, 1, sz2, 2), Pt(-1, 1, sz2, 2), Pt(-1, -1, sz2, 2), Pt(1, -1, sz2, 2)], base);
    // الحواف الاثنتا عشرة (أفتح قليلاً)
    const ec = AA.mixc(base, [1, 1, 1], 0.1);
    for (const sx of S) for (const sy of S) face([Pt(sx, sy, 1, 0), Pt(sx, sy, 1, 1), Pt(sx, sy, -1, 1), Pt(sx, sy, -1, 0)], ec);
    for (const sx of S) for (const sz2 of S) face([Pt(sx, 1, sz2, 0), Pt(sx, 1, sz2, 2), Pt(sx, -1, sz2, 2), Pt(sx, -1, sz2, 0)], ec);
    for (const sy of S) for (const sz2 of S) face([Pt(1, sy, sz2, 1), Pt(1, sy, sz2, 2), Pt(-1, sy, sz2, 2), Pt(-1, sy, sz2, 1)], ec);
    // الزوايا الثماني
    for (const sx of S) for (const sy of S) for (const sz2 of S) face([Pt(sx, sy, sz2, 0), Pt(sx, sy, sz2, 1), Pt(sx, sy, sz2, 2)], ec);
  };
  // أسطوانة مشطوفة الطرفين بين a و b
  TB.cyl = function (B, a, b, r, col, n, bv, o, caps) {
    const d = V.sub(b, a), L = V.len(d), bb = Math.min(bv == null ? Math.min(0.03, r * 0.25) : bv, L * 0.3, r * 0.4);
    if (bb <= 0.002) return K.cyl(B, a, b, r, r, n, col, o);
    const u = V.scale(d, 1 / L), A1 = V.madd(a, u, bb), B1 = V.madd(b, u, -bb), ec = AA.mixc(K.c(col), [1, 1, 1], 0.1);
    K.cyl(B, a, A1, r - bb, r, n, ec, o); K.cyl(B, A1, B1, r, r, n, col, o, { noCaps: true }); K.cyl(B, B1, b, r, r - bb, n, ec, o);
  };
  // ألواح بخطوط فواصل (صاج، خرسانة مسبقة الصب): يرسم خطوطاً داكنة رقيقة فوق وجه
  TB.seams = function (B, c, w, h, axis, n, col, o, depth) {
    for (let i = 1; i < n; i++) { const t = -w / 2 + w * i / n; K.box(B, axis === 'x' ? [c[0] + t, c[1], c[2]] : [c[0], c[1], c[2] + t], axis === 'x' ? [0.02, h, depth || 0.012] : [depth || 0.012, h, 0.02], col, o); }
  };
  // سلك شائك ملفوف على طول x
  TB.wire = function (B, x0, x1, y, z, r, o) {
    const n = Math.max(4, Math.round((x1 - x0) / 0.25)); let prev = null;
    for (let i = 0; i <= n * 4; i++) { const t = i / (n * 4), a = t * n * Math.PI * 2, p = [x0 + (x1 - x0) * t, y + Math.sin(a) * r, z + Math.cos(a) * r]; if (prev) K.cyl(B, prev, p, 0.008, 0.008, 3, 'tbSteel', o); prev = p; }
  };
  // لوحة نص (A-Z, 0-9) على خلفية مشطوفة
  TB.sign = (P, txt, at, cell, bg, fg, o) => { const w = (txt.length * 4 + 1) * cell; TB.box(P('paint'), at, [w, 7 * cell, 0.04], bg, 0.008, o); K.text(P('stone'), txt, at[0], at[1], at[2] + 0.021, cell, fg, o); };
  // شعار روافد: قطرة داخل دائرة
  TB.logo = function (B, at, r, col, o) {
    const n = 14, ring = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; ring.push([Math.cos(a) * r, Math.sin(a) * r]); }
    K.extrude(B, ring, 'z', at[2], at[2] + 0.015, col, { at: [at[0], at[1], 0], rot: 0 });
    const drop = [[0, r * 0.62], [r * 0.32, r * 0.05], [r * 0.25, -r * 0.3], [0, -r * 0.45], [-r * 0.25, -r * 0.3], [-r * 0.32, r * 0.05]];
    K.extrude(B, drop, 'z', at[2] + 0.015, at[2] + 0.025, 'tbWhite', { at: [at[0], at[1], 0], rot: 0 });
    void o;
  };
  // سلّم فولاذي قابل للتسلق (يرجع نقاط البداية والنهاية للعبة)
  TB.ladder = function (B, x, z, y0, y1, w, col, o, cage) {
    for (const s of [1, -1]) TB.box(B, [x + s * w / 2, (y0 + y1) / 2, z], [0.05, y1 - y0, 0.05], col, 0.01, o);
    for (let y = y0 + 0.3; y < y1 - 0.05; y += 0.3) K.cyl(B, [x - w / 2, y, z], [x + w / 2, y, z], 0.016, 0.016, 6, col, o);
    if (cage) for (let y = y0 + 2.2; y < y1; y += 0.7) { const pts = []; for (let k = 0; k <= 6; k++) { const a = Math.PI * k / 6; pts.push([x + Math.cos(a) * (w / 2 + 0.12), y, z + Math.sin(a) * 0.55]); } for (let k = 0; k < 6; k++) K.cyl(B, pts[k], pts[k + 1], 0.012, 0.012, 4, col, o); }
    return { bottom: K.X([x, y0, z + 0.35], o), top: K.X([x, y1, z], o) };
  };
  // ضوء حالة (أخضر/أصفر/أحمر) — جزء مضيء
  TB.stateLamp = function (P, at, r, state, o) {
    if (state === 'off') { K.ball(P('dark'), at, r, 'tbBlack', o, 0); return; }
    const nm = state === 'alarm' ? 'sigRed' : state === 'suspect' ? 'sigAmber' : 'sigGreen';
    K.ball(P(nm), at, r, 'white', o, 0);
  };
  // مادة الضوء التقني الفيروزي
  TB.teal = P => P.custom('tealGlow', LP.mat('lamp', { emissive: [0.18, 0.84, 0.79], glow: 1.4 }));
  TB.water = P => P.custom('tbWater', LP.mat('water', { roughness: 0.15, opacity: 0.72, emissive: [0.05, 0.32, 0.36], glow: 0.5, doubleSided: true }));

  // ---------- الإنهاء: إطباق محيطي مخبوز + تفاوت لوني + غبار رمل عند القاعدة ----------
  const hash = (x, y, z) => { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); };
  TB.hash3 = d => hash(Math.round(d[0] * 100), Math.round(d[1] * 100), Math.round(d[2] * 100)); // ثابت لنفس النقطة (لا يفتح شقوقاً بين الأوجه)
  TB.done = function (id, P, meta, opts) {
    opts = opts || {};
    const out = K.done('tb_' + id, P, meta); out.id = 'tb_' + id; out.style = 'premium-stylized';
    const ao = opts.ao == null ? 0.3 : opts.ao, dust = opts.dust == null ? 0.25 : opts.dust, sand = K.c('tbSand');
    for (const p of Object.values(out.parts)) {
      const m = p.material || {}; if (m.emissive || m.kind === 'glass' || m.kind === 'water' || m.opacity != null) continue;
      const Ps = p.positions, C = p.colors, N = p.normals;
      for (let i = 0; i < Ps.length; i += 3) {
        const x = Ps[i], y = Ps[i + 1], z = Ps[i + 2];
        let f = 1 - ao * (1 - smooth(0, 0.9, y)); // أغمق قرب الأرض
        if (N && N[i + 1] < -0.5) f *= 0.82; // الأوجه السفلية أغمق
        f *= 0.96 + 0.08 * hash(Math.round(x * 4), Math.round(y * 4), Math.round(z * 4)); // تفاوت خفيف
        const dd = dust * (1 - smooth(0.02, 0.35, y)) * (N && N[i + 1] > 0.5 ? 1.4 : 1); // غبار رمل
        for (let j = 0; j < 3; j++) C[i + j] = (C[i + j] * f) * (1 - dd) + sand[j] * dd;
      }
    }
    return out;
  };
})(typeof window !== 'undefined' ? window : globalThis);

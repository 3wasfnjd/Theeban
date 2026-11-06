// Aboden Assets — theeban/tb-items.js — أغراض المهمات وأدوات ذيبان الأربع:
// جهاز تسجيل الوالد، بطاقة الصيانة «عبدالله»، وحدة تخزين السجلات، النبّاه، الزاحف، كاشف الأثر، العازل، كبسولة الغاز المنوّم
// كل غرض صغير بمقاس حقيقي، وله meta.grip (نقطة المسك) و meta.pickup، ويمكن تكبيره للعرض بمعامل size
(function (g) {
  'use strict';
  const AA = g.AA, K = AA.kit, V = AA.v, TB = AA.tb, LP = AA.lp;
  const sh = TB.shade;
  const glow = (P, name, col, k) => P.custom(name, LP.mat('lamp', { emissive: col, glow: k || 1.4 }));

  // جهاز تسجيل صغير قديم (s = مقياس العرض)
  TB.recorderInto = function (P, at, s) {
    s = s || 1; const S = v => V.add(at, v.map(x => x * s)), B = P('plastic');
    TB.box(B, S([0, 0.02, 0]), [0.14 * s, 0.04 * s, 0.085 * s], 'tbGunmetal', 0.008 * s);
    TB.box(B, S([0, 0.042, 0]), [0.13 * s, 0.006 * s, 0.075 * s], '#3a3f45', 0.002 * s);
    for (let k = 0; k < 5; k++) K.box(P('dark'), S([-0.035 + k * 0.012, 0.046, -0.015]), [0.006 * s, 0.002 * s, 0.03 * s], 'tbBlack');
    K.cyl(P('metal'), S([0.035, 0.045, 0.012]), S([0.035, 0.05, 0.012]), 0.018 * s, 0.018 * s, 10, 'tbSteel');
    for (let k = 0; k < 3; k++) TB.box(P('plastic'), S([-0.04 + k * 0.025, 0.021, 0.045]), [0.018 * s, 0.012 * s, 0.008 * s], k === 0 ? 'tbRed' : 'tbSteel2', 0.002 * s);
    K.box(glow(P, 'recLed', [1, 0.15, 0.1], 1.6), S([0.055, 0.046, -0.03]), [0.008 * s, 0.003 * s, 0.008 * s], 'white');
    K.box(P('paint'), S([-0.02, 0.022, -0.0435]), [0.06 * s, 0.018 * s, 0.002 * s], 'tbWhite');
  };
  // وحدة تخزين (درج صلب بمقبض وضوء فيروزي)
  TB.dataUnitInto = function (P, at, s) {
    s = s || 1; const S = v => V.add(at, v.map(x => x * s));
    TB.box(P('metal'), S([0, 0, 0.05]), [0.32 * s, 0.1 * s, 0.1 * s], 'tbSteel', 0.01 * s);
    TB.box(P('metal'), S([0, 0, 0.105]), [0.3 * s, 0.085 * s, 0.012 * s], 'tbGunmetal', 0.004 * s);
    K.box(glow(P, 'duGlow', [0.18, 0.9, 0.85], 1.8), S([-0.06, 0, 0.112]), [0.14 * s, 0.012 * s, 0.003 * s], 'white');
    K.cyl(P('metal'), S([0.1, -0.025, 0.11]), S([0.1, 0.025, 0.11]), 0.008 * s, 0.008 * s, 6, 'tbSteel2');
    TB.logo(P('stone'), [at[0] - 0.12 * s, at[1], at[2] + 0.112 * s], 0.025 * s, 'tbRawafid');
  };

  const scaleSchema = def => ({ key: 'size', label: 'تكبير للعرض', min: 1, max: 6, step: 0.5, def: def || 1 });

  // ---------- جهاز تسجيل الوالد ----------
  TB.def('recorder', { name: 'جهاز تسجيل الوالد', nameEn: "Father's recorder", group: 'tb_items', schema: [scaleSchema(1)], presets: { 'حقيقي': {}, 'مكبّر للعرض': { size: 4 } },
    generate: (p, q) => { const P = K.parts(); TB.recorderInto(P, [0, 0, 0], p.size); return TB.done('recorder', P, { pickup: true, grip: [0, 0.02 * p.size, 0], story: 'mission1' }, { ao: 0, dust: 0 }); } });

  // ---------- بطاقة الصيانة ----------
  TB.def('maint_card', { name: 'بطاقة صيانة', nameEn: 'Maintenance card', group: 'tb_items', schema: [scaleSchema(1), { key: 'worn', label: 'قديمة', type: 'bool', def: true }], presets: { 'حقيقية': {}, 'مكبّرة': { size: 5 } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, S = v => v.map(x => x * s), c = p.worn ? '#d8d2c2' : 'tbWhite';
      TB.box(P('plastic'), S([0, 0.0012, 0]), S([0.0856, 0.0024, 0.054]), c, 0.0008 * s);
      K.box(P('paint'), S([0, 0.0025, -0.019]), S([0.0856, 0.0004, 0.016]), 'tbRawafid');
      K.box(P('paint'), S([-0.03, 0.0026, 0.008]), S([0.02, 0.0004, 0.025]), '#a68f78'); // صورة
      for (let k = 0; k < 3; k++) K.box(P('dark'), S([0.012, 0.0026, -0.002 + k * 0.008]), S([0.035 - k * 0.008, 0.0003, 0.003]), 'tbGunmetal');
      K.box(P('metal'), S([0.028, 0.0026, 0.016]), S([0.012, 0.0004, 0.01]), 'tbYellow'); // شريحة
      return TB.done('maint_card', P, { pickup: true, grip: [0, 0, 0], story: 'mission2' }, { ao: 0, dust: 0 });
    } });

  // ---------- وحدة تخزين السجلات ----------
  TB.def('data_unit', { name: 'وحدة تخزين', nameEn: 'Data storage unit', group: 'tb_items', schema: [scaleSchema(1)], presets: { 'حقيقية': {}, 'مكبّرة': { size: 3 } },
    generate: (p, q) => { const P = K.parts(); TB.dataUnitInto(P, [0, 0.05 * p.size, -0.05 * p.size], p.size); return TB.done('data_unit', P, { pickup: true, grip: [0, 0.05 * p.size, 0], story: 'mission3' }, { ao: 0, dust: 0 }); } });

  // ---------- النبّاه: جهاز صوت للتشتيت ----------
  TB.def('nabbah', { name: 'النبّاه', nameEn: 'Nabbah (sound lure)', group: 'tb_items', schema: [scaleSchema(1), { key: 'active', label: 'يعمل', type: 'bool', def: true }], presets: { 'يعمل': {}, 'مكبّر': { size: 5 } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, S = v => v.map(x => x * s), n = K.sides(q, 14);
      TB.cyl(P('plastic'), S([0, 0, 0]), S([0, 0.05, 0]), 0.045 * s, 'tbGunmetal', n, 0.008 * s);
      K.cyl(P('metal'), S([0, 0.05, 0]), S([0, 0.058, 0]), 0.04 * s, 0.04 * s, n, 'tbSteel2');
      for (let k = 0; k < 3; k++) K.cyl(P('dark'), S([0, 0.058 + k * 0.0001, 0]), S([0, 0.0585 + k * 0.0001, 0]), (0.035 - k * 0.01) * s, (0.035 - k * 0.01) * s, n, k % 2 ? 'tbSteel' : 'tbBlack');
      const G = p.active ? glow(P, 'nbGlow', [0.95, 0.65, 0.15], 1.8) : P('dark');
      K.cyl(G, S([0, 0.022, 0]), S([0, 0.028, 0]), 0.0465 * s, 0.0465 * s, n, p.active ? 'white' : 'tbBlack', null, { noCaps: true });
      K.cyl(P('metal'), S([0.03, 0.05, 0]), S([0.03, 0.09, 0]), 0.003 * s, 0.002 * s, 4, 'tbSteel');
      for (let k = 0; k < 3; k++) TB.box(P('rubber'), S([Math.cos(k * 2.09) * 0.04, 0.003, Math.sin(k * 2.09) * 0.04]), S([0.014, 0.006, 0.014]), 'tbRubber', 0.002 * s);
      return TB.done('nabbah', P, { pickup: true, gadget: 'sound', throwable: true, grip: [0, 0.025 * s, 0], radius: 8 }, { ao: 0, dust: 0 });
    } });

  // ---------- الزاحف: قطعة ميكانيكية تمشي وتصدر خطوات ----------
  TB.def('zahif', { name: 'الزاحف', nameEn: 'Zahif (crawler decoy)', group: 'tb_items', schema: [scaleSchema(1), { key: 'active', label: 'يعمل', type: 'bool', def: true }], presets: { 'يعمل': {}, 'مكبّر': { size: 5 } },
    clips: [['walk', 'يمشي']],
    generate: (p, q) => {
      const P = K.parts(), s = p.size, S = v => v.map(x => x * s);
      TB.box(P('metal'), S([0, 0.035, 0]), S([0.07, 0.03, 0.1]), 'tbOlive2', 0.008 * s); TB.box(P('metal'), S([0, 0.055, -0.01]), S([0.05, 0.015, 0.06]), 'tbGunmetal', 0.004 * s);
      K.box(p.active ? glow(P, 'zhEye', [0.18, 0.9, 0.85], 1.8) : P('dark'), S([0, 0.04, 0.051]), S([0.04, 0.008, 0.003]), 'white');
      K.cyl(P('metal'), S([-0.02, 0.06, -0.035]), S([-0.02, 0.1, -0.04]), 0.002 * s, 0.0015 * s, 4, 'tbSteel');
      for (const sx of [1, -1]) for (const z of [0.03, 0, -0.03]) { const hip = S([sx * 0.035, 0.035, z]), knee = S([sx * 0.065, 0.045, z + 0.005]), foot = S([sx * 0.075, 0.0, z]); K.cyl(P('metal'), hip, knee, 0.004 * s, 0.004 * s, 4, 'tbSteel2'); K.cyl(P('metal'), knee, foot, 0.0035 * s, 0.002 * s, 4, 'tbSteel2'); }
      return TB.done('zahif', P, { pickup: true, gadget: 'decoy', speed: 0.6, grip: [0, 0.04 * s, 0] }, { ao: 0, dust: 0 });
    } });

  // ---------- كاشف الأثر ----------
  TB.def('kashif', { name: 'كاشف الأثر', nameEn: 'Kashif (trace detector)', group: 'tb_items', schema: [scaleSchema(1), { key: 'active', label: 'يعمل', type: 'bool', def: true }], presets: { 'يعمل': {}, 'مكبّر': { size: 4 } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, S = v => v.map(x => x * s);
      TB.box(P('plastic'), S([0, 0.012, 0]), S([0.075, 0.024, 0.13]), 'tbGunmetal', 0.006 * s); TB.box(P('rubber'), S([0, 0.012, -0.05]), S([0.08, 0.028, 0.035]), 'tbRubber', 0.006 * s);
      TB.box(P('plastic'), S([0, 0.025, 0.02]), S([0.06, 0.004, 0.07]), 'tbBlack', 0.002 * s);
      const scr = p.active ? glow(P, 'ksScr', [0.06, 0.28, 0.25], 0.8) : P('dark'); K.box(scr, S([0, 0.0275, 0.02]), S([0.054, 0.001, 0.062]), 'white');
      if (p.active) { const G = glow(P, 'ksRing', [0.2, 0.95, 0.85], 1.6); for (let r = 0; r < 3; r++) { const n = 14, rr = 0.008 + r * 0.008; for (let k = 0; k < n; k += 2) { const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2; K.box(G, S([Math.cos(a0) * rr * 0.5 + Math.cos(a1) * rr * 0.5, 0.0282, 0.02 + Math.sin(a0) * rr * 0.5 + Math.sin(a1) * rr * 0.5]), S([0.002, 0.0006, rr * 0.45]), 'white', { at: [0, 0, 0], rot: -(a0 + a1) / 2 }); } } K.ball(glow(P, 'ksDot', [1, 0.7, 0.2], 1.8), S([0.012, 0.029, 0.04]), 0.003 * s, 'white'); }
      K.cyl(P('metal'), S([0.025, 0.024, 0.06]), S([0.025, 0.06, 0.075]), 0.003 * s, 0.002 * s, 4, 'tbSteel');
      return TB.done('kashif', P, { pickup: true, gadget: 'tracker', grip: [0, 0.012 * s, -0.04 * s] }, { ao: 0, dust: 0 });
    } });

  // ---------- العازل: يعطل كاميرا أو حساس ----------
  TB.def('azil', { name: 'العازل', nameEn: 'Azil (jammer)', group: 'tb_items', schema: [scaleSchema(1), { key: 'active', label: 'يعمل', type: 'bool', def: true }], presets: { 'يعمل': {}, 'مكبّر': { size: 4 } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, S = v => v.map(x => x * s), n = K.sides(q, 12);
      TB.box(P('metal'), S([0, 0.018, 0]), S([0.06, 0.036, 0.06]), 'tbSteel2', 0.006 * s);
      K.cyl(P('metal'), S([0, 0.036, 0]), S([0, 0.044, 0]), 0.026 * s, 0.022 * s, n, 'tbGunmetal');
      const G = p.active ? glow(P, 'azGlow', [0.55, 0.4, 1], 1.8) : P('dark');
      K.cyl(G, S([0, 0.044, 0]), S([0, 0.05, 0]), 0.018 * s, 0.018 * s, n, p.active ? 'white' : 'tbBlack');
      for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + Math.PI / 4; K.cyl(P('metal'), S([Math.cos(a) * 0.025, 0.03, Math.sin(a) * 0.025]), S([Math.cos(a) * 0.045, 0.075, Math.sin(a) * 0.045]), 0.0025 * s, 0.0015 * s, 4, 'tbSteel'); K.ball(P('metal'), S([Math.cos(a) * 0.045, 0.076, Math.sin(a) * 0.045]), 0.004 * s, 'tbGunmetal'); }
      TB.box(P('paint'), S([0, 0.018, 0.031]), S([0.04, 0.012, 0.002]), 'tbYellow', 0.001 * s);
      return TB.done('azil', P, { pickup: true, gadget: 'jammer', radius: 4, duration: 8, grip: [0, 0.018 * s, 0] }, { ao: 0, dust: 0 });
    } });

  // ---------- كبسولة الغاز المنوّم ----------
  TB.def('sleep_capsule', { name: 'كبسولة غاز منوّم', nameEn: 'Sleeping-gas capsule', group: 'tb_items', schema: [scaleSchema(1), { key: 'burst', label: 'سحابة الغاز', type: 'bool', def: false }], presets: { 'كبسولة': {}, 'مكبّرة': { size: 5 }, 'انفجرت': { burst: true } },
    generate: (p, q) => {
      const P = K.parts(), s = p.size, S = v => v.map(x => x * s), n = K.sides(q, 12);
      if (p.burst) { const C = P.custom('gas', LP.mat('glass', { roughness: 1, opacity: 0.35, emissive: [0.45, 0.85, 0.75], glow: 0.25, doubleSided: true, noShadow: true })), rng = AA.rng(p.seed); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, d = 0.4 + rng() * 0.7; K.ball(C, [Math.cos(a) * d, 0.35 + rng() * 0.5, Math.sin(a) * d], [0.55 + rng() * 0.3, 0.4 + rng() * 0.2, 0.55 + rng() * 0.3], '#bfe8de', null, 1); } TB.cyl(P('metal'), [0, 0.02, 0], [0.07, 0.03, 0.03], 0.018, 'tbSteel2', n, 0.004); return TB.done('sleep_capsule', P, { gas: { radius: 1.6, duration: 6 } }, { ao: 0, dust: 0 }); }
      K.cyl(P('metal'), S([0, 0.018, -0.03]), S([0, 0.018, -0.012]), 0.016 * s, 0.018 * s, n, 'tbSteel2');
      K.cyl(P('glassSolid'), S([0, 0.018, -0.012]), S([0, 0.018, 0.02]), 0.018 * s, 0.018 * s, n, '#7fd6c4');
      K.cyl(P('metal'), S([0, 0.018, 0.02]), S([0, 0.018, 0.035]), 0.018 * s, 0.012 * s, n, 'tbSteel2');
      K.cyl(glow(P, 'capBand', [0.3, 0.95, 0.75], 1.4), S([0, 0.018, -0.008]), S([0, 0.018, -0.004]), 0.0185 * s, 0.0185 * s, n, 'white');
      K.cyl(P('metal'), S([0, 0.018, 0.035]), S([0, 0.018, 0.04]), 0.005 * s, 0.005 * s, 6, 'tbRed');
      return TB.done('sleep_capsule', P, { pickup: true, throwable: true, gas: { radius: 1.6, duration: 6 }, grip: [0, 0.018 * s, 0] }, { ao: 0, dust: 0 });
    } });
})(typeof window !== 'undefined' ? window : globalThis);

// Aboden Assets — lowpoly/lp-majlis.js — المجلس بأسلوب لو-بولي: دلة، طقم قهوة، مبخرة، زولية، جلسة أرضية، وجار، فانوس، زير، فخار، حطب
// بنفس المعاملات ونقاط الربط (أماكن الجلوس، الضوء، المنقار) في الحزمة الواقعية.
(function (g) {
  'use strict';
  const AA = g.AA, LP = AA.lp, V = AA.v, vary = AA.vary, lerp = AA.lerp, mixc = AA.mixc, smooth = AA.smooth;
  const FIN = { brass: '#d1a24a', copper: '#c0703f', silver: '#cfd1d0' };
  const SADU = ['#8a2a24', '#1f1b1a', '#efe4cf', '#c8a24a', '#2f5f8a'];
  function kit() { const k = {}; for (const n of ['metal', 'metal2', 'porcelain', 'wood', 'woodDark', 'sadu', 'rug', 'cloth', 'clay', 'flame', 'ember', 'glass', 'smoke', 'stone', 'dark', 'rope', 'goods', 'ash']) k[n] = new AA.Builder(); return k; }
  function done(id, P, meta) {
    if (meta.lift) { for (const k in P) { const B = P[k]; for (let i = 1; i < B.pos.length; i += 3) B.pos[i] += meta.lift; } meta.height += meta.lift; delete meta.lift; }
    return LP.finalize(id, {
      metal: { builder: P.metal, material: LP.mat('metal', { metalness: 0.5, roughness: 0.35 }) }, metal2: { builder: P.metal2, material: LP.mat('metal', { metalness: 0.4 }) },
      porcelain: { builder: P.porcelain, material: LP.mat('porcelain', { roughness: 0.3 }) }, wood: { builder: P.wood, material: LP.mat('wood') }, woodDark: { builder: P.woodDark, material: LP.mat('wood') },
      sadu: { builder: P.sadu, material: LP.mat('cloth') }, rug: { builder: P.rug, material: LP.mat('rug') }, cloth: { builder: P.cloth, material: LP.mat('cloth', { doubleSided: true }) },
      clay: { builder: P.clay, material: LP.mat('clay') }, flame: { builder: P.flame, material: LP.mat('flame', { emissive: [1, 0.45, 0.1], glow: 1.5, doubleSided: true }) },
      ember: { builder: P.ember, material: LP.mat('ember', { emissive: [1, 0.35, 0.08], glow: 1 }) }, glass: { builder: P.glass, material: LP.mat('glass', { opacity: 0.35, doubleSided: true }) },
      smoke: { builder: P.smoke, material: LP.mat('smoke', { opacity: 0.35, doubleSided: true }) }, stone: { builder: P.stone, material: LP.mat('stone') }, dark: { builder: P.dark, material: LP.mat('dark') },
      rope: { builder: P.rope, material: LP.mat('rope') }, goods: { builder: P.goods, material: LP.mat('fruit') }, ash: { builder: P.ash, material: LP.mat('ash') }
    }, Object.assign({ stiffness: 0 }, meta));
  }
  const lathe = (B, prof, at, sides, col) => AA.lathe(B, prof, { at, sides, color: typeof col === 'function' ? col : () => col });
  const moveNew = (B, n0, o) => { for (let i = n0; i < B.vertexCount; i++) { const q = AA.xform([B.pos[i * 3], B.pos[i * 3 + 1], B.pos[i * 3 + 2]], o); B.pos[i * 3] = q[0]; B.pos[i * 3 + 1] = q[1]; B.pos[i * 3 + 2] = q[2]; } };

  // ---------- الدلة ----------
  const DALLAH = [[0, 0], [0.001, 0.055], [0.03, 0.058], [0.08, 0.066], [0.12, 0.042], [0.15, 0.033], [0.176, 0.054], [0.2, 0.032], [0.222, 0.034], [0.25, 0.015], [0.262, 0.012], [0.28, 0.0]];
  function dallahInto(B, at, s, rot, finish) {
    const n0 = B.vertexCount, col = LP.c(FIN[finish] || finish || FIN.brass);
    lathe(B, DALLAH, [0, 0, 0], 8, y => Math.abs(y - 0.176) < 0.01 ? mixc(col, [1, 1, 1], 0.25) : col);
    LP.chain(B, [[0, 0.06, 0.055], [0, 0.13, 0.11], [0, 0.22, 0.11], [0, 0.262, 0.185]], [0.02, 0.016, 0.01, 0.006], 5, () => col); // المنقار
    LP.chain(B, [[0, 0.182, -0.048], [0, 0.2, -0.11], [0, 0.12, -0.12], [0, 0.07, -0.07]], [0.009, 0.009, 0.009, 0.009], 4, () => col); // المقبض
    for (let i = n0; i < B.vertexCount; i++) { const p = AA.xform(V.scale([B.pos[i * 3], B.pos[i * 3 + 1], B.pos[i * 3 + 2]], s), { at, rot }); B.pos[i * 3] = p[0]; B.pos[i * 3 + 1] = p[1]; B.pos[i * 3 + 2] = p[2]; }
  }
  function dallah(p, q) { const P = kit(); dallahInto(P.metal, [0, 0, 0], p.size, 0, p.finish); return done('lp_dallah', P, { lift: 0.022, height: 0.34 * p.size, radius: 0.15 * p.size, collider: { type: 'cylinder', radius: 0.07 * p.size, height: 0.34 * p.size }, physics: { mass: 1.2 * p.size, friction: 0.4 }, spout: [0, 0.262 * p.size, 0.185 * p.size] }); }
  function finjanInto(P, at) { lathe(P.porcelain, [[0, 0], [0.001, 0.016], [0.004, 0.021], [0.036, 0.029], [0.037, 0.0], ], at, 7, y => y > 0.03 ? LP.c('#d6a43a') : LP.c('#f4f1ea')); }
  function coffeeSet(p, q) {
    const P = kit(), rng = AA.rng(p.seed), R = 0.24, col = LP.c(FIN[p.finish] || FIN.brass);
    lathe(P.metal, [[0, 0], [0.001, R * 0.9], [0.018, R], [0.022, R * 1.02], [0.02, 0]], [0, 0, 0], 12, col);
    dallahInto(P.metal, [-0.08, 0.006, -0.06], 1, 0.6, p.finish);
    if (p.dallahs > 1) dallahInto(P.metal, [0.1, 0.006, -0.1], 0.78, -0.3, p.finish);
    if (p.dallahs > 2) dallahInto(P.metal, [-0.02, 0.006, -0.16], 0.65, 0.2, p.finish);
    for (let k = 0; k < Math.round(p.cups); k++) { const st = k % 2, b = Math.floor(k / 2); finjanInto(P, [0.12 - b * 0.07, 0.006 + st * 0.014, 0.1 + (b % 2) * 0.03]); }
    if (p.dates) { lathe(P.porcelain, [[0, 0], [0.001, 0.055], [0.045, 0.11], [0.047, 0.0]], [-0.42, 0, 0.12], 8, LP.c('#2f5f8a')); for (let k = 0; k < 9; k++) { const a = k * 2.39996, d = Math.sqrt(k / 9) * 0.07; LP.ico(P.goods, [-0.42 + Math.cos(a) * d, 0.05, 0.12 + Math.sin(a) * d], [0.012, 0.012, 0.02], 0, () => vary(LP.c('#4a2410'), rng, 0.2)); } }
    return done('lp_coffee_set', P, { lift: 0.024, height: 0.34, radius: 0.5, collider: { type: 'cylinder', radius: 0.26, height: 0.1 } });
  }
  // ---------- المبخرة ----------
  function mabkhara(p, q) {
    const P = kit(), s = p.size, rng = AA.rng(p.seed);
    const prof = [[0, 0], [0.0005, 0.075], [0.012, 0.075], [0.03, 0.06], [0.1, 0.034], [0.13, 0.062], [0.165, 0.07], [0.17, 0.064], [0.15, 0]].map(([y, w]) => [y * s, w * s * Math.SQRT2]);
    const n0 = P.woodDark.vertexCount; lathe(P.woodDark, prof, [0, 0, 0], 4, LP.c('#5e3b22')); moveNew(P.woodDark, n0, { rot: Math.PI / 4 });
    for (let f = 0; f < 4; f++) { const a = f * Math.PI / 2, n = [Math.sin(a), 0, Math.cos(a)]; AA.box(P.metal, V.add(V.scale(n, 0.05 * s), [0, 0.065 * s, 0]), [Math.abs(n[2]) > 0.5 ? 0.03 * s : 0.006 * s, 0.03 * s, Math.abs(n[0]) > 0.5 ? 0.03 * s : 0.006 * s], LP.c('#d1a24a'), 1, {}); }
    LP.ico(P.ash, [0, 0.168 * s, 0], [0.05 * s, 0.012 * s, 0.05 * s], 0, () => LP.c('#5a5550'));
    for (let k = 0; k < 3; k++) LP.ico(P.ember, [(rng() - 0.5) * 0.05 * s, 0.178 * s, (rng() - 0.5) * 0.05 * s], 0.012 * s, 0, () => LP.c('#ff7a2a'));
    if (p.smoke) for (let k = 0; k < 2; k++) { const pts = []; for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push([Math.sin(t * 5 + k * 2) * 0.03 * t * s, (0.19 + t * 0.45) * s, Math.cos(t * 4 + k) * 0.03 * t * s]); }
      for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], w = (0.008 + 0.02 * i / 5) * s, A = P.smoke.v(V.add(a, [-w, 0, 0]), [0.92, 0.92, 0.9], 0.05 * i, k, 0.8), Bv = P.smoke.v(V.add(a, [w, 0, 0]), [0.92, 0.92, 0.9], 0.05 * i, k, 0.8), C = P.smoke.v(V.add(b, [w, 0, 0]), [0.92, 0.92, 0.9], 0.05 * (i + 1), k, 0.8), D = P.smoke.v(V.add(b, [-w, 0, 0]), [0.92, 0.92, 0.9], 0.05 * (i + 1), k, 0.8); P.smoke.t(A, Bv, C); P.smoke.t(A, C, D); } }
    return done('lp_mabkhara', P, { lift: 0.022, height: 0.2 * s + (p.smoke ? 0.45 * s : 0), radius: 0.08 * s, collider: { type: 'box', size: [0.15 * s, 0.17 * s, 0.15 * s] }, light: { at: [0, 0.19 * s, 0], color: [1, 0.45, 0.15], intensity: 0.25, distance: 1.5 } });
  }
  // ---------- الزولية ----------
  function rugInto(P, o, L, W, rng, fringe) {
    const y = 0.032, th = 0.012, n = 6, m = 4, C = [LP.c('#8a2a24'), LP.c('#6a1e1a'), LP.c('#c8a24a'), LP.c('#1f2f4a')];
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      const x0 = lerp(-L / 2, L / 2, i / n), x1 = lerp(-L / 2, L / 2, (i + 1) / n), z0 = lerp(-W / 2, W / 2, j / m), z1 = lerp(-W / 2, W / 2, (j + 1) / m);
      const border = i === 0 || j === 0 || i === n - 1 || j === m - 1, col = border ? C[(i + j) % 2 ? 3 : 2] : C[(i + j) % 2];
      LP.quad(P.rug, AA.xform([x0, y + th, z1], o), AA.xform([x1, y + th, z1], o), AA.xform([x1, y + th, z0], o), AA.xform([x0, y + th, z0], o), col, [0, 1, 0]);
    }
    AA.box(P.rug, [0, y + th / 2 - 0.003, 0], [L, th - 0.006, W], C[3], 1, o); // أخفض من وجه النقشة حتى لا يتنافسا
    if (fringe) for (const s of [1, -1]) for (let k = 0; k < 8; k++) { const z = lerp(-W / 2 + 0.06, W / 2 - 0.06, k / 7); LP.tri(P.cloth, AA.xform([s * L / 2, y + 0.006, z - 0.02], o), AA.xform([s * L / 2, y + 0.006, z + 0.02], o), AA.xform([s * (L / 2 + 0.07), y + 0.004, z], o), LP.c('#efe8da'), [0, 1, 0]); }
  }
  function carpet(p, q) { const P = kit(), rng = AA.rng(p.seed); rugInto(P, {}, p.length, p.width, rng, true); return done('lp_carpet', P, { height: 0.06, radius: Math.hypot(p.length, p.width) / 2, collider: { type: 'none' }, seats: { length: p.length, width: p.width } }); }
  // ---------- الجلسة الأرضية ----------
  function seatRun(P, o, L, rng) {
    AA.box(P.sadu, [0, 0.115, 0], [L, 0.13, 0.72], LP.c('#8a2a24'), 1, o);
    for (let k = 0; k < Math.max(2, Math.round(L / 0.5)); k++) AA.box(P.sadu, [-L / 2 + (k + 0.5) * L / Math.max(2, Math.round(L / 0.5)), 0.18, 0.366], [L / Math.max(2, Math.round(L / 0.5)) - 0.01, 0.012, 0.01], LP.c(SADU[k % SADU.length]), 1, o);
    const n = Math.max(1, Math.round(L / 0.75));
    for (let k = 0; k < n; k++) {
      const x = -L / 2 + (k + 0.5) * L / n, w = L / n - 0.04, oo = { at: AA.xform([x, 0.42, -0.27], o), rot: o.rot || 0 }, st = P.sadu.vertexCount;
      AA.box(P.sadu, [0, 0, 0], [w, 0.48, 0.16], LP.c(SADU[k % 2 ? 1 : 0]), 1, {});
      AA.box(P.sadu, [0, 0.05, 0.085], [w - 0.02, 0.08, 0.005], LP.c(SADU[2 + (k % 2)]), 1, {});
      for (let i = st; i < P.sadu.vertexCount; i++) { const y = P.sadu.pos[i * 3 + 1], z = P.sadu.pos[i * 3 + 2], a = -0.22, y2 = y * Math.cos(a) - z * Math.sin(a), z2 = y * Math.sin(a) + z * Math.cos(a), pp = AA.xform([P.sadu.pos[i * 3], y2, z2], oo); P.sadu.pos[i * 3] = pp[0]; P.sadu.pos[i * 3 + 1] = pp[1]; P.sadu.pos[i * 3 + 2] = pp[2]; }
    }
    for (let k = 0; k <= n; k += 2) { const x = -L / 2 + k * L / n + (k === 0 ? 0.15 : k === n ? -0.15 : 0), c = AA.xform([x, 0.27, -0.05], o), d = AA.xform([0, 0, 1], { rot: o.rot || 0 }); LP.prism(P.cloth, V.madd(c, d, -0.24), V.madd(c, d, 0.22), 0.09, 0.09, 6, vary(LP.c('#8a2a24'), rng, 0.1)); }
  }
  function majlisSeat(p, q) {
    const P = kit(), rng = AA.rng(p.seed), L = p.length, runs = [];
    if (p.layout === 'line') runs.push({ L, at: [0, 0, 0], rot: 0 });
    else { const D = p.depth; runs.push({ L, at: [0, 0, -D / 2], rot: 0 }); runs.push({ L: D - 0.8, at: [-L / 2 + 0.36, 0, 0.36], rot: Math.PI / 2 }); if (p.layout === 'u') runs.push({ L: D - 0.8, at: [L / 2 - 0.36, 0, 0.36], rot: -Math.PI / 2 }); }
    for (const r of runs) seatRun(P, { at: r.at, rot: r.rot }, r.L, rng);
    if (p.rug && p.layout !== 'line') rugInto(P, { at: [0, 0, 0.4] }, L - 1.6, p.depth - 1.5, rng, true);
    const seats = []; for (const r of runs) { const n = Math.max(1, Math.floor(r.L / 0.8)); for (let k = 0; k < n; k++) seats.push({ at: AA.xform([-r.L / 2 + (k + 0.5) * r.L / n, 0.17, -0.02], { at: r.at, rot: r.rot }), rot: r.rot }); }
    return done('lp_majlis_seat', P, { height: 0.7, radius: Math.max(L, p.depth || 1) / 2 + 0.4, collider: { type: 'compound' }, seats });
  }
  // ---------- الوجار ----------
  function flameInto(P, c, h, rng, n) {
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + rng(), r = 0.05 + rng() * 0.04, b = [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r], hh = h * (0.6 + rng() * 0.6), side = V.norm([Math.sin(a), 0, -Math.cos(a)]), w = 0.05 * h / 0.5, ph = rng() * 6;
      const top = [b[0] - Math.cos(a) * r * 0.7, b[1] + hh, b[2] - Math.sin(a) * r * 0.7], mid = V.lerp(b, top, 0.4);
      const i0 = P.flame.v(V.madd(b, side, w * 0.6), LP.c('#ffd36a'), 0, ph, 0), i1 = P.flame.v(V.madd(b, side, -w * 0.6), LP.c('#ffd36a'), 0, ph, 0), i2 = P.flame.v(V.madd(mid, side, -w), LP.c('#ff9a2a'), 0.02, ph, 1.2), i3 = P.flame.v(V.madd(mid, side, w), LP.c('#ff9a2a'), 0.02, ph, 1.2), i4 = P.flame.v(top, LP.c('#ff5a1a'), 0.05, ph, 2.5);
      P.flame.t(i0, i1, i2); P.flame.t(i0, i2, i3); P.flame.t(i3, i2, i4); }
  }
  function firePit(p, q) {
    const P = kit(), rng = AA.rng(p.seed), R = p.radius, ns = Math.round(R * 2 * Math.PI / 0.22);
    for (let k = 0; k < ns; k++) { const a = k / ns * Math.PI * 2, s = 0.09 + rng() * 0.04; LP.rockInto(P.stone, [Math.cos(a) * R, 0.03 + s * 0.3, Math.sin(a) * R], s, rng, 0.7, ['#c9b8a2', '#ab9a85', '#8e7e6c'], 0); }
    LP.ico(P.ash, [0, 0.03, 0], [R * 0.85, 0.03, R * 0.85], 0, () => LP.c('#4f4a45'));
    if (p.lit) for (let k = 0; k < 6; k++) { const a = rng() * 6.28, d = Math.sqrt(rng()) * R * 0.6; LP.ico(P.ember, [Math.cos(a) * d, 0.055, Math.sin(a) * d], [0.03, 0.016, 0.03], 0, () => LP.c('#ff6a1f')); }
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + rng() * 0.3, l = R * 1.3; LP.prism(P.woodDark, [Math.cos(a) * l * 0.7, 0.05, Math.sin(a) * l * 0.7], [Math.cos(a) * 0.04, 0.17, Math.sin(a) * 0.04], 0.032, 0.022, 5, p.lit && k % 2 ? LP.c('#2a1f18') : vary(LP.c('#6e4a2c'), rng, 0.1)); }
    if (p.lit) flameInto(P, [0, 0.07, 0], 0.5 * p.flame, rng, q === 'low' ? 4 : 7);
    if (p.dallahs) { dallahInto(P.metal, [R + 0.18, 0, 0.12], 1, -1.2, 'brass'); dallahInto(P.metal, [R + 0.12, 0, -0.18], 0.8, -1.9, 'brass'); }
    return done('lp_fire_pit', P, { height: p.lit ? 0.6 * p.flame : 0.25, radius: R + 0.35, collider: { type: 'cylinder', radius: R, height: 0.2 }, light: p.lit ? { at: [0, 0.35, 0], color: [1, 0.55, 0.2], intensity: 2.4 * p.flame, distance: 9, flicker: true } : null });
  }
  // ---------- الفانوس ----------
  function lanternInto(P, o, s, lit) {
    const R = 0.07 * s, n0 = { metal2: P.metal2.vertexCount, glass: P.glass.vertexCount, flame: P.flame.vertexCount }, M = LP.c('#4a4744');
    lathe(P.metal2, [[0, 0], [0.001, R * 1.05], [0.024 * s, R * 0.95], [0.025 * s, 0]], [0, 0, 0], 6, M);
    lathe(P.metal2, [[0.2 * s, 0], [0.2 * s + 0.001, R * 1.14], [0.27 * s, R * 0.4], [0.3 * s, R * 0.25], [0.305 * s, 0]], [0, 0, 0], 6, M);
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; LP.prism(P.metal2, [Math.sin(a) * R, 0.02 * s, Math.cos(a) * R], [Math.sin(a) * R, 0.205 * s, Math.cos(a) * R], 0.005 * s, 0.005 * s, 4, M); }
    lathe(P.glass, [[0.024 * s, R * 0.97], [0.2 * s, R * 0.97]], [0, 0, 0], 6, LP.c('#fff2d8'));
    LP.prism(P.metal2, [0, 0.305 * s, 0], [0, 0.365 * s, 0], 0.006 * s, 0.006 * s, 4, M);
    if (lit) lathe(P.flame, [[0.065 * s, 0], [0.07 * s, 0.009 * s], [0.09 * s, 0.012 * s], [0.12 * s, 0]], [0, 0, 0], 5, y => mixc(LP.c('#fff0b0'), LP.c('#ff8a2a'), AA.clamp((y / s - 0.065) / 0.055, 0, 1)));
    for (const [k, v] of Object.entries(n0)) moveNew(P[k], v, o);
  }
  function lantern(p, q) {
    const P = kit(), s = p.size; let y = 0, light;
    if (p.mount === 'wall') { y = 2.1; const arm = 0.42; AA.box(P.wood, [0, 2.62, 0.02], [0.12, 0.16, 0.06], LP.c('wood'), 1, {}); AA.box(P.wood, [0, 2.66, arm / 2], [0.06, 0.06, arm], LP.c('woodLight'), 1, {}); LP.prism(P.metal2, [0, 2.63, arm - 0.03], [0, y + 0.365 * s, arm - 0.03], 0.004, 0.004, 4, LP.c('#4a4744')); lanternInto(P, { at: [0, y, arm - 0.03] }, s, p.lit); light = [0, y + 0.1 * s, arm - 0.03]; }
    else if (p.mount === 'pole') { y = 1.9; LP.prism(P.wood, [0, 0, 0], [0, 2.3, 0], 0.05, 0.04, 6, LP.c('wood')); AA.box(P.wood, [0.2, 2.25, 0], [0.45, 0.05, 0.05], LP.c('woodLight'), 1, {}); LP.prism(P.metal2, [0.38, 2.25, 0], [0.38, y + 0.36 * s, 0], 0.004, 0.004, 4, LP.c('#4a4744')); lanternInto(P, { at: [0.38, y, 0] }, s, p.lit); light = [0.38, y + 0.1 * s, 0]; }
    else { lanternInto(P, { at: [0, 0.03, 0] }, s, p.lit); light = [0, 0.13 * s, 0]; }
    return done('lp_lantern', P, { height: p.mount === 'floor' ? 0.37 * s : 2.7, radius: 0.5, collider: { type: 'box', size: [0.16 * s, 0.34 * s, 0.16 * s] }, light: p.lit ? { at: light, color: [1, 0.7, 0.35], intensity: 1.4, distance: 7, flicker: true } : null });
  }
  // ---------- الزير ----------
  function zir(p, q) {
    const P = kit(), H = p.height, R = H * 0.34, legH = 0.42, C = LP.c('#c78456');
    lathe(P.clay, [[0, 0], [0.001, R * 0.25], [0.06 * H, R * 0.55], [0.3 * H, R * 0.95], [0.5 * H, R], [0.72 * H, R * 0.82], [0.88 * H, R * 0.5], [0.97 * H, R * 0.47], [1.0 * H, R * 0.46], [0.98 * H, 0]].map(([y, r]) => [y, r]), [0, legH - 0.02, 0], 8, y => mixc(C, LP.c('#8a5636'), 0.5 * smooth(legH + 0.5 * H, legH, y)));
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; LP.prism(P.wood, [Math.sin(a) * R * 0.95, 0, Math.cos(a) * R * 0.95], [Math.sin(a) * R * 0.6, legH + 0.08, Math.cos(a) * R * 0.6], 0.03, 0.025, 5, LP.c('wood')); }
    LP.prism(P.wood, [0, legH + 0.01, 0], [0, legH + 0.05, 0], R * 0.72, R * 0.72, 8, LP.c('woodLight'), { noCaps: true });
    lathe(P.clay, [[0, 0], [0.001, R * 0.45], [0.05, R * 0.55], [0.052, 0]], [0, 0, 0], 8, LP.c('#b06e48'));
    const topY = legH - 0.02 + H;
    lathe(P.wood, [[0, 0], [0.001, R * 0.56], [0.025, R * 0.56], [0.026, 0]], [0, topY, 0], 8, LP.c('woodLight'));
    LP.prism(P.wood, [0, topY + 0.025, 0], [0, topY + 0.06, 0], 0.015, 0.02, 5, LP.c('wood'));
    lathe(P.metal, [[0, 0], [0.001, 0.05], [0.04, 0.065], [0.042, 0]], [R * 0.25, topY + 0.026, 0.02], 8, LP.c(FIN.copper));
    return done('lp_zir', P, { lift: 0.022, height: topY + 0.08, radius: R + 0.1, collider: { type: 'cylinder', radius: R, height: topY }, physics: { mass: 40, friction: 0.7 } });
  }
  // ---------- الفخار ----------
  const TINTS = ['#cc8456', '#bd7550', '#db9e6b', '#a8664a'];
  function jarInto(P, at, kind, s, rng, tint) {
    const col = y => vary(LP.c(tint || TINTS[Math.floor(rng() * 4)]), rng, 0.04);
    if (kind === 'jarra') { lathe(P.clay, [[0, 0], [0.001, 0.07], [0.03, 0.1], [0.12, 0.14], [0.22, 0.13], [0.3, 0.085], [0.34, 0.06], [0.39, 0.075], [0.392, 0]].map(([y, r]) => [y * s, r * s]), at, 7, col); for (const sd of [1, -1]) LP.chain(P.clay, [[at[0] + sd * 0.07 * s, at[1] + 0.35 * s, at[2]], [at[0] + sd * 0.15 * s, at[1] + 0.32 * s, at[2]], [at[0] + sd * 0.12 * s, at[1] + 0.23 * s, at[2]]], [0.012 * s, 0.012 * s, 0.012 * s], 4, () => col(0)); }
    else if (kind === 'burma') lathe(P.clay, [[0, 0], [0.001, 0.08], [0.04, 0.14], [0.1, 0.16], [0.15, 0.14], [0.18, 0.13], [0.185, 0]].map(([y, r]) => [y * s, r * s]), at, 8, y => y < 0.06 * s ? LP.c('#3a2e27') : col(y));
    else { lathe(P.clay, [[0, 0], [0.001, 0.05], [0.02, 0.065], [0.08, 0.075], [0.14, 0.05], [0.18, 0.03], [0.21, 0.032], [0.215, 0]].map(([y, r]) => [y * s, r * s]), at, 6, col); LP.prism(P.clay, [at[0], at[1] + 0.1 * s, at[2] + 0.06 * s], [at[0], at[1] + 0.17 * s, at[2] + 0.13 * s], 0.014 * s, 0.007 * s, 4, col(0)); }
  }
  function pottery(p, q) {
    const P = kit(), rng = AA.rng(p.seed), n = Math.round(p.count), kinds = ['jarra', 'burma', 'ibriq'], spots = [];
    for (let k = 0; k < n; k++) {
      let x, z, g2 = 0; const kind = p.kind === 'mix' ? kinds[k % 3] : p.kind, s = (kind === 'jarra' ? 1.4 : kind === 'burma' ? 1.3 : 1.2) * (0.75 + rng() * 0.5) * p.size, r = (kind === 'burma' ? 0.17 : 0.14) * s;
      do { x = (rng() - 0.5) * p.spread; z = (rng() - 0.5) * p.spread * 0.6; g2++; } while (g2 < 40 && spots.some(sp => Math.hypot(sp[0] - x, sp[1] - z) < sp[2] + r + 0.02));
      spots.push([x, z, r]); jarInto(P, [x, 0.02, z], kind, s, rng, TINTS[k % 4]);
    }
    return done('lp_pottery', P, { height: 0.6 * p.size, radius: p.spread / 2 + 0.2, collider: { type: 'compound' } });
  }
  // ---------- الحطب ----------
  function firewood(p, q) {
    const P = kit(), rng = AA.rng(p.seed), L = p.length, rows = Math.round(p.rows); let y = 0.05;
    for (let r = 0; r < rows; r++) { const n = rows - r + 2; for (let k = 0; k < n; k++) { const x = (k - (n - 1) / 2) * 0.11 + (rng() - 0.5) * 0.03, rr = 0.04 + rng() * 0.015;
      LP.prism(P.woodDark, [x, y + rr, -L / 2 + (rng() - 0.5) * 0.05], [x + (rng() - 0.5) * 0.04, y + rr, L / 2 + (rng() - 0.5) * 0.05], rr, rr * 0.9, 6, vary(LP.c('#7a5a3e'), rng, 0.15), { rot: rng() });
      LP.prism(P.wood, [x, y + rr, -L / 2 - 0.035], [x, y + rr, -L / 2 - 0.03], rr * 0.85, rr * 0.85, 6, LP.c('#e8cf9a')); }
      y += 0.085; }
    if (p.tied) for (const z of [-L * 0.28, L * 0.28]) LP.prism(P.rope, [0, y / 2, z - 0.015], [0, y / 2, z + 0.015], rows * 0.07 + 0.1, rows * 0.07 + 0.1, 8, LP.c('#a8865a'), { sx: 1, noCaps: true });
    return done('lp_firewood', P, { height: y + 0.05, radius: L / 2 + 0.1, collider: { type: 'box', size: [rows * 0.15 + 0.3, y, L] }, physics: { mass: 20 * rows, friction: 0.8 } });
  }

  LP.def('dallah', dallah); LP.def('coffee_set', coffeeSet); LP.def('mabkhara', mabkhara); LP.def('carpet', carpet); LP.def('majlis_seat', majlisSeat);
  LP.def('fire_pit', firePit); LP.def('lantern', lantern); LP.def('zir', zir); LP.def('pottery', pottery); LP.def('firewood', firewood);
  LP.majlis = { dallahInto, jarInto, lanternInto, flameInto, rugInto, seatRun, finjanInto };
})(typeof window !== 'undefined' ? window : globalThis);

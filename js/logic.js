// ذيبان · THEEBAN — منطق اللعبة (بدون رسم)
// كل شيء هنا مستقل عن Three.js عشان نقدر نختبره في Node: الحركة، التصادم، الرؤية، الحراس، نقاط الحفظ.
// المحاور: x يمين، z لتحت الشاشة (الجنوب)، y فوق. الوحدة متر.
(function (root) {
  'use strict';
  const T = {};

  // ---------- الوضعيات ----------
  // h = ارتفاع النقطة اللي يشوفها الحارس، vis = سرعة الانكشاف، range = نسبة مدى الرؤية
  T.STANCES = {
    stand:  { name: 'واقف',  h: 1.5,  walk: 2.6, run: 5.0, vis: 1.0,  range: 1.0,  clear: 1.8 },
    crouch: { name: 'منحني', h: 0.75, walk: 1.7, run: 1.7, vis: 0.55, range: 0.8,  clear: 1.1 },
    crawl:  { name: 'زاحف',  h: 0.3,  walk: 0.95, run: 0.95, vis: 0.35, range: 0.55, clear: 0.5 }
  };
  T.STANCE_ORDER = ['stand', 'crouch', 'crawl'];
  T.PLAYER_R = 0.35;

  // ---------- الحراس ----------
  T.GUARD_TYPES = {
    scout: { name: 'الكشاف',        speed: 2.8, chase: 4.3, fov: 100, range: 11,  r: 0.38 },
    heavy: { name: 'الحارس الثقيل', speed: 1.5, chase: 3.1, fov: 60,  range: 9,   r: 0.5 },
    tech:  { name: 'الفني',         speed: 2.1, chase: 3.7, fov: 80,  range: 9.5, r: 0.4 }
  };
  T.EYE = 1.6;          // ارتفاع عين الحارس
  T.SUSPECT = 0.3;      // عتبة الاشتباه
  T.CATCH = 1.05;       // مسافة الإمساك
  T.NOISE_RUN = 6.5;    // نصف قطر صوت الركض
  T.ALERT_SHARE = 14;   // الحارس اللي ينذر يبلّغ اللي حوله
  T.SUBDUE_DIST = 1.5;  // مسافة التخدير من ورا
  T.OUT_TIME = 45;      // كم ثانية ينام الحارس المخدّر

  // ---------- أدوات رياضية ----------
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const len = (x, z) => Math.hypot(x, z);
  const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  T.clamp = clamp; T.angDiff = angDiff;

  // تقاطع قطعة مع مستطيل (2D): يرجع [tmin, tmax] أو null
  function segBox(ax, az, bx, bz, o) {
    const dx = bx - ax, dz = bz - az;
    let t0 = 0, t1 = 1;
    const x0 = o.x - o.w / 2, x1 = o.x + o.w / 2, z0 = o.z - o.d / 2, z1 = o.z + o.d / 2;
    const p = [-dx, dx, -dz, dz], q = [ax - x0, x1 - ax, az - z0, z1 - az];
    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return null; }
      else { const r = q[i] / p[i]; if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; } }
    }
    return [t0, t1];
  }
  T.segBox = segBox;

  // هل الخط من (a بارتفاع ha) إلى (b بارتفاع hb) ينسد بعائق؟
  function blocked(obstacles, ax, az, ha, bx, bz, hb) {
    for (const o of obstacles) {
      const s = segBox(ax, az, bx, bz, o);
      if (!s) continue;
      const h0 = ha + (hb - ha) * s[0], h1 = ha + (hb - ha) * s[1];
      const lo = Math.min(h0, h1), hi = Math.max(h0, h1);
      if (lo < o.y1 && hi > o.y0) return true;
    }
    return false;
  }
  T.blocked = blocked;

  // ---------- المرحلة ----------
  function normObstacle(o) {
    const y0 = o.y0 || 0;
    return Object.assign({}, o, { y0, y1: y0 + o.h });
  }

  T.makeLevel = function (data) {
    const L = Object.assign({}, data);
    const obs = (data.obstacles || []).slice();
    // أغراض المرحلة (من حزمة أصول ذيبان): اللي لها col تصير عوائق بنفس المكان
    for (const pr of data.props || []) {
      if (!pr.col) continue;
      const q = Math.round(((pr.rot || 0) / (Math.PI / 2)) % 2), sw = Math.abs(q) === 1;
      obs.push({ kind: 'prop', x: pr.x + (pr.cx || 0), z: pr.z + (pr.cz || 0), w: sw ? pr.col[1] : pr.col[0], d: sw ? pr.col[0] : pr.col[1], h: pr.col[2], y0: pr.y0 || 0, ref: pr.id });
    }
    // غرفة tb_room (بدون دوران): جدار خلفي ويسار كامل، أمامي ويمين منخفضة (0.9) لو cutaway، والباب في الجدار الأمامي على x = -W/4
    for (const pr of data.props || []) {
      if (pr.id !== 'tb_room' || !pr.walls) continue;
      const P0 = pr.p || {}, W = P0.width || 7, D = P0.depth || 6, H = P0.height || 3.2, t = 0.25, low = P0.cutaway === false ? H : 0.9, x = pr.x, z = pr.z;
      obs.push({ kind: 'roomwall', x, z: z - D / 2 - t / 2, w: W + 2 * t, d: t, h: H }, { kind: 'roomwall', x: x - W / 2 - t / 2, z, w: t, d: D, h: H }, { kind: 'roomwall', x: x + W / 2 + t / 2, z, w: t, d: D, h: low });
      const dx = x - W * 0.25, dw = 1.2, a0 = x - W / 2 - t, b0 = dx - dw / 2, c0 = dx + dw / 2, d0 = x + W / 2 + t;
      if (P0.door === false) obs.push({ kind: 'roomwall', x, z: z + D / 2 + t / 2, w: W + 2 * t, d: t, h: low });
      else obs.push({ kind: 'roomwall', x: (a0 + b0) / 2, z: z + D / 2 + t / 2, w: b0 - a0, d: t, h: low }, { kind: 'roomwall', x: (c0 + d0) / 2, z: z + D / 2 + t / 2, w: d0 - c0, d: t, h: low });
      pr.door = { x: dx, z: z + D / 2 + 0.5 };
    }
    // خريطة أنفاق بالحروف: # صخر · . نفق (ممر 3 م بين جدارين) · P قاعة (بدون أعمدة) · D مجرى زحف (قناة 1.1 م) · S فتحة الدخول
    if (data.tunnel) {
      const T0 = data.tunnel, c = T0.cell, hc = c / 2, M = T0.map;
      const at = (i, j) => (M[j] && M[j][i]) || '#';
      const open = (i, j) => at(i, j) !== '#';
      M.forEach((row, j) => [...row].forEach((ch, i) => {
        const x = T0.ox + (i + 0.5) * c, z = T0.oz + (j + 0.5) * c;
        if (ch === '#') { obs.push({ kind: 'solid', x, z, w: c, d: c, h: 3.2 }); return; }
        if (ch === 'D') {
          const vert = open(i, j - 1) && open(i, j + 1), ch2 = 0.55, sw = hc - ch2;
          if (vert) obs.push({ kind: 'twall', x: x - ch2 - sw / 2, z, w: sw, d: c, h: 3.2 }, { kind: 'twall', x: x + ch2 + sw / 2, z, w: sw, d: c, h: 3.2 }, { kind: 'duct', x, z, w: 2 * ch2, d: c, h: 2.6, y0: 0.62 });
          else obs.push({ kind: 'twall', x, z: z - ch2 - sw / 2, w: c, d: sw, h: 3.2 }, { kind: 'twall', x, z: z + ch2 + sw / 2, w: c, d: sw, h: 3.2 }, { kind: 'duct', x, z, w: c, d: 2 * ch2, h: 2.6, y0: 0.62 });
          return;
        }
        const hall = ch === 'P', th = hall ? 0.3 : 0.5;
        // جدار على كل جهة مقفولة
        if (!open(i, j - 1)) obs.push({ kind: 'twall', x, z: z - hc + th / 2, w: c, d: th, h: 3.2 });
        if (!open(i, j + 1)) obs.push({ kind: 'twall', x, z: z + hc - th / 2, w: c, d: th, h: 3.2 });
        if (!open(i - 1, j)) obs.push({ kind: 'twall', x: x - hc + th / 2, z, w: th, d: c, h: 3.2 });
        if (!open(i + 1, j)) obs.push({ kind: 'twall', x: x + hc - th / 2, z, w: th, d: c, h: 3.2 });
        // أعمدة الزوايا للممرات (قطع النفق عرضها 3 م)
        if (!hall) for (const sx of [-1, 1]) for (const sz of [-1, 1]) obs.push({ kind: 'twall', x: x + sx * (hc - 0.25), z: z + sz * (hc - 0.25), w: 0.5, d: 0.5, h: 3.2 });
      }));
    }
    L.allObstacles = obs.map(normObstacle);
    L.obstacles = L.allObstacles;
    L.ladders = (data.ladders || []).map(l => Object.assign({}, l, { obs: L.allObstacles.find(o => Math.abs(o.x - l.plat.x) < 0.01 && Math.abs(o.z - l.plat.z) < 0.01) || null }));
    L.grid = buildGrid(L, 0.5);
    return L;
  };

  // شبكة مشي الحراس: الخلية مقفولة إذا فيها أي عائق (حتى الأنابيب — الحارس ما يزحف)
  function buildGrid(L, cell) {
    const nx = Math.round(L.size.w / cell), nz = Math.round(L.size.d / cell);
    const ox = -L.size.w / 2, oz = -L.size.d / 2;
    const block = new Uint8Array(nx * nz);
    const pad = 0.45;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const x = ox + (i + 0.5) * cell, z = oz + (j + 0.5) * cell;
      for (const o of L.obstacles) {
        if (o.y0 > 2.2) continue;
        if (Math.abs(x - o.x) < o.w / 2 + pad && Math.abs(z - o.z) < o.d / 2 + pad) { block[i + j * nx] = 1; break; }
      }
    }
    return { cell, nx, nz, ox, oz, block };
  }

  function cellOf(G, x, z) { return [clamp(Math.floor((x - G.ox) / G.cell), 0, G.nx - 1), clamp(Math.floor((z - G.oz) / G.cell), 0, G.nz - 1)]; }
  function cellCenter(G, i, j) { return [G.ox + (i + 0.5) * G.cell, G.oz + (j + 0.5) * G.cell]; }

  // أقرب خلية مفتوحة
  function nearestOpen(G, i, j) {
    if (!G.block[i + j * G.nx]) return [i, j];
    for (let r = 1; r < 12; r++) for (let di = -r; di <= r; di++) for (let dj = -r; dj <= r; dj++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
      const a = i + di, b = j + dj;
      if (a >= 0 && b >= 0 && a < G.nx && b < G.nz && !G.block[a + b * G.nx]) return [a, b];
    }
    return [i, j];
  }

  // A* على الشبكة (8 اتجاهات) ثم تنعيم بخط الرؤية
  T.findPath = function (L, sx, sz, tx, tz) {
    const G = L.grid, N = G.nx * G.nz;
    const s = nearestOpen(G, ...cellOf(G, sx, sz)), t = nearestOpen(G, ...cellOf(G, tx, tz));
    const si = s[0] + s[1] * G.nx, ti = t[0] + t[1] * G.nx;
    if (si === ti) return [[tx, tz]];
    const g = new Float32Array(N).fill(Infinity), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const open = [si]; g[si] = 0;
    const h = k => { const i = k % G.nx, j = (k / G.nx) | 0; const dx = Math.abs(i - t[0]), dz = Math.abs(j - t[1]); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    const f = new Float32Array(N).fill(Infinity); f[si] = h(si);
    let found = false, iter = 0;
    while (open.length && iter++ < 20000) {
      let bi = 0; for (let k = 1; k < open.length; k++) if (f[open[k]] < f[open[bi]]) bi = k;
      const cur = open[bi]; open[bi] = open[open.length - 1]; open.pop();
      if (cur === ti) { found = true; break; }
      if (closed[cur]) continue; closed[cur] = 1;
      const ci = cur % G.nx, cj = (cur / G.nx) | 0;
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
        if (!di && !dj) continue;
        const ni = ci + di, nj = cj + dj;
        if (ni < 0 || nj < 0 || ni >= G.nx || nj >= G.nz) continue;
        const nk = ni + nj * G.nx;
        if (G.block[nk] || closed[nk]) continue;
        if (di && dj && (G.block[ci + di + cj * G.nx] || G.block[ci + (cj + dj) * G.nx])) continue;
        const ng = g[cur] + (di && dj ? 1.414 : 1);
        if (ng < g[nk]) { g[nk] = ng; came[nk] = cur; f[nk] = ng + h(nk); open.push(nk); }
      }
    }
    if (!found) return null;
    const cells = []; for (let k = ti; k !== -1; k = came[k]) cells.push(k);
    cells.reverse();
    const pts = cells.map(k => cellCenter(G, k % G.nx, (k / G.nx) | 0));
    pts[pts.length - 1] = [tx, tz];
    // تنعيم: نتخطى النقاط اللي نقدر نوصل لبعدها بخط مستقيم
    const out = []; let a = [sx, sz], k = 0;
    while (k < pts.length) {
      let far = k;
      for (let m = pts.length - 1; m > k; m--) if (walkLine(L, a[0], a[1], pts[m][0], pts[m][1])) { far = m; break; }
      out.push(pts[far]); a = pts[far]; k = far + 1;
    }
    return out;
  };

  function walkLine(L, ax, az, bx, bz) {
    const G = L.grid, steps = Math.ceil(len(bx - ax, bz - az) / (G.cell * 0.5));
    for (let s = 0; s <= steps; s++) {
      const x = ax + (bx - ax) * s / steps, z = az + (bz - az) * s / steps;
      const c = cellOf(G, x, z); if (G.block[c[0] + c[1] * G.nx]) return false;
    }
    return true;
  }

  // ---------- تصادم دائرة مع مستطيلات ----------
  function solidFor(o, clear) { return o.y0 < clear; } // الأنبوب (y0=0.6) ما يصد الزاحف (clear=0.5)
  function pushOut(L, p, r, clear) {
    for (const o of L.obstacles) {
      if (!solidFor(o, clear)) continue;
      const cx = clamp(p.x, o.x - o.w / 2, o.x + o.w / 2), cz = clamp(p.z, o.z - o.d / 2, o.z + o.d / 2);
      const dx = p.x - cx, dz = p.z - cz, d = len(dx, dz);
      if (d < r) {
        if (d > 1e-6) { p.x = cx + dx / d * r; p.z = cz + dz / d * r; }
        else { // داخل الصندوق: اطلع من أقرب جهة
          const ex = [o.x - o.w / 2 - r - p.x, o.x + o.w / 2 + r - p.x], ez = [o.z - o.d / 2 - r - p.z, o.z + o.d / 2 + r - p.z];
          const m = [[Math.abs(ex[0]), 'x', ex[0]], [Math.abs(ex[1]), 'x', ex[1]], [Math.abs(ez[0]), 'z', ez[0]], [Math.abs(ez[1]), 'z', ez[1]]].sort((a, b) => a[0] - b[0])[0];
          p[m[1]] += m[2];
        }
      }
    }
    const hw = L.size.w / 2 - r, hd = L.size.d / 2 - r;
    p.x = clamp(p.x, -hw, hw); p.z = clamp(p.z, -hd, hd);
  }
  T.pushOut = pushOut;

  function overlapsLow(L, p, r, clear) { // هل فوقه شيء يمنعه يوقف؟
    for (const o of L.obstacles) {
      if (o.y0 <= 0 || o.y0 >= clear) continue;
      if (Math.abs(p.x - o.x) < o.w / 2 + r && Math.abs(p.z - o.z) < o.d / 2 + r) return true;
    }
    return false;
  }

  // ---------- الحالة ----------
  T.newGame = function (L) {
    const S = {
      L, time: 0, status: 'play', // play | caught | won
      player: { x: L.start.x, z: L.start.z, y: 0, dir: L.start.dir || Math.PI, stance: 'stand', moving: 0, running: false, noiseT: 0, mode: 'ground',
        gas: L.gasStart || 0, nabbah: (L.tools && L.tools.nabbah) || 0, azil: (L.tools && L.tools.azil) || 0, zahif: (L.tools && L.tools.zahif) || 0, tool: 'gas' },
      picked: {}, shots: [], clouds: [],
      checkpoint: { x: L.start.x, z: L.start.z, idx: -1, gas: L.gasStart || 0, picked: {}, tools: null, objIdx: 0 },
      guards: [], events: [], radioDone: {}, caughtT: 0, catches: 0, objectiveTaken: false,
      gateOpen: !L.gateLock, gateTried: false, notesRead: {},
      cams: (L.cameras || []).map((c, i) => ({ meter: 0, off: 0, dir: c.dir || 0, seen: false })), decoys: [], objIdx: 0,
      lights: newLights(L), alarm: { on: false, t: 0, x: 0, z: 0 }, power: { off: false, t: 0 }, action: null
    };
    S.guards = L.guards.map((g, i) => newGuard(g, i));
    return S;
  };

  function newLights(L) { return (L.searchlights || []).map(() => ({ meter: 0, lit: false, ph: 0 })); }

  function newGuard(g, i) {
    const p = g.route[0];
    return {
      id: i, type: g.type, cfg: T.GUARD_TYPES[g.type], route: g.route, wait: g.wait == null ? 1.2 : g.wait, look: g.look || 0.9,
      x: p[0], z: p[1], dir: g.dir != null ? g.dir : 0, wp: 1 % g.route.length, waitT: 0, sweep: 0,
      state: 'calm', meter: 0, seen: false, target: null, path: null, pathT: 0, searchT: 0, lastSeen: null, home: null, outT: 0, noticed: false
    };
  }

  T.resetToCheckpoint = function (S) {
    const P = S.player;
    P.x = S.checkpoint.x; P.z = S.checkpoint.z; P.y = 0; P.stance = 'stand'; P.moving = 0; P.running = false;
    P.mode = 'ground'; P.climb = null; P.hide = null; P.gas = S.checkpoint.gas; if (S.checkpoint.tools) Object.assign(P, S.checkpoint.tools); S.objIdx = S.checkpoint.objIdx || 0; S.camsDead = (S.L.objectives || []).slice(0, S.objIdx).some(o => o.camsOff); S.decoys = []; S.cams = (S.L.cameras || []).map(c => ({ meter: 0, off: 0, dir: c.dir || 0, seen: false })); S.picked = Object.assign({}, S.checkpoint.picked); S.shots = []; S.clouds = [];
    S.guards = S.L.guards.map((g, i) => newGuard(g, i));
    S.status = 'play'; S.caughtT = 0; S.subdue = null;
    S.lights = newLights(S.L); (S.checkpoint.dead || []).forEach((d, i) => { if (d && S.lights[i]) S.lights[i].dead = true; }); applyGate(S, true); S.alarm = { on: false, t: 0, x: 0, z: 0 }; S.power = { off: false, t: 0 }; S.action = null;
    S.events.push({ t: 'respawn' });
  };

  T.cycleStance = function (S) {
    const P = S.player, i = T.STANCE_ORDER.indexOf(P.stance);
    for (let k = 1; k <= 3; k++) {
      const next = T.STANCE_ORDER[(i + k) % 3];
      if (overlapsLow(S.L, P, T.PLAYER_R * 0.9, T.STANCES[next].clear)) continue; // ما يقدر يوقف تحت أنبوب
      P.stance = next; S.events.push({ t: 'stance', s: next }); return next;
    }
    return P.stance;
  };
  T.setStance = function (S, s) {
    const P = S.player;
    if (overlapsLow(S.L, P, T.PLAYER_R * 0.9, T.STANCES[s].clear)) return false;
    P.stance = s; S.events.push({ t: 'stance', s }); return true;
  };

  // ---------- التخدير من ورا ----------
  // يقرب من الحارس من وراه (والحارس ما شافه ومو في إنذار) ← يخدّره. الثقيل ياخذ وقت أطول.
  T.subdueTarget = function (S) {
    const P = S.player;
    if (S.status !== 'play' || S.subdue || S.action || P.stance === 'crawl' || P.mode !== 'ground') return null;
    let best = null, bd = 99;
    for (const g of S.guards) {
      if (g.state === 'alert' || g.state === 'out' || g.seen) continue;
      const d = len(P.x - g.x, P.z - g.z);
      if (d > T.SUBDUE_DIST + g.cfg.r * 0.5 || d >= bd) continue;
      const behind = Math.abs(angDiff(g.dir, Math.atan2(P.x - g.x, P.z - g.z))) > 1.95;
      if (behind) { best = g; bd = d; }
    }
    return best;
  };
  T.startSubdue = function (S) {
    const g = T.subdueTarget(S); if (!g) return false;
    S.subdue = { g: g.id, t: 0, need: g.type === 'heavy' ? 1.3 : 0.7 };
    S.player.dir = Math.atan2(g.x - S.player.x, g.z - S.player.z);
    S.events.push({ t: 'subdue_start', g: g.id });
    return true;
  };
  function updateSubdue(S, dt) {
    const sd = S.subdue, g = S.guards[sd.g];
    sd.t += dt;
    if (!g || g.state === 'alert') { S.subdue = null; return; }
    if (sd.t >= sd.need) {
      g.state = 'out'; g.outT = T.OUT_TIME; g.meter = 0; g.target = null; g.path = null; g.noticed = false; g.outBy = 'subdue';
      S.subdue = null; S.subdued = (S.subdued || 0) + 1;
      S.events.push({ t: 'subdued', g: g.id });
    }
  }

  // ---------- الإنذار والكهربا ----------
  // الإنذار يشتغل إذا كشفك الضوء أو حارس. يخلي كل الحراس يفتشون ويسرّع الكشافات.
  // تطفيه من لوحة الإنذار، أو تقطع الكهربا من المولد (يطفي الكشافات والأنوار والإنذار، ويجي حارس يصلحه).
  function raiseAlarm(S, x, z) {
    S.alarm.x = x; S.alarm.z = z;
    if (S.alarm.on) return;
    S.alarm.on = true; S.alarm.t = 0;
    S.events.push({ t: 'alarm_on' });
    for (const g of S.guards) if (g.state === 'calm') { g.state = 'suspicious'; g.meter = Math.max(g.meter, 0.5); g.target = [x, z]; g.path = null; g.searchT = 0; }
  }
  T.raiseAlarm = raiseAlarm;
  function alarmOff(S, why) {
    if (!S.alarm.on) return;
    S.alarm.on = false; S.alarm.t = 0;
    for (const g of S.guards) if (g.state === 'alert' && !g.seen) { g.state = 'suspicious'; g.meter = 0.45; g.searchT = 2; }
    S.events.push({ t: 'alarm_off', why });
  }
  function updateAlarm(S, dt) {
    if (S.alarm.on) { S.alarm.t += dt; if (S.alarm.t > 90) alarmOff(S, 'timeout'); }
    if (S.power.off) {
      S.power.t -= dt;
      if (S.power.t <= 0) { S.power.off = false; S.events.push({ t: 'power_on' }); }
    }
  }
  T.rangeMod = function (S) { return (S.alarm && S.alarm.on ? 1.15 : 1) * (S.power && S.power.off ? 0.75 : 1) * ((S.L.env && S.L.env.vision) || 1); };

  // أقرب شيء يقدر يسويه ذيبان الحين (زر واحد يتغير حسب المكان)
  T.action = function (S) {
    const P = S.player;
    if (S.status !== 'play' || S.subdue || S.action) return null;
    const near = (o, r) => o && len(P.x - o.x, P.z - o.z) < r;
    if (P.mode === 'climb') return null;
    if (P.mode === 'hidden') return P.hide.phase === 'in' ? { kind: 'exit' } : null;
    if (P.mode === 'top') {
      const l = P.ladder, li = l.light;
      if (li != null && S.lights[li] && !S.lights[li].dead && near(l.ctrl || l.top, 1.4)) return { kind: 'light', need: 1.2 };
      if (near(l.top, 0.9)) return { kind: 'down' };
      return null;
    }
    if (T.canInteract(S)) { const o = T.curObjective(S); return o ? { kind: 'use', need: o.need || 1.5, btn: o.btn } : { kind: 'play', need: 2.6 }; }
    const ni = (S.L.notes || []).findIndex(n => near(n, 1.0));
    if (ni >= 0) return { kind: 'read', note: ni };
    if (S.alarm.on && (S.L.panels || []).some(p => near(p, 1.6))) return { kind: 'panel', need: 1.0 };
    if (!S.power.off && near(S.L.generator, 1.8)) return { kind: 'gen', need: 1.2 };
    if (T.subdueTarget(S)) return { kind: 'subdue' }; // الحارس قدامك أهم من أي شي ثاني
    if (!S.gateOpen && (S.L.gatePoints || []).some(g => near(g, 1.4))) return { kind: 'gate' };
    const lad = (S.L.ladders || []).find(l => near(l, 1.0));
    if (lad && P.stance !== 'crawl') return { kind: 'climb', ladder: lad };
    const hs = (S.L.hideSpots || []).find(h => near(h, 1.2));
    if (hs) return { kind: 'hide', spot: hs };
    if (T.subdueTarget(S)) return { kind: 'subdue' };
    return null;
  };
  T.doAction = function (S) {
    const a = T.action(S); if (!a) return false;
    if (a.kind === 'take') return T.interact(S);
    if (a.kind === 'gate') { S.gateTried = true; S.events.push({ t: 'gate_locked' }); return true; }
    if (a.kind === 'read') { const n = S.L.notes[a.note]; S.notesRead[a.note] = 1; S.events.push({ t: 'note', i: a.note, title: n.title, text: n.text }); return true; }
    if (a.kind === 'subdue') return T.startSubdue(S);
    const P = S.player;
    if (a.kind === 'climb') { const l = a.ladder; P.mode = 'climb'; P.ladder = l; P.x = l.x; P.z = l.z; P.dir = l.face; P.stance = 'stand'; P.moving = 0; P.climb = { phase: 'mount', t: 0 }; S.events.push({ t: 'climb' }); return true; }
    if (a.kind === 'down') { P.mode = 'climb'; P.x = P.ladder.x; P.z = P.ladder.z; P.dir = P.ladder.face; P.stance = 'stand'; P.moving = 0; P.y = P.ladder.h - T.LADDER_TOP; P.climb = { phase: 'down', t: 0 }; return true; }
    if (a.kind === 'hide') { const h = a.spot; P.mode = 'hidden'; P.hide = { spot: h, phase: 'enter', t: 0 }; P.x = h.x; P.z = h.z; P.dir = h.face; P.moving = 0; P.stance = 'stand'; S.events.push({ t: 'hide' }); return true; }
    if (a.kind === 'exit') { P.hide.phase = 'exit'; P.hide.t = 0; return true; }
    S.action = { kind: a.kind, t: 0, need: a.need };
    S.events.push({ t: 'action_start', kind: a.kind });
    return true;
  };
  function updateAction(S, dt) {
    const A = S.action; A.t += dt;
    if (A.t < A.need) return;
    S.action = null;
    if (A.kind === 'play') { T.interact(S); return; }
    if (A.kind === 'use') { advanceObjective(S); return; }
    if (A.kind === 'panel') alarmOff(S, 'panel');
    if (A.kind === 'light') { const li = S.player.ladder.light; S.lights[li].dead = true; S.lights[li].meter = 0; S.events.push({ t: 'light_dead', light: li }); }
    if (A.kind === 'gen') {
      S.power.off = true; S.power.t = 35;
      S.events.push({ t: 'power_off' });
      alarmOff(S, 'power');
      const G = S.L.generator; // أقرب حارس يجي يصلح المولد
      const g = S.guards.filter(o => o.state !== 'out' && o.state !== 'alert').sort((a, b) => len(a.x - G.x, a.z - G.z) - len(b.x - G.x, b.z - G.z))[0];
      if (g) { g.state = 'suspicious'; g.meter = Math.max(g.meter, 0.5); g.target = [G.x, G.z]; g.path = null; g.searchT = 0; }
    }
  }

  // ---------- التسلق ----------
  // تحت السلّم ← mount ← يطلع (1.3 م/ث) ← top (حركة الملف ترفعه 1.28 م لقدام 0.58) ← فوق المنصة.
  // النزول بالعكس. ما ينمسك وهو فوق، والحارس ما يطلع وراه — بس يقدر يشوفه وهو يتسلق.
  T.LADDER_TOP = 1.28; T.CLIMB_SPEED = 1.3;
  function updateClimb(S, dt) {
    const P = S.player, l = P.ladder, c = P.climb; c.t += dt; P.moving = 0;
    if (c.phase === 'mount' && c.t >= 0.7) { c.phase = 'up'; c.t = 0; }
    else if (c.phase === 'up') { P.y = Math.min(l.h - T.LADDER_TOP, P.y + T.CLIMB_SPEED * dt); P.moving = 1; if (P.y >= l.h - T.LADDER_TOP) { c.phase = 'top'; c.t = 0; } }
    else if (c.phase === 'top' && c.t >= 1.6) { P.mode = 'top'; P.y = l.h; P.x = l.top.x; P.z = l.top.z; P.climb = null; S.events.push({ t: 'on_top' }); }
    else if (c.phase === 'down') { P.y = Math.max(0, P.y - T.CLIMB_SPEED * dt); P.moving = -1; if (P.y <= 0) { c.phase = 'dismount'; c.t = 0; } }
    else if (c.phase === 'dismount' && c.t >= 0.5) { P.mode = 'ground'; P.y = 0; P.ladder = null; P.climb = null; P.dir = l.face + Math.PI; P.z += Math.cos(P.dir) * 0.3; P.x += Math.sin(P.dir) * 0.3; }
  }

  // ---------- الاختباء في السيارة ----------
  function updateHide(S, dt) {
    const P = S.player, h = P.hide; h.t += dt; P.moving = 0;
    if (h.phase === 'enter' && h.t >= 1.4) { h.phase = 'in'; h.t = 0; S.events.push({ t: 'hidden' }); }
    else if (h.phase === 'in') {
      // وقت الإنذار: إذا حارس يفتش جنب السيارة ممكن يلقاه
      if (S.alarm.on) for (const g of S.guards) {
        if (g.state === 'calm' || g.state === 'out') continue;
        if (len(g.x - h.spot.seat.x, g.z - h.spot.seat.z) < 2.0 && Math.random() < dt * 0.35) {
          g.state = 'alert'; g.meter = 1; P.mode = 'ground'; P.hide = null; P.x = h.spot.x; P.z = h.spot.z; P.y = 0;
          S.events.push({ t: 'found', g: g.id }); caught(S, g); return;
        }
      }
    }
    else if (h.phase === 'exit' && h.t >= 1.1) { P.mode = 'ground'; P.hide = null; P.x = h.spot.x; P.z = h.spot.z; P.y = 0; S.events.push({ t: 'unhide' }); }
  }

  // ---------- كبسولات الغاز المنوّم ----------
  // يرميها على أقرب حارس قدامه (أو 6 م لقدام). وين ما تطيح تطلع سحابة غاز 5 ثواني وصوت يجذب الحراس القريبين.
  // الحارس اللي يبقى في السحابة ينام (الثقيل ياخذ وقت أطول).
  T.GAS = { range: 9, cone: 1.2, cloudR: 2.4, life: 5, flight: 0.65, noise: 6, sleep: { scout: 0.8, tech: 0.9, heavy: 1.6 } };
  T.canThrow = function (S) {
    const P = S.player;
    return S.status === 'play' && P.gas > 0 && !S.subdue && !S.action && (P.mode === 'ground' || P.mode === 'top') && P.stance !== 'crawl';
  };
  T.gasTarget = function (S) {
    const P = S.player; let best = null, bd = 99;
    for (const g of S.guards) {
      if (g.state === 'out') continue;
      const dx = g.x - P.x, dz = g.z - P.z, d = len(dx, dz);
      if (d > T.GAS.range || d >= bd) continue;
      if (Math.abs(angDiff(P.dir, Math.atan2(dx, dz))) > T.GAS.cone) continue;
      best = g; bd = d;
    }
    if (best) return { x: best.x, z: best.z, g: best.id };
    let x = P.x + Math.sin(P.dir) * 6, z = P.z + Math.cos(P.dir) * 6;
    return { x: clamp(x, -S.L.size.w / 2 + 1, S.L.size.w / 2 - 1), z: clamp(z, -S.L.size.d / 2 + 1, S.L.size.d / 2 - 1), g: null };
  };
  T.throwGas = function (S, nab) {
    const P = S.player;
    if (nab ? !(P.nabbah > 0 && S.status === 'play' && !S.subdue && !S.action && (P.mode === 'ground' || P.mode === 'top') && P.stance !== 'crawl') : !T.canThrow(S)) return false;
    // النبّاه يطيح جنب الحارس مو عليه (عشان يلفته)، والغاز على الحارس
    const tg = nab ? (() => { const t = T.gasTarget(S); if (t.g == null) { t.x = P.x + Math.sin(P.dir) * 7; t.z = P.z + Math.cos(P.dir) * 7; } else { t.x += 2.2; } return t; })() : T.gasTarget(S);
    tg.x = clamp(tg.x, -S.L.size.w / 2 + 1, S.L.size.w / 2 - 1); tg.z = clamp(tg.z, -S.L.size.d / 2 + 1, S.L.size.d / 2 - 1);
    if (tg.g != null && !nab) P.dir = Math.atan2(tg.x - P.x, tg.z - P.z);
    S.action = { kind: 'throw', t: 0, need: 0.8, target: tg, released: false, nab: !!nab };
    P.moving = 0;
    return true;
  };
  function updateGas(S, dt) {
    const P = S.player, A = S.action;
    if (A && A.kind === 'throw' && !A.released && A.t >= 0.4) {
      A.released = true; if (A.nab) P.nabbah--; else P.gas--;
      S.shots.push({ x0: P.x + Math.sin(P.dir) * 0.3, z0: P.z + Math.cos(P.dir) * 0.3, y0: (P.y || 0) + 1.5, x1: A.target.x, z1: A.target.z, t: 0, dur: T.GAS.flight, nab: A.nab });
      S.events.push({ t: 'gas_throw', nab: A.nab });
      if (!(P[P.tool] > 0)) T.cycleTool(S);
    }
    for (let i = S.shots.length - 1; i >= 0; i--) {
      const sh = S.shots[i]; sh.t += dt;
      if (sh.t >= sh.dur) {
        S.shots.splice(i, 1);
        if (sh.nab) { // النبّاه: صوت قوي بس، بدون غاز
          S.nabs = S.nabs || []; S.nabs.push({ x: sh.x1, z: sh.z1, t: 0 });
          S.events.push({ t: 'nab_land', x: sh.x1, z: sh.z1 });
          for (const g of S.guards) if ((g.state === 'calm' || g.state === 'suspicious') && len(g.x - sh.x1, g.z - sh.z1) < 9) hear(S, g, sh.x1, sh.z1);
          continue;
        }
        S.clouds.push({ x: sh.x1, z: sh.z1, r: T.GAS.cloudR, t: 0, life: T.GAS.life });
        S.events.push({ t: 'gas_land', x: sh.x1, z: sh.z1 });
        for (const g of S.guards) if (g.state === 'calm' && len(g.x - sh.x1, g.z - sh.z1) < T.GAS.noise) hear(S, g, sh.x1, sh.z1);
      }
    }
    for (let i = S.clouds.length - 1; i >= 0; i--) { const c = S.clouds[i]; c.t += dt; if (c.t >= c.life) S.clouds.splice(i, 1); }
    for (const g of S.guards) {
      if (g.state === 'out') { g.gasT = 0; continue; }
      const inC = S.clouds.some(c => len(g.x - c.x, g.z - c.z) < c.r * Math.min(1, 0.4 + c.t * 1.5));
      g.gasT = inC ? (g.gasT || 0) + dt : Math.max(0, (g.gasT || 0) - dt);
      if (g.gasT >= (T.GAS.sleep[g.type] || 1)) {
        g.state = 'out'; g.outT = T.OUT_TIME; g.meter = 0; g.target = null; g.path = null; g.noticed = false; g.gasT = 0; g.outBy = 'gas';
        S.subdued = (S.subdued || 0) + 1; S.events.push({ t: 'gassed', g: g.id });
      }
    }
    // التقاط كبسولات من الأرض
    (S.L.gasPickups || []).forEach((p, i) => {
      if (!S.picked[i] && P.mode === 'ground' && len(P.x - p.x, P.z - p.z) < 0.9) { S.picked[i] = 1; const k = p.kind || 'gas'; P[k] = (P[k] || 0) + 1; S.events.push({ t: 'gas_pick', n: P[k], kind: k }); }
    });
  }

  // ---------- البوابة المقفلة ----------
  // بوابة المجمّع وشبك الأنابيب: تنشال من العوائق وقت ما تكون الكهربا مقطوعة.
  // البوابة وشبك الأنابيب بقفل كهربائي: تنفتح لما تنقطع الكهربا (المولد)، وتتسكّر إذا رجعت
  function applyGate(S, silent) {
    const L = S.L;
    const open = !L.gateLock || !!(S.power && S.power.off);
    const was = S.gateOpen;
    S.gateOpen = open;
    L.obstacles = open ? L.allObstacles.filter(o => !o.lock) : L.allObstacles;
    if (was !== open || silent) L.grid = buildGrid(L, 0.5);
    if (open && !was && !silent) S.events.push({ t: 'gate_open' });
    if (!open && was && !silent) S.events.push({ t: 'gate_closed' });
  }
  T.applyGate = applyGate;
  T.inCompound = function (S) { const P = S.player; return P.z < (S.L.compoundZ != null ? S.L.compoundZ : -1e9); };
  T.inRoom = function (S) { const R = S.L.room, P = S.player; return !!R && (P.y || 0) < 0.5 && Math.abs(P.x - R.x) < R.w / 2 && Math.abs(P.z - R.z) < R.d / 2; };
  T.objectiveText = function (S) {
    if (S.objectiveTaken) return 'تم';
    if (S.L.objectives) { const o = T.curObjective(S); return o ? o.label : 'تم'; }
    if (T.inRoom(S)) return 'شغّل التسجيل';
    return T.inCompound(S) ? 'دوّر على التسجيل' : 'ادخل المجمّع';
  };

  // ---------- الأدوات: غاز · نبّاه · عازل · زاحف ----------
  T.TOOLS = ['gas', 'nabbah', 'azil', 'zahif'];
  T.TOOL_NAMES = { gas: 'غاز', nabbah: 'نبّاه', azil: 'عازل', zahif: 'زاحف' };
  T.toolCount = function (S, k) { return S.player[k] || 0; };
  T.cycleTool = function (S) {
    const P = S.player, i = T.TOOLS.indexOf(P.tool);
    for (let k = 1; k <= T.TOOLS.length; k++) { const n = T.TOOLS[(i + k) % T.TOOLS.length]; if (P[n] > 0) { P.tool = n; return n; } }
    return P.tool;
  };
  T.canUseTool = function (S) {
    const P = S.player, k = P.tool;
    if (S.status !== 'play' || S.subdue || S.action || !(P.mode === 'ground' || P.mode === 'top') || !(P[k] > 0)) return false;
    if ((k === 'gas' || k === 'nabbah') && P.stance === 'crawl') return false;
    if (k === 'zahif' && P.mode !== 'ground') return false;
    return true;
  };
  T.useTool = function (S) {
    const P = S.player, k = P.tool;
    if (!T.canUseTool(S)) return false;
    if (k === 'gas') return T.throwGas(S);
    if (k === 'nabbah') { const ok = T.throwGas(S, true); return ok; }
    if (k === 'azil') {
      let best = -1, bd = 99;
      (S.L.cameras || []).forEach((c, i) => { const st = S.cams[i]; if (st.off > 0) return; const d = len(c.x - P.x, c.z - P.z); if (d < 11 && d < bd && !blocked(obstaclesFor(S), P.x, P.z, (P.y || 0) + 1.4, c.x, c.z, c.h - 0.3)) { best = i; bd = d; } });
      if (best < 0) { S.events.push({ t: 'azil_none' }); return false; }
      P.azil--; S.cams[best].off = 22; S.cams[best].meter = 0; S.events.push({ t: 'azil', cam: best });
      return true;
    }
    if (k === 'zahif') {
      P.zahif--; S.decoys.push({ x: P.x + Math.sin(P.dir) * 0.6, z: P.z + Math.cos(P.dir) * 0.6, dir: P.dir, t: 0, life: 8, noiseT: 0 });
      S.events.push({ t: 'zahif' }); if (!(P.zahif > 0)) T.cycleTool(S);
      return true;
    }
    return false;
  };
  // الزاحف: قطعة تمشي لقدام بصوت خطوات، والحراس يلحقونها
  function updateDecoys(S, dt) {
    for (let i = S.decoys.length - 1; i >= 0; i--) {
      const d = S.decoys[i]; d.t += dt;
      const px = d.x, pz = d.z; d.x += Math.sin(d.dir) * 1.4 * dt; d.z += Math.cos(d.dir) * 1.4 * dt;
      pushOut(S.L, d, 0.15, 0.3);
      if (len(d.x - px, d.z - pz) < 1.4 * dt * 0.3) d.dir += 1.7; // اصطدم ← يلف
      d.noiseT -= dt;
      if (d.noiseT <= 0) { d.noiseT = 0.7; S.events.push({ t: 'noise', x: d.x, z: d.z, r: 6 }); for (const g of S.guards) if ((g.state === 'calm' || g.state === 'suspicious') && len(g.x - d.x, g.z - d.z) < 6) hear(S, g, d.x, d.z); }
      if (d.t >= d.life) S.decoys.splice(i, 1);
    }
  }
  // ---------- الكاميرات ----------
  T.camDir = function (S, i) { const c = S.L.cameras[i]; return (c.dir || 0) + Math.sin(S.time * (c.speed || 0.5) + i * 1.7) * (c.amp || 0); };
  T.camActive = function (S, i) { return !S.camsDead && !(S.power && S.power.off) && !(S.cams[i] && S.cams[i].off > 0); };
  T.camSees = function (S, i) {
    const c = S.L.cameras[i], P = S.player, st = T.STANCES[P.stance];
    if (!T.camActive(S, i) || T.playerHidden(S)) return false;
    const dx = P.x - c.x, dz = P.z - c.z, d = len(dx, dz);
    if (d > (c.range || 8) * st.range * ((S.L.env && S.L.env.vision) || 1)) return false;
    if (Math.abs(angDiff(T.camDir(S, i), Math.atan2(dx, dz))) > (c.fov || 70) * Math.PI / 360) return false;
    return !blocked(obstaclesFor(S), c.x, c.z, c.h || 3, P.x, P.z, (P.y || 0) + st.h);
  };
  function updateCams(S, dt) {
    (S.L.cameras || []).forEach((c, i) => {
      const st = S.cams[i]; if (st.off > 0) st.off = Math.max(0, st.off - dt);
      st.seen = T.camSees(S, i);
      if (st.seen) st.meter = Math.min(1, st.meter + dt * 1.5 * T.STANCES[S.player.stance].vis); else st.meter = Math.max(0, st.meter - dt * 0.6);
      if (st.meter >= 1) {
        st.meter = 0.3; const P = S.player;
        S.events.push({ t: 'cam_spotted', cam: i });
        S.guards.filter(g => g.state !== 'out').sort((a, b) => len(a.x - P.x, a.z - P.z) - len(b.x - P.x, b.z - P.z)).slice(0, 2).forEach(g => {
          const was = g.state; g.state = 'alert'; g.meter = 1; g.target = [P.x, P.z]; g.lastSeen = [P.x, P.z]; g.path = null; g.searchT = 0;
          if (was !== 'alert') S.events.push({ t: 'alert', g: g.id, why: 'cam' });
        });
        raiseAlarm(S, P.x, P.z);
      }
    });
  }

  T.curObjective = function (S) { return S.L.objectives ? S.L.objectives[S.objIdx] || null : null; };
  T.canInteract = function (S) {
    const P = S.player;
    if (S.L.objectives) { const o = T.curObjective(S); return S.status === 'play' && !!o && o.kind === 'use' && P.mode === 'ground' && len(P.x - o.x, P.z - o.z) < (o.r || 1.9); }
    const o = S.L.objective;
    return S.status === 'play' && !S.objectiveTaken && len(P.x - o.x, P.z - o.z) < 1.9;
  };
  // سلسلة أهداف المرحلة: use (تفاعل بمدة) أو exit (توصل لمكان)
  function advanceObjective(S) {
    const o = T.curObjective(S); if (!o) return;
    S.objIdx++;
    S.events.push({ t: 'obj', i: S.objIdx - 1, text: o.done || '' });
    if (o.power) { S.power.off = true; S.power.t = o.power; S.events.push({ t: 'power_off' }); alarmOff(S, 'power'); }
    if (o.camsOff) { S.camsDead = true; S.events.push({ t: 'cams_dead' }); }
    if (S.objIdx >= S.L.objectives.length) { S.objectiveTaken = true; S.status = 'won'; S.events.push({ t: 'won' }); }
  }
  T.advanceObjective = advanceObjective;
  T.interact = function (S) {
    if (!T.canInteract(S)) return false;
    S.objectiveTaken = true; S.status = 'won'; S.events.push({ t: 'won' });
    return true;
  };

  // ---------- الرؤية ----------
  // العوائق اللي تحجب الرؤية عن ذيبان (لو فوق برج، المنصة اللي واقف عليها ما تحسب)
  function obstaclesFor(S) {
    const P = S.player;
    if (P.mode === 'top' || P.mode === 'climb') { const own = P.ladder && P.ladder.obs; return own ? S.L.obstacles.filter(o => o !== own) : S.L.obstacles; }
    return S.L.obstacles;
  }
  T.playerHidden = function (S) {
    const P = S.player;
    if (P.mode === 'hidden' && P.hide && P.hide.phase === 'in') return true;
    if (P.mode === 'top' && P.stance !== 'stand') return true; // منبطح فوق السطح ما ينشاف من تحت
    return false;
  };
  T.canSee = function (S, g) {
    const P = S.player, st = T.STANCES[P.stance];
    if (T.playerHidden(S)) return false;
    const dx = P.x - g.x, dz = P.z - g.z, d = len(dx, dz);
    const range = g.cfg.range * st.range * (g.state === 'alert' ? 1.25 : 1) * T.rangeMod(S);
    if (d > range) return false;
    // قريب جداً يحس فيه حتى لو على طرف عينه — بس مو من وراه (عشان التخدير)
    const off = Math.abs(angDiff(g.dir, Math.atan2(dx, dz)));
    const close = d < 1.3 && P.stance !== 'crawl' && off < 1.7;
    const fov = g.cfg.fov * (g.state === 'alert' ? 1.3 : 1);
    if (!close && off > fov * Math.PI / 360) return false;
    return !blocked(obstaclesFor(S), g.x, g.z, T.EYE, P.x, P.z, (P.y || 0) + st.h);
  };

  // مخروط الرؤية المقصوص بالجدران — للرسم فقط
  T.visionFan = function (S, g, rays) {
    const fov = g.cfg.fov * (g.state === 'alert' ? 1.3 : 1) * Math.PI / 180;
    const range = g.cfg.range * (g.state === 'alert' ? 1.25 : 1);
    const pts = [];
    for (let i = 0; i <= rays; i++) {
      const a = g.dir - fov / 2 + fov * i / rays;
      const bx = g.x + Math.sin(a) * range, bz = g.z + Math.cos(a) * range;
      let tm = 1;
      for (const o of S.L.obstacles) {
        if (o.y1 < 1.2 || o.y0 > 1.2) continue; // نرسم قص الجدران والصخور العالية فقط
        const s = segBox(g.x, g.z, bx, bz, o); if (s && s[0] < tm) tm = s[0];
      }
      pts.push([g.x + (bx - g.x) * tm, g.z + (bz - g.z) * tm]);
    }
    return pts;
  };

  // ---------- التحديث ----------
  T.update = function (S, input, dt) {
    dt = Math.min(dt, 0.05);
    S.time += dt;
    if (S.status === 'caught') {
      S.caughtT += dt;
      if (S.caughtT > 1.6) T.resetToCheckpoint(S);
      return;
    }
    if (S.status !== 'play') return;
    const P0 = S.player;
    if (S.subdue) updateSubdue(S, dt);
    else if (P0.mode === 'climb') updateClimb(S, dt);
    else if (P0.mode === 'hidden') updateHide(S, dt);
    else if (S.action) updateAction(S, dt);
    else updatePlayer(S, input || {}, dt);
    updateGas(S, dt); updateCams(S, dt); updateDecoys(S, dt);
    for (const g of S.guards) updateGuard(S, g, dt);
    if (S.status === 'play') { updateLights(S, dt); updateAlarm(S, dt); if (S.L.gateLock && S.gateOpen !== !!S.power.off) applyGate(S); }
    checkZones(S);
  };

  // ---------- الكشافات الضوئية ----------
  // بقعة ضوء تمسح الأرض من مصدر عالي. إذا وقف ذيبان فيها مكشوف (مو ورا شيء يحجب الضوء) يمتلي العداد،
  // وإذا امتلى ينذر أقرب حارسين ويرسلهم لمكانه.
  T.lightPos = function (S, l, i) {
    if (i == null) i = (S.L.searchlights || []).indexOf(l);
    const st = S.lights && S.lights[i], t = (st ? st.ph : S.time * l.speed) + (l.phase || 0);
    return [l.cx + Math.sin(t) * l.ax, l.cz + Math.sin(t * 0.73 + 1.1) * l.az];
  };
  T.advanceLights = function (S, dt) {
    (S.L.searchlights || []).forEach((l, i) => { if (S.lights[i]) S.lights[i].ph += dt * l.speed * (S.alarm && S.alarm.on ? 1.7 : 1); });
  };
  T.inLight = function (S, l, i) {
    if (S.power && S.power.off) return false;
    if (S.lights && S.lights[i] && S.lights[i].dead) return false;
    if (T.playerHidden(S)) return false;
    const P = S.player, [lx, lz] = T.lightPos(S, l, i);
    if (len(P.x - lx, P.z - lz) > l.r) return false;
    return !blocked(obstaclesFor(S), l.sx, l.sz, l.sh, P.x, P.z, (P.y || 0) + T.STANCES[P.stance].h);
  };
  function updateLights(S, dt) {
    T.advanceLights(S, dt);
    (S.L.searchlights || []).forEach((l, i) => {
      const st = S.lights[i], lit = T.inLight(S, l, i);
      st.lit = lit;
      if (lit) st.meter = Math.min(1, st.meter + dt * 1.7 * T.STANCES[S.player.stance].vis);
      else st.meter = Math.max(0, st.meter - dt * 0.7);
      if (st.meter >= 1) {
        st.meter = 0.35;
        const P = S.player;
        S.events.push({ t: 'spotted', light: i });
        S.guards.filter(g => g.state !== 'out').sort((a, b) => len(a.x - P.x, a.z - P.z) - len(b.x - P.x, b.z - P.z)).slice(0, 2).forEach(g => {
          const was = g.state;
          g.state = 'alert'; g.meter = 1; g.target = [P.x, P.z]; g.lastSeen = [P.x, P.z]; g.path = null; g.searchT = 0;
          if (was !== 'alert') S.events.push({ t: 'alert', g: g.id, why: 'light' });
        });
        raiseAlarm(S, P.x, P.z);
      }
    });
  }

  function updatePlayer(S, inp, dt) {
    const P = S.player, st = T.STANCES[P.stance];
    let mx = inp.x || 0, mz = inp.z || 0;
    const m = Math.min(1, len(mx, mz));
    if (m < 0.12) { P.moving = 0; P.running = false; }
    else {
      const run = P.stance === 'stand' && P.mode !== 'top' && (inp.run || m > 0.8);
      const sp = (run ? st.run : st.walk) * (run ? 1 : Math.max(0.45, m / 0.8));
      const k = sp / len(mx, mz);
      P.x += mx * k * dt; P.z += mz * k * dt;
      P.dir = Math.atan2(mx, mz);
      P.moving = sp; P.running = run;
    }
    if (P.mode === 'top') { // فوق المنصة: يتحرك داخلها بس
      const pl = P.ladder.plat, m2 = 0.35;
      P.x = clamp(P.x, pl.x - pl.w / 2 + m2, pl.x + pl.w / 2 - m2); P.z = clamp(P.z, pl.z - pl.d / 2 + m2, pl.z + pl.d / 2 - m2);
      P.running = false;
    } else pushOut(S.L, P, T.PLAYER_R, st.clear);
    // الركض يطلع صوت
    P.noiseT -= dt;
    if (P.running && P.noiseT <= 0) {
      P.noiseT = 0.45;
      S.events.push({ t: 'noise', x: P.x, z: P.z, r: T.NOISE_RUN });
      for (const g of S.guards) {
        if (g.state === 'alert' || g.state === 'out') continue;
        if (len(g.x - P.x, g.z - P.z) < T.NOISE_RUN) hear(S, g, P.x, P.z);
      }
    }
  }

  function hear(S, g, x, z) {
    g.meter = Math.max(g.meter, T.SUSPECT + 0.12);
    if (g.state === 'calm') S.events.push({ t: 'suspicious', g: g.id, why: 'noise' });
    g.state = 'suspicious'; g.target = [x, z]; g.path = null; g.searchT = 0;
  }
  T.hear = hear;

  function moveAlong(S, g, speed, dt) {
    if (!g.target) return true;
    if (!g.path || g.pathT <= 0) {
      g.path = T.findPath(S.L, g.x, g.z, g.target[0], g.target[1]) || [g.target];
      g.pathT = g.state === 'alert' ? 0.4 : 1.5;
    }
    g.pathT -= dt;
    let step = speed * dt;
    while (step > 0 && g.path.length) {
      const [tx, tz] = g.path[0];
      const dx = tx - g.x, dz = tz - g.z, d = len(dx, dz);
      if (d < 0.05) { g.path.shift(); continue; }
      const want = Math.atan2(dx, dz);
      turn(g, want, dt * 1.5);
      const s = Math.min(step, d);
      g.x += dx / d * s; g.z += dz / d * s; step -= s;
      if (s >= d) g.path.shift();
    }
    pushOut(S.L, g, g.cfg.r * 0.8, 1.8);
    return !g.path.length;
  }

  function turn(g, want, dt) {
    const d = angDiff(g.dir, want), m = 5 * dt;
    g.dir += Math.abs(d) < m ? d : Math.sign(d) * m;
  }

  function updateGuard(S, g, dt) {
    const P = S.player;
    if (g.state === 'out') {
      g.seen = false; g.outT -= dt;
      if (g.outT <= 0) wake(S, g);
      return;
    }
    if (S.subdue && S.subdue.g === g.id) { g.seen = false; return; } // ينخدّر الحين
    g.seen = T.canSee(S, g);
    // يشوف زميله طايح؟ يروح له
    if (g.state !== 'alert') for (const o of S.guards) {
      if (o.state !== 'out' || o.noticed) continue;
      if (seesPoint(S, g, o.x, o.z, 0.4)) {
        o.noticed = true; g.meter = Math.max(g.meter, 0.6); g.state = 'suspicious'; g.target = [o.x, o.z]; g.path = null; g.searchT = 0;
        S.events.push({ t: 'body', g: g.id, body: o.id });
      }
    }
    const dP = len(P.x - g.x, P.z - g.z);
    if (g.seen) {
      const range = g.cfg.range * T.STANCES[P.stance].range;
      const rate = Math.max(0.5, 2.6 - 2.1 * dP / range) * T.STANCES[P.stance].vis;
      g.meter = Math.min(1, g.meter + rate * dt);
      g.lastSeen = [P.x, P.z];
    }

    // تصعيد الحالة
    if (g.meter >= 1 && g.state !== 'alert') {
      g.state = 'alert'; g.target = g.lastSeen || [P.x, P.z]; g.path = null; g.searchT = 0;
      S.events.push({ t: 'alert', g: g.id });
      raiseAlarm(S, P.x, P.z);
      for (const o of S.guards) if (o !== g && o.state === 'calm' && len(o.x - g.x, o.z - g.z) < T.ALERT_SHARE) {
        o.meter = Math.max(o.meter, 0.55); o.state = 'suspicious'; o.target = [P.x, P.z]; o.path = null; o.searchT = 0;
        S.events.push({ t: 'suspicious', g: o.id, why: 'radio' });
      }
    } else if (g.state === 'calm' && g.meter >= T.SUSPECT) {
      g.state = 'suspicious'; g.target = g.lastSeen; g.path = null; g.searchT = 0;
      S.events.push({ t: 'suspicious', g: g.id, why: 'sight' });
    }

    if (g.state === 'alert') {
      if (g.seen) { g.target = [P.x, P.z]; g.searchT = 0; }
      if (g.seen && dP < T.CATCH + g.cfg.r && (P.y || 0) < 0.5) { caught(S, g); return; }
      if (g.seen && dP < 3) { // قريب: يركض مباشرة
        const want = Math.atan2(P.x - g.x, P.z - g.z); turn(g, want, dt * 2);
        const s = g.cfg.chase * dt; g.x += Math.sin(g.dir) * s; g.z += Math.cos(g.dir) * s; pushOut(S.L, g, g.cfg.r * 0.8, 1.8);
        return;
      }
      const arrived = moveAlong(S, g, g.cfg.chase, dt);
      if (arrived && !g.seen) {
        g.searchT += dt; g.dir += Math.sin(S.time * 2.2) * dt * 2.5;
        if (g.searchT > 5) { g.state = 'suspicious'; g.meter = 0.6; g.searchT = 3; S.events.push({ t: 'lost', g: g.id }); }
      }
      return;
    }

    if (g.state === 'suspicious') {
      if (g.seen) { turn(g, Math.atan2(P.x - g.x, P.z - g.z), dt); return; } // يوقف ويتأمل
      const arrived = moveAlong(S, g, g.cfg.speed * 0.9, dt);
      if (arrived) for (const o of S.guards) if (o.state === 'out' && o.noticed && len(o.x - g.x, o.z - g.z) < 1.8) { wake(S, o); g.meter = Math.max(g.meter, 0.7); }
      const G = S.L.generator;
      if (arrived && G && S.power.off && len(G.x - g.x, G.z - g.z) < 2) { S.power.off = false; S.power.t = 0; S.events.push({ t: 'power_on', by: g.id }); }
      if (arrived) {
        g.searchT += dt; g.dir += Math.sin(S.time * 1.6) * dt * 1.6;
        g.meter = Math.max(0, g.meter - 0.12 * dt);
        if (S.alarm.on && g.searchT > 3) { // وقت الإنذار يفتشون حول آخر مكان انشاف فيه
          const a = (g.id * 2.4 + S.time * 0.7), r = 2 + (g.id * 1.7 + S.time) % 5;
          g.target = [clamp(S.alarm.x + Math.sin(a) * r, -S.L.size.w / 2 + 1, S.L.size.w / 2 - 1), clamp(S.alarm.z + Math.cos(a) * r, -S.L.size.d / 2 + 1, S.L.size.d / 2 - 1)];
          g.path = null; g.searchT = 0; g.meter = Math.max(g.meter, 0.4);
        } else if (g.searchT > 3.5 && g.meter < 0.25) { g.state = 'calm'; g.meter = 0; g.target = null; g.path = null; S.events.push({ t: 'calm', g: g.id }); }
      }
      return;
    }

    // هادئ: دورية
    if (!g.seen) g.meter = Math.max(0, g.meter - 0.25 * dt);
    if (g.route.length === 1) { // حارس واقف يلتفت
      const [hx, hz] = g.route[0];
      if (len(hx - g.x, hz - g.z) > 0.3) { g.target = [hx, hz]; moveAlong(S, g, g.cfg.speed, dt); return; }
      g.sweep += dt; turn(g, (g.home != null ? g.home : (g.home = g.dir)) + Math.sin(g.sweep * 0.6) * g.look, dt);
      return;
    }
    if (g.waitT > 0) { g.waitT -= dt; g.sweep += dt; g.dir += Math.cos(g.sweep * 1.8) * g.look * dt * 1.2; return; }
    const wpt = g.route[g.wp];
    if (!g.target || g.target[0] !== wpt[0] || g.target[1] !== wpt[1]) { g.target = wpt; g.path = null; }
    if (moveAlong(S, g, g.cfg.speed, dt)) { g.wp = (g.wp + 1) % g.route.length; g.waitT = g.wait; g.sweep = 0; g.target = null; }
  }

  function seesPoint(S, g, x, z, h) {
    const dx = x - g.x, dz = z - g.z, d = len(dx, dz);
    if (d > g.cfg.range) return false;
    if (Math.abs(angDiff(g.dir, Math.atan2(dx, dz))) > g.cfg.fov * Math.PI / 360) return false;
    return !blocked(S.L.obstacles, g.x, g.z, T.EYE, x, z, h);
  }
  function wake(S, g) {
    g.state = 'suspicious'; g.meter = 0.5; g.outT = 0; g.target = [g.x, g.z]; g.path = null; g.searchT = 0;
    S.events.push({ t: 'woke', g: g.id });
  }

  function caught(S, g) {
    S.status = 'caught'; S.caughtT = 0; S.catches++;
    S.events.push({ t: 'caught', g: g.id });
  }

  function checkZones(S) {
    const P = S.player, L = S.L;
    const co = T.curObjective(S);
    if (co && co.kind === 'exit' && P.mode === 'ground' && len(P.x - co.x, P.z - co.z) < (co.r || 1.6)) advanceObjective(S);
    L.checkpoints.forEach((c, i) => {
      if (i !== S.checkpoint.idx && P.mode === 'ground' && len(P.x - c.x, P.z - c.z) < c.r) { // آخر نقطة يمر عليها هي اللي تنحفظ
        S.checkpoint = { x: c.x, z: c.z, idx: i, gas: P.gas, picked: Object.assign({}, S.picked), dead: S.lights.map(l => !!l.dead), tools: { nabbah: P.nabbah, azil: P.azil, zahif: P.zahif }, objIdx: S.objIdx }; S.events.push({ t: 'checkpoint', i });
      }
    });
    (L.radio || []).forEach((r, i) => {
      if (!S.radioDone[i] && len(P.x - r.x, P.z - r.z) < r.r) { S.radioDone[i] = 1; S.events.push({ t: 'radio', who: r.who, text: r.text }); }
    });
  }

  T.alertLevel = function (S) {
    let lv = 0, meter = 0;
    for (const g of S.guards) { if (g.state === 'out') continue; lv = Math.max(lv, g.state === 'alert' ? 2 : g.state === 'suspicious' ? 1 : 0); meter = Math.max(meter, g.meter); }
    for (const l of S.lights || []) meter = Math.max(meter, l.meter);
    for (const c of S.cams || []) meter = Math.max(meter, c.meter);
    if (S.alarm && S.alarm.on) lv = 2;
    return { level: lv, meter };
  };

  // ممرات اللاعب (مع الزحف) — للتأكد إن المرحلة قابلة للعب
  T.playerReachable = function (L, from, to) {
    const cell = 0.4, nx = Math.round(L.size.w / cell), nz = Math.round(L.size.d / cell), ox = -L.size.w / 2, oz = -L.size.d / 2;
    const ok = (i, j) => { const p = { x: ox + (i + 0.5) * cell, z: oz + (j + 0.5) * cell };
      for (const o of L.obstacles) if (solidFor(o, T.STANCES.crawl.clear) && Math.abs(p.x - o.x) < o.w / 2 + T.PLAYER_R && Math.abs(p.z - o.z) < o.d / 2 + T.PLAYER_R) return false; return true; };
    const ci = p => [Math.floor((p.x - ox) / cell), Math.floor((p.z - oz) / cell)];
    const s = ci(from), t = ci(to), seen = new Uint8Array(nx * nz), q = [s]; seen[s[0] + s[1] * nx] = 1;
    while (q.length) { const [i, j] = q.shift(); if (Math.abs(i - t[0]) <= 2 && Math.abs(j - t[1]) <= 2) return true;
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + a, nj = j + b; if (ni < 0 || nj < 0 || ni >= nx || nj >= nz || seen[ni + nj * nx] || !ok(ni, nj)) continue; seen[ni + nj * nx] = 1; q.push([ni, nj]); } }
    return false;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = T; else root.TH = T;
})(typeof globalThis !== 'undefined' ? globalThis : this);

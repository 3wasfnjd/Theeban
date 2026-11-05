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
    L.obstacles = data.obstacles.map(normObstacle);
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
      player: { x: L.start.x, z: L.start.z, dir: L.start.dir || Math.PI, stance: 'stand', moving: 0, running: false, noiseT: 0 },
      checkpoint: { x: L.start.x, z: L.start.z, idx: -1 },
      guards: [], events: [], radioDone: {}, caughtT: 0, catches: 0, objectiveTaken: false
    };
    S.guards = L.guards.map((g, i) => newGuard(g, i));
    return S;
  };

  function newGuard(g, i) {
    const p = g.route[0];
    return {
      id: i, type: g.type, cfg: T.GUARD_TYPES[g.type], route: g.route, wait: g.wait == null ? 1.2 : g.wait, look: g.look || 0.9,
      x: p[0], z: p[1], dir: g.dir != null ? g.dir : 0, wp: 1 % g.route.length, waitT: 0, sweep: 0,
      state: 'calm', meter: 0, seen: false, target: null, path: null, pathT: 0, searchT: 0, lastSeen: null, home: null
    };
  }

  T.resetToCheckpoint = function (S) {
    const P = S.player;
    P.x = S.checkpoint.x; P.z = S.checkpoint.z; P.stance = 'stand'; P.moving = 0; P.running = false;
    S.guards = S.L.guards.map((g, i) => newGuard(g, i));
    S.status = 'play'; S.caughtT = 0;
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

  T.canInteract = function (S) {
    const o = S.L.objective, P = S.player;
    return S.status === 'play' && !S.objectiveTaken && len(P.x - o.x, P.z - o.z) < 1.9;
  };
  T.interact = function (S) {
    if (!T.canInteract(S)) return false;
    S.objectiveTaken = true; S.status = 'won'; S.events.push({ t: 'won' });
    return true;
  };

  // ---------- الرؤية ----------
  T.canSee = function (S, g) {
    const P = S.player, st = T.STANCES[P.stance];
    const dx = P.x - g.x, dz = P.z - g.z, d = len(dx, dz);
    const range = g.cfg.range * st.range * (g.state === 'alert' ? 1.25 : 1);
    if (d > range) return false;
    const close = d < 1.3 && P.stance !== 'crawl';
    if (!close) {
      const a = Math.atan2(dx, dz);
      const fov = g.cfg.fov * (g.state === 'alert' ? 1.3 : 1);
      if (Math.abs(angDiff(g.dir, a)) > fov * Math.PI / 360) return false;
    }
    return !blocked(S.L.obstacles, g.x, g.z, T.EYE, P.x, P.z, st.h);
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
    updatePlayer(S, input || {}, dt);
    for (const g of S.guards) updateGuard(S, g, dt);
    checkZones(S);
  };

  function updatePlayer(S, inp, dt) {
    const P = S.player, st = T.STANCES[P.stance];
    let mx = inp.x || 0, mz = inp.z || 0;
    const m = Math.min(1, len(mx, mz));
    if (m < 0.12) { P.moving = 0; P.running = false; }
    else {
      const run = P.stance === 'stand' && (inp.run || m > 0.8);
      const sp = (run ? st.run : st.walk) * (run ? 1 : Math.max(0.45, m / 0.8));
      const k = sp / len(mx, mz);
      P.x += mx * k * dt; P.z += mz * k * dt;
      P.dir = Math.atan2(mx, mz);
      P.moving = sp; P.running = run;
    }
    pushOut(S.L, P, T.PLAYER_R, st.clear);
    // الركض يطلع صوت
    P.noiseT -= dt;
    if (P.running && P.noiseT <= 0) {
      P.noiseT = 0.45;
      S.events.push({ t: 'noise', x: P.x, z: P.z, r: T.NOISE_RUN });
      for (const g of S.guards) {
        if (g.state === 'alert') continue;
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
    g.seen = T.canSee(S, g);
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
      if (g.seen && dP < T.CATCH + g.cfg.r) { caught(S, g); return; }
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
      if (arrived) {
        g.searchT += dt; g.dir += Math.sin(S.time * 1.6) * dt * 1.6;
        g.meter = Math.max(0, g.meter - 0.12 * dt);
        if (g.searchT > 3.5 && g.meter < 0.25) { g.state = 'calm'; g.meter = 0; g.target = null; g.path = null; S.events.push({ t: 'calm', g: g.id }); }
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

  function caught(S, g) {
    S.status = 'caught'; S.caughtT = 0; S.catches++;
    S.events.push({ t: 'caught', g: g.id });
  }

  function checkZones(S) {
    const P = S.player, L = S.L;
    L.checkpoints.forEach((c, i) => {
      if (i > S.checkpoint.idx && len(P.x - c.x, P.z - c.z) < c.r) {
        S.checkpoint = { x: c.x, z: c.z, idx: i }; S.events.push({ t: 'checkpoint', i });
      }
    });
    (L.radio || []).forEach((r, i) => {
      if (!S.radioDone[i] && len(P.x - r.x, P.z - r.z) < r.r) { S.radioDone[i] = 1; S.events.push({ t: 'radio', who: r.who, text: r.text }); }
    });
  }

  T.alertLevel = function (S) {
    let lv = 0, meter = 0;
    for (const g of S.guards) { lv = Math.max(lv, g.state === 'alert' ? 2 : g.state === 'suspicious' ? 1 : 0); meter = Math.max(meter, g.meter); }
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

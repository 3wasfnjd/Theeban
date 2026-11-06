// ذيبان — رسم المهمات 2–5 من حزمة أصول ذيبان (theeban/ في مستودع أصول عبودين):
// الأجواء (ليل · أنفاق · عاصفة · داخلي)، أغراض المرحلة، قطع الأنفاق من الخريطة، الكاميرات ومخاريطها،
// علامة الهدف، الزاحف والنبّاه.
(function (root) {
  'use strict';
  const THREE = root.THREE, TH = root.TH;
  const ST = {};

  // ---------- أصل من الحزمة (نبنيه مرة ونكرر النسخ) ----------
  const builtCache = {};
  function aa(id, params) {
    try {
      const A = root.AA && root.AA.assets && root.AA.assets[id], X = root.AA && root.AA.three;
      if (!A || !X) return null;
      const key = id + JSON.stringify(params || {});
      const b = builtCache[key] || (builtCache[key] = X.build(A.generate(root.AA.params(A, params || {}), 'med'), 'med'));
      const g = X.instance(b);
      g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      return g;
    } catch (e) { console.warn('tb asset', id, e && e.message); return null; }
  }
  ST.aa = aa;

  let softTex = null;
  function soft() {
    if (softTex) return softTex;
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return (softTex = new THREE.CanvasTexture(c));
  }
  function pool(r, color, op) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: soft(), color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 2; return m;
  }
  const LIGHTC = { teal: 0x33e0d0, warm: 0xffbf6a, alarm: 0xff3020 };

  // ---------- الأجواء ----------
  ST.env = function (ctx, L) {
    const k = (L.env && L.env.kind) || 'night', sc = ctx.scene;
    ctx.envKind = k;
    if (k === 'tunnel' || k === 'indoor') {
      for (const o of [ctx.sky.sky, ctx.sky.stars, ctx.sky.moon, ctx.sky.mountains]) o.visible = false;
      sc.background = new THREE.Color(k === 'tunnel' ? 0x030304 : 0x05080b);
      sc.fog = new THREE.Fog(k === 'tunnel' ? 0x050608 : 0x081016, 16, 46);
      ctx.ground.material = new THREE.MeshLambertMaterial({ color: k === 'tunnel' ? 0x1c1915 : 0x47505a });
      ctx.hemi.color.setHex(k === 'tunnel' ? 0x8a7a66 : 0x6d8ea8); ctx.hemi.groundColor.setHex(0x16120e);
      ctx.moon.intensity = k === 'tunnel' ? 0.22 : 0.4; ctx.moon.color.setHex(k === 'tunnel' ? 0xffd6a0 : 0x9fd8ff);
      ctx.baseHemi = k === 'tunnel' ? 0.55 : 0.75;
    } else if (k === 'storm') {
      ctx.sky.stars.visible = false; ctx.sky.moon.visible = false;
      sc.fog = new THREE.Fog(0x3a2c20, 7, 34);
      ctx.hemi.color.setHex(0x9a7c5c); ctx.baseHemi = 0.85;
      ctx.moon.intensity = 0.4; ctx.moon.color.setHex(0xd8b48a);
      ctx.storm = stormFx(sc);
    } else ctx.baseHemi = 0.9;
  };

  // رمل طاير بقوة (العاصفة): خطوط تمشي أفقياً حول الكاميرا
  function stormFx(scene) {
    const N = 900, pos = new Float32Array(N * 6), seed = [];
    for (let i = 0; i < N; i++) seed.push([Math.random() * 60 - 30, Math.random() * 8, Math.random() * 60 - 30, 0.4 + Math.random() * 0.8]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xd8b07a, transparent: true, opacity: 0.35, depthWrite: false }));
    m.frustumCulled = false; scene.add(m);
    return { m, seed, N };
  }
  function updateStorm(F, cx, cz, t) {
    const p = F.m.geometry.attributes.position;
    for (let i = 0; i < F.N; i++) {
      const s = F.seed[i], sp = 14 * s[3];
      const x = cx + ((s[0] + t * sp) % 60 + 60) % 60 - 30, z = cz + ((s[2] + t * sp * 0.35) % 60 + 60) % 60 - 30, y = s[1] + Math.sin(t * 2 + i) * 0.3;
      p.setXYZ(i * 2, x, y, z); p.setXYZ(i * 2 + 1, x - 0.9 * s[3], y + 0.05, z - 0.3 * s[3]);
    }
    p.needsUpdate = true;
  }

  // ---------- قطع الأنفاق من الخريطة ----------
  const ROT = { s: 'e', e: 'n', n: 'w', w: 's' }; // rotation.y = +90° يحوّل الجهة كذا
  const BASE = { end: ['s'], straight: ['n', 's'], corner: ['s', 'e'], tee: ['n', 's', 'e'], cross: ['n', 's', 'e', 'w'] };
  function pieceFor(open) {
    const n = open.length;
    const kind = n === 1 ? 'end' : n === 2 ? ((open.includes('n') && open.includes('s')) || (open.includes('e') && open.includes('w')) ? 'straight' : 'corner') : n === 3 ? 'tee' : 'cross';
    let set = BASE[kind].slice();
    for (let k = 0; k < 4; k++) {
      if (set.length === n && set.every(d => open.includes(d))) return { kind, rot: k * Math.PI / 2 };
      set = set.map(d => ROT[d]);
    }
    return { kind, rot: 0 };
  }
  function buildTunnel(ctx, L) {
    const T0 = L.tunnel, c = T0.cell, M = T0.map, sc = ctx.scene;
    const at = (i, j) => (M[j] && M[j][i]) || '#';
    const rocks = [];
    const hallFloor = new THREE.MeshLambertMaterial({ color: 0x6f6a60 }), hallWall = new THREE.MeshLambertMaterial({ color: 0x847d70 });
    M.forEach((row, j) => [...row].forEach((ch, i) => {
      const x = T0.ox + (i + 0.5) * c, z = T0.oz + (j + 0.5) * c;
      if (ch === '#') { rocks.push([x, z, c, c]); return; }
      const light = (T0.lights && T0.lights[i + ',' + j]) || 'teal';
      if (ch === 'D') {
        const vert = at(i, j - 1) !== '#' && at(i, j + 1) !== '#', sw = c / 2 - 0.55;
        const d = aa('tb_crawl_duct', { length: c, kind: 'duct' }); if (d) { d.position.set(x, 0, z); d.rotation.y = vert ? 0 : Math.PI / 2; sc.add(d); }
        if (vert) rocks.push([x - 0.55 - sw / 2, z, sw, c], [x + 0.55 + sw / 2, z, sw, c]); else rocks.push([x, z - 0.55 - sw / 2, c, sw], [x, z + 0.55 + sw / 2, c, sw]);
        return;
      }
      const open = []; if (at(i, j - 1) !== '#') open.push('n'); if (at(i, j + 1) !== '#') open.push('s'); if (at(i + 1, j) !== '#') open.push('e'); if (at(i - 1, j) !== '#') open.push('w');
      if (ch === 'P') { // قاعة المضخات: أرضية وجدران كاملة على الجهات المقفولة (بدون أعمدة)
        const f = new THREE.Mesh(new THREE.BoxGeometry(c, 0.2, c), hallFloor); f.position.set(x, -0.1, z); f.receiveShadow = true; sc.add(f);
        const wall = (wx, wz, w, d) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 3.2, d), hallWall); m.position.set(wx, 1.6, wz); m.castShadow = m.receiveShadow = true; sc.add(m); };
        if (!open.includes('n')) wall(x, z - c / 2 + 0.15, c, 0.3); if (!open.includes('s')) wall(x, z + c / 2 - 0.15, c, 0.3);
        if (!open.includes('w')) wall(x - c / 2 + 0.15, z, 0.3, c); if (!open.includes('e')) wall(x + c / 2 - 0.15, z, 0.3, c);
        if ((i + j) % 2 === 0) { const p = pool(3.4, 0xcfe8ff, 0.18); p.position.set(x, 0.03, z); sc.add(p); }
        return;
      }
      const pc = pieceFor(open);
      const g = aa('tb_tunnel', { kind: pc.kind, lights: light, water: (i * 7 + j * 3) % 5 === 0, pipes: true, seed: (i * 13 + j * 7) % 5 + 1 });
      if (g) { g.position.set(x, 0, z); g.rotation.y = pc.rot; sc.add(g); }
      if (light !== 'off') { const p = pool(2.6, LIGHTC[light] || 0x33e0d0, 0.2); p.position.set(x, 0.03, z); sc.add(p); }
    }));
    // كتل الصخر بين الأنفاق (نسخة وحدة لكل الكتل)
    const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
    const im = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0x2b241d }), rocks.length);
    const m4 = new THREE.Matrix4();
    rocks.forEach(([x, z, w, d], k) => { m4.makeScale(w, 3.15 + (k % 3) * 0.05, d); m4.setPosition(x, 0, z); im.setMatrixAt(k, m4); });
    im.receiveShadow = true; sc.add(im);
  }

  // ---------- البناء ----------
  ST.build = function (ctx, L) {
    const sc = ctx.scene, S = {};
    ST.env(ctx, L);
    if (L.tunnel) buildTunnel(ctx, L);
    if (L.env && L.env.kind === 'indoor') { // أرضية المنشأة: بقع ضوء فيروزية من السقف، وتوهّج تحت السديم
      for (let x = -16; x <= 16; x += 8) for (let z = -16; z <= 16; z += 8) { const p = pool(3.6, 0x5fd8e8, 0.14); p.position.set(x, 0.03, z); sc.add(p); }
      const core = (L.props || []).find(p => p.id === 'tb_sadeem_core');
      if (core) { const p = pool(10, 0xff4030, 0.22); p.position.set(core.x, 0.04, core.z); sc.add(p); }
    }
    for (const pr of L.props || []) {
      const g = aa(pr.id, Object.assign(pr.id === 'tb_room' ? { cutaway: true } : {}, pr.p || {}));
      if (!g) continue;
      g.position.set(pr.x, pr.y || 0, pr.z); g.rotation.y = pr.rot || 0; sc.add(g);
      if (pr.id === 'tb_floodlight') { const p = pool(5, 0xffe2b0, 0.25); p.position.set(pr.x, 0.04, pr.z); sc.add(p); }
    }
    // الكاميرات: الموديل يلف مع اتجاهها، ومخروط على الأرض يتلون بحالتها
    S.cams = (L.cameras || []).map(c => {
      const g = aa('tb_camera', { mount: c.mount || 'pole', cone: false, sweep: false }) || new THREE.Group();
      g.position.set(c.x, 0, c.z); sc.add(g);
      const RAYS = 16, geo = new THREE.BufferGeometry(), pos = new Float32Array((RAYS + 2) * 3), idx = [];
      for (let i = 0; i < RAYS; i++) idx.push(0, i + 1, i + 2);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
      const cone = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x4fd27a, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
      cone.frustumCulled = false; cone.renderOrder = 2; sc.add(cone);
      const led = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft(), color: 0x4fd27a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      led.scale.set(0.7, 0.7, 1); led.position.set(c.x, c.h + 0.1, c.z); sc.add(led);
      return { c, g, cone, led, RAYS };
    });
    // علامة الهدف: حلقة تنبض وعمود ضوء خفيف
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 36), new THREE.MeshBasicMaterial({ color: 0x3fd0c4, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.renderOrder = 3; sc.add(ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 6, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0x3fd0c4, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    sc.add(beam);
    S.obj = { ring, beam };
    S.decoys = new Map(); S.nabs = new Map();
    return S;
  };

  // ---------- كل إطار ----------
  ST.update = function (ctx, S, dt, t) {
    const G = ctx.stage, L = S.L; if (!G) return;
    if (ctx.storm) updateStorm(ctx.storm, S.player.x, S.player.z, t);
    G.cams.forEach((o, i) => {
      const st = S.cams[i], dir = TH.camDir(S, i), on = TH.camActive(S, i), c = o.c;
      o.g.rotation.y = dir;
      const fov = (c.fov || 70) * Math.PI / 180, R = (c.range || 8) * ((L.env && L.env.vision) || 1);
      const pos = o.cone.geometry.attributes.position; pos.setXYZ(0, c.x, 0.06, c.z);
      for (let k = 0; k <= o.RAYS; k++) {
        const a = dir - fov / 2 + fov * k / o.RAYS; let bx = c.x + Math.sin(a) * R, bz = c.z + Math.cos(a) * R, tm = 1;
        for (const ob of L.obstacles) { if (ob.y1 < 1.2 || ob.y0 > 1.2) continue; const s = TH.segBox(c.x, c.z, bx, bz, ob); if (s && s[0] < tm) tm = s[0]; }
        pos.setXYZ(k + 1, c.x + (bx - c.x) * tm, 0.06, c.z + (bz - c.z) * tm);
      }
      pos.needsUpdate = true;
      const col = !on ? 0x667080 : st.meter > 0.6 || (S.alarm && S.alarm.on) ? 0xff4d3d : st.meter > 0.05 ? 0xf2c23a : 0x4fd27a;
      o.cone.visible = on; o.cone.material.color.setHex(col); o.cone.material.opacity = st.seen ? 0.28 : 0.15;
      o.led.material.color.setHex(on ? col : 0x223040); o.led.material.opacity = on ? (st.seen && Math.floor(t * 8) % 2 ? 0.4 : 0.95) : (st.off > 0 && Math.floor(t * 3) % 2 ? 0.6 : 0.15);
    });
    const o = TH.curObjective(S);
    G.obj.ring.visible = G.obj.beam.visible = !!o && S.status === 'play';
    if (o) {
      const k = 1 + Math.sin(t * 3) * 0.1, ex = o.kind === 'exit', col = ex ? 0xe8e2c8 : 0x3fd0c4;
      G.obj.ring.position.set(o.x, 0.05, o.z); G.obj.ring.scale.setScalar(k * (o.r || 1.2));
      G.obj.beam.position.set(o.x, 3, o.z); G.obj.ring.material.color.setHex(col); G.obj.beam.material.color.setHex(col);
    }
    // الزاحف: قطعة تمشي ورجولها تتحرك
    for (const d of S.decoys) {
      if (!G.decoys.has(d)) { const m = aa('tb_zahif', { size: 2.2, active: true }) || new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.4), new THREE.MeshLambertMaterial({ color: 0x8a8070 })); ctx.scene.add(m); G.decoys.set(d, m); }
      const m = G.decoys.get(d); m.position.set(d.x, Math.abs(Math.sin(t * 18)) * 0.03, d.z); m.rotation.y = d.dir;
    }
    for (const [d, m] of G.decoys) if (!S.decoys.includes(d)) { ctx.scene.remove(m); G.decoys.delete(d); }
    // النبّاه: يطيح ويرمش ثواني
    for (const n of S.nabs || []) {
      n.t += dt;
      if (!G.nabs.has(n)) { const m = aa('tb_nabbah', { size: 2.5, active: true }) || new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xffaa33 })); m.position.set(n.x, 0, n.z); ctx.scene.add(m); G.nabs.set(n, m); }
    }
    if (S.nabs) for (let i = S.nabs.length - 1; i >= 0; i--) if (S.nabs[i].t > 6) { const m = G.nabs.get(S.nabs[i]); if (m) ctx.scene.remove(m); G.nabs.delete(S.nabs[i]); S.nabs.splice(i, 1); }
  };

  root.STAGE = ST;
})(typeof globalThis !== 'undefined' ? globalThis : this);

// ذيبان — الرسم بـ Three.js. كل الأشكال مبنية بالكود (نموذج رمادي).
// موديلات الشخصيات تنركّب لاحقاً مكان الأجسام المؤقتة: makePlayer / makeGuard (انظر README).
(function (root) {
  'use strict';
  const THREE = root.THREE, TH = root.TH, FX = root.FX;
  const W = {};

  const COL = {
    sky: 0x0b1018, fog: 0x0f1622, sand: 0x6a5842, sandFar: 0x5a4a39, rock: 0x7d7262, rockDark: 0x675d50,
    crate: 0x7a5a36, crateEdge: 0x3a2914, concrete: 0x6f6c66, concreteDark: 0x55534e, metal: 0x56636c,
    teal: 0x3fd0c4, calm: 0x4fd27a, sus: 0xf2c23a, alert: 0xff4d3d,
    theeban: 0x34373c, theebanHood: 0x4a4d52, scarf: 0xc8743a,
    scout: 0x6f6b5e, scoutMark: 0xf0c03a, heavy: 0x3a3e44, heavyPack: 0x24272b, tech: 0xb3b6ba, techStripe: 0xf4f4f0, visor: 0x1a2a33
  };
  W.COL = COL;

  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  const matCache = {};
  function mat(color, opts) {
    const k = color + JSON.stringify(opts || {});
    if (!matCache[k]) matCache[k] = new THREE.MeshLambertMaterial(Object.assign({ color, flatShading: true }, opts || {}));
    return matCache[k];
  }
  function box(w, h, d, color, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
    m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; m.receiveShadow = true; return m;
  }

  // صخرة: صندوق مقسّم ونقاطه مهزوزة شوي (تبقى داخل حدود التصادم تقريباً)
  function rockMesh(o, r) {
    const g = new THREE.BoxGeometry(o.w, o.h, o.d, 3, 2, 3);
    const p = g.attributes.position, seen = {};
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), key = x.toFixed(3) + y.toFixed(3) + z.toFixed(3);
      if (!seen[key]) {
        const top = y > 0 ? 1 : 0;
        seen[key] = [x * (0.86 + r() * 0.12) * (top ? 0.88 : 1), y + (top ? (r() - 0.6) * 0.35 : 0), z * (0.86 + r() * 0.12) * (top ? 0.88 : 1)];
      }
      p.setXYZ(i, ...seen[key]);
    }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat(r() > 0.5 ? COL.rock : COL.rockDark));
    m.position.set(o.x, o.h / 2, o.z); m.castShadow = m.receiveShadow = true;
    return m;
  }

  function crateMesh(o) {
    const grp = new THREE.Group();
    grp.add(box(o.w, o.h, o.d, COL.crate, 0, o.h / 2, 0));
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(o.w + 0.02, o.h + 0.02, o.d + 0.02)), new THREE.LineBasicMaterial({ color: COL.crateEdge }));
    e.position.y = o.h / 2; grp.add(e);
    grp.add(box(o.w * 1.02, 0.08, 0.12, COL.crateEdge, 0, o.h * 0.5, o.d / 2));
    grp.position.set(o.x, 0, o.z);
    return grp;
  }

  // مبنى خربان: كتلة مصمتة (نفس حدود التصادم) وأعلاها مكسّر بارتفاعات مختلفة
  function ruinMesh(o, r) {
    const grp = new THREE.Group(), base = o.h * 0.6;
    grp.add(box(o.w, base, o.d, COL.concreteDark, 0, base / 2, 0));
    const nx = 4, nz = 3;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      if (r() < 0.3) continue;
      const h = (o.h - base) * (0.3 + r() * 0.7);
      grp.add(box(o.w / nx, h, o.d / nz, (i + j) % 2 ? COL.concrete : COL.concreteDark, -o.w / 2 + (i + 0.5) * o.w / nx, base + h / 2, -o.d / 2 + (j + 0.5) * o.d / nz));
    }
    for (let k = 0; k < 3; k++) grp.add(box(0.7, 1.2, 0.08, 0x1c1f24, -o.w / 2 + 1 + k * (o.w - 2) / 2, 1.2, o.d / 2 + 0.03)); // شبابيك
    grp.position.set(o.x, 0, o.z);
    return grp;
  }

  function pipeMesh(o) {
    const grp = new THREE.Group();
    const m = mat(COL.metal);
    for (const [y, rr] of [[o.y0 + 0.2, 0.2], [o.y0 + 0.6, 0.2]]) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, o.w + 0.6, 10), m);
      c.rotation.z = Math.PI / 2; c.position.y = y; c.castShadow = true; grp.add(c);
    }
    for (const x of [-o.w / 2, 0, o.w / 2]) grp.add(box(0.15, o.y0, 0.6, COL.concreteDark, x, o.y0 / 2, 0));
    grp.position.set(o.x, 0, o.z);
    return grp;
  }

  function towerMesh(o, S) {
    const grp = new THREE.Group();
    grp.add(box(o.w, 2.6, o.d, COL.concrete, 0, 1.3, 0));
    grp.add(box(1.1, 2.0, 0.1, 0x2a2e33, 0, 1.0, o.d / 2 + 0.03)); // الباب
    const H = 11, legs = [[-1.4, -1.4], [1.4, -1.4], [1.4, 1.4], [-1.4, 1.4]];
    for (const [x, z] of legs) grp.add(box(0.16, H - 2.6, 0.16, COL.metal, x * 0.8, 2.6 + (H - 2.6) / 2, z * 0.8));
    for (let y = 3.6; y < H; y += 1.6) for (let k = 0; k < 4; k++) {
      const a = legs[k], b = legs[(k + 1) % 4];
      const bar = box(Math.abs(a[0] - b[0]) * 0.8 || 0.08, 0.08, Math.abs(a[1] - b[1]) * 0.8 || 0.08, COL.metal, (a[0] + b[0]) * 0.4, y, (a[1] + b[1]) * 0.4);
      grp.add(bar);
    }
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 6, 0, Math.PI * 2, 0, Math.PI / 3), mat(0xb9bcc0, { side: THREE.DoubleSide }));
    dish.rotation.x = -Math.PI / 2.4; dish.position.set(0, H - 1.5, 1.2); grp.add(dish);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3020 }));
    lamp.position.y = H + 0.2; grp.add(lamp); S.blink = lamp;
    grp.position.set(o.x, 0, o.z);
    grp.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return grp;
  }

  // عمود إنارة: رأس مضيء وبقعة ضوء مزيفة على الأرض (بدل أضواء حقيقية كثيرة — أخف على الجوال)
  let poolTex = null;
  function lightPool(radius, color) {
    if (!poolTex) {
      const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
      const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.5, 'rgba(255,255,255,0.3)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 128, 128); poolTex = new THREE.CanvasTexture(c);
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), new THREE.MeshBasicMaterial({ map: poolTex, color, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.03; m.renderOrder = 1; return m;
  }
  function lampPost(x, z, color) {
    const grp = new THREE.Group();
    grp.add(box(0.14, 4, 0.14, COL.metal, 0, 2, 0));
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff2c8 }));
    head.position.y = 4.05; grp.add(head);
    grp.add(lightPool(5, color || 0xffd9a0));
    grp.position.set(x, 0, z); return grp;
  }

  // ---------- الشخصيات (أجسام مؤقتة) ----------
  // ذيبان: جسم فحمي، غطاء رأس، ووشاح برتقالي رملي يبان من فوق
  function makePlayer() {
    const root = new THREE.Group(), pose = new THREE.Group(); root.add(pose);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.8, 4, 10), mat(COL.theeban)); body.position.y = 0.72; body.castShadow = true; pose.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), mat(COL.theebanHood)); head.position.y = 1.42; head.castShadow = true; pose.add(head);
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.07, 6, 12), mat(COL.scarf)); scarf.rotation.x = Math.PI / 2; scarf.position.y = 1.22; pose.add(scarf);
    const tail = box(0.12, 0.05, 0.42, COL.scarf, 0, 1.22, -0.36); pose.add(tail); // طرف الوشاح
    const pack = box(0.38, 0.4, 0.18, 0x2b2d31, 0, 0.95, -0.27); pose.add(pack);
    const face = box(0.2, 0.08, 0.06, COL.scarf, 0, 1.33, 0.18); pose.add(face);
    root.userData = { pose, tail };
    return root;
  }

  function makeGuard(type) {
    const root = new THREE.Group(), pose = new THREE.Group(); root.add(pose);
    const wide = type === 'heavy' ? 1.35 : type === 'scout' ? 0.85 : 1;
    const color = COL[type];
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.85, 4, 10), mat(color)); body.scale.set(wide, 1, wide); body.position.y = 0.75; body.castShadow = true; pose.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 8), mat(color)); head.position.y = 1.5; head.castShadow = true; pose.add(head);
    pose.add(box(0.3, 0.1, 0.12, COL.visor, 0, 1.52, 0.17)); // النظارة: تبين وين يطالع
    if (type === 'scout') { pose.add(box(0.62, 0.1, 0.36, COL.scoutMark, 0, 1.22, 0)); pose.add(box(0.3, 0.32, 0.16, 0x4a473f, 0, 0.98, -0.26)); }
    if (type === 'heavy') { pose.add(box(0.6, 0.62, 0.3, COL.heavyPack, 0, 0.95, -0.42)); pose.add(box(0.95, 0.14, 0.5, color, 0, 1.25, 0)); }
    if (type === 'tech') { pose.add(box(0.5, 0.08, 0.58, COL.techStripe, 0, 0.95, 0)); pose.add(box(0.36, 0.22, 0.16, 0xd2a640, 0.3, 0.55, 0.05)); }
    // مصباح يدوي صغير
    const torch = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 6), new THREE.MeshBasicMaterial({ color: 0xfff4c0 })); torch.rotation.x = Math.PI / 2; torch.position.set(0.28 * wide, 1.0, 0.3); pose.add(torch);
    // علامة الحالة فوق الراس
    const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTex('?', '#f2c23a'), depthTest: false, transparent: true }));
    icon.scale.set(0.8, 0.8, 1); icon.position.y = 2.35; icon.visible = false; icon.renderOrder = 5; root.add(icon);
    root.userData = { pose, icon };
    return root;
  }

  const iconCache = {};
  function iconTex(ch, color) {
    const k = ch + color; if (iconCache[k]) return iconCache[k];
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.fillStyle = 'rgba(8,12,18,.85)'; x.beginPath(); x.arc(32, 32, 28, 0, Math.PI * 2); x.fill();
    x.lineWidth = 4; x.strokeStyle = color; x.stroke();
    x.fillStyle = color; x.font = 'bold 40px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 32, 34);
    return (iconCache[k] = new THREE.CanvasTexture(c));
  }

  // مخروط الرؤية: مروحة مثلثات تتحدث كل إطار
  function makeCone(rays) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array((rays + 2) * 3), idx = [];
    for (let i = 0; i < rays; i++) idx.push(0, i + 1, i + 2);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: COL.calm, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }));
    m.renderOrder = 2; m.frustumCulled = false; return m;
  }

  // ---------- بناء العالم ----------
  W.build = function (canvas, S) {
    const L = S.L;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1c1a20, 24, 72);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 260);
    const sky = FX.sky(scene);

    // إضاءة الليل: قمر بارد + سماء خفيفة
    const hemi = new THREE.HemisphereLight(0x6d82a8, 0x2a2016, 0.9); scene.add(hemi);
    const moon = new THREE.DirectionalLight(0xa9c2ff, 0.75);
    moon.position.set(-8, 20, 6); moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024);
    Object.assign(moon.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 60 });
    moon.shadow.bias = -0.0015;
    scene.add(moon, moon.target);

    // الأرض: مسطحة في الساحة، وكثبان برا
    const gg = new THREE.PlaneGeometry(140, 140, 70, 70); gg.rotateX(-Math.PI / 2);
    const gp = gg.attributes.position;
    for (let i = 0; i < gp.count; i++) {
      const x = gp.getX(i), z = gp.getZ(i);
      const out = Math.max(0, Math.max(Math.abs(x) - 21, Math.abs(z) - 23));
      const dune = (Math.sin(x * 0.18 + z * 0.07) + Math.sin(z * 0.15 - x * 0.05) * 0.8 + 1.6) * Math.min(1, out / 10) * 1.6;
      gp.setY(i, dune - 0.02);
    }
    gg.computeVertexNormals();
    const ground = new THREE.Mesh(gg, new THREE.MeshLambertMaterial({ color: 0xa8957c, map: FX.sandTexture() }));
    ground.receiveShadow = true; scene.add(ground);

    // العوائق
    const r = rng(42);
    for (const o of L.obstacles) {
      let m;
      if (o.kind === 'rock') m = rockMesh(o, r);
      else if (o.kind === 'crate') m = crateMesh(o);
      else if (o.kind === 'ruin') m = ruinMesh(o, r);
      else if (o.kind === 'pipe') m = pipeMesh(o);
      else if (o.kind === 'tower') m = towerMesh(o, W);
      else if (FX.prop[o.kind]) m = FX.prop[o.kind](o);
      else { m = box(o.w, o.h, o.d, o.h < 2 ? COL.concreteDark : COL.concrete, o.x, o.y0 + o.h / 2, o.z); }
      scene.add(m);
    }

    // إنارة الموقع
    // أعمدة إنارة: صوديوم برتقالي عند البوابة والخرابات، وأبيض بارد حول البرج (بعضها يرمش)
    const lamps = [[-3.2, -9.0, 0xffb060, 0], [3.2, -9.0, 0xffb060, 1], [-4.5, -13.6, 0xbfe2ff, 0], [4.6, -20.9, 0xbfe2ff, 0], [-11.5, -3.2, 0xffb060, 1], [12.6, 4.2, 0xffb060, 0], [-17, 6, 0xffb060, 0]]
      .map(([x, z, c, f]) => FX.lamp(scene, x, z, c, f));
    const sls = (L.searchlights || []).map(l => FX.searchlight(scene, l));
    const beacons = [[-2.1, 3.15, -10], [2.1, 3.15, -10], [1.5, 2.85, -14.9], [17.6, 6.85, 19.6]].map(([x, y, z]) => FX.beacon(scene, x, y, z));
    const dust = FX.dust(scene);
    const flick = []; scene.traverse(o => { if (o.userData && o.userData.flick) flick.push(o.userData.flick); });

    // الهدف: جهاز التسجيل على صندوق صغير، وحلقة تنبض
    const objG = new THREE.Group();
    objG.add(box(0.6, 0.6, 0.6, COL.crate, 0, 0.3, 0));
    const rec = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.22), new THREE.MeshBasicMaterial({ color: COL.teal })); rec.position.y = 0.66; objG.add(rec);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.05, 32), new THREE.MeshBasicMaterial({ color: COL.teal, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; objG.add(ring);
    objG.position.set(L.objective.x, 0, L.objective.z); scene.add(objG);

    // نقاط الحفظ
    const cps = L.checkpoints.map(c => {
      const m = new THREE.Mesh(new THREE.RingGeometry(c.r - 0.12, c.r, 40), new THREE.MeshBasicMaterial({ color: 0x8aa0b0, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(c.x, 0.04, c.z); scene.add(m); return m;
    });

    const player = makePlayer(); scene.add(player);
    const guards = [], cones = [];
    const RAYS = 22;

    const ctx = { renderer, scene, camera, moon, hemi, sky, lamps, sls, beacons, dust, flick, player, guards, cones, objG, ring, rec, cps, rings: [], RAYS, camPos: new THREE.Vector3(), lookAt: new THREE.Vector3(), t: 0, alarm: 0, shake: 0, intro: 0 };
    W.syncGuards(ctx, S);
    W.resize(ctx);
    W.snapCamera(ctx, S);
    return ctx;
  };

  // نعيد بناء الحراس لما يتغير عددهم (بعد الرجوع لنقطة الحفظ نفس العدد، بس نخليها آمنة)
  W.syncGuards = function (ctx, S) {
    while (ctx.guards.length > S.guards.length) { ctx.scene.remove(ctx.guards.pop()); ctx.scene.remove(ctx.cones.pop()); }
    while (ctx.guards.length < S.guards.length) {
      const g = S.guards[ctx.guards.length];
      const m = makeGuard(g.type); ctx.scene.add(m); ctx.guards.push(m);
      const c = makeCone(ctx.RAYS); ctx.scene.add(c); ctx.cones.push(c);
    }
  };

  W.resize = function (ctx) {
    const w = root.innerWidth, h = root.innerHeight;
    ctx.renderer.setSize(w, h, false);
    ctx.camera.aspect = w / h;
    // الشاشة الضيقة (طولي) نرفع الكاميرا عشان يبان المكان
    ctx.camDist = w / h < 1 ? 1.5 : w / h < 1.6 ? 1.15 : 1;
    ctx.camera.updateProjectionMatrix();
  };

  function camTarget(ctx, S, out) {
    const P = S.player, k = ctx.camDist || 1;
    return out.set(P.x, 13 * k, P.z + 9 * k);
  }
  W.snapCamera = function (ctx, S) { camTarget(ctx, S, ctx.camPos); ctx.camera.position.copy(ctx.camPos); ctx.camera.lookAt(S.player.x, 0, S.player.z - 1.2); };

  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  W.render = function (ctx, S, dt) {
    ctx.t += dt;
    const P = S.player, t = ctx.t;

    // ذيبان
    const pm = ctx.player, pose = pm.userData.pose;
    pm.position.set(P.x, 0, P.z);
    pm.rotation.y += TH.angDiff(pm.rotation.y, P.dir) * Math.min(1, dt * 14);
    const bob = P.moving ? Math.abs(Math.sin(t * (P.running ? 13 : 8))) * (P.running ? 0.09 : 0.05) : 0;
    const tgt = P.stance === 'crawl' ? { sy: 1, rx: Math.PI / 2 * 0.92, y: 0.3 } : P.stance === 'crouch' ? { sy: 0.62, rx: 0.28, y: 0 } : { sy: 1, rx: P.running ? 0.18 : 0, y: 0 };
    const k = Math.min(1, dt * 12);
    pose.scale.y += (tgt.sy - pose.scale.y) * k;
    pose.rotation.x += (tgt.rx - pose.rotation.x) * k;
    pose.position.y += (tgt.y + bob - pose.position.y) * k;
    pose.position.z = P.stance === 'crawl' ? -0.6 : 0;
    pm.userData.tail.rotation.x = Math.sin(t * (P.running ? 18 : 6)) * (P.moving ? 0.35 : 0.08);
    pm.visible = S.status !== 'caught' || Math.floor(t * 10) % 2 === 0;

    // الحراس
    W.syncGuards(ctx, S);
    S.guards.forEach((g, i) => {
      const m = ctx.guards[i], gp = m.userData.pose, out = g.state === 'out'; m.position.set(g.x, 0, g.z); m.rotation.y = g.dir;
      const held = S.subdue && S.subdue.g === i;
      const lyX = out ? Math.PI / 2 : 0;
      gp.rotation.x += (lyX - gp.rotation.x) * Math.min(1, dt * 8);
      gp.rotation.z = held ? Math.sin(t * 38) * 0.12 : 0;
      gp.position.y = out ? 0.32 : Math.abs(Math.sin(t * 7 + i)) * 0.04;
      gp.position.z = 0;
      const ic = m.userData.icon;
      ic.visible = g.state !== 'calm';
      if (ic.visible) { ic.material.map = out ? iconTex('Z', '#8ab4ff') : g.state === 'alert' ? iconTex('!', '#ff4d3d') : iconTex('?', '#f2c23a'); ic.position.y = (out ? 1.0 : 2.35) + Math.sin(t * (out ? 2 : 5)) * 0.08; }
      ctx.cones[i].visible = !out;
      // مخروط الرؤية
      const c = ctx.cones[i], pts = TH.visionFan(S, g, ctx.RAYS), pos = c.geometry.attributes.position;
      pos.setXYZ(0, g.x, 0.05, g.z);
      pts.forEach((p, j) => pos.setXYZ(j + 1, p[0], 0.05, p[1]));
      pos.needsUpdate = true; c.geometry.computeBoundingSphere();
      c.material.color.setHex(g.state === 'alert' ? COL.alert : g.state === 'suspicious' ? COL.sus : COL.calm);
      c.material.opacity = g.state === 'alert' ? 0.3 : g.state === 'suspicious' ? 0.26 : 0.17 + (g.seen ? 0.12 : 0);
    });

    // الهدف ونقاط الحفظ
    const pul = 1 + Math.sin(t * 3) * 0.12;
    ctx.ring.scale.set(pul, pul, pul); ctx.rec.visible = !S.objectiveTaken;
    ctx.cps.forEach((m, i) => { m.material.color.setHex(i <= S.checkpoint.idx ? COL.teal : 0x8aa0b0); m.material.opacity = i <= S.checkpoint.idx ? 0.6 : 0.35; });
    if (W.blink) W.blink.visible = Math.floor(t * 1.4) % 2 === 0;

    // حلقات الصوت
    for (let i = ctx.rings.length - 1; i >= 0; i--) {
      const r = ctx.rings[i]; r.userData.t += dt; const f = r.userData.t / 0.6;
      r.scale.setScalar(0.2 + f * r.userData.r); r.material.opacity = 0.45 * (1 - f);
      if (f >= 1) { ctx.scene.remove(r); r.geometry.dispose(); r.material.dispose(); ctx.rings.splice(i, 1); }
    }

    // الأجواء: الإنذار يلوّن المكان بالأحمر ويشغل الأضواء الدوارة
    const lvl = TH.alertLevel(S).level;
    ctx.alarm += ((lvl === 2 ? 1 : 0) - ctx.alarm) * Math.min(1, dt * 3);
    const al = ctx.alarm;
    ctx.hemi.color.setRGB(0.43 + al * 0.18, 0.51 - al * 0.14, 0.66 - al * 0.22);
    ctx.scene.fog.color.setRGB(0.11 + al * 0.14, 0.10 - al * 0.03, 0.125 - al * 0.04);
    ctx.sky.sky.material.uniforms.uAlarm.value = al;
    ctx.beacons.forEach(b => FX.updateBeacon(b, al, t, dt));
    ctx.sls.forEach((o, i) => FX.updateSearchlight(o, S, i));
    for (const L of ctx.lamps) if (L.flicker) {
      const f = Math.sin(t * 13 + L.seed) > 0.93 || Math.sin(t * 2.3 + L.seed) > 0.985 ? 0.15 : 1;
      L.beam.material.uniforms.uStr.value = 0.55 * f; L.pool.material.opacity = 0.42 * f; L.glow.material.opacity = 0.9 * f;
    }
    for (const [lamp, gl] of ctx.flick) { const on = Math.random() > 0.08; lamp.visible = on; gl.material.opacity = on ? 0.6 + Math.random() * 0.3 : 0; }
    FX.updateDust(ctx.dust, P.x, P.z, dt, t);

    // الكاميرا تتبع ذيبان (وتقرب شوي وهو منحني)، تهتز مع الإنذار، ولقطة افتتاحية فوق الموقع
    const zoom = P.stance === 'crawl' ? 0.88 : P.stance === 'crouch' ? 0.94 : 1;
    ctx.zoom = (ctx.zoom || 1) + (zoom - (ctx.zoom || 1)) * Math.min(1, dt * 3);
    camTarget(ctx, S, tmp); tmp.y *= ctx.zoom; tmp.z = P.z + (tmp.z - P.z) * ctx.zoom;
    ctx.camPos.lerp(tmp, Math.min(1, dt * 4));
    const look = tmp2.set(ctx.camPos.x, 0, ctx.camPos.z - (tmp.z - P.z) - 1.2);
    if (ctx.intro > 0) {
      const k = 1 - ctx.intro, e = k * k * (3 - 2 * k);
      // من فوق البرج ← فوق الساحة ← ذيبان
      const a = [6, 11, -27], b = [-4, 24, 2], c = [ctx.camPos.x, ctx.camPos.y, ctx.camPos.z];
      const q = (i) => (1 - e) * (1 - e) * a[i] + 2 * (1 - e) * e * b[i] + e * e * c[i];
      ctx.camera.position.set(q(0), q(1), q(2));
      const la = [0, 5, -17], lc = [look.x, 0, look.z];
      ctx.camera.lookAt(la[0] + (lc[0] - la[0]) * e, la[1] + (lc[1] - la[1]) * e, la[2] + (lc[2] - la[2]) * e);
    } else {
      ctx.camera.position.copy(ctx.camPos);
      if (ctx.shake > 0.001) { ctx.camera.position.x += (Math.random() - 0.5) * ctx.shake; ctx.camera.position.y += (Math.random() - 0.5) * ctx.shake * 0.6; ctx.shake *= Math.pow(0.02, dt); }
      ctx.camera.lookAt(look);
    }
    ctx.sky.moon.position.set(ctx.camera.position.x - 42, 46, ctx.camera.position.z - 70);
    ctx.moon.position.set(P.x - 8, 20, P.z + 6); ctx.moon.target.position.set(P.x, 0, P.z); ctx.moon.target.updateMatrixWorld();

    ctx.renderer.render(ctx.scene, ctx.camera);
  };

  W.noiseRing = function (ctx, x, z, radius) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); m.userData = { t: 0, r: radius }; ctx.scene.add(m); ctx.rings.push(m);
  };

  root.WORLD = W;
})(typeof globalThis !== 'undefined' ? globalThis : this);

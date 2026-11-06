// ذيبان — الرسم بـ Three.js. كل الأشكال مبنية بالكود (نموذج رمادي).
// موديلات الشخصيات تنركّب لاحقاً مكان الأجسام المؤقتة: makePlayer / makeGuard (انظر README).
(function (root) {
  'use strict';
  const THREE = root.THREE, TH = root.TH, FX = root.FX, ROOM = root.ROOM;
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
    const root = new THREE.Group(), pose = new THREE.Group(); root.add(pose); root.userData.type = type;
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
    root.userData = { pose, icon, type };
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
    const L = S.L, ctxRef = {};
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
    const ROOMK = { rwall: 1, f_rack: 1, f_desk: 1, f_desk2: 1, f_shelf: 1, f_table: 1 };
    const gates = [];
    for (const o of L.allObstacles || L.obstacles) {
      let m;
      if (ROOMK[o.kind]) continue; // ترسمها غرفة الاتصالات
      if (o.kind === 'gatebar') { gates.push(ROOM.gate(scene, o)); continue; }
      if (o.kind === 'grate') { gates.push(ROOM.grate(scene, o)); continue; }
      if (o.kind === 'rock') m = rockMesh(o, r);
      else if (o.kind === 'crate') m = crateMesh(o);
      else if (o.kind === 'ruin') m = ruinMesh(o, r);
      else if (o.kind === 'pipe') m = pipeMesh(o);
      else if (o.kind === 'tower') m = towerMesh(o, W);
      else if (FX.prop[o.kind]) m = FX.prop[o.kind](o);
      else { m = box(o.w, o.h, o.d, o.h < 2 ? COL.concreteDark : COL.concrete, o.x, o.y0 + o.h / 2, o.z); }
      scene.add(m);
    }
    const roomFx = ROOM.build(scene, L, W);

    // إنارة الموقع
    // أعمدة إنارة: صوديوم برتقالي عند البوابة والخرابات، وأبيض بارد حول البرج (بعضها يرمش)
    const lamps = [[-3.2, -9.0, 0xffb060, 0], [3.2, -9.0, 0xffb060, 1], [-4.5, -13.6, 0xbfe2ff, 0], [4.6, -20.9, 0xbfe2ff, 0], [-11.5, -3.2, 0xffb060, 1], [12.6, 4.2, 0xffb060, 0], [-17, 6, 0xffb060, 0]]
      .map(([x, z, c, f]) => FX.lamp(scene, x, z, c, f));
    const sls = (L.searchlights || []).map(l => FX.searchlight(scene, l));
    const beacons = [[-2.1, 3.15, -10], [2.1, 3.15, -10], [1.6, 3.3, -14.35], [17.6, 6.85, 19.2]].map(([x, y, z]) => FX.beacon(scene, x, y, z));
    const dust = FX.dust(scene);
    const details = FX.details(scene, L);
    const panels = (L.panels || []).map(p => FX.panel(scene, p));
    // سلّم البرج + صناديق تحكم الكشافات فوق المنصات + كم الريح + شوك يتدحرج
    for (const l of L.ladders || []) if (l.id === 'tower') FX.ladder(scene, l.x - 0.5, l.z, l.h, -Math.PI / 2);
    const ctrls = (L.ladders || []).map(l => l.light != null ? Object.assign(FX.lightCtrl(scene, l.ctrl.x + (l.id === 'post' ? 0.6 : 0.8), l.h, l.ctrl.z - 0.3), { light: l.light }) : null).filter(Boolean);
    const post = L.obstacles.find(o => o.kind === 'post');
    const sock = post ? FX.windsock(scene, post.x - post.w / 2 - 0.1, post.h + 1.4, post.z - post.d / 2) : null;
    const tumble = FX.tumbleweeds(scene, 3);
    const roofs = []; scene.traverse(o => { if (o.userData && o.userData.roof) roofs.push(o.userData.roof); });
    ctxRef.roofs = roofs;
    const sways = [], fires = []; scene.traverse(o => { if (o.userData && o.userData.sway) sways.push(o.userData.sway); if (o.userData && o.userData.fire) fires.push(o.userData.fire); });
    // كبسولات الغاز: نموذج مؤقت لين يتحمّل gas_capsule.glb
    const capGeo = new THREE.CapsuleGeometry(0.028, 0.06, 4, 8);
    const capMat = new THREE.MeshLambertMaterial({ color: 0x8fd0a0, emissive: 0x1a3a22 });
    ctxRef.capProto = new THREE.Mesh(capGeo, capMat);
    W.loadCapsule(ctxRef);
    W.loadGuards(ctxRef);
    const pickups = (L.gasPickups || []).map(p => {
      const g = new THREE.Group(); g.position.set(p.x, 0, p.z);
      const holder = new THREE.Group(); holder.position.y = 0.45; holder.scale.setScalar(3.2); g.add(holder);
      const gl = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 24), new THREE.MeshBasicMaterial({ color: 0x9fd08a, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
      gl.rotation.x = -Math.PI / 2; gl.position.y = 0.04; g.add(gl);
      scene.add(g); return { g, holder, ring: gl };
    });
    const shotsG = new THREE.Group(); scene.add(shotsG);
    const clouds = new Map();
    const lit = []; scene.traverse(o => { if (o.userData && o.userData.lit) lit.push(...o.userData.lit); });
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
    W.loadHero(player, ctxRef);
    const guards = [], cones = [];
    const RAYS = 22;

    const ctx = ctxRef; Object.assign(ctx, { renderer, scene, camera, moon, hemi, sky, lamps, sls, beacons, dust, flick, details, panels, lit, ctrls, roomFx, gates, sock, tumble, sways, fires, pickups, shotsG, clouds, player, guards, cones, objG, ring, rec, cps, rings: [], RAYS, camPos: new THREE.Vector3(), lookAt: new THREE.Vector3(), t: 0, alarm: 0, shake: 0, intro: 0 });
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
    if (ctx.guardBuf) W.fitGuards(ctx);
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
    const up = P.mode === 'top' ? 1.25 : 1;
    return out.set(P.x, 13 * k * up + (P.y || 0), P.z + 9 * k * up);
  }
  W.snapCamera = function (ctx, S) { camTarget(ctx, S, ctx.camPos); ctx.camera.position.copy(ctx.camPos); ctx.camera.lookAt(S.player.x, 0, S.player.z - 1.2); };

  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  W.render = function (ctx, S, dt) {
    ctx.t += dt;
    const P = S.player, t = ctx.t;

    // ذيبان
    const pm = ctx.player, pose = pm.userData.pose;
    let px = P.x, py = P.y || 0, pz = P.z, pdir = P.dir;
    if (P.mode === 'hidden' && P.hide) { // يدخل السيارة وينسدح فيها
      const h = P.hide, seat = h.spot.seat, f = h.phase === 'in' ? 1 : h.phase === 'enter' ? Math.min(1, Math.max(0, (h.t - 0.3) / 0.9)) : 1 - Math.min(1, h.t / 0.9);
      px = h.spot.x + (seat.x - h.spot.x) * f; pz = h.spot.z + (seat.z - h.spot.z) * f; py = seat.y * Math.min(1, f * 1.6);
      pdir = f > 0.5 ? seat.dir : h.spot.face;
    }
    pm.position.set(px, py, pz);
    const snap = P.mode === 'climb' || P.mode === 'hidden';
    pm.rotation.y += TH.angDiff(pm.rotation.y, pdir) * (snap ? 1 : Math.min(1, dt * 14));
    if (ctx.hero) { W.animateHero(ctx, S, dt, t); }
    else {
      const bob = P.moving ? Math.abs(Math.sin(t * (P.running ? 13 : 8))) * (P.running ? 0.09 : 0.05) : 0;
      const tgt = P.stance === 'crawl' ? { sy: 1, rx: Math.PI / 2 * 0.92, y: 0.3 } : P.stance === 'crouch' ? { sy: 0.62, rx: 0.28, y: 0 } : { sy: 1, rx: P.running ? 0.18 : 0, y: 0 };
      const k = Math.min(1, dt * 12);
      pose.scale.y += (tgt.sy - pose.scale.y) * k;
      pose.rotation.x += (tgt.rx - pose.rotation.x) * k;
      pose.position.y += (tgt.y + bob - pose.position.y) * k;
      pose.position.z = P.stance === 'crawl' ? -0.6 : 0;
      pm.userData.tail.rotation.x = Math.sin(t * (P.running ? 18 : 6)) * (P.moving ? 0.35 : 0.08);
      pm.visible = S.status !== 'caught' || Math.floor(t * 10) % 2 === 0;
    }

    // الحراس
    W.syncGuards(ctx, S);
    S.guards.forEach((g, i) => {
      const m = ctx.guards[i], gp = m.userData.pose, out = g.state === 'out'; m.position.set(g.x, 0, g.z); m.rotation.y = g.dir;
      const held = S.subdue && S.subdue.g === i;
      if (m.userData.anim) W.animateGuard(ctx, S, g, m, dt, held);
      else {
        const lyX = out ? Math.PI / 2 : 0;
        gp.rotation.x += (lyX - gp.rotation.x) * Math.min(1, dt * 8);
        gp.rotation.z = held ? Math.sin(t * 38) * 0.12 : 0;
        gp.position.y = out ? 0.32 : Math.abs(Math.sin(t * 7 + i)) * 0.04;
        gp.position.z = 0;
      }
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
    const off = S.power && S.power.off;
    ctx.sls.forEach((o, i) => { FX.updateSearchlight(o, S, i); o.beam.visible = o.spot.visible = o.ring.visible = o.glow.visible = !off; });
    for (const L of ctx.lamps) {
      const f = off ? 0 : L.flicker && (Math.sin(t * 13 + L.seed) > 0.93 || Math.sin(t * 2.3 + L.seed) > 0.985) ? 0.15 : 1;
      L.beam.material.uniforms.uStr.value = 0.55 * f; L.pool.material.opacity = 0.42 * f; L.glow.material.opacity = 0.9 * f; L.head.visible = f > 0;
    }
    for (const [lamp, gl] of ctx.flick) { const on = !off && Math.random() > 0.08; lamp.visible = on; gl.material.opacity = on ? 0.6 + Math.random() * 0.3 : 0; }
    for (const w of ctx.lit) w.material.color.setHex(off ? 0x1a1a1a : 0xffc070);
    ctx.panels.forEach(p => FX.updatePanel(p, S.alarm && S.alarm.on, off, t));
    FX.updateDetails(ctx.details, t, off);
    ctx.sls.forEach((o, i) => { if (S.lights[i] && S.lights[i].dead) o.beam.visible = o.spot.visible = o.ring.visible = o.glow.visible = false; });
    for (const c of ctx.ctrls) { const dead = S.lights[c.light] && S.lights[c.light].dead, col = off ? 0x111111 : dead ? (Math.floor(t * 6) % 2 ? 0xff3322 : 0x220000) : 0x33ff66; c.led.material.color.setHex(col); c.gl.material.color.setHex(col); c.gl.material.opacity = off || (dead && !(Math.floor(t * 6) % 2)) ? 0 : 0.7; }
    const lp = (P.mode === 'top' || P.mode === 'climb') && P.ladder ? P.ladder.plat : null;
    for (const r of ctx.roofs) { const at = r.userData.at, on = lp && at && Math.abs(at[0] - lp.x) < 0.5 && Math.abs(at[1] - lp.z) < 0.5; r.material.opacity += ((on ? 0.15 : 1) - r.material.opacity) * Math.min(1, dt * 6); }
    ROOM.update(ctx.roomFx, S, dt, t, TH.inRoom(S), off, ctx.alarm);
    for (const G of ctx.gates) ROOM.updateGate(G, S.gateOpen, dt);
    if (ctx.sock) { ctx.sock.rotation.y = Math.sin(t * 0.4) * 0.3; ctx.sock.rotation.z = -0.15 + Math.sin(t * 7) * 0.05; }
    FX.updateTumble(ctx.tumble, dt, t);
    ctx.sways.forEach((sw, i) => { sw.rotation.z = Math.sin(t * 1.1 + i) * 0.05; sw.rotation.x = Math.sin(t * 0.8 + i * 2) * 0.04; });
    for (const f of ctx.fires) { const k2 = 0.8 + Math.random() * 0.3; f.flame.scale.set(1, k2, 1); f.f2.scale.set(1, 0.8 + Math.random() * 0.4, 1); f.fg.material.opacity = 0.6 + Math.random() * 0.3; f.fp.material.opacity = 0.32 + Math.random() * 0.12; }
    // كبسولات على الأرض، وطايرة، وسحب الغاز
    ctx.pickups.forEach((pk, i) => { const on = !S.picked[i]; pk.g.visible = on; if (on) { pk.holder.rotation.y = t * 1.5; pk.holder.position.y = 0.45 + Math.sin(t * 2.5 + i) * 0.08; pk.ring.scale.setScalar(1 + Math.sin(t * 3) * 0.1); if (!pk.holder.children.length && ctx.capProto) pk.holder.add(ctx.capProto.clone()); } });
    while (ctx.shotsG.children.length < S.shots.length) ctx.shotsG.add(ctx.capProto.clone());
    ctx.shotsG.children.forEach((m, i) => { const sh = S.shots[i]; m.visible = !!sh; if (!sh) return; const f = sh.t / sh.dur; m.position.set(sh.x0 + (sh.x1 - sh.x0) * f, sh.y0 * (1 - f) + Math.sin(f * Math.PI) * 2.2, sh.z0 + (sh.z1 - sh.z0) * f); m.rotation.x += dt * 14; m.scale.setScalar(2.5); });
    for (const c of S.clouds) { if (!ctx.clouds.has(c)) ctx.clouds.set(c, FX.gasCloud(ctx.scene, c.x, c.z, c.r)); FX.updateGasCloud(ctx.clouds.get(c), c); }
    for (const [c, C] of ctx.clouds) if (!S.clouds.includes(c)) { ctx.scene.remove(C.g); ctx.clouds.delete(c); }
    ctx.darkness = (ctx.darkness || 0) + ((off ? 1 : 0) - (ctx.darkness || 0)) * Math.min(1, dt * 2);
    ctx.hemi.intensity = 0.9 - ctx.darkness * 0.25;
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

  // ---------- موديل ذيبان (GLB) ----------
  // إذا الملف موجود يحل محل الجسم المؤقت. الحركات تتبدل حسب الوضعية والسرعة، بتداخل ناعم.
  const NOMINAL = { walk: 2.6, run: 5.0, crouch_walk: 1.7, crawl: 0.95 };
  W.loadHero = function (player, ctx) {
    if (!THREE.GLTFLoader) return;
    new THREE.GLTFLoader().load('assets/characters/theeban.glb?v=' + (root.TH_VERSION || '1'), gltf => {
      const model = gltf.scene, bones = {};
      model.traverse(o => {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; o.frustumCulled = false;
          const m = o.material; if (m) { m.metalness = 0; m.roughness = 1; if (m.map) { m.map.encoding = THREE.LinearEncoding; m.map.needsUpdate = true; } } }
        if (o.isBone) bones[o.name] = o;
      });
      const pose = player.userData.pose;
      pose.clear(); pose.scale.set(1, 1, 1); pose.rotation.set(0, 0, 0); pose.position.set(0, 0, 0);
      pose.add(model);
      const mixer = new THREE.AnimationMixer(model), actions = {};
      for (const clip of gltf.animations) {
        const a = mixer.clipAction(clip); actions[clip.name] = a;
        if (['subdue', 'interact', 'caught', 'ladder_mount', 'ladder_top', 'car_enter', 'car_exit', 'throw_gas', 'crouch_throw_gas'].includes(clip.name)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
      }
      const scarf = ['Scarf_1', 'Scarf_2', 'Scarf_3'].map(n => bones[n]).filter(Boolean);
      ctx.hero = { model, mixer, actions, cur: null, scarf };
      W.playHero(ctx.hero, 'idle', 0);
      root.dispatchEvent && root.dispatchEvent(new Event('theeban-hero'));
    }, undefined, err => { console.warn('theeban.glb', err && err.message); });
  };
  W.loadCapsule = function (ctx) {
    if (!THREE.GLTFLoader) return;
    new THREE.GLTFLoader().load('assets/props/gas_capsule.glb?v=' + (root.TH_VERSION || '1'), gltf => {
      const m = gltf.scene; m.traverse(o => { if (o.isMesh) { o.castShadow = true; if (o.material) { o.material.metalness = 0.3; o.material.roughness = 0.5; o.material.emissive = new THREE.Color(0x0f2a16); } } });
      ctx.capProto = m;
      if (ctx.pickups) ctx.pickups.forEach(pk => { pk.holder.clear(); });
      if (ctx.shotsG) ctx.shotsG.clear();
    }, undefined, () => {});
  };
  // ---------- موديل الحارس (GLB) ----------
  // ملف واحد لكل الحراس: نحمّله مرة ونفكّه لكل حارس (كل واحد له هيكله وحركاته). شارة على الذراع تفرّق النوع.
  const BAND = { scout: 0xf0c03a, heavy: 0xb03020, tech: 0xf4f4f0 };
  const GUARD_ONCE = ['alert', 'spot', 'gassed', 'subdued', 'wake'];
  // الكشاف بلبس صحراوي ونظارة (guard2)، والثقيل والفني باللبس الداكن (guard)
  const GUARD_FILE = { scout: 'guard2.glb', heavy: 'guard.glb', tech: 'guard.glb' };
  W.loadGuards = function (ctx) {
    if (!THREE.GLTFLoader || !THREE.FileLoader) return;
    ctx.guardBufs = {};
    for (const f of new Set(Object.values(GUARD_FILE))) {
      const fl = new THREE.FileLoader(); fl.setResponseType('arraybuffer');
      fl.load('assets/characters/' + f + '?v=' + (root.TH_VERSION || '1'), buf => { ctx.guardBufs[f] = buf; ctx.guardBuf = true; W.fitGuards(ctx); }, undefined, () => {});
    }
  };
  W.fitGuards = function (ctx) {
    if (!ctx.guardBufs || !ctx.guards) return;
    ctx.guards.forEach((m, i) => {
      const buf = ctx.guardBufs[GUARD_FILE[m.userData.type] || 'guard.glb'];
      if (!buf || m.userData.anim || m.userData.loading) return;
      m.userData.loading = true;
      new THREE.GLTFLoader().parse(buf.slice(0), '', gltf => {
        const model = gltf.scene, bones = {};
        model.traverse(o => {
          if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; const mt = o.material; if (mt) { mt.metalness = 0; mt.roughness = 1; if (mt.map) { mt.map.encoding = THREE.LinearEncoding; mt.map.needsUpdate = true; } } }
          if (o.isBone) bones[o.name] = o;
        });
        const type = m.userData.type;
        if (type === 'heavy') model.scale.set(1.12, 1.04, 1.12);
        if (type === 'scout') model.scale.set(0.94, 1.0, 0.94);
        const arm = bones.LeftArm;
        if (arm) { const band = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.09, 10), new THREE.MeshBasicMaterial({ color: BAND[type] || 0xffffff })); band.rotation.z = Math.PI / 2; band.position.set(0.12, 0, 0); arm.add(band); }
        const pose = m.userData.pose; pose.clear(); pose.position.set(0, 0, 0); pose.rotation.set(0, 0, 0); pose.add(model);
        const mixer = new THREE.AnimationMixer(model), actions = {};
        for (const c of gltf.animations) { const a = mixer.clipAction(c); actions[c.name] = a; if (GUARD_ONCE.includes(c.name)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; } }
        m.userData.anim = { mixer, actions, cur: null, last: [0, 0], outClip: null };
        W.playHero(m.userData.anim, 'idle', 0);
      }, () => { m.userData.loading = false; });
    });
  };
  W.animateGuard = function (ctx, S, g, m, dt, held) {
    const A = m.userData.anim, moved = Math.hypot(g.x - A.last[0], g.z - A.last[1]) / Math.max(dt, 1e-3); A.last = [g.x, g.z];
    const speed = moved > 6 ? 0 : moved; // قفزة الرجوع لنقطة الحفظ ما تحسب
    let clip, fade = 0.25;
    if (g.state === 'out' || held) {
      const first = held ? 'subdued' : g.outBy === 'gas' ? 'gassed' : 'subdued';
      if (A.cur !== first && A.cur !== 'sleep') clip = first;
      else if (A.cur === first && A.actions[first] && !A.actions[first].isRunning()) clip = 'sleep';
      else clip = A.cur;
      fade = 0.15;
    }
    else if (A.waking && A.actions.wake && (A.cur !== 'wake' || A.actions.wake.isRunning())) { clip = 'wake'; fade = 0.3; }
    else if (g.state === 'alert') {
      if (A.prevState !== 'alert' && speed < 1) clip = 'alert';
      else clip = speed > 0.3 ? 'run' : (A.cur === 'alert' && A.actions.alert.isRunning() ? 'alert' : 'spot');
    }
    else if (g.state === 'suspicious') clip = g.seen ? 'spot' : speed > 0.3 ? 'patrol_walk' : (S.alarm && S.alarm.on && (g.id + Math.floor(S.time / 4)) % 2 ? 'radio' : 'look_around');
    else clip = speed > 0.3 ? 'patrol_walk' : (g.waitT > 0 && g.route.length > 1 ? 'look_around' : 'idle');
    if (A.prevState === 'out' && g.state !== 'out') { A.waking = true; clip = A.actions.wake ? 'wake' : clip; fade = 0.3; } // يقوم من النوم
    if (clip !== 'wake') A.waking = false;
    A.prevState = held ? 'out' : g.state;
    if (!A.actions[clip]) clip = 'idle';
    if (clip === 'spot' && A.cur === 'spot' && !A.actions.spot.isRunning()) { /* يبقى على آخر وضعية */ }
    W.playHero(A, clip, fade);
    const a = A.actions[clip];
    if (clip === 'patrol_walk') a.timeScale = Math.max(0.6, Math.min(1.8, speed / 1.75));
    else if (clip === 'run') a.timeScale = Math.max(0.8, Math.min(1.5, speed / 4));
    else a.timeScale = 1;
    A.mixer.update(dt);
  };

  W.playHero = function (H, name, fade) {
    if (H.cur === name || !H.actions[name]) return;
    const next = H.actions[name], prev = H.cur && H.actions[H.cur];
    next.reset(); next.enabled = true; next.setEffectiveWeight(1); next.play();
    if (prev) prev.crossFadeTo(next, fade == null ? 0.2 : fade, false);
    H.cur = name;
  };
  W.animateHero = function (ctx, S, dt, t) {
    const H = ctx.hero, P = S.player;
    let clip, fade = 0.2;
    const A = S.action;
    if (S.status === 'caught') clip = 'caught';
    else if (P.mode === 'climb') {
      const c = P.climb; clip = c.phase === 'mount' ? 'ladder_mount' : c.phase === 'top' ? 'ladder_top' : c.phase === 'dismount' ? 'idle' : 'ladder_climb';
      fade = c.phase === 'top' ? 0.1 : 0.15;
    }
    else if (P.mode === 'hidden') { const ph = P.hide.phase; clip = ph === 'enter' ? 'car_enter' : ph === 'in' ? 'car_hide_idle' : 'car_exit'; fade = 0.1; }
    else if (A && A.kind === 'throw') clip = P.stance === 'crouch' ? 'crouch_throw_gas' : 'throw_gas';
    else if (S.subdue) clip = 'subdue';
    else if (S.action) clip = 'interact';
    else if (P.stance === 'crawl') clip = P.moving ? 'crawl' : 'crawl_idle';
    else if (P.stance === 'crouch') clip = P.moving ? 'crouch_walk' : 'crouch_idle';
    else clip = P.running ? 'run' : P.moving ? 'walk' : 'idle';
    // بعد ما يوصل فوق المنصة ننقل الجسم فوق، فلازم التبديل يكون فوري عشان ما يقفز
    if (H.cur === 'ladder_top' && clip !== 'ladder_top') fade = 0;
    if (H.cur === 'car_exit' && clip !== 'car_exit') fade = 0.05;
    if (!H.actions[clip]) clip = P.mode === 'climb' ? 'idle' : P.mode === 'hidden' ? 'crawl_idle' : A ? 'interact' : clip;
    W.playHero(H, clip, clip === 'caught' ? 0.1 : fade);
    const a = H.actions[clip];
    if (a && clip === 'ladder_climb') a.timeScale = P.moving < 0 ? -1 : 1;
    else if (a && clip === 'ladder_mount' && P.climb && P.climb.phase === 'dismount') a.timeScale = -1;
    else if (a && NOMINAL[clip]) a.timeScale = Math.max(0.5, Math.min(1.6, P.moving / NOMINAL[clip]));
    else if (a) a.timeScale = 1;
    H.mixer.update(dt);
    // الوشاح يرفرف مع الريح والحركة (فوق حركة الملف)
    const sp = P.running ? 1 : P.moving ? 0.55 : 0.25;
    H.scarf.forEach((b, i) => { b.rotation.x += Math.sin(t * (5 + sp * 9) - i * 0.9) * 0.18 * sp * (i + 1) * 0.6; b.rotation.z += Math.sin(t * 2.3 + i) * 0.08 * sp; });
    ctx.player.visible = true;
  };

  W.noiseRing = function (ctx, x, z, radius) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); m.userData = { t: 0, r: radius }; ctx.scene.add(m); ctx.rings.push(m);
  };

  root.WORLD = W;
})(typeof globalThis !== 'undefined' ? globalThis : this);

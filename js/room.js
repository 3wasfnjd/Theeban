// ذيبان — غرفة الاتصالات: المبنى (يتشال سقفه وجداره القدامي لما تدخل)، الأثاث من مستودع أصول عبودين،
// والمعدات المبنية هنا: رفوف أجهزة لاسلكي بلمبات، شاشة موجات، مسجّل كاسيت وأشرطة، خريطة روافد، لوحة مذكرات،
// مروحة سقف، لمبات فلورسنت ترمش، أوراق على الأرض. وكمان البوابة المقفلة وشبك الأنابيب.
(function (root) {
  'use strict';
  const THREE = root.THREE;
  const R = {};

  const mats = {};
  const lam = (c, o) => { const k = c + JSON.stringify(o || {}); return mats[k] || (mats[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o || {}))); };
  const basic = c => new THREE.MeshBasicMaterial({ color: c });
  function bx(w, h, d, c, x, y, z, m) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || lam(c)); o.position.set(x || 0, y || 0, z || 0); o.castShadow = o.receiveShadow = true; return o; }
  function cy(r1, r2, h, c, seg, x, y, z) { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 12), lam(c)); o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; return o; }
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.userData = { canvas: c }; return t; }
  function plane(w, h, tex, x, y, z, ry, rx) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); return m; }
  let softTex = null;
  function soft() { return softTex || (softTex = canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); })); }
  function pool(r, color, op) { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: soft(), color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); m.rotation.x = -Math.PI / 2; m.renderOrder = 2; return m; }
  function glow(size, color, op) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft(), color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.set(size, size, 1); return s; }

  // أصل من مستودع أصول عبودين (kit) — وإذا ما توفر، صندوق بديل
  function aa(id, params, fallback) {
    try {
      const A = root.AA && root.AA.assets && root.AA.assets[id], X = root.AA && root.AA.three;
      if (A && X) { const g = X.instance(X.build(A.generate(root.AA.params(A, params || {}), 'med'), 'med')); g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; }
    } catch (e) { console.warn('aboden asset', id, e && e.message); }
    return fallback ? fallback() : new THREE.Group();
  }
  R.aa = aa;

  // ---------- خامات مرسومة بالكود ----------
  function floorTex() {
    const t = canvasTex(256, 256, (x, w, h) => {
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#8d8a80' : '#a19d92'; x.fillRect(i * 64, j * 64, 64, 64); }
      x.strokeStyle = 'rgba(40,35,30,.5)'; x.lineWidth = 2; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(w, i * 64); x.stroke(); }
      for (let k = 0; k < 900; k++) { x.fillStyle = 'rgba(60,50,40,' + Math.random() * 0.12 + ')'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2.5); return t;
  }
  function mapTex() {
    return canvasTex(512, 320, (x, w, h) => {
      x.fillStyle = '#e8dcc0'; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(140,110,70,.35)'; x.lineWidth = 1; for (let i = 0; i < 12; i++) { x.beginPath(); for (let k = 0; k <= w; k += 16) x.lineTo(k, 20 + i * 26 + Math.sin(k * 0.03 + i) * 6); x.stroke(); }
      const st = [[80, 230, '١'], [170, 120, '٢'], [270, 200, '٣'], [350, 90, '٤'], [450, 170, '٥']];
      x.strokeStyle = '#2f6fb3'; x.lineWidth = 5; x.beginPath(); st.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke();
      x.font = 'bold 26px Cairo, sans-serif'; x.textAlign = 'center';
      st.forEach(([a, b, n], i) => {
        x.fillStyle = i === 3 ? '#b03020' : '#1f3a5a'; x.beginPath(); x.arc(a, b, 14, 0, 7); x.fill();
        x.fillStyle = '#fff'; x.fillText(n, a, b + 9);
        if (i === 3) { x.strokeStyle = '#b03020'; x.lineWidth = 3; x.beginPath(); x.moveTo(a - 22, b - 22); x.lineTo(a + 22, b + 22); x.moveTo(a + 22, b - 22); x.lineTo(a - 22, b + 22); x.stroke(); }
        if (i === 4) { x.strokeStyle = '#b03020'; x.lineWidth = 4; x.beginPath(); x.arc(a, b, 30, 0, 7); x.stroke(); x.fillStyle = '#b03020'; x.fillText('؟', a + 40, b - 24); }
      });
      x.fillStyle = '#3a2a1a'; x.font = 'bold 30px Cairo, sans-serif'; x.textAlign = 'right'; x.fillText('شبكة روافد', w - 16, 40);
    });
  }
  function corkTex() {
    return canvasTex(256, 192, (x, w, h) => {
      x.fillStyle = '#a77b4a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#5a3a1a'; x.lineWidth = 10; x.strokeRect(0, 0, w, h);
      for (let k = 0; k < 500; k++) { x.fillStyle = 'rgba(70,40,15,.25)'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      const papers = [[20, 20, 70, 60, '#f4efe2'], [100, 30, 60, 80, '#fff6b0'], [175, 20, 65, 55, '#f4efe2'], [30, 100, 80, 70, '#dfe8f0'], [130, 120, 55, 55, '#f4efe2'], [195, 95, 50, 75, '#fff6b0']];
      papers.forEach(([a, b, c, d, col], i) => {
        x.save(); x.translate(a + c / 2, b + d / 2); x.rotate((i % 3 - 1) * 0.08); x.fillStyle = col; x.fillRect(-c / 2, -d / 2, c, d);
        x.strokeStyle = 'rgba(40,40,60,.55)'; x.lineWidth = 2; for (let l = 0; l < 4; l++) { x.beginPath(); x.moveTo(-c / 2 + 6, -d / 2 + 12 + l * 11); x.lineTo(c / 2 - 6 - (l % 2) * 12, -d / 2 + 12 + l * 11); x.stroke(); }
        x.fillStyle = i % 2 ? '#c0392b' : '#2f6fb3'; x.beginPath(); x.arc(0, -d / 2 + 4, 4, 0, 7); x.fill(); x.restore();
      });
      x.strokeStyle = '#c0392b'; x.lineWidth = 2; x.beginPath(); x.moveTo(55, 24); x.lineTo(130, 34); x.lineTo(160, 124); x.lineTo(220, 99); x.stroke();
    });
  }
  function labelTex(text, sub, bg) {
    return canvasTex(256, 96, (x, w, h) => {
      x.fillStyle = bg || '#efe8d6'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a1a1a'; x.textAlign = 'center'; x.direction = 'rtl';
      x.font = 'bold 40px Cairo, sans-serif'; x.fillText(text, w / 2, 48); if (sub) { x.font = 'bold 26px Cairo, sans-serif'; x.fillStyle = '#5a5a5a'; x.fillText(sub, w / 2, 82); }
    });
  }

  // ---------- مسجّل الكاسيت ----------
  R.recorder = function () {
    const g = new THREE.Group();
    g.add(bx(0.42, 0.12, 0.24, 0x2e3136, 0, 0.06, 0));
    g.add(bx(0.4, 0.015, 0.22, 0x3c4046, 0, 0.125, 0));
    // سماعة مشبّكة
    const grill = canvasTex(64, 64, (x) => { x.fillStyle = '#1b1c1f'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#3c3f44'; for (let i = 4; i < 64; i += 6) for (let j = 4; j < 64; j += 6) { x.beginPath(); x.arc(i, j, 1.6, 0, 7); x.fill(); } });
    const sp = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), new THREE.MeshLambertMaterial({ map: grill })); sp.position.set(-0.11, 0.06, 0.121); g.add(sp);
    // نافذة الكاسيت والبكرتين
    g.add(bx(0.17, 0.075, 0.005, 0x101113, 0.09, 0.065, 0.121));
    const tape = new THREE.Group(); tape.position.set(0.09, 0.065, 0.126); g.add(tape);
    tape.add(bx(0.15, 0.06, 0.004, 0xe9e1cf, 0, 0, 0));
    const reels = [];
    for (const sx of [-0.04, 0.04]) {
      const r = new THREE.Group(); r.position.set(sx, 0, 0.004); tape.add(r);
      r.add(new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), basic(0x2a1e14)));
      for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.012, 0.002), basic(0xf0f0f0)); s.rotation.z = k * Math.PI / 3; s.position.z = 0.001; r.add(s); }
      reels.push(r);
    }
    // أزرار ملونة فوق
    [0xd0d0d0, 0xd0d0d0, 0xb03020, 0xd0d0d0, 0xd0d0d0, 0x3a3a3a].forEach((c, i) => g.add(bx(0.04, 0.02, 0.05, c, -0.12 + i * 0.048, 0.14, 0.06)));
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), basic(0x441111)); led.position.set(0.17, 0.11, 0.122); g.add(led);
    // يد
    g.add(bx(0.3, 0.02, 0.02, 0x1b1c1f, 0, 0.21, -0.06), bx(0.02, 0.08, 0.02, 0x1b1c1f, -0.14, 0.17, -0.06), bx(0.02, 0.08, 0.02, 0x1b1c1f, 0.14, 0.17, -0.06));
    g.userData = { reels, led };
    return g;
  };
  R.cassette = function (label) {
    const g = new THREE.Group();
    g.add(bx(0.11, 0.012, 0.07, 0x1b1c1f, 0, 0.006, 0));
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.03), new THREE.MeshLambertMaterial({ map: labelTex(label || 'ع', '٢٠٣٦') })); lab.rotation.x = -Math.PI / 2; lab.position.set(0, 0.0125, -0.012); g.add(lab);
    for (const sx of [-0.025, 0.025]) { const w = new THREE.Mesh(new THREE.CircleGeometry(0.011, 10), basic(0x6b4a2a)); w.rotation.x = -Math.PI / 2; w.position.set(sx, 0.0125, 0.015); g.add(w); }
    return g;
  };

  // ---------- رف أجهزة لاسلكي ----------
  function rack(o, fx) {
    const g = new THREE.Group(), n = 3, cw = o.w / n;
    for (let i = 0; i < n; i++) {
      const x = -o.w / 2 + cw * (i + 0.5);
      g.add(bx(cw - 0.06, o.h, o.d, i === 1 ? 0x2c3238 : 0x353b42, x, o.h / 2, 0));
      for (let k = 0; k < 4; k++) {
        const y = 0.35 + k * 0.42;
        g.add(bx(cw - 0.14, 0.32, 0.03, 0x1e2226, x, y, o.d / 2 + 0.01));
        for (let d = 0; d < 3; d++) { const knob = cy(0.025, 0.025, 0.03, 0xb9bcc0, 10, x - 0.18 + d * 0.09, y - 0.06, o.d / 2 + 0.03); knob.rotation.x = Math.PI / 2; g.add(knob); }
        for (let l = 0; l < 5; l++) { const led = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, 0.01), basic(0x33ff66)); led.position.set(x + 0.05 + l * 0.04, y + 0.08, o.d / 2 + 0.03); g.add(led); fx.leds.push({ m: led, ph: Math.random() * 10, sp: 1 + Math.random() * 6, cols: [0x33ff66, 0xffb030, 0xff3322][(i + k + l) % 3] }); }
      }
    }
    // شاشة موجات (أوسيلوسكوب) فوق الرف
    const scopeTex = canvasTex(128, 80, () => {}); const scope = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.31), new THREE.MeshBasicMaterial({ map: scopeTex }));
    scope.position.set(-o.w / 2 + cw * 1.5, o.h + 0.25, o.d / 2 - 0.08); g.add(bx(0.6, 0.42, 0.35, 0x2a2e33, -o.w / 2 + cw * 1.5, o.h + 0.21, -0.02)); g.add(scope);
    fx.scopes.push(scopeTex);
    // ميكروفون لاسلكي معلّق بسلك
    const mic = bx(0.06, 0.1, 0.04, 0x1b1c1f, o.w / 2 - 0.15, 1.15, o.d / 2 + 0.06); g.add(mic);
    g.position.set(o.x, 0, o.z); return g;
  }

  // ---------- المبنى ----------
  R.build = function (scene, L, W) {
    const Rm = L.room; if (!Rm) return null;
    const fx = { leds: [], scopes: [], fade: [], tubes: [], fan: null, reels: null, recLed: null, notes: [], monitors: [], alarmLights: [] };
    const room = new THREE.Group(); room.position.set(Rm.x, 0, Rm.z); scene.add(room);
    const wallMat = () => new THREE.MeshLambertMaterial({ color: 0xc9c2b2, flatShading: true, transparent: true });
    const H = Rm.h, hw = Rm.w / 2, hd = Rm.d / 2, t = 0.3;

    // أرضية بلاط
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(Rm.w - 0.1, Rm.d - 0.1), new THREE.MeshLambertMaterial({ map: floorTex() })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.02; floor.receiveShadow = true; room.add(floor);
    // الجدران (القدامي يختفي لما تدخل)
    const walls = [];
    const W1 = (w, d, x, z, front) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), wallMat()); m.position.set(x, H / 2, z); m.castShadow = m.receiveShadow = true; room.add(m); walls.push({ m, front }); };
    W1(Rm.w, t, 0, -hd + t / 2, false); W1(t, Rm.d, -hw + t / 2, 0, false); W1(t, Rm.d, hw - t / 2, 0, false);
    const dw = Rm.door.w, side = (Rm.w - dw) / 2;
    W1(side, t, -hw + side / 2, hd - t / 2, true); W1(side, t, hw - side / 2, hd - t / 2, true);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(dw, 0.7, t), wallMat()); lintel.position.set(0, H - 0.35, hd - t / 2); room.add(lintel); walls.push({ m: lintel, front: true });
    // إطار الباب وضلفته مفتوحة
    room.add(bx(0.08, 2.3, 0.34, 0x3a3f45, -dw / 2, 1.15, hd - t / 2), bx(0.08, 2.3, 0.34, 0x3a3f45, dw / 2, 1.15, hd - t / 2));
    const leaf = bx(dw - 0.1, 2.2, 0.05, 0x5a6168, 0, 1.1, 0); const hinge = new THREE.Group(); hinge.position.set(-dw / 2 + 0.05, 0, hd + 0.02); leaf.position.x = (dw - 0.1) / 2; hinge.add(leaf); hinge.rotation.y = -1.9; room.add(hinge);
    // لوحة فوق الباب
    const sign = plane(1.5, 0.5, labelTex('غرفة الاتصالات', 'روافد · محطة ٧', '#e8e4da'), 0, H - 0.25, hd + 0.02, 0); room.add(sign); walls.push({ m: sign, front: true, plain: true });
    // السقف + حافة
    const roof = new THREE.Mesh(new THREE.BoxGeometry(Rm.w + 0.2, 0.2, Rm.d + 0.2), new THREE.MeshLambertMaterial({ color: 0x8f8a80, flatShading: true, transparent: true })); roof.position.y = H + 0.1; roof.receiveShadow = roof.castShadow = true; room.add(roof);
    fx.roof = roof;
    // معدات السطح (من المستودع) + برج الاتصالات الشبكي فوق السطح
    const rt = aa('kit_rooftop', {}, null); rt.position.set(-2.2, H + 0.2, -1.2); room.add(rt); fx.fade.push(rt);
    const lat = new THREE.Group(); lat.position.y = H + 0.2; room.add(lat); fx.fade.push(lat);
    const TH_ = 8, legs = [[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1]];
    for (const [x, z] of legs) lat.add(bx(0.14, TH_, 0.14, 0x56636c, x * 0.7, TH_ / 2, z * 0.7));
    for (let y = 1; y < TH_; y += 1.4) for (let k = 0; k < 4; k++) { const a = legs[k], b = legs[(k + 1) % 4]; lat.add(bx(Math.abs(a[0] - b[0]) * 0.7 || 0.07, 0.07, Math.abs(a[1] - b[1]) * 0.7 || 0.07, 0x56636c, (a[0] + b[0]) * 0.35, y, (a[1] + b[1]) * 0.35)); }
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 6, 0, Math.PI * 2, 0, Math.PI / 3), lam(0xb9bcc0, { side: THREE.DoubleSide })); dish.rotation.x = -Math.PI / 2.4; dish.position.set(0, TH_ - 1.6, 1); lat.add(dish);
    const lampTop = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), basic(0xff3020)); lampTop.position.y = TH_ + 0.2; lat.add(lampTop); W.blink = lampTop;
    // سلّم السطح (من الشرق) مرسوم في world.js عبر FX.ladder
    // مكيفات سبليت على الجدار الغربي من برا
    const ac = aa('kit_ac_split', {}, null); ac.position.set(-hw - 0.15, 2.2, -0.6); ac.rotation.y = -Math.PI / 2; room.add(ac);

    // ---------- داخل الغرفة ----------
    const inside = new THREE.Group(); room.add(inside); fx.inside = inside;
    const obsOf = k => L.obstacles.filter(o => o.kind === k);
    // رف الأجهزة
    for (const o of obsOf('f_rack')) inside.add(Object.assign(rack({ x: o.x - Rm.x, z: o.z - Rm.z, w: o.w, d: o.d, h: o.h }, fx), {}));
    // مكتب المسجّل (من المستودع) + المسجّل + أشرطة + أوراق + كوب + أباجورة
    for (const o of obsOf('f_desk')) {
      const d = aa('kit_desk', { width: o.w, computer: 'none', wood: 'woodDark' }, () => bx(o.w, o.h, o.d, 0x6a4529, 0, o.h / 2, 0)); d.position.set(o.x - Rm.x, 0, o.z - Rm.z); inside.add(d);
      const top = 0.76;
      const rec = R.recorder(); rec.position.set(o.x - Rm.x - 0.1, top, o.z - Rm.z + 0.05); rec.rotation.y = 0.12; inside.add(rec);
      fx.reels = rec.userData.reels; fx.recLed = rec.userData.led; fx.recorder = rec;
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.36, 28), new THREE.MeshBasicMaterial({ color: 0x3fd0c4, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(o.x - Rm.x - 0.1, top + 0.01, o.z - Rm.z + 0.05); inside.add(ring); fx.recRing = ring;
      [[0.45, 0.2, 0.3], [0.52, 0.0, -0.2], [0.4, -0.15, 0.6]].forEach(([dx, dz, r], i) => { const c = R.cassette(i ? 'ع' : '؟'); c.position.set(o.x - Rm.x + dx, top + i * 0.013, o.z - Rm.z + dz); c.rotation.y = r; inside.add(c); });
      const paper = canvasTex(64, 80, (x, w, h) => { x.fillStyle = '#f4efe2'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(30,30,60,.5)'; for (let l = 0; l < 7; l++) { x.beginPath(); x.moveTo(6, 10 + l * 10); x.lineTo(w - 6 - (l % 3) * 8, 10 + l * 10); x.stroke(); } });
      [[-0.55, 0.05, 0.4], [-0.35, -0.15, -0.3]].forEach(([dx, dz, r]) => { const p = plane(0.21, 0.28, paper, o.x - Rm.x + dx, top + 0.005, o.z - Rm.z + dz, r, -Math.PI / 2); inside.add(p); });
      inside.add(cy(0.04, 0.035, 0.09, 0xf0ece0, 10, o.x - Rm.x - 0.75, top + 0.045, o.z - Rm.z - 0.2));
      const lampA = aa('kit_floor_lamp', { kind: 'table', shade: 'cream' }, null); lampA.position.set(o.x - Rm.x + 0.72, top, o.z - Rm.z - 0.25); inside.add(lampA);
      const lp = pool(1.3, 0xffc070, 0.35); lp.position.set(o.x - Rm.x + 0.5, top + 0.01, o.z - Rm.z); inside.add(lp); fx.deskPool = lp;
      const ch = aa('kit_chair', {}, null); ch.position.set(o.x - Rm.x - 0.1, 0, o.z - Rm.z + 0.8); ch.rotation.y = Math.PI + 0.3; inside.add(ch);
    }
    // مكتب الكمبيوتر (من المستودع) — شاشته تطالع الشرق
    for (const o of obsOf('f_desk2')) {
      const d = aa('kit_desk', { width: o.d, computer: 'desktop', wood: 'woodLight' }, () => bx(o.w, o.h, o.d, 0x9a6a3f, 0, o.h / 2, 0)); d.position.set(o.x - Rm.x, 0, o.z - Rm.z); d.rotation.y = Math.PI / 2; inside.add(d);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.27), new THREE.MeshBasicMaterial({ map: canvasTex(128, 80, () => {}) })); scr.position.set(o.x - Rm.x + 0.02, 1.02, o.z - Rm.z); scr.rotation.y = Math.PI / 2; inside.add(scr); fx.monitors.push(scr.material.map);
      const ch = aa('kit_chair', {}, null); ch.position.set(o.x - Rm.x + 0.85, 0, o.z - Rm.z + 0.1); ch.rotation.y = -Math.PI / 2 + 0.4; inside.add(ch);
    }
    // رف كتب وملفات (من المستودع) على الجدار الشرقي
    for (const o of obsOf('f_shelf')) { const b = aa('kit_bookshelf', {}, () => bx(o.w, o.h, o.d, 0x6a4529, 0, o.h / 2, 0)); b.position.set(o.x - Rm.x, 0, o.z - Rm.z); b.rotation.y = -Math.PI / 2; b.scale.setScalar(0.95); inside.add(b); }
    // طاولة الخريطة: خريطة شبكة روافد بدبابيس وخيوط
    for (const o of obsOf('f_table')) {
      const tb = aa('kit_table', { width: o.w, depth: o.d }, () => bx(o.w, o.h, o.d, 0x8a6240, 0, o.h / 2, 0)); tb.position.set(o.x - Rm.x, 0, o.z - Rm.z); inside.add(tb);
      const map = plane(o.w * 0.92, o.d * 0.85, mapTex(), o.x - Rm.x, 0.79, o.z - Rm.z, 0, -Math.PI / 2); inside.add(map);
      for (let i = 0; i < 4; i++) inside.add(cy(0.012, 0.012, 0.08, [0xc0392b, 0x2f6fb3, 0xf0c03a, 0xc0392b][i], 6, o.x - Rm.x - 0.45 + i * 0.3, 0.83, o.z - Rm.z + (i % 2 ? -0.15 : 0.12)));
      const torch = cy(0.025, 0.03, 0.2, 0x2a2a2a, 8, o.x - Rm.x + 0.5, 0.82, o.z - Rm.z + 0.3); torch.rotation.z = Math.PI / 2; inside.add(torch);
    }
    // لوحة مذكرات على الجدار الغربي، وساعة وتقويم
    inside.add(plane(1.4, 1.0, corkTex(), -hw + t + 0.02, 1.7, 0.6, Math.PI / 2));
    const clock = canvasTex(64, 64, (x) => { x.fillStyle = '#f4f2ec'; x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 3; x.stroke(); x.beginPath(); x.moveTo(32, 32); x.lineTo(32, 12); x.moveTo(32, 32); x.lineTo(46, 38); x.stroke(); });
    inside.add(plane(0.35, 0.35, clock, 1.6, 2.35, -hd + t + 0.02, 0));
    inside.add(plane(0.4, 0.55, labelTex('١٤', 'رجب', '#f4efe2'), 2.6, 1.9, -hd + t + 0.02, 0));
    // أدوات من المستودع: طفاية حريق، صندوق عدة، بكرة كيابل
    const ext = aa('kit_safety', {}, null); ext.position.set(hw - 0.55, 0, hd - 0.55); inside.add(ext);
    const tb2 = aa('kit_toolbox', {}, null); tb2.position.set(-1.0, 0, -hd + 0.75); inside.add(tb2);
    const sp2 = aa('kit_electrical', {}, null); sp2.position.set(-hw + 0.55, 0, hd - 0.6); inside.add(sp2);
    // أوراق على الأرض
    const fp = canvasTex(32, 40, (x, w, h) => { x.fillStyle = '#efe9da'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(40,40,60,.4)'; for (let l = 0; l < 5; l++) { x.beginPath(); x.moveTo(4, 6 + l * 7); x.lineTo(w - 4, 6 + l * 7); x.stroke(); } });
    for (let i = 0; i < 9; i++) { const p = plane(0.21, 0.28, fp, -2.5 + Math.random() * 5, 0.025 + i * 0.001, -1.6 + Math.random() * 3.4, Math.random() * 6, -Math.PI / 2); inside.add(p); }
    // المذكرات: ورقة تلمع لين تنقرا
    (L.notes || []).forEach((n, i) => {
      const nt = canvasTex(64, 80, (x, w, h) => { x.fillStyle = '#fff6b0'; x.fillRect(0, 0, w, h); x.fillStyle = '#c0392b'; x.fillRect(0, 0, w, 10); x.strokeStyle = 'rgba(30,30,60,.6)'; x.lineWidth = 2; for (let l = 0; l < 5; l++) { x.beginPath(); x.moveTo(6, 22 + l * 11); x.lineTo(w - 8, 22 + l * 11); x.stroke(); } });
      const y = i === 1 ? 1.25 : 0.82;
      const px = i === 0 ? n.x - 0.55 : i === 1 ? n.x : n.x + 0.45, pz = i === 1 ? n.z - 0.62 : n.z;
      const m = plane(0.22, 0.28, nt, px - Rm.x, y, pz - Rm.z, i === 1 ? 0 : 0.3, i === 1 ? 0 : -Math.PI / 2);
      inside.add(m);
      const gl = glow(0.6, 0xfff2a0, 0.6); gl.position.set(px - Rm.x, y + 0.05, pz - Rm.z); inside.add(gl);
      fx.notes.push(gl);
    });
    // إضاءة: لمبتين فلورسنت (ترمش وحدة)، مروحة سقف، ضوء إنذار أحمر
    [[-1.4, -0.6], [1.6, -0.2]].forEach(([x, z], i) => {
      const tube = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.12), basic(0xeaf6ff)); tube.position.set(x, H - 0.08, z); inside.add(tube);
      const pl = pool(2.2, 0xd8ecff, 0.32); pl.position.set(x, 0.03, z); inside.add(pl);
      fx.tubes.push({ tube, pl, bad: i === 1 });
    });
    const fan = new THREE.Group(); fan.position.set(0, H - 0.25, 0.4); inside.add(fan);
    fan.add(cy(0.08, 0.08, 0.12, 0x2a2a2a, 10, 0, 0.08, 0)); fan.add(cy(0.02, 0.02, 0.3, 0x2a2a2a, 6, 0, 0.25, 0));
    for (let k = 0; k < 3; k++) { const b = bx(0.75, 0.02, 0.14, 0x6a4529, 0.4, 0, 0); const arm = new THREE.Group(); arm.rotation.y = k * Math.PI * 2 / 3; arm.add(b); fan.add(arm); }
    fx.fan = fan;
    const red = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), basic(0x551511)); red.position.set(0, H - 0.1, -hd + t + 0.1); inside.add(red);
    const redPool = pool(3.2, 0xff2a1a, 0); redPool.position.set(0, 0.04, 0); inside.add(redPool);
    fx.alarmLights.push({ red, redPool });
    // غبار يلمع في ضوء اللمبات
    const N = 60, dp = new Float32Array(N * 3); for (let i = 0; i < N; i++) { dp[i * 3] = (Math.random() - 0.5) * (Rm.w - 1); dp[i * 3 + 1] = 0.3 + Math.random() * 2.4; dp[i * 3 + 2] = (Math.random() - 0.5) * (Rm.d - 1); }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    const motes = new THREE.Points(dg, new THREE.PointsMaterial({ map: soft(), color: 0xfff0d0, size: 0.06, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); inside.add(motes); fx.motes = { motes, dp, N };

    fx.walls = walls; fx.room = room; fx.Rm = Rm; fx.cut = 0;
    return fx;
  };

  // ---------- تحديث كل إطار ----------
  R.update = function (fx, S, dt, t, inRoom, powerOff, alarm) {
    if (!fx) return;
    // قصّ الجدار القدامي والسقف لما يكون داخل
    fx.cut += ((inRoom ? 1 : 0) - fx.cut) * Math.min(1, dt * 5);
    const c = fx.cut;
    for (const w of fx.walls) if (w.front) { if (w.plain) w.m.visible = c < 0.5; else w.m.material.opacity = 1 - c * 0.85; }
    fx.roof.material.opacity = 1 - c; fx.roof.visible = c < 0.98;
    for (const f of fx.fade) f.visible = c < 0.6;
    fx.inside.visible = c > 0.02 || !inRoom; // داخل الغرفة ينرسم دايماً (يبان من الباب)
    // لمبات الأجهزة
    for (const l of fx.leds) { const on = !powerOff && Math.sin(t * l.sp + l.ph) > -0.2; l.m.material.color.setHex(on ? l.cols : 0x111111); }
    // شاشات: موجات وأسطر نص
    for (const tex of fx.scopes) {
      const cv = tex.userData.canvas, x = cv.getContext('2d'); x.fillStyle = powerOff ? '#050605' : '#071a0c'; x.fillRect(0, 0, cv.width, cv.height);
      if (!powerOff) { x.strokeStyle = '#4dff7a'; x.lineWidth = 2; x.beginPath(); for (let i = 0; i <= cv.width; i += 2) x.lineTo(i, cv.height / 2 + Math.sin(i * 0.12 + t * 6) * 14 * Math.sin(t * 0.7 + i * 0.01) + (Math.random() - 0.5) * 4); x.stroke(); }
      tex.needsUpdate = true;
    }
    if (Math.floor(t * 4) !== fx._mt) {
      fx._mt = Math.floor(t * 4);
      for (const tex of fx.monitors) {
        const cv = tex.userData.canvas, x = cv.getContext('2d'); x.fillStyle = powerOff ? '#050505' : '#0a1420'; x.fillRect(0, 0, cv.width, cv.height);
        if (!powerOff) { x.fillStyle = '#5fd0ff'; x.font = '10px monospace'; for (let l = 0; l < 6; l++) x.fillText(['SDM> SENSOR 3: CONTAM', 'SDM> STATION 4: CLOSE', 'SDM> OVERRIDE: DENIED', 'SDM> PROTOCOL L: 1/2', 'SDM> WAIT ASSIST...', 'SDM> ' + (Math.random() * 1e6 | 0)][(l + fx._mt) % 6], 6, 14 + l * 11); }
        tex.needsUpdate = true;
      }
    }
    // فلورسنت: وحدة ترمش
    for (const tb of fx.tubes) { const on = !powerOff && !(tb.bad && (Math.sin(t * 17) > 0.6 || Math.sin(t * 3.1) > 0.92)); tb.tube.material.color.setHex(on ? 0xeaf6ff : 0x333840); tb.pl.material.opacity = on ? 0.32 : 0.02; }
    if (fx.deskPool) fx.deskPool.material.opacity = powerOff ? 0 : 0.35;
    // مروحة
    if (fx.fan) fx.fan.rotation.y += dt * (powerOff ? 0.3 : 7);
    // ضوء الإنذار
    for (const a of fx.alarmLights) { const on = alarm > 0.05 && Math.floor(t * 4) % 2 === 0; a.red.material.color.setHex(on ? 0xff3322 : 0x551511); a.redPool.material.opacity = on ? 0.4 * alarm : 0; }
    // المسجّل: البكرات تلف وقت التشغيل
    const playing = S.action && S.action.kind === 'play';
    if (fx.reels) for (const r of fx.reels) r.rotation.z -= dt * (playing ? 9 : 0);
    if (fx.recLed) fx.recLed.material.color.setHex(playing ? (Math.floor(t * 6) % 2 ? 0xff3322 : 0x441111) : 0x441111);
    if (fx.recRing) { fx.recRing.visible = !S.objectiveTaken; fx.recRing.scale.setScalar(1 + Math.sin(t * 3) * 0.12); }
    // المذكرات اللي ما انقرت تلمع
    fx.notes.forEach((g, i) => { g.material.opacity = S.notesRead[i] ? 0 : 0.35 + Math.sin(t * 3 + i) * 0.25; });
    // غبار
    const M = fx.motes; for (let i = 0; i < M.N; i++) { M.dp[i * 3 + 1] += Math.sin(t * 0.5 + i) * dt * 0.05; M.dp[i * 3] += Math.cos(t * 0.3 + i) * dt * 0.04; }
    M.motes.geometry.attributes.position.needsUpdate = true; M.motes.material.opacity = powerOff ? 0.15 : 0.6;
  };

  // ---------- البوابة المقفلة وشبك الأنابيب ----------
  R.gate = function (scene, o) {
    const g = new THREE.Group(); g.position.set(o.x, 0, o.z); scene.add(g);
    const slide = new THREE.Group(); g.add(slide);
    slide.add(bx(o.w, 0.12, 0.12, 0x5a6168, 0, 0.15, 0), bx(o.w, 0.12, 0.12, 0x5a6168, 0, o.h - 0.1, 0));
    for (let x = -o.w / 2 + 0.1; x <= o.w / 2; x += 0.22) slide.add(bx(0.05, o.h, 0.05, 0x6b7076, x, o.h / 2, 0));
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(o.w, 0.3), new THREE.MeshLambertMaterial({ map: (() => { const t = document.createElement('canvas'); t.width = 128; t.height = 16; const x = t.getContext('2d'); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#1a1a1a' : '#e8c23a'; x.beginPath(); x.moveTo(i * 8, 0); x.lineTo(i * 8 + 8, 0); x.lineTo(i * 8, 16); x.lineTo(i * 8 - 8, 16); x.fill(); } return new THREE.CanvasTexture(t); })(), side: THREE.DoubleSide }));
    stripe.position.set(0, 1.2, 0.07); slide.add(stripe);
    const box = bx(0.3, 0.45, 0.2, 0x3a3f45, o.w / 2 + 0.35, 1.3, 0.3); g.add(box);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), basic(0xff3322)); led.position.set(o.w / 2 + 0.35, 1.45, 0.42); g.add(led);
    const gl = glow(1.0, 0xff3322, 0.8); gl.position.copy(led.position); g.add(gl);
    return { kind: 'gate', g, slide, led, gl, w: o.w, open: 0 };
  };
  R.grate = function (scene, o) {
    const g = new THREE.Group(); g.position.set(o.x, 0, o.z); scene.add(g);
    const panel = new THREE.Group(); g.add(panel);
    for (let x = -o.w / 2; x <= o.w / 2 + 0.01; x += 0.2) panel.add(bx(0.03, o.h, 0.03, 0x7a8086, x, o.h / 2, 0));
    for (let y = 0.15; y < o.h; y += 0.25) panel.add(bx(o.w, 0.03, 0.03, 0x7a8086, 0, y, 0));
    const lock = bx(0.18, 0.22, 0.08, 0xb03020, 0, 0.7, 0.06); panel.add(lock);
    return { kind: 'grate', g, panel, lock, open: 0 };
  };
  R.updateGate = function (G, open, dt) {
    G.open += ((open ? 1 : 0) - G.open) * Math.min(1, dt * 1.5);
    if (G.kind === 'gate') {
      G.slide.position.x = -G.w * 0.95 * G.open;
      const col = open ? 0x33ff66 : 0xff3322; G.led.material.color.setHex(col); G.gl.material.color.setHex(col);
    } else {
      G.panel.rotation.x = -Math.PI / 2 * G.open; G.panel.position.z = 0.6 * G.open; G.lock.visible = !open;
    }
  };

  root.ROOM = R;
})(typeof globalThis !== 'undefined' ? globalThis : this);

// ذيبان — الأجواء: سماء الليل، القمر، الجبال، الغبار، أشعة الأضواء، الكشافات الضوئية، أضواء الإنذار، وأغراض الموقع.
// كل شيء مبني بالكود وخفيف على الجوال (بدون أضواء حقيقية كثيرة: الأشعة والبقع مزيفة بمواد شفافة).
(function (root) {
  'use strict';
  const THREE = root.THREE, TH = root.TH;
  const FX = {};

  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const mats = {};
  function lam(c, o) { const k = c + JSON.stringify(o || {}); return mats[k] || (mats[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o || {}))); }
  function shade(m) { m.traverse(o => { if (o.isMesh && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } }); return m; }
  function bx(w, h, d, c, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(c)); m.position.set(x || 0, y || 0, z || 0); return m; }
  function cy(rt, rb, h, c, seg, x, y, z) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 12), lam(c)); m.position.set(x || 0, y || 0, z || 0); return m; }
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); return t; }

  // ---------- مادة الشعاع: مخروط مضيء يخف مع الطول وعند الأطراف ----------
  function beamMat(color, strength, fall) {
    return new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uStr: { value: strength }, uFall: { value: fall || 1.4 } },
      vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = uv.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uColor; uniform float uStr; uniform float uFall; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float e = pow(abs(dot(vN, vV)), 1.6); float a = uStr * e * (0.15 + 0.85 * pow(vY, uFall)); gl_FragColor = vec4(uColor * a, a); }',
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false
    });
  }
  // شعاع من نقطة a إلى نقطة b (الرأس عند a)
  const UP = new THREE.Vector3(0, 1, 0), va = new THREE.Vector3(), vb = new THREE.Vector3();
  function aimBeam(m, ax, ay, az, bx_, by, bz, rBottom) {
    va.set(ax, ay, az); vb.set(bx_, by, bz);
    const L = va.distanceTo(vb);
    m.position.copy(va).add(vb).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, va.sub(vb).normalize());
    m.scale.set(rBottom, L, rBottom);
  }
  function makeBeam(color, strength, fall, topRatio) {
    const g = new THREE.CylinderGeometry(topRatio || 0.12, 1, 1, 24, 1, true);
    const m = new THREE.Mesh(g, beamMat(color, strength, fall)); m.renderOrder = 3; m.frustumCulled = false; return m;
  }

  let softTex = null;
  function soft() {
    return softTex || (softTex = canvasTex(128, 128, (x) => {
      const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    }));
  }
  function pool(r, color, op) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: soft(), color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.04; m.renderOrder = 2; return m;
  }
  function glow(size, color, op) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft(), color, transparent: true, opacity: op == null ? 0.9 : op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    s.scale.set(size, size, 1); s.renderOrder = 4; return s;
  }

  // ---------- خامة الرمل ----------
  FX.sandTexture = function () {
    const t = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#7a6550'; x.fillRect(0, 0, w, h);
      const r = rng(3);
      for (let i = 0; i < 2600; i++) { const v = r(); x.fillStyle = v > 0.5 ? 'rgba(255,230,190,.07)' : 'rgba(40,25,10,.08)'; x.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
      x.strokeStyle = 'rgba(30,18,8,.12)'; x.lineWidth = 2;
      for (let k = 0; k < 9; k++) { x.beginPath(); const y0 = k * h / 9 + r() * 8; for (let i = 0; i <= w; i += 8) x.lineTo(i, y0 + Math.sin(i * 0.05 + k) * 6); x.stroke(); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(26, 26); t.anisotropy = 4;
    return t;
  };

  // ---------- السماء والقمر والجبال ----------
  FX.sky = function (scene) {
    const g = new THREE.SphereGeometry(110, 32, 16);
    const m = new THREE.ShaderMaterial({
      uniforms: { uAlarm: { value: 0 } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform float uAlarm; varying vec3 vP; void main(){ float y = vP.y; vec3 hor = mix(vec3(0.24,0.16,0.12), vec3(0.35,0.06,0.05), uAlarm); vec3 mid = vec3(0.07,0.09,0.15); vec3 top = vec3(0.012,0.018,0.04); vec3 c = y < 0.12 ? mix(hor, mid, smoothstep(-0.05, 0.12, y)) : mix(mid, top, smoothstep(0.12, 0.7, y)); gl_FragColor = vec4(c, 1.0); }',
      side: THREE.BackSide, depthWrite: false, fog: false
    });
    const sky = new THREE.Mesh(g, m); sky.renderOrder = -10; scene.add(sky);

    // نجوم
    const sp = [], r0 = rng(7);
    for (let i = 0; i < 700; i++) { const a = r0() * Math.PI * 2, e = 0.12 + r0() * 1.3; sp.push(Math.cos(a) * Math.cos(e) * 100, Math.sin(e) * 100, Math.sin(a) * Math.cos(e) * 100); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdbe6ff, size: 0.45, fog: false, transparent: true, opacity: 0.9, depthWrite: false }));
    scene.add(stars);

    // القمر
    const moonTex = canvasTex(256, 256, (x) => {
      const g2 = x.createRadialGradient(128, 128, 30, 128, 128, 128); g2.addColorStop(0, 'rgba(210,225,255,.55)'); g2.addColorStop(1, 'rgba(210,225,255,0)');
      x.fillStyle = g2; x.fillRect(0, 0, 256, 256);
      x.fillStyle = '#eef2ff'; x.beginPath(); x.arc(128, 128, 34, 0, Math.PI * 2); x.fill();
      x.fillStyle = 'rgba(150,160,190,.35)'; for (const [a, b, r] of [[118, 120, 8], [140, 136, 6], [125, 145, 5]]) { x.beginPath(); x.arc(a, b, r, 0, Math.PI * 2); x.fill(); }
    });
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, fog: false, depthWrite: false, transparent: true }));
    moon.scale.set(26, 26, 1); moon.renderOrder = -9; scene.add(moon);

    // سلسلة جبال داكنة على الأفق
    const r = rng(11), N = 140, pos = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const a = i / N * Math.PI * 2, R = 92;
      const h = 5 + Math.abs(Math.sin(a * 3.1)) * 7 + Math.sin(a * 11.3) * 2 + r() * 2.5;
      pos.push(Math.cos(a) * R, -2, Math.sin(a) * R, Math.cos(a) * R, h, Math.sin(a) * R);
      if (i < N) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); mg.setIndex(idx);
    const mountains = new THREE.Mesh(mg, new THREE.MeshBasicMaterial({ color: 0x0a0c13, fog: false, side: THREE.DoubleSide })); mountains.renderOrder = -8;
    scene.add(mountains);
    return { sky, stars, moon, mountains };
  };

  // ---------- الغبار والرمل الطاير ----------
  FX.dust = function (scene) {
    const N = 650, pos = new Float32Array(N * 3), r = rng(5);
    for (let i = 0; i < N; i++) { pos[i * 3] = (r() - 0.5) * 44; pos[i * 3 + 1] = r() * 6; pos[i * 3 + 2] = (r() - 0.5) * 34; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: soft(), color: 0xd6b48a, size: 0.16, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    pts.frustumCulled = false; scene.add(pts);

    // رمل يزحف على الأرض: طبقة شفافة بخطوط، تتحرك مع الريح
    const drift = canvasTex(256, 256, (x, w, h) => {
      const rr = rng(9);
      for (let i = 0; i < 70; i++) { const y = rr() * h, l = 40 + rr() * 140, xx = rr() * w; const gr = x.createLinearGradient(xx, 0, xx + l, 0); gr.addColorStop(0, 'rgba(230,200,150,0)'); gr.addColorStop(0.5, 'rgba(230,200,150,.55)'); gr.addColorStop(1, 'rgba(230,200,150,0)'); x.fillStyle = gr; x.fillRect(xx, y, l, 1 + rr() * 2); }
    });
    drift.wrapS = drift.wrapT = THREE.RepeatWrapping; drift.repeat.set(5, 5);
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshBasicMaterial({ map: drift, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
    sheet.rotation.x = -Math.PI / 2; sheet.position.y = 0.06; sheet.renderOrder = 1; scene.add(sheet);
    return { pts, pos, N, sheet, drift };
  };
  FX.updateDust = function (D, cx, cz, dt, t) {
    const p = D.pos, wind = 3.2 + Math.sin(t * 0.4) * 1.6;
    for (let i = 0; i < D.N; i++) {
      let x = p[i * 3] + wind * dt * (0.7 + (i % 7) * 0.08), y = p[i * 3 + 1] + Math.sin(t * 2 + i) * dt * 0.3, z = p[i * 3 + 2] + Math.sin(t * 0.7 + i * 0.3) * dt * 0.6;
      // لف حول الكاميرا
      if (x - cx > 22) x -= 44; if (x - cx < -22) x += 44; if (z - cz > 17) z -= 34; if (z - cz < -17) z += 34;
      if (y < 0) y += 6; if (y > 6) y -= 6;
      p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
    }
    D.pts.geometry.attributes.position.needsUpdate = true;
    D.drift.offset.x -= dt * wind * 0.012; D.drift.offset.y += dt * 0.004;
    D.sheet.position.x = Math.round(cx / 10) * 10; D.sheet.position.z = Math.round(cz / 10) * 10;
  };

  // ---------- عمود إنارة بشعاع ----------
  FX.lamp = function (scene, x, z, color, flicker) {
    const g = new THREE.Group();
    g.add(bx(0.14, 4.2, 0.14, 0x3c4248, 0, 2.1, 0), bx(0.9, 0.08, 0.1, 0x3c4248, 0.35, 4.15, 0));
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.32), new THREE.MeshBasicMaterial({ color: 0xffe9c0 })); head.position.set(0.7, 4.05, 0); g.add(head);
    const h = glow(1.6, color, 0.9); h.position.set(0.7, 3.95, 0); g.add(h);
    const beam = makeBeam(color, 0.55, 1.6, 0.08); aimBeam(beam, 0.7, 3.95, 0, 0.7, 0, 0, 2.6); g.add(beam);
    const p = pool(3.6, color, 0.42); p.position.x = 0.7; g.add(p);
    g.position.set(x, 0, z); shade(g); scene.add(g);
    return { g, head, beam, pool: p, glow: h, color: new THREE.Color(color), flicker: !!flicker, seed: x * 3.1 + z };
  };

  // ---------- الكشاف الضوئي ----------
  FX.searchlight = function (scene, l) {
    const head = new THREE.Group();
    head.add(cy(0.35, 0.45, 0.6, 0x30353b, 14));
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.33, 16), new THREE.MeshBasicMaterial({ color: 0xffffff })); lens.position.y = -0.31; lens.rotation.x = Math.PI / 2; head.add(lens);
    head.position.set(l.sx, l.sh, l.sz); scene.add(head);
    const g = glow(3, 0xfff3d8, 1); g.position.set(l.sx, l.sh, l.sz); scene.add(g);
    const beam = makeBeam(0xfff1d0, 0.7, 0.55, 0.1); scene.add(beam);
    const spot = pool(l.r * 1.15, 0xfff1d0, 0.85); spot.renderOrder = 3; scene.add(spot);
    const ring = new THREE.Mesh(new THREE.RingGeometry(l.r - 0.08, l.r, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; scene.add(ring);
    return { l, head, beam, spot, ring, glow: g };
  };
  FX.updateSearchlight = function (o, S, i) {
    const [x, z] = TH.lightPos(S, o.l), st = S.lights[i] || { meter: 0 };
    aimBeam(o.beam, o.l.sx, o.l.sh - 0.2, o.l.sz, x, 0, z, o.l.r);
    o.spot.position.set(x, 0.05, z); o.ring.position.set(x, 0.05, z);
    o.head.lookAt(x, 0, z); o.head.rotateX(Math.PI / 2);
    const danger = st.meter;
    const c = new THREE.Color(0xfff1d0).lerp(new THREE.Color(0xff3a2a), Math.min(1, danger * 1.4));
    o.spot.material.color.copy(c); o.beam.material.uniforms.uColor.value.copy(c); o.ring.material.color.copy(c);
    o.ring.material.opacity = 0.35 + danger * 0.6;
  };

  // ---------- أضواء الإنذار الحمراء (تشتغل وقت الإنذار) ----------
  FX.beacon = function (scene, x, y, z) {
    const g = new THREE.Group();
    g.add(cy(0.16, 0.2, 0.3, 0x2a1a1a, 10, 0, 0, 0));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshBasicMaterial({ color: 0x551511 })); bulb.position.y = 0.2; g.add(bulb);
    const spin = new THREE.Group(); spin.position.y = 0.2; g.add(spin);
    const b1 = makeBeam(0xff2a1a, 0.9, 0.8, 0.05); aimBeam(b1, 0, 0, 0, 7, -y + 0.2, 0, 1.4); spin.add(b1);
    const h = glow(2.4, 0xff2a1a, 0); h.position.y = 0.2; g.add(h);
    const p = pool(4, 0xff2a1a, 0); p.position.y = -y + 0.06; g.add(p);
    g.position.set(x, y, z); scene.add(g);
    spin.visible = false;
    return { g, bulb, spin, glow: h, pool: p };
  };
  FX.updateBeacon = function (b, alarm, t, dt) {
    b.spin.visible = alarm > 0.05;
    b.spin.rotation.y += dt * 4.5;
    const blink = 0.6 + 0.4 * Math.sin(t * 9);
    b.glow.material.opacity = alarm * blink;
    b.pool.material.opacity = alarm * 0.35 * blink;
    b.bulb.material.color.setHex(alarm > 0.05 ? 0xff3322 : 0x551511);
    b.spin.children[0].material.uniforms.uStr.value = 0.9 * alarm;
  };

  // ---------- أغراض الموقع ----------
  let signTex = null;
  function rawafidSign() {
    return signTex || (signTex = canvasTex(512, 256, (x, w, h) => {
      x.fillStyle = '#e8e4da'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#1f5f8b'; x.fillRect(0, 0, w, 26); x.fillRect(0, h - 26, w, 26);
      // قطرة ماء
      x.fillStyle = '#2f86c0'; x.beginPath(); x.moveTo(430, 60); x.bezierCurveTo(470, 115, 470, 150, 430, 175); x.bezierCurveTo(390, 150, 390, 115, 430, 60); x.fill();
      x.fillStyle = '#1b2a36'; x.textAlign = 'right'; x.direction = 'rtl';
      x.font = 'bold 70px Cairo, sans-serif'; x.fillText('مشروع روافد', 380, 130);
      x.font = 'bold 34px Cairo, sans-serif'; x.fillStyle = '#5a6670'; x.fillText('محطة ٧ · ممنوع الدخول', 380, 190);
    }));
  }

  FX.prop = {
    post(o) { // برج حراسة: أربع أرجل، منصة، درابزين، سقف، سلّم
      const g = new THREE.Group(), H = 4.6, w = o.w / 2 - 0.15;
      for (const [a, b] of [[-w, -w], [w, -w], [w, w], [-w, w]]) g.add(bx(0.18, H, 0.18, 0x4a3a2a, a, H / 2, b));
      g.add(bx(o.w, 0.2, o.d, 0x5c4630, 0, H, 0));
      for (const [a, b, ww, dd] of [[0, -w, o.w, 0.08], [0, w, o.w, 0.08], [-w, 0, 0.08, o.d], [w, 0, 0.08, o.d]]) g.add(bx(ww, 0.9, dd, 0x5c4630, a, H + 0.55, b));
      for (const [a, b] of [[-w, -w], [w, -w], [w, w], [-w, w]]) g.add(bx(0.1, 1.9, 0.1, 0x4a3a2a, a, H + 1.05, b));
      g.add(bx(o.w + 0.5, 0.15, o.d + 0.5, 0x3a2e22, 0, H + 2.05, 0));
      for (let y = 0.4; y < H; y += 0.45) g.add(bx(0.7, 0.06, 0.06, 0x6b5238, 0, y, o.d / 2 + 0.15));
      g.add(bx(0.06, H, 0.06, 0x6b5238, -0.33, H / 2, o.d / 2 + 0.15), bx(0.06, H, 0.06, 0x6b5238, 0.33, H / 2, o.d / 2 + 0.15));
      g.position.set(o.x, 0, o.z); return shade(g);
    },
    truck(o) { // وانيت عسكري مهجور
      const g = new THREE.Group(), body = 0x7c6c4e;
      g.add(bx(o.w, 0.7, o.d, body, 0, 0.85, 0));
      g.add(bx(o.w - 0.1, 0.95, 1.6, body, 0, 1.65, o.d / 2 - 1.0));
      g.add(bx(o.w - 0.06, 0.45, 0.06, 0x1a232b, 0, 1.75, o.d / 2 - 0.18));
      g.add(bx(0.06, 0.4, 1.2, 0x1a232b, o.w / 2 - 0.04, 1.75, o.d / 2 - 1.0), bx(0.06, 0.4, 1.2, 0x1a232b, -o.w / 2 + 0.04, 1.75, o.d / 2 - 1.0));
      for (const s of [-1, 1]) g.add(bx(0.08, 0.5, o.d - 1.9, body, s * (o.w / 2 - 0.04), 1.45, -0.9));
      g.add(bx(o.w - 0.2, 0.08, o.d - 1.9, 0x3a3226, 0, 1.22, -0.9));
      for (const [a, b] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const wh = cy(0.42, 0.42, 0.32, 0x1d1d1d, 14, a * (o.w / 2 - 0.05), 0.42, b * (o.d / 2 - 0.85)); wh.rotation.z = Math.PI / 2; g.add(wh); }
      g.add(bx(1.0, 0.5, 0.8, 0x4c5a44, 0.25, 1.5, -1.2)); // صندوق في الحوض
      g.position.set(o.x, 0, o.z); g.rotation.y = 0.04; return shade(g);
    },
    tank(o) { // خزان مياه روافد عليه لوحة المشروع
      const g = new THREE.Group(), R = o.w / 2;
      g.add(cy(R, R, o.h, 0xb7b0a2, 24, 0, o.h / 2, 0));
      for (const y of [0.8, 2.1, 3.4]) g.add(cy(R + 0.03, R + 0.03, 0.12, 0x8d877b, 24, 0, y, 0));
      const top = new THREE.Mesh(new THREE.SphereGeometry(R, 24, 6, 0, Math.PI * 2, 0, Math.PI / 6), lam(0xa9a296)); top.position.y = o.h - R * Math.cos(Math.PI / 6); g.add(top);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshLambertMaterial({ map: rawafidSign() }));
      sign.position.set(0, 2.2, R + 0.04); g.add(sign);
      for (let y = 0.3; y < o.h; y += 0.4) g.add(bx(0.06, 0.06, 0.5, 0x6d6a63, R + 0.08, y, -0.3));
      g.add(cy(0.18, 0.18, 2.4, 0x56636c, 10, R + 0.6, 0.18, 0.6)).rotation.x = Math.PI / 2;
      g.position.set(o.x, 0, o.z); g.rotation.y = 0.5; return shade(g);
    },
    gen(o) { // مولد كهربا يطقطق
      const g = new THREE.Group();
      g.add(bx(o.w, o.h, o.d, 0x4c5746, 0, o.h / 2, 0));
      for (let i = 0; i < 5; i++) g.add(bx(0.06, 0.6, 0.03, 0x262b24, -0.6 + i * 0.3, 0.75, o.d / 2 + 0.01));
      g.add(cy(0.07, 0.07, 0.9, 0x2a2a2a, 8, 0.7, o.h + 0.4, -0.3));
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffa040 })); lamp.position.set(-0.7, o.h + 0.05, 0.4); g.add(lamp);
      const gl = glow(1.2, 0xffa040, 0.8); gl.position.copy(lamp.position); g.add(gl);
      g.userData.flick = [lamp, gl];
      g.position.set(o.x, 0, o.z); return shade(g);
    },
    sandbag(o) { // أكياس رمل بصفين
      const g = new THREE.Group(), n = Math.round(Math.max(o.w, o.d) / 0.55), along = o.w > o.d;
      for (let row = 0; row < 3; row++) for (let i = 0; i < n - (row % 2); i++) {
        const u = -Math.max(o.w, o.d) / 2 + 0.3 + i * 0.55 + (row % 2) * 0.27;
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 5), lam(row % 2 ? 0x9a8762 : 0x8a7856)); b.scale.set(along ? 1 : 0.65, 0.55, along ? 0.65 : 1);
        b.position.set(along ? u : 0, 0.17 + row * 0.3, along ? 0 : u); g.add(b);
      }
      g.position.set(o.x, 0, o.z); return shade(g);
    },
    barrels(o) { // براميل صدية وزرقاء
      const g = new THREE.Group(), along = o.w > o.d, n = Math.round(Math.max(o.w, o.d) / 0.85);
      for (let i = 0; i < n; i++) {
        const u = -Math.max(o.w, o.d) / 2 + 0.42 + i * 0.85;
        const c = i % 2 ? 0x2f5f86 : 0x8a3b26;
        const b = cy(0.38, 0.38, o.h, c, 14, along ? u : 0, o.h / 2, along ? 0 : u); g.add(b);
        g.add(cy(0.39, 0.39, 0.05, 0x2b2b2b, 14, along ? u : 0, o.h * 0.7, along ? 0 : u), cy(0.39, 0.39, 0.05, 0x2b2b2b, 14, along ? u : 0, o.h * 0.3, along ? 0 : u));
      }
      g.position.set(o.x, 0, o.z); return shade(g);
    },
    cabin(o) { // كرفان مكتب الموقع، فوقه صحن ستلايت
      const g = new THREE.Group();
      g.add(bx(o.w, o.h - 0.3, o.d, 0xc9c2b2, 0, (o.h - 0.3) / 2 + 0.3, 0));
      for (const x of [-o.w / 2 + 0.4, o.w / 2 - 0.4]) for (const z of [-o.d / 2 + 0.3, o.d / 2 - 0.3]) g.add(bx(0.25, 0.3, 0.25, 0x3a3a3a, x, 0.15, z));
      for (let i = 0; i < 6; i++) g.add(bx(0.04, o.h - 0.4, 0.02, 0xa9a292, -o.w / 2 + 0.35 + i * (o.w - 0.7) / 5, o.h / 2 + 0.15, o.d / 2 + 0.01));
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6), new THREE.MeshBasicMaterial({ color: 0xffc070 })); win.position.set(0.9, 1.65, o.d / 2 + 0.02); g.add(win); g.userData.lit = [win];
      g.add(bx(0.8, 1.9, 0.04, 0x6d6658, -0.9, 1.25, o.d / 2 + 0.02));
      g.add(bx(1.2, 0.08, 1.0, 0x5c5548, -0.9, 0.2, o.d / 2 + 0.5)); // درجة
      const ac = bx(0.7, 0.5, 0.4, 0x9a968c, 1.2, o.h + 0.1, -0.3); g.add(ac);
      const dish = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 6, 0, Math.PI * 2, 0, Math.PI / 3), lam(0xd8d8d0, { side: THREE.DoubleSide }));
      dish.rotation.x = -1.0; dish.position.set(-1.2, o.h + 0.45, 0); g.add(dish, bx(0.06, 0.5, 0.06, 0x555555, -1.2, o.h + 0.15, 0));
      g.position.set(o.x, 0, o.z); return shade(g);
    },
    barrier(o) { // حاجز خرساني (جيرسي) مع خطوط تحذير
      const g = new THREE.Group(), along = o.w > o.d, L = Math.max(o.w, o.d);
      const shape = new THREE.Shape(); shape.moveTo(-0.3, 0); shape.lineTo(0.3, 0); shape.lineTo(0.12, 0.35); shape.lineTo(0.09, o.h); shape.lineTo(-0.09, o.h); shape.lineTo(-0.12, 0.35); shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false }); geo.translate(0, 0, -L / 2);
      const m = new THREE.Mesh(geo, lam(0x8f8b83)); if (along) m.rotation.y = Math.PI / 2; g.add(m);
      for (let i = 0; i < 3; i++) { const st = bx(along ? 0.3 : 0.27, 0.14, along ? 0.27 : 0.3, i % 2 ? 0xd8c03a : 0x222222, 0, o.h * 0.62, 0); if (along) st.position.x = -L / 3 + i * L / 3; else st.position.z = -L / 3 + i * L / 3; g.add(st); }
      g.position.set(o.x, 0, o.z); return shade(g);
    },
    tires(o) { // كفرات مكدسة
      const g = new THREE.Group();
      for (const [x, z, y] of [[-0.3, -0.3, 0], [0.32, 0.25, 0], [0, 0, 0.32], [0, 0, 0.64], [-0.35, 0.3, 0]]) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.14, 8, 16), lam(0x1c1c1c)); t.rotation.x = Math.PI / 2; t.position.set(x, 0.14 + y, z); g.add(t);
      }
      g.position.set(o.x, 0, o.z); return shade(g);
    },
    pipeline(o) { // خط مياه روافد على الأرض مع محابس
      const g = new THREE.Group(), along = o.w > o.d, L = Math.max(o.w, o.d);
      const p = cy(0.26, 0.26, L, 0x3f6f8f, 14, 0, 0.32, 0); p.rotation.z = Math.PI / 2; if (!along) p.rotation.set(Math.PI / 2, 0, 0); g.add(p);
      for (let u = -L / 2 + 2; u < L / 2; u += 4) {
        const c = cy(0.3, 0.3, 0.12, 0x2f5670, 14, along ? u : 0, 0.32, along ? 0 : u); c.rotation.z = Math.PI / 2; g.add(c);
        g.add(bx(0.18, 0.32, 0.5, 0x4a4a46, along ? u : 0, 0.08, along ? 0 : u));
      }
      for (const u of [-8, 7]) { g.add(cy(0.08, 0.08, 0.4, 0x2f5670, 8, along ? u : 0, 0.72, along ? 0 : u)); const w = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 6, 14), lam(0xb03020)); w.rotation.x = Math.PI / 2; w.position.set(along ? u : 0, 0.92, along ? 0 : u); g.add(w); }
      g.position.set(o.x, 0, o.z); return shade(g);
    },
    fence(o) { // سور شبك بأسلاك شائكة
      const g = new THREE.Group(), along = o.w > o.d, Lh = Math.max(o.w, o.d), n = Math.round(Lh / 3);
      for (let i = 0; i <= n; i++) { const u = -Lh / 2 + i * Lh / n; g.add(bx(0.1, 2.4, 0.1, 0x3d4247, along ? u : 0, 1.2, along ? 0 : u)); }
      const net = new THREE.Mesh(new THREE.PlaneGeometry(Lh, 2.1), new THREE.MeshBasicMaterial({ color: 0x9aa3ab, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
      net.position.y = 1.1; if (!along) net.rotation.y = Math.PI / 2; g.add(net);
      for (const y of [2.15, 2.35]) g.add(bx(along ? Lh : 0.03, 0.03, along ? 0.03 : Lh, 0x7d858c, 0, y, 0));
      g.add(bx(along ? Lh : 0.4, 0.25, along ? 0.4 : Lh, 0x2b2620, 0, 0.12, 0));
      g.position.set(o.x, 0, o.z); return g;
    }
  };

  // ---------- لوحة الإنذار ----------
  FX.panel = function (scene, p) {
    const g = new THREE.Group();
    g.add(bx(0.7, 0.9, 0.12, 0x4a4f55, 0, 1.4, 0));
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.28), new THREE.MeshBasicMaterial({ color: 0x1f5a3a })); scr.position.set(0, 1.55, 0.065); g.add(scr);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x33ff66 })); led.position.set(0.22, 1.2, 0.08); g.add(led);
    const hl = glow(0.9, 0x33ff66, 0.7); hl.position.copy(led.position); g.add(hl);
    const lever = bx(0.08, 0.25, 0.08, 0xb03020, -0.2, 1.15, 0.1); g.add(lever);
    g.add(bx(0.04, 1.0, 0.04, 0x222222, 0.3, 0.5, 0)); // سلك نازل
    g.position.set(p.wall[0], 0, p.wall[1]); g.rotation.y = p.face || 0;
    scene.add(shade(g));
    return { g, scr, led, glow: hl, lever };
  };
  FX.updatePanel = function (P, alarmOn, powerOff, t) {
    const red = alarmOn && Math.floor(t * 4) % 2 === 0;
    const c = powerOff ? 0x111111 : alarmOn ? (red ? 0xff3322 : 0x441111) : 0x33ff66;
    P.led.material.color.setHex(c); P.glow.material.color.setHex(c); P.glow.material.opacity = powerOff ? 0 : alarmOn ? (red ? 0.9 : 0.2) : 0.6;
    P.scr.material.color.setHex(powerOff ? 0x0a0a0a : alarmOn ? 0x5a1f1f : 0x1f5a3a);
    P.lever.rotation.x = alarmOn ? 0 : 0.8;
  };

  // ---------- تفاصيل صغيرة: شجيرات، حصى، آثار كفرات، لوحات تحذير، بركة تسريب، كيابل، دخان، ومحطة بعيدة ----------
  function freeAt(L, x, z, pad) { for (const o of L.obstacles) if (Math.abs(x - o.x) < o.w / 2 + pad && Math.abs(z - o.z) < o.d / 2 + pad) return false; return true; }
  let signTex2 = null;
  function warnSign() {
    return signTex2 || (signTex2 = canvasTex(256, 160, (x, w, h) => {
      x.fillStyle = '#d9c23a'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a1a1a'; x.fillRect(8, 8, w - 16, h - 16); x.fillStyle = '#d9c23a'; x.fillRect(14, 14, w - 28, h - 28);
      x.fillStyle = '#1a1a1a'; x.textAlign = 'center'; x.direction = 'rtl'; x.font = 'bold 40px Cairo, sans-serif'; x.fillText('منطقة محظورة', w / 2, 72); x.font = 'bold 26px Cairo, sans-serif'; x.fillText('خطر · ممنوع الاقتراب', w / 2, 118);
    }));
  }
  FX.details = function (scene, L) {
    const r = rng(77), half = { w: L.size.w / 2 - 1, d: L.size.d / 2 - 1 };
    // شجيرات صحراوية يابسة
    const bushGeo = new THREE.IcosahedronGeometry(0.32, 0); const bush = new THREE.InstancedMesh(bushGeo, lam(0x5f5a3a), 60);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3(); let n = 0;
    for (let k = 0; k < 400 && n < 60; k++) {
      const x = (r() * 2 - 1) * half.w, z = (r() * 2 - 1) * half.d; if (!freeAt(L, x, z, 0.6)) continue;
      const s0 = 0.6 + r() * 0.9; q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 6); m4.compose(ps.set(x, 0.12 * s0, z), q, sc.set(s0 * 1.2, s0 * 0.6, s0)); bush.setMatrixAt(n++, m4);
    }
    bush.count = n; bush.castShadow = true; scene.add(bush);
    // حصى
    const peb = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.12, 0), lam(0x6d6152), 260); n = 0;
    for (let k = 0; k < 900 && n < 260; k++) {
      const x = (r() * 2 - 1) * (half.w + 6), z = (r() * 2 - 1) * (half.d + 6); if (!freeAt(L, x, z, 0.2)) continue;
      const s0 = 0.4 + r() * 1.2; q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, 0)); m4.compose(ps.set(x, 0.03, z), q, sc.set(s0, s0 * 0.6, s0)); peb.setMatrixAt(n++, m4);
    }
    peb.count = n; peb.receiveShadow = true; scene.add(peb);
    // آثار كفرات من البوابة الجنوبية للبوابة
    const trackTex = canvasTex(64, 256, (x, w, h) => { for (let y = 0; y < h; y += 8) { x.fillStyle = 'rgba(25,15,8,' + (0.28 + Math.random() * 0.12) + ')'; x.fillRect(4, y, 22, 5); x.fillRect(38, y + 3, 22, 5); } });
    trackTex.wrapT = THREE.RepeatWrapping; trackTex.repeat.set(1, 8);
    const tr = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 30), new THREE.MeshBasicMaterial({ map: trackTex, transparent: true, depthWrite: false }));
    tr.rotation.x = -Math.PI / 2; tr.rotation.z = 0.05; tr.position.set(-0.6, 0.035, 6.5); tr.renderOrder = 1; scene.add(tr);
    // لوحات "منطقة محظورة"
    for (const [x, z, ry] of [[-4.2, 21.3, 0], [5.6, -9.4, 0], [19.3, -3, -Math.PI / 2]]) {
      const g = new THREE.Group(); g.add(bx(0.08, 1.6, 0.08, 0x3d4247, -0.5, 0.8, 0), bx(0.08, 1.6, 0.08, 0x3d4247, 0.5, 0.8, 0));
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), new THREE.MeshLambertMaterial({ map: warnSign(), side: THREE.DoubleSide })); pl.position.y = 1.5; pl.rotation.y = Math.PI; g.add(pl);
      g.position.set(x, 0, z); g.rotation.y = ry; scene.add(shade(g));
    }
    // بركة ماء تسرّب من خزان روافد (تلمع)
    const tank = L.obstacles.find(o => o.kind === 'tank');
    let puddle = null;
    if (tank) {
      puddle = new THREE.Mesh(new THREE.CircleGeometry(1.3, 20), new THREE.MeshLambertMaterial({ color: 0x223a52, emissive: 0x0a1a2a, transparent: true, opacity: 0.85 }));
      puddle.rotation.x = -Math.PI / 2; puddle.scale.set(1.4, 0.8, 1); puddle.position.set(tank.x + 2.1, 0.03, tank.z + 1.6); scene.add(puddle);
    }
    // كيابل من المولد للأعمدة
    const gen = L.obstacles.find(o => o.kind === 'gen');
    if (gen) for (const [tx, tz] of [[-11.5, -3.2], [-17, 6], [-3.2, -9.0]]) {
      const pts = [], N = 12; for (let i = 0; i <= N; i++) { const f = i / N; pts.push(new THREE.Vector3(gen.x + (tx - gen.x) * f + Math.sin(f * 9) * 0.3, 0.04, gen.z + (tz - gen.z) * f + Math.cos(f * 7) * 0.3)); }
      const c = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.035, 4), lam(0x111111)); scene.add(c);
    }
    // تلال رمل صغيرة لازقة في الجدران والسور
    const mound = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    for (const o of L.obstacles) {
      if (o.kind !== 'wall' && o.kind !== 'ruin' && o.kind !== 'fence') continue;
      const cnt = Math.max(1, Math.round(Math.max(o.w, o.d) / 6));
      for (let i = 0; i < cnt; i++) {
        if (r() < 0.4) continue;
        const along = o.w > o.d, u = (r() - 0.5) * Math.max(o.w, o.d) * 0.9, side = r() < 0.5 ? -1 : 1;
        const x = along ? o.x + u : o.x + side * (o.w / 2 + 0.05), z = along ? o.z + side * (o.d / 2 + 0.05) : o.z + u;
        if (!freeAt({ obstacles: L.obstacles.filter(b => b !== o) }, x, z, 0.4)) continue;
        const m = new THREE.Mesh(mound, lam(0x7a6650)); m.scale.set(along ? 1.4 : 0.45, 0.32, along ? 0.45 : 1.4); m.position.set(x, 0, z); m.receiveShadow = true; scene.add(m);
      }
    }
    // دخان المولد
    const smoke = [];
    if (gen) for (let i = 0; i < 8; i++) { const sp = glow(1, 0x8a8a8a, 0); sp.material = sp.material.clone(); sp.material.blending = THREE.NormalBlending; sp.userData.ph = i / 8; sp.userData.base = [gen.x + 0.7, 1.9, gen.z - 0.3]; scene.add(sp); smoke.push(sp); }
    // محطة بعيدة في الأفق (المحطة الخامسة؟): أنوار صغيرة ورا الجبال
    const far = new THREE.Group();
    for (let i = 0; i < 14; i++) { const l = glow(0.8 + r() * 1.4, i % 5 ? 0xffc37a : 0xff4030, 0.9); l.position.set((r() - 0.5) * 9, 1 + r() * 3.5, (r() - 0.5) * 2); far.add(l); }
    const halo = glow(22, 0xff9a50, 0.18); halo.position.y = 2; far.add(halo);
    far.position.set(-26, 2, -84); scene.add(far);
    return { bush, puddle, smoke, far };
  };
  FX.updateDetails = function (D, t, powerOff) {
    if (D.puddle) D.puddle.material.emissive.setRGB(0.04 + Math.sin(t * 1.3) * 0.015, 0.1 + Math.sin(t * 1.3) * 0.03, 0.16 + Math.sin(t * 1.3) * 0.04);
    for (const sp of D.smoke) {
      const f = ((t * 0.25 + sp.userData.ph) % 1), b = sp.userData.base;
      sp.position.set(b[0] + f * 1.6, b[1] + f * 3, b[2] - f * 0.4); sp.scale.setScalar(0.5 + f * 2.2);
      sp.material.opacity = powerOff ? 0 : 0.28 * (1 - f) * Math.min(1, f * 6);
    }
    D.far.children.forEach((c, i) => { if (i < 14 && i % 5 === 0) c.material.opacity = Math.floor(t * 1.2 + i) % 2 ? 0.9 : 0.15; });
  };

  root.FX = FX;
})(typeof globalThis !== 'undefined' ? globalThis : this);

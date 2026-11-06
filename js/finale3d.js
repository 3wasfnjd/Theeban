// ذيبان — مشهد اللقاء في غرفة الصمت: ضوء أصفر دافئ وحيد، عبدالله عند الصمام اليدوي، وذيبان قدامه.
// موديل عبدالله: assets/characters/abdullah.glb (موديل عبودين من كساب) — بدون حركات، فنحرّكه بالكود
// (تنفس، التفاتة راس، ويده على الصمام). وذيبان بحركة idle من ملفه.
(function (root) {
  'use strict';
  const THREE = root.THREE, D = Math.PI / 180;
  const F = {};

  // نفس طريقة كساب: الدوران محسوب في فضاء الموديل (يطالع +x) ونحوله لدوران محلي لكل عظمة
  function poser(model) {
    const bones = {}, rest = {}, pw = {};
    model.traverse(o => { if (o.isBone) bones[o.name] = o; });
    model.updateMatrixWorld(true);
    const inv = new THREE.Quaternion(); model.getWorldQuaternion(inv); inv.invert();
    for (const n in bones) { const b = bones[n]; rest[n] = b.quaternion.clone(); const q = new THREE.Quaternion(); if (b.parent) b.parent.getWorldQuaternion(q); pw[n] = inv.clone().multiply(q); }
    const AX = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) }, r = new THREE.Quaternion();
    return function pose(P) {
      for (const n in P) {
        const b = bones[n]; if (!b) continue;
        const R = new THREE.Quaternion(); for (const [a, d] of P[n]) { r.setFromAxisAngle(AX[a], d * D); R.premultiply(r); }
        b.quaternion.copy(pw[n].clone().invert().multiply(R).multiply(pw[n]).multiply(rest[n]));
      }
    };
  }

  F.start = function (canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(root.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0603); scene.fog = new THREE.Fog(0x0b0603, 5, 13);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    const lam = c => new THREE.MeshLambertMaterial({ color: c });
    // الغرفة: أرضية وجدار خلفي وأنابيب
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), lam(0x4a3e30)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 0.3), lam(0x5a4a38)); wall.position.set(0, 2.5, -1.8); wall.receiveShadow = true; scene.add(wall);
    for (const [y, rr, c] of [[3.3, 0.16, 0x2f6fb3], [2.9, 0.11, 0x6b6f72], [0.5, 0.2, 0x5a5f3a]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, 14, 12), lam(c)); p.rotation.z = Math.PI / 2; p.position.set(0, y, -1.45); p.castShadow = true; scene.add(p); }
    // الصمام اليدوي: أنبوب نازل من فوق وعجلة
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2, 10), lam(0x6b6f72)); stem.position.set(0.95, 1.6, -0.9); stem.castShadow = true; scene.add(stem);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.4, 12), lam(0x8a6a2a)); body.position.set(0.95, 1.15, -0.9); scene.add(body);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 8, 20), new THREE.MeshLambertMaterial({ color: 0xc8952e })); wheel.position.set(0.95, 1.15, -0.62); wheel.castShadow = true; scene.add(wheel);
    for (let k = 0; k < 3; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.03, 0.03), lam(0xc8952e)); s.rotation.z = k * Math.PI / 3; wheel.add(s); }
    // اللمبة الوحيدة
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe2a0 })); bulb.position.set(0.1, 2.75, -0.2); scene.add(bulb);
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.2, 4), lam(0x111111)); wire.position.set(0.1, 3.85, -0.2); scene.add(wire);
    const lamp = new THREE.PointLight(0xffb860, 2.2, 9, 1.6); lamp.position.copy(bulb.position); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); scene.add(lamp);
    scene.add(new THREE.HemisphereLight(0x7a5a3a, 0x120a04, 0.35));
    const st = { renderer, scene, camera, t: 0, on: true, father: null, hero: null };

    const loader = THREE.GLTFLoader ? new THREE.GLTFLoader() : null;
    const v = root.TH_VERSION || '1';
    const fix = m => m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; const mt = o.material; if (mt) { mt.metalness = 0; mt.roughness = 1; if (mt.map) { mt.map.encoding = THREE.LinearEncoding; mt.map.needsUpdate = true; } } } });
    if (loader) {
      loader.load('assets/characters/abdullah.glb?v=' + v, g => {
        const m = g.scene; fix(m);
        const wrap = new THREE.Group(); m.rotation.y = -Math.PI / 2; m.scale.setScalar(1.7); wrap.add(m);
        wrap.position.set(0.55, 0, -0.55); wrap.rotation.y = -0.55; scene.add(wrap);
        st.father = { wrap, pose: poser(m) };
      }, undefined, e => console.warn('abdullah.glb', e && e.message));
      loader.load('assets/characters/theeban.glb?v=' + v, g => {
        const m = g.scene; fix(m);
        m.position.set(-1.0, 0, 0.9); m.rotation.y = Math.atan2(0.55 + 1.0, -0.55 - 0.9); scene.add(m);
        const mixer = new THREE.AnimationMixer(m), clip = g.animations.find(a => a.name === 'idle');
        if (clip) mixer.clipAction(clip).play();
        st.hero = { m, mixer };
      }, undefined, () => {});
    }
    const resize = () => { const w = root.innerWidth, h = root.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    resize(); root.addEventListener('resize', resize);
    let last = performance.now();
    (function loop(now) {
      if (!st.on) return;
      requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; st.t += dt; const t = st.t;
      // الكاميرا تقرب ببطء
      const k = Math.min(1, t / 14), e = k * k * (3 - 2 * k);
      camera.position.set(-0.9 + 0.7 * e, 1.75 - 0.15 * e, 4.6 - 1.3 * e); camera.lookAt(0.15, 0.7, -0.4);
      lamp.intensity = 2.1 + Math.sin(t * 9) * 0.05 + (Math.random() < 0.01 ? -0.6 : 0);
      if (st.father) {
        const s = Math.sin(t * 1.3);
        // يده اليمنى على الصمام، والراس يلتفت لذيبان
        st.father.pose({
          Spine02: [['z', -3 - 1.2 * s]], Spine01: [['z', -2]],
          Head: [['y', 14 + 3 * Math.sin(t * 0.4)], ['z', 6 + 1 * s]],
          L_Upperarm: [['x', 40], ['z', 26]], L_Forearm: [['z', 50], ['y', 10]],
          R_Upperarm: [['x', -4], ['z', 1.5 * s]], R_Forearm: [['z', 10]]
        });
      }
      if (st.hero) st.hero.mixer.update(dt);
      renderer.render(scene, camera);
    })(last);
    st.stop = () => { st.on = false; root.removeEventListener('resize', resize); renderer.dispose(); };
    return st;
  };
  root.FIN3D = F;
})(typeof globalThis !== 'undefined' ? globalThis : this);

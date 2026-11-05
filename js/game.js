// ذيبان — الحلقة الرئيسية، التحكم باللمس والكيبورد، الواجهة، والأصوات
(function (root) {
  'use strict';
  const TH = root.TH, W = root.WORLD, $ = id => document.getElementById(id);
  const doc = document;

  let S = null, ctx = null, running = false, last = 0, startedAt = 0;
  const input = { x: 0, z: 0, run: false };
  const keys = {};

  // ---------- الأصوات (مولّدة، بدون ملفات) ----------
  let ac = null;
  function audio() { if (!ac) { try { ac = new (root.AudioContext || root.webkitAudioContext)(); } catch (e) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
  function tone(freq, dur, type, vol, slide, delay) {
    const a = ac; if (!a) return;
    const t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  const SFX = {
    sus: () => { tone(520, 0.14, 'triangle', 0.12); tone(700, 0.18, 'triangle', 0.12, 0, 0.13); },
    alert: () => { tone(880, 0.12, 'square', 0.1); tone(660, 0.12, 'square', 0.1, 0, 0.12); tone(880, 0.2, 'square', 0.1, 0, 0.24); },
    caught: () => tone(300, 0.6, 'sawtooth', 0.12, 80),
    cp: () => { tone(660, 0.1, 'sine', 0.1); tone(990, 0.2, 'sine', 0.1, 0, 0.1); },
    radio: () => tone(1800, 0.05, 'square', 0.04),
    won: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.35, 'sine', 0.1, 0, i * 0.15)); },
    step: () => tone(90 + Math.random() * 30, 0.05, 'triangle', 0.03)
  };

  // ---------- الواجهة ----------
  const ICONS = {
    stand: '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7m0 0-3 7m3-7 3 7M8 10h8"/>',
    crouch: '<circle cx="13" cy="7" r="2"/><path d="M12 9.5 10 14l4 2-1 5M10 14l-3 1 1 6M9 11h6"/>',
    crawl: '<circle cx="19" cy="13" r="2"/><path d="M17 14H8l-4 4M8 14l3 4M13 14l2 4"/>'
  };
  const STATE_TXT = ['هادئ', 'مشتبه', 'إنذار'];
  let radioT = 0, toastT = 0, lastLevel = 0;

  function showRadio(who, text) { $('radioWho').textContent = who + ':'; $('radioTxt').textContent = text; $('radio').classList.add('on'); radioT = 4 + text.length * 0.05; SFX.radio(); }
  function toast(text, sec) { $('toast').textContent = text; $('toast').classList.add('on'); toastT = sec || 1.6; }

  function updateHud(dt) {
    const a = TH.alertLevel(S);
    const pill = $('pill'); pill.textContent = STATE_TXT[a.level]; pill.className = a.level ? 's' + a.level : '';
    const mi = $('meter').firstElementChild; mi.style.width = Math.round(a.meter * 100) + '%'; mi.style.background = a.level === 2 ? 'var(--alert)' : 'var(--sus)';
    $('flash').classList.toggle('on', a.level === 2 || S.status === 'caught');
    const st = S.player.stance;
    if ($('stance').dataset.s !== st) { $('stance').dataset.s = st; $('stIcon').innerHTML = ICONS[st]; $('stTxt').textContent = TH.STANCES[st].name; }
    const can = TH.canInteract(S); $('act').disabled = !can; $('act').classList.toggle('act', can);
    if (radioT > 0 && (radioT -= dt) <= 0) $('radio').classList.remove('on');
    if (toastT > 0 && (toastT -= dt) <= 0) $('toast').classList.remove('on');
    drawRadar();
  }

  // كاشف الأثر: الحراس القريبين (15 م) كنقاط، والخط يبين اتجاههم
  const rc = $('radar'), rx = rc.getContext('2d');
  function drawRadar() {
    const W2 = rc.width, R = W2 / 2, scale = R / 15, P = S.player;
    rx.clearRect(0, 0, W2, W2);
    rx.strokeStyle = 'rgba(63,208,196,.25)'; rx.lineWidth = 2;
    for (const k of [0.33, 0.66]) { rx.beginPath(); rx.arc(R, R, R * k, 0, Math.PI * 2); rx.stroke(); }
    const sweep = (performance.now() / 1000) % 2 / 2 * Math.PI * 2;
    rx.fillStyle = 'rgba(63,208,196,.12)'; rx.beginPath(); rx.moveTo(R, R); rx.arc(R, R, R, sweep - 0.5, sweep); rx.closePath(); rx.fill();
    for (const g of S.guards) {
      const dx = (g.x - P.x) * scale, dz = (g.z - P.z) * scale;
      if (Math.hypot(dx, dz) > R - 8) continue;
      const col = g.state === 'alert' ? '#ff4d3d' : g.state === 'suspicious' ? '#f2c23a' : '#4fd27a';
      rx.fillStyle = col; rx.strokeStyle = col; rx.lineWidth = 4;
      rx.beginPath(); rx.arc(R + dx, R + dz, 9, 0, Math.PI * 2); rx.fill();
      rx.beginPath(); rx.moveTo(R + dx, R + dz); rx.lineTo(R + dx + Math.sin(g.dir) * 22, R + dz + Math.cos(g.dir) * 22); rx.stroke();
    }
    rx.fillStyle = '#e9eef2'; rx.beginPath(); rx.arc(R, R, 7, 0, Math.PI * 2); rx.fill();
  }

  // ---------- الأحداث من المنطق ----------
  let stepT = 0;
  function handleEvents(dt) {
    for (const e of S.events) {
      if (e.t === 'radio') showRadio(e.who, e.text);
      else if (e.t === 'suspicious' && e.why !== 'radio') SFX.sus();
      else if (e.t === 'alert') { SFX.alert(); toast('انكشفت!', 1.2); }
      else if (e.t === 'caught') { SFX.caught(); toast('انمسكت… ترجع لآخر نقطة حفظ', 1.6); }
      else if (e.t === 'checkpoint') { SFX.cp(); toast('نقطة حفظ', 1.2); }
      else if (e.t === 'noise') W.noiseRing(ctx, e.x, e.z, e.r);
      else if (e.t === 'won') win();
      else if (e.t === 'lost') toast('ضيّعوك', 1.2);
    }
    S.events.length = 0;
    if (S.player.moving && S.player.stance === 'stand') { stepT -= dt; if (stepT <= 0) { stepT = S.player.running ? 0.28 : 0.5; SFX.step(); } }
  }

  // ---------- التحكم ----------
  const zone = $('stickZone'), base = $('stickBase'), knob = $('stickKnob');
  let stickId = null, sx = 0, sy = 0;
  const homeStick = () => { base.style.left = ''; base.style.top = ''; };
  zone.addEventListener('pointerdown', e => {
    if (stickId !== null) return;
    stickId = e.pointerId; zone.setPointerCapture(e.pointerId);
    sx = e.clientX; sy = e.clientY; base.style.left = sx + 'px'; base.style.top = sy + 'px'; base.classList.add('on');
    knob.style.transform = ''; e.preventDefault();
  });
  zone.addEventListener('pointermove', e => {
    if (e.pointerId !== stickId) return;
    let dx = e.clientX - sx, dy = e.clientY - sy; const d = Math.hypot(dx, dy), max = 52;
    if (d > max) { dx = dx / d * max; dy = dy / d * max; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    input.x = dx / max; input.z = dy / max;
  });
  const endStick = e => { if (e.pointerId !== stickId) return; stickId = null; input.x = input.z = 0; knob.style.transform = ''; base.classList.remove('on'); homeStick(); };
  zone.addEventListener('pointerup', endStick); zone.addEventListener('pointercancel', endStick);

  function press(el, fn) { el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audio(); fn(); }); }
  press($('stance'), () => { if (S && S.status === 'play') { const before = S.player.stance; if (TH.cycleStance(S) === before) toast('ما تقدر توقف هنا', 1); } });
  press($('act'), () => S && TH.interact(S));

  doc.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (!S || S.status !== 'play') return;
    if (e.code === 'KeyC' || e.code === 'Space') { TH.cycleStance(S); e.preventDefault(); }
    if (e.code === 'KeyE' || e.code === 'Enter') TH.interact(S);
  });
  doc.addEventListener('keyup', e => { keys[e.code] = false; });
  function keyInput() {
    const kx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
    const kz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
    if (!kx && !kz) return null;
    const run = keys.ShiftLeft || keys.ShiftRight, n = Math.hypot(kx, kz), m = run ? 1 : 0.6;
    return { x: kx / n * m, z: kz / n * m, run };
  }

  // ---------- الحلقة ----------
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    T_step(dt);
  }
  function T_step(dt) {
    const k = keyInput();
    TH.update(S, k || input, dt);
    handleEvents(dt);
    updateHud(dt);
    W.render(ctx, S, dt);
    fpsTick(dt);
  }
  let fpsAcc = 0, fpsN = 0;
  const showFps = /debug/.test(location.search);
  function fpsTick(dt) { if (!showFps) return; fpsAcc += dt; fpsN++; if (fpsAcc > 1) { $('fps').textContent = Math.round(fpsN / fpsAcc) + ' fps'; fpsAcc = fpsN = 0; } }

  function newRun() {
    S = TH.newGame(TH.makeLevel(root.LEVEL1));
    $('objTxt').textContent = S.L.objectiveText;
    if (!ctx) ctx = W.build($('c'), S); else { W.syncGuards(ctx, S); W.snapCamera(ctx, S); }
    startedAt = performance.now();
  }

  function start() {
    audio();
    $('title').hidden = true; $('won').hidden = true;
    doc.body.classList.remove('ui-off');
    newRun();
    running = true; last = performance.now(); requestAnimationFrame(frame);
  }

  function win() {
    SFX.won();
    const secs = Math.round((performance.now() - startedAt) / 1000);
    setTimeout(() => {
      running = false;
      doc.body.classList.add('ui-off');
      for (const id of ['radio', 'toast', 'flash']) $(id).classList.remove('on'); radioT = toastT = 0;
      const st = $('story'); st.innerHTML = '';
      S.L.ending.forEach((line, i) => {
        const p = doc.createElement('p'); p.textContent = line; p.style.animationDelay = (i * 1.3) + 's';
        if (line.startsWith('«')) p.className = 'q'; st.appendChild(p);
      });
      $('stats').textContent = `الوقت: ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')} · مرات الإمساك: ${S.catches}`;
      $('won').hidden = false;
    }, 700);
  }

  $('startBtn').addEventListener('click', start);
  $('againBtn').addEventListener('click', start);
  root.addEventListener('resize', () => ctx && W.resize(ctx));
  doc.addEventListener('visibilitychange', () => { if (!doc.hidden) last = performance.now(); });

  // نرسم المشهد خلف شاشة البداية من أول لحظة
  newRun(); W.render(ctx, S, 0.016);

  // للاختبارات الآلية فقط
  root.__theeban = { get S() { return S; }, TH, start, step: T_step, input };
})(typeof globalThis !== 'undefined' ? globalThis : this);

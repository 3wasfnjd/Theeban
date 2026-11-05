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
  // أجواء صوتية: ريح، طنين منخفض يزيد مع التوتر، صفارة إنذار، ونبض قلب إذا حارس قريب مشتبه
  const AMB = { on: false };
  function startAmbience() {
    const a = audio(); if (!a || AMB.on) return; AMB.on = true;
    const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < d.length; i++) { last = last * 0.98 + (Math.random() * 2 - 1) * 0.02; d[i] = last * 6; }
    const noise = a.createBufferSource(); noise.buffer = buf; noise.loop = true;
    const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.7;
    const wg = a.createGain(); wg.gain.value = 0.22;
    noise.connect(bp).connect(wg).connect(a.destination); noise.start();
    const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 260; lfo.connect(lg).connect(bp.frequency); lfo.start();
    const drone = a.createGain(); drone.gain.value = 0.0; drone.connect(a.destination);
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180; lp.connect(drone);
    for (const f of [55, 55.7, 82.4]) { const o = a.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(); }
    const siren = a.createOscillator(), sg = a.createGain(), slfo = a.createOscillator(), slg = a.createGain();
    siren.type = 'square'; siren.frequency.value = 720; slfo.frequency.value = 0.8; slg.gain.value = 180; slfo.connect(slg).connect(siren.frequency);
    const sf = a.createBiquadFilter(); sf.type = 'lowpass'; sf.frequency.value = 1400;
    sg.gain.value = 0; siren.connect(sf).connect(sg).connect(a.destination); siren.start(); slfo.start();
    Object.assign(AMB, { wind: wg, drone, lp, siren: sg, beatT: 0 });
  }
  function updateAmbience(dt, level, near) {
    if (!AMB.on || !ac) return;
    const t = ac.currentTime;
    AMB.drone.gain.setTargetAtTime(level === 2 ? 0.07 : level === 1 ? 0.05 : 0.025, t, 0.6);
    AMB.lp.frequency.setTargetAtTime(level === 2 ? 420 : level === 1 ? 260 : 170, t, 0.6);
    AMB.siren.gain.setTargetAtTime(level === 2 ? 0.035 : 0, t, 0.3);
    AMB.wind.gain.setTargetAtTime(level === 2 ? 0.12 : 0.22, t, 1);
    if (level >= 1 && near < 9) {
      AMB.beatT -= dt;
      if (AMB.beatT <= 0) { AMB.beatT = level === 2 ? 0.42 : 0.75; tone(58, 0.12, 'sine', 0.3, 40); tone(52, 0.12, 'sine', 0.22, 38, 0.16); }
    }
  }
  function muteAmbience() { if (AMB.on && ac) { const t = ac.currentTime; AMB.drone.gain.setTargetAtTime(0, t, 0.3); AMB.siren.gain.setTargetAtTime(0, t, 0.2); } }

  const SFX = {
    sus: () => { tone(520, 0.14, 'triangle', 0.12); tone(700, 0.18, 'triangle', 0.12, 0, 0.13); },
    alert: () => { tone(880, 0.12, 'square', 0.1); tone(660, 0.12, 'square', 0.1, 0, 0.12); tone(880, 0.2, 'square', 0.1, 0, 0.24); },
    caught: () => tone(300, 0.6, 'sawtooth', 0.12, 80),
    cp: () => { tone(660, 0.1, 'sine', 0.1); tone(990, 0.2, 'sine', 0.1, 0, 0.1); },
    radio: () => tone(1800, 0.05, 'square', 0.04),
    won: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.35, 'sine', 0.1, 0, i * 0.15)); },
    step: () => tone(90 + Math.random() * 30, 0.05, 'triangle', 0.03),
    power: () => { tone(600, 0.7, 'sawtooth', 0.08, 40); tone(90, 0.5, 'square', 0.05, 30, 0.1); },
    subdue: () => { tone(200, 0.08, 'square', 0.08); tone(1400, 0.25, 'sine', 0.05, 300, 0.05); },
    spotted: () => { tone(1200, 0.08, 'square', 0.1); tone(1200, 0.08, 'square', 0.1, 0, 0.12); tone(900, 0.3, 'sawtooth', 0.08, 0, 0.24); }
  };

  // ---------- الواجهة ----------
  const ICONS = {
    stand: '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7m0 0-3 7m3-7 3 7M8 10h8"/>',
    crouch: '<circle cx="13" cy="7" r="2"/><path d="M12 9.5 10 14l4 2-1 5M10 14l-3 1 1 6M9 11h6"/>',
    crawl: '<circle cx="19" cy="13" r="2"/><path d="M17 14H8l-4 4M8 14l3 4M13 14l2 4"/>'
  };
  const STATE_TXT = ['هادئ', 'مشتبه', 'إنذار'];
  const ICON_HAND = '<path d="M9 11V5a1.5 1.5 0 0 1 3 0v5m0-1a1.5 1.5 0 0 1 3 0v2m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 15a1.5 1.5 0 0 1 2.5-1.6L9 16"/>';
  const ICON_SUB = '<path d="m14 4 6 6M17 7l-9 9-3 1 1-3 9-9M4 20l3-3"/>';
  const ICON_BELL = '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20h4M3 3l18 18"/>';
  const ICON_BOLT = '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>';
  const ICON_UP = '<path d="M7 21V3M17 21V3M7 7h10M7 12h10M7 17h10"/><path d="m12 1-2 2h4z"/>';
  const ICON_DOWN = '<path d="M7 21V3M17 21V3M7 7h10M7 12h10M7 17h10"/><path d="m12 23-2-2h4z"/>';
  const ICON_LIGHT = '<path d="M5 9h6l4-4v14l-4-4H5zM18 8l3-2M18 16l3 2M3 3l18 18"/>';
  const ICON_CAR = '<path d="M3 16v-4l2-5h14l2 5v4zM6 16v2M18 16v2M3 12h18"/>';
  const ICON_OUT = '<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>';
  const ACT = { take: ['تفاعل', ICON_HAND], subdue: ['تخدير', ICON_SUB], panel: ['أطفئ', ICON_BELL], gen: ['اقطع', ICON_BOLT],
    climb: ['تسلق', ICON_UP], down: ['انزل', ICON_DOWN], light: ['عطّل', ICON_LIGHT], hide: ['اختبي', ICON_CAR], exit: ['اطلع', ICON_OUT], throw: ['رمي', ICON_HAND], none: ['تفاعل', ICON_HAND] };
  let radioT = 0, toastT = 0, lastLevel = 0, alarmHint = 0;

  function showRadio(who, text) { $('radioWho').textContent = who + ':'; $('radioTxt').textContent = text; $('radio').classList.add('on'); radioT = 4 + text.length * 0.05; SFX.radio(); }
  function toast(text, sec) { $('toast').textContent = text; $('toast').classList.add('on'); toastT = sec || 1.6; }

  function updateHud(dt) {
    const a = TH.alertLevel(S);
    const pill = $('pill'); pill.textContent = STATE_TXT[a.level]; pill.className = a.level ? 's' + a.level : '';
    const mi = $('meter').firstElementChild; mi.style.width = Math.round(a.meter * 100) + '%'; mi.style.background = a.level === 2 ? 'var(--alert)' : 'var(--sus)';
    $('flash').classList.toggle('on', a.level === 2 || S.status === 'caught');
    const st = S.player.stance;
    if ($('stance').dataset.s !== st) { $('stance').dataset.s = st; $('stIcon').innerHTML = ICONS[st]; $('stTxt').textContent = TH.STANCES[st].name; }
    const busy = S.subdue || S.action, A = TH.action(S);
    const mode = busy ? (S.subdue ? 'subdue' : S.action.kind) : A ? A.kind : 'none';
    const act = $('act');
    if (act.dataset.m !== mode) { act.dataset.m = mode; const M = ACT[mode] || ACT.take; $('actTxt').textContent = M[0]; $('actIcon').innerHTML = M[1]; }
    act.disabled = mode === 'none'; act.classList.toggle('act', mode !== 'none'); act.classList.toggle('sub', mode !== 'none' && mode !== 'take');
    act.style.setProperty('--p', busy && busy.kind !== 'throw' ? Math.min(1, busy.t / busy.need) : 0);
    const gb = $('gas'), gn = S.player.gas;
    if (gb.dataset.n !== String(gn)) { gb.dataset.n = gn; $('gasN').textContent = '×' + gn; }
    gb.disabled = !TH.canThrow(S);
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
      else if (e.t === 'alert') { SFX.alert(); if (e.why !== 'light') toast('انكشفت!', 1.2); ctx.shake = Math.max(ctx.shake, 0.35); }
      else if (e.t === 'caught') { SFX.caught(); toast('انمسكت', 1.4); ctx.shake = 0.7; }
      else if (e.t === 'checkpoint') { SFX.cp(); toast('نقطة حفظ', 1.2); }
      else if (e.t === 'noise') W.noiseRing(ctx, e.x, e.z, e.r);
      else if (e.t === 'won') win();
      else if (e.t === 'lost') toast('ضيّعوك', 1.2);
      else if (e.t === 'subdued') { SFX.subdue(); toast('نام الحارس', 1.1); }
      else if (e.t === 'body') { SFX.sus(); showRadio('برق', 'شافوا الطايح!'); }
      else if (e.t === 'woke') toast('صحى حارس', 1);
      else if (e.t === 'spotted') { SFX.spotted(); toast('الضوء كشفك!', 1.2); ctx.shake = 0.5; }
      else if (e.t === 'alarm_on') { if (!alarmHint) { alarmHint = 1; showRadio('برق', 'إنذار! أطفيه من اللوحة أو اقطع المولد.'); } }
      else if (e.t === 'alarm_off') { SFX.cp(); toast(e.why === 'timeout' ? 'هدأ الإنذار' : 'انطفى الإنذار', 1.3); }
      else if (e.t === 'power_off') { SFX.power(); toast('انقطعت الكهربا', 1.3); ctx.shake = 0.25; }
      else if (e.t === 'power_on') { tone(200, 0.4, 'sawtooth', 0.06, 600); toast('رجعت الكهربا', 1.2); }
      else if (e.t === 'gas_pick') { SFX.cp(); toast('+1 غاز', 1); }
      else if (e.t === 'gas_throw') tone(500, 0.15, 'triangle', 0.06, 900);
      else if (e.t === 'gas_land') { tone(160, 0.4, 'sawtooth', 0.05, 60); W.noiseRing(ctx, e.x, e.z, 6); }
      else if (e.t === 'gassed') { SFX.subdue(); toast('نام بالغاز', 1.1); }
      else if (e.t === 'light_dead') { tone(900, 0.5, 'square', 0.06, 80); toast('تعطّل الكشاف', 1.3); }
      else if (e.t === 'hidden') toast('مختبي', 0.9);
      else if (e.t === 'found') { SFX.alert(); toast('لقوك!', 1.2); }
      else if (e.t === 'on_top') toast('فوق', 0.7);
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
  press($('stance'), () => { if (S && S.status === 'play' && introT <= 0) { const before = S.player.stance; if (TH.cycleStance(S) === before) toast('ما تقدر', 0.8); } });
  press($('act'), () => { if (!S || introT > 0) return; TH.doAction(S); });
  press($('gas'), () => { if (!S || introT > 0) return; TH.throwGas(S); });

  doc.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (!S || S.status !== 'play') return;
    if (introT > 0) { if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') endIntro(); return; }
    if (e.code === 'KeyC' || e.code === 'Space') { TH.cycleStance(S); e.preventDefault(); }
    if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'KeyF') TH.doAction(S);
    if (e.code === 'KeyG' || e.code === 'KeyQ') TH.throwGas(S);
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
  let introT = 0; const INTRO = 5.5;
  function endIntro() { introT = 0; ctx.intro = 0; doc.body.classList.remove('intro'); doc.body.classList.remove('ui-off'); }
  function T_step(dt) {
    if (introT > 0) {
      introT -= dt; ctx.intro = Math.max(0, introT / INTRO); S.time += dt; TH.advanceLights(S, dt);
      if (introT <= 0) endIntro();
      W.render(ctx, S, dt); return;
    }
    const k = keyInput();
    TH.update(S, k || input, dt);
    handleEvents(dt);
    updateHud(dt);
    let near = 99; for (const g of S.guards) if (g.state !== 'calm' && g.state !== 'out') near = Math.min(near, Math.hypot(g.x - S.player.x, g.z - S.player.z));
    updateAmbience(dt, TH.alertLevel(S).level, near);
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
    newRun();
    startAmbience();
    // لقطة افتتاحية فوق الموقع (تنتخطى باللمس)
    $('cardTitle').textContent = S.L.title.split(': ')[1] || S.L.title; $('cardPlace').textContent = S.L.place || '';
    introT = INTRO; ctx.intro = 1; doc.body.classList.add('intro');
    running = true; last = performance.now(); requestAnimationFrame(frame);
  }

  function win() {
    SFX.won();
    const secs = Math.round((performance.now() - startedAt) / 1000);
    setTimeout(() => {
      running = false; muteAmbience();
      doc.body.classList.add('ui-off');
      for (const id of ['radio', 'toast', 'flash']) $(id).classList.remove('on'); radioT = toastT = 0;
      const st = $('story'); st.innerHTML = '';
      S.L.ending.forEach((line, i) => {
        const p = doc.createElement('p'); p.textContent = line; p.style.animationDelay = (i * 1.3) + 's';
        if (line.startsWith('«')) p.className = 'q'; st.appendChild(p);
      });
      $('stats').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')} · انمسكت ${S.catches} · خدّرت ${S.subdued || 0}`;
      $('won').hidden = false;
    }, 700);
  }

  $('startBtn').addEventListener('click', start);
  $('skip').addEventListener('pointerdown', e => { e.preventDefault(); if (introT > 0) endIntro(); });
  $('againBtn').addEventListener('click', start);
  root.addEventListener('resize', () => ctx && W.resize(ctx));
  doc.addEventListener('visibilitychange', () => { if (!doc.hidden) last = performance.now(); });

  // نرسم المشهد خلف شاشة البداية من أول لحظة
  newRun(); W.render(ctx, S, 0.016);

  // للاختبارات الآلية فقط
  root.__theeban = { get ctx() { return ctx; }, get S() { return S; }, TH, start, step: T_step, input, skipIntro: () => introT > 0 && endIntro() };
})(typeof globalThis !== 'undefined' ? globalThis : this);

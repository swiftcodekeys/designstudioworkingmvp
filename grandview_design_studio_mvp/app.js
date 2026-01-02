// Grandview Fence Design Studio (static, no build step)
// Renders: background + fence overlay, supports drag/zoom/position, URL state, export with logo watermark.

const CANVAS_W = 1960;
const CANVAS_H = 1096;

const els = {
  canvas: document.getElementById('canvas'),
  sceneButtons: document.getElementById('sceneButtons'),
  fenceSceneSection: document.getElementById('fenceSceneSection'),
  modeSelect: document.getElementById('modeSelect'),
  styleSelect: document.getElementById('styleSelect'),
  styleHeader: document.getElementById('styleHeader'),
  gateIframe: document.getElementById('gateIframe'),
  resetViewBtn: document.getElementById('resetViewBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  status: document.getElementById('status'),
};

const ctx = els.canvas.getContext('2d');

const state = {
  mode: 'fence', // fence | gate
  scene: 'front',
  styleCode: null,
  gateStyleCode: 'UAF-200',
  transform: { x: 0, y: 0, scale: 1.0 },
  watermark: true,
};

// Gate styles exposed (ONLY what Ultra's gate studio in this bundle supports)
// value = Ultra style code (internal), label = Grandview-facing name
const GATE_STYLES = [
  { code: 'UAF-200', label: 'Grandview Horizon™ Gate' },
  { code: 'UAF-201', label: 'Grandview Horizon Pro™ Gate' },
  { code: 'UAF-250', label: 'Grandview Vanguard™ Gate' },
  { code: 'UAS-100', label: 'Grandview Charleston™ Gate' },
  { code: 'UAS-101', label: 'Grandview Charleston Pro™ Gate' },
  { code: 'UAS-150', label: 'Grandview Savannah™ Gate' },
  { code: 'UAB-200', label: 'Grandview Haven™ Gate' },
];

let catalog;
let bgImg = new Image();
let fenceImg = new Image();
let logoImg = new Image();

function setStatus(msg){ els.status.textContent = msg || ''; }

function loadImage(src){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load: ' + src));
    img.src = src;
  });
}

function getQuery(){
  const p = new URLSearchParams(location.search);
  return {
    mode: p.get('mode'),
    scene: p.get('scene'),
    style: p.get('style'),
    gstyle: p.get('gstyle'),
    x: p.get('x'),
    y: p.get('y'),
    s: p.get('s'),
    wm: p.get('wm'),
  };
}

function updateUrl(){
  const p = new URLSearchParams();
  p.set('mode', state.mode);
  p.set('scene', state.scene);
  if (state.styleCode) p.set('style', state.styleCode);
  if (state.gateStyleCode) p.set('gstyle', state.gateStyleCode);
  p.set('x', String(state.transform.x));
  p.set('y', String(state.transform.y));
  p.set('s', String(state.transform.scale.toFixed(3)));
  p.set('wm', state.watermark ? '1' : '0');
  const url = location.origin + location.pathname + '?' + p.toString();
  history.replaceState({}, '', url);
  localStorage.setItem('gv_designstudio_state', JSON.stringify(state));
}

function applyFromQueryOrStorage(){
  // query wins over storage
  const q = getQuery();
  if (q.mode) state.mode = q.mode;
  if (q.scene) state.scene = q.scene;
  if (q.style) state.styleCode = q.style;
  if (q.gstyle) state.gateStyleCode = q.gstyle;
  if (q.x !== null) state.transform.x = Number(q.x) || 0;
  if (q.y !== null) state.transform.y = Number(q.y) || 0;
  if (q.s !== null) state.transform.scale = Number(q.s) || 1.0;
  if (q.wm !== null) state.watermark = q.wm === '1';

  if (!q.mode && !q.scene && !q.style && !q.gstyle && !q.x && !q.y && !q.s && !q.wm){
    const saved = localStorage.getItem('gv_designstudio_state');
    if (saved){
      try{
        const parsed = JSON.parse(saved);
        Object.assign(state, parsed);
      }catch{}
    }
  }
}

function resetView(){
  state.transform = { x: 0, y: 0, scale: 1.0 };
  draw();
  updateUrl();
}

function draw(){
  ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
  ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);

  const s = state.transform.scale;
  const x = state.transform.x;
  const y = state.transform.y;

  // Fence is rendered with transform relative to canvas origin
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.drawImage(fenceImg, 0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();
}

async function setScene(sceneId){
  state.scene = sceneId;
  if (state.mode === 'fence') await refreshImages();
  updateUrl();
}

async function setStyle(styleCode){
  state.styleCode = styleCode;
  if (state.mode === 'fence') await refreshImages();
  updateUrl();
}

function setGateStyle(styleCode){
  state.gateStyleCode = styleCode;
  updateUrl();
  // Send to iframe (it will apply if already loaded)
  try{
    els.gateIframe?.contentWindow?.postMessage({ type: 'SET_GATE_STYLE', style: styleCode }, '*');
  }catch{}
}

function buildModeSelect(){
  if (!els.modeSelect) return;
  els.modeSelect.innerHTML = '';
  els.modeSelect.add(new Option('Fence', 'fence'));
  els.modeSelect.add(new Option('Gate', 'gate'));
  els.modeSelect.value = state.mode;
  els.modeSelect.onchange = () => {
    state.mode = els.modeSelect.value;
    updateModeUi(true);
  };
}

function buildSceneButtons(){
  els.sceneButtons.innerHTML = '';
  catalog.scenes.forEach(sc => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'segBtn';
    b.textContent = sc.label;
    b.dataset.scene = sc.id;
    b.onclick = () => setScene(sc.id);
    els.sceneButtons.appendChild(b);
  });
}

function syncUi(){
  // scene buttons active state
  [...els.sceneButtons.querySelectorAll('.segBtn')].forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scene === state.scene);
  });

  // style select value
  if (els.styleSelect) {
    els.styleSelect.value = state.styleCode || '';
  }

  updateUrl();
}

function buildFenceStyleSelect(){
  els.styleSelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a fence style';
  els.styleSelect.appendChild(placeholder);

  catalog.styles.forEach(st => {
    const o = document.createElement('option');
    o.value = st.code;
    o.textContent = st.label;
    els.styleSelect.appendChild(o);
  });

  els.styleSelect.onchange = () => {
    const v = els.styleSelect.value;
    if (v) setStyle(v);
  };
}

function buildGateStyleSelect(){
  els.styleSelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select a gate style';
  els.styleSelect.appendChild(placeholder);

  GATE_STYLES.forEach(st => {
    const o = document.createElement('option');
    o.value = st.code;
    o.textContent = st.label;
    els.styleSelect.appendChild(o);
  });

  els.styleSelect.value = state.gateStyleCode || '';

  els.styleSelect.onchange = () => {
    const v = els.styleSelect.value;
    if (v) setGateStyle(v);
  };
}

function getBackgroundFile(sceneId){
  const scene = catalog.scenes.find(s => s.id === sceneId) || catalog.scenes[0];
  return scene.background;
}

function getOverlayFile(sceneId, styleCode){
  const map = catalog.overlays?.[sceneId] || {};
  return map?.[styleCode] || null;
}

async function refreshImages(){
  syncUi();
  setStatus('Loading…');

  try{
    const bgFile = getBackgroundFile(state.scene);
    if (!state.styleCode){
      // default to first style if not set
      state.styleCode = catalog.styles[0]?.code || null;
    }

    const ovFile = getOverlayFile(state.scene, state.styleCode);
    if (!ovFile){
      setStatus('No overlay for this scene/style.');
      return;
    }

    [bgImg, fenceImg] = await Promise.all([loadImage(bgFile), loadImage(ovFile)]);
    draw();
    setStatus('');
  }catch(err){
    console.error(err);
    setStatus('Failed to load images.');
  }finally{
    syncUi();
  }
}

function updateModeUi(kickGateStyle){
  const fenceMode = state.mode === 'fence';

  // Toggle sections
  if (els.fenceSceneSection) els.fenceSceneSection.style.display = fenceMode ? 'block' : 'none';
  if (els.canvas) els.canvas.style.display = fenceMode ? 'block' : 'none';
  if (els.gateIframe) els.gateIframe.style.display = fenceMode ? 'none' : 'block';

  // Header text + select contents
  if (els.styleHeader) els.styleHeader.textContent = fenceMode ? 'Fence Style' : 'Gate Style';

  // Disable export controls in gate mode (gate tool can later get its own export)
  if (els.downloadBtn) els.downloadBtn.disabled = !fenceMode;
  if (els.resetViewBtn) els.resetViewBtn.disabled = !fenceMode;

  // Build appropriate style dropdown
  if (fenceMode) {
    buildFenceStyleSelect();
    // Ensure fence style set
    if (!state.styleCode) state.styleCode = catalog?.styles?.[0]?.code || null;
    refreshImages();
  } else {
    buildGateStyleSelect();
    setStatus('');
    if (kickGateStyle) {
      // Gate iframe may still be loading; send again on load handler too
      setGateStyle(state.gateStyleCode || GATE_STYLES[0]?.code);
    }
  }

  updateUrl();
}

function downloadImage(){
  // Create an offscreen canvas (same size) for clean export
  const off = document.createElement('canvas');
  off.width = CANVAS_W;
  off.height = CANVAS_H;
  const c = off.getContext('2d');

  // draw composed
  c.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);

  c.save();
  c.translate(state.transform.x, state.transform.y);
  c.scale(state.transform.scale, state.transform.scale);
  c.drawImage(fenceImg, 0, 0, CANVAS_W, CANVAS_H);
  c.restore();

  // watermark (Grandview logo) if enabled
  if (state.watermark){
    const cfg = catalog.brand?.export_watermark || {};
    const pad = Number(cfg.padding ?? 24);
    const maxW = Number(cfg.max_width ?? 340);
    const opacity = Number(cfg.opacity ?? 0.88);

    const ratio = logoImg.width / logoImg.height;
    const w = Math.min(maxW, logoImg.width);
    const h = Math.round(w / ratio);

    const x = CANVAS_W - w - pad;
    const y = CANVAS_H - h - pad;

    c.save();
    c.globalAlpha = opacity;
    c.drawImage(logoImg, x, y, w, h);
    c.restore();
  }

  const a = document.createElement('a');
  const styleSlug = (state.styleCode || 'fence').replace(/[^a-z0-9-]/gi,'_');
  a.download = `grandview-design-${state.scene}-${styleSlug}.png`;
  a.href = off.toDataURL('image/png');
  a.click();
}

function hookControls(){
  // Reset (brings you back to default view/state)
  if (els.resetViewBtn) els.resetViewBtn.onclick = () => {
    if (state.mode !== 'fence') return;
    resetView();
  };

  // Save Image
  if (els.downloadBtn) els.downloadBtn.onclick = () => {
    if (state.mode !== 'fence') return;
    downloadImage();
  };
}

// Drag to move fence
function hookDrag(){
  let dragging = false;
  let last = {x:0,y:0};
  els.canvas.addEventListener('mousedown', (e) => {
    dragging = true;
    last = {x: e.clientX, y: e.clientY};
  });
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    last = {x: e.clientX, y: e.clientY};

    // Convert from displayed canvas size to internal units
    const rect = els.canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;

    state.transform.x += dx * scaleX;
    state.transform.y += dy * scaleY;
    draw(); updateUrl();
  });
}

async function init(){
  const res = await fetch('catalog.json', {cache:'no-store'});
  catalog = await res.json();

  applyFromQueryOrStorage();

  // Load logo once for watermark export
  logoImg = await loadImage(catalog.brand.logo);

  buildModeSelect();
  buildSceneButtons();

  // Ensure default style is first if not set
  if (!state.styleCode) state.styleCode = catalog.styles[0]?.code || null;

  hookControls();
  hookDrag();

  // When the gate tool finishes loading, re-send current gate style
  if (els.gateIframe) {
    els.gateIframe.addEventListener('load', () => {
      if (state.mode === 'gate') {
        setGateStyle(state.gateStyleCode || GATE_STYLES[0]?.code);
      }
    });
  }

  updateModeUi(true);
  syncUi();
}

init();

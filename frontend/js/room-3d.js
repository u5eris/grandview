/*
 * Grandview, trình xem phòng 3D
 * Cần nạp trước (theo thứ tự):
 *   https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js
 *   https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/controls/OrbitControls.js
 *   https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/GLTFLoader.js
 *
 * Dùng:
 *   <div class="gv-3d" data-room="deluxe"></div>
 *   <script src="/js/room-3d.js"></script>
 * hoặc:  const v = GrandviewRoom3D.mount(element, 'suite');  v.show('villa');
 */
(function () {
  const VERSION = '1';
  const ROOMS = {
    deluxe:   { name: 'Phòng Deluxe',   src: '/models/phong-deluxe.glb',   w: 8.0,  d: 4.0, eye: [0.7, 2.7],  look: [7.6, 2.0] },
    superior: { name: 'Phòng Superior', src: '/models/phong-superior.glb', w: 9.0,  d: 4.5, eye: [0.7, 3.0],  look: [8.6, 2.2] },
    suite:    { name: 'Suite',          src: '/models/phong-suite.glb',    w: 9.2,  d: 6.8, eye: [0.7, 2.08], look: [8.6, 1.4] },
    villa:    { name: 'Biệt thự',       src: '/models/phong-villa.glb',    w: 11.0, d: 8.6, eye: [5.6, 0.7],  look: [5.6, 7.6] }
  };
  const CUT_MATS = new Set(['wall', 'wall_top', 'glass', 'frame', 'honey']);

  // Chữ trên trình xem theo ngôn ngữ của trang (i18n.js); không có i18n.js thì dùng tiếng Việt
  const TEXT = {
    vi: { iso: 'Toàn cảnh', top: 'Nhìn từ trên', eye: 'Đứng ở cửa', walls: 'Tường đầy đủ', bar: 'Góc nhìn',
          loading: 'Đang dựng phòng', model: 'Mô hình 3D',
          noLib: 'Không tải được trình xem 3D. Kiểm tra kết nối mạng rồi tải lại trang.',
          noGl: 'Trình duyệt này chưa bật WebGL nên không hiển thị được mô hình 3D.',
          noFile: 'Không đọc được file {src}. Kiểm tra file đã nằm trong thư mục models trên máy chủ.' },
    en: { iso: 'Overview', top: 'Top view', eye: 'Stand at the door', walls: 'Full walls', bar: 'Viewpoint',
          loading: 'Building the room', model: '3D model',
          noLib: "Couldn't load the 3D viewer. Check your connection and reload the page.",
          noGl: "This browser doesn't have WebGL turned on, so the 3D model can't be shown.",
          noFile: "Couldn't read {src}. Check that the file is in the models folder on the server." },
  };
  const lang = () => (window.GV_I18N && TEXT[window.GV_I18N.lang] ? window.GV_I18N.lang : 'vi');
  const L = (key, vars) => TEXT[lang()][key].replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars ? vars[k] : m));
  const ROOM_NAMES = { deluxe: { vi: 'Phòng Deluxe', en: 'Deluxe Room' }, superior: { vi: 'Phòng Superior', en: 'Superior Room' },
                       suite: { vi: 'Suite', en: 'Suite' }, villa: { vi: 'Biệt thự', en: 'Villa' } };

  const CSS = `
  .gv-3d{position:relative;min-height:300px;aspect-ratio:4/3;border-radius:16px;overflow:hidden;background:#F5F2EA;font-family:'Be Vietnam Pro',system-ui,sans-serif;color:#2C3A2E}
  .gv-3d canvas{display:block;width:100%!important;height:100%!important;touch-action:none}
  .gv-3d__bar{position:absolute;left:0;right:0;margin:0 auto;width:fit-content;max-width:calc(100% - 16px);bottom:14px;display:flex;flex-wrap:wrap;justify-content:center;gap:4px;padding:5px;border-radius:999px;background:#FBF9F3;border:1px solid #E6E1D3}
  .gv-3d__bar button{all:unset;cursor:pointer;padding:8px 14px;border-radius:999px;font-size:14px;font-weight:500;white-space:nowrap}
  .gv-3d__bar button:hover{background:rgba(211,220,180,.45)}
  .gv-3d__bar button[aria-pressed="true"]{background:#5A6B43;color:#fff}
  .gv-3d__bar button:focus-visible{outline:2px solid #5A6B43;outline-offset:2px}
  .gv-3d__msg{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:24px;color:#6E6B5E;font-size:15px;line-height:1.6}
  .gv-3d__msg[hidden]{display:none}
  @media (max-width:520px){.gv-3d__bar button{padding:7px 10px;font-size:13px}}`;

  function injectCss() {
    if (document.getElementById('gv-3d-css')) return;
    const s = document.createElement('style'); s.id = 'gv-3d-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function mount(el, key, opts) {
    opts = opts || {};
    injectCss();
    el.classList.add('gv-3d');
    el.innerHTML = '<div class="gv-3d__msg"></div>';
    const msg = el.firstChild;
    msg.textContent = L('loading');
    if (!window.THREE || !THREE.GLTFLoader || !THREE.OrbitControls) {
      msg.textContent = L('noLib');
      return null;
    }
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { msg.textContent = L('noGl'); return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    el.insertBefore(renderer.domElement, msg);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 200);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.495; controls.minDistance = 0.3; controls.maxDistance = 40;
    scene.add(new THREE.HemisphereLight(0xfbf9f3, 0x4f5f3a, 0.75));
    const sun = new THREE.DirectionalLight(0xfff3dc, 0.85);
    sun.position.set(-6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 });
    sun.shadow.bias = -0.0005; scene.add(sun);

    const cut = [new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.2)];
    const loader = new THREE.GLTFLoader();
    const cache = {};
    let current = null, currentKey = null, fullWalls = false;

    let bar = null;
    if (opts.controls !== false) {
      bar = document.createElement('div'); bar.className = 'gv-3d__bar'; bar.setAttribute('role', 'toolbar');
      bar.innerHTML = '<button type="button" data-view="iso" aria-pressed="true"></button>' +
        '<button type="button" data-view="top" aria-pressed="false"></button>' +
        '<button type="button" data-view="eye" aria-pressed="false"></button>' +
        '<button type="button" data-walls aria-pressed="false"></button>';
      el.appendChild(bar);
      bar.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view, true)));
      bar.querySelector('[data-walls]').addEventListener('click', () => toggleWalls());
    }

    function relabel() {
      if (bar) {
        bar.setAttribute('aria-label', L('bar'));
        bar.querySelectorAll('[data-view]').forEach(b => { b.textContent = L(b.dataset.view); });
        bar.querySelector('[data-walls]').textContent = L('walls');
      }
      if (currentKey) renderer.domElement.setAttribute('aria-label', `${L('model')} ${ROOM_NAMES[currentKey][lang()]}`);
      if (!msg.hidden && msgKey) msg.textContent = L(msgKey, msgVars);
    }
    let msgKey = 'loading', msgVars = null;
    document.addEventListener('gv:langchange', relabel);

    function applyWalls(root) {
      root.traverse(o => { if (o.isMesh && CUT_MATS.has(o.material.name)) o.material.clippingPlanes = fullWalls ? [] : cut; });
    }
    function toggleWalls(v) {
      fullWalls = v === undefined ? !fullWalls : v;
      if (bar) bar.querySelector('[data-walls]').setAttribute('aria-pressed', String(fullWalls));
      if (current) applyWalls(current);
    }
    function setView(view, animate) {
      const r = ROOMS[currentKey]; if (!r) return;
      const span = Math.max(r.w, r.d); let pos, target;
      if (view === 'top') { pos = new THREE.Vector3(0, span * 1.55, 0.01); target = new THREE.Vector3(0, 0, 0); }
      else if (view === 'eye') {
        pos = new THREE.Vector3(r.eye[0] - r.w / 2, 1.6, r.eye[1] - r.d / 2);
        target = new THREE.Vector3(r.look[0] - r.w / 2, 1.2, r.look[1] - r.d / 2);
        if (!fullWalls) toggleWalls(true);
      } else { pos = new THREE.Vector3(-span * 0.55, span * 0.95, span * 0.95); target = new THREE.Vector3(0, 0.3, 0); }
      if (bar) bar.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!animate || reduce) { camera.position.copy(pos); controls.target.copy(target); controls.update(); return; }
      const p0 = camera.position.clone(), t0 = controls.target.clone(), start = performance.now();
      (function step(now) {
        const k = Math.min(1, (now - start) / 700), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        camera.position.lerpVectors(p0, pos, e); controls.target.lerpVectors(t0, target, e); controls.update();
        if (k < 1) requestAnimationFrame(step);
      })(start);
    }
    function load(k) {
      if (cache[k]) return Promise.resolve(cache[k]);
      return new Promise((res, rej) => loader.load(ROOMS[k].src + '?v=' + VERSION, g => {
        g.scene.traverse(o => {
          if (!o.isMesh) return;
          const n = o.material.name;
          o.castShadow = !(n === 'glass' || n === 'water' || n === 'grass'); o.receiveShadow = true; o.material.clipShadows = true;
        });
        cache[k] = g.scene; res(g.scene);
      }, undefined, rej));
    }
    async function show(k) {
      if (!ROOMS[k]) k = 'deluxe';
      currentKey = k; msg.hidden = false; msgKey = 'loading'; msgVars = null; msg.textContent = L('loading');
      try {
        const root = await load(k);
        if (currentKey !== k) return;
        if (current) scene.remove(current);
        current = root; if (fullWalls) toggleWalls(false); applyWalls(root); scene.add(root);
        msg.hidden = true; setView('iso', false);
        renderer.domElement.setAttribute('role', 'img');
        relabel();
      } catch (e) {
        msgKey = 'noFile'; msgVars = { src: ROOMS[k].src }; msg.textContent = L('noFile', msgVars);
      }
    }
    function resize() {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / Math.max(h, 1); camera.updateProjectionMatrix();
    }
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
    relabel();
    show(key);
    function destroy() {
      renderer.setAnimationLoop(null);
      document.removeEventListener('gv:langchange', relabel);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      el.innerHTML = '';
      delete el.dataset.mounted;
    }
    return { show, setView, toggleWalls, destroy, rooms: ROOMS };
  }

  window.GrandviewRoom3D = { mount, rooms: ROOMS };
  function auto() { document.querySelectorAll('[data-room].gv-3d:not([data-mounted])').forEach(el => { el.dataset.mounted = '1'; mount(el, el.dataset.room); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();

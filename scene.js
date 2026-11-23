// Скролл-сцена: видео из Seedance прокручивается скроллом (облёт камеры),
// в последнем кадре сайт загорается на экране ноутбука, и камера ныряет в экран.
(() => {
  const VW = 1280, VH = 720;                 // размер кадра видео
  // углы пустого экрана в последнем кадре видео: TL, TR, BR, BL
  const QUAD = [[564, 253], [980, 254], [966, 524], [548, 507]];
  const SCREEN_W = 1440, SCREEN_H = 900;     // «сайт внутри ноутбука»
  const START_X = 640, END_X = 765;          // куда смотрит кадр в начале и в конце (героиня → ноутбук)

  // доли прокрутки сцены
  const T_VIDEO = .62;     // до этой точки крутится видео
  const T_SCREEN = .69;    // сайт загорелся на экране
  const T_DIVE = .93;      // нырок закончен

  const tpl = document.getElementById('inside-tpl');
  document.querySelectorAll('[data-inside]').forEach(n => n.appendChild(tpl.content.cloneNode(true)));
  document.querySelectorAll('.mini a').forEach(a => a.setAttribute('tabindex', '-1'));

  const intro = document.querySelector('.intro');
  const video = document.getElementById('heroVideo');
  const l2 = document.getElementById('l2');
  const wrap = document.getElementById('wrap');
  const screen = document.getElementById('screen');
  const mini = screen.querySelector('.mini');
  const flat = document.getElementById('flat');
  const hint = document.getElementById('hint');
  const vaseFx = document.getElementById('vaseFx');
  const VASE = [840, 420, 200, 184];          // где цветы в первом кадре видео: x, y, ширина, высота
  const fxs = [...document.querySelectorAll('#flyIntro .fx')].map(el => ({ el, out: el.dataset.out.split(',').map(Number) }));

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const smooth = t => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  // --- перспективная матрица: прямоугольник → четырёхугольник ---
  const adj = m => [m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
                    m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
                    m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]];
  const mm = (a, b) => { const c = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += a[3*i+k] * b[3*k+j]; c[3*i+j] = s; } return c; };
  const mv = (m, v) => [m[0]*v[0]+m[1]*v[1]+m[2]*v[2], m[3]*v[0]+m[4]*v[1]+m[5]*v[2], m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
  const basis = p => { const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1]; const v = mv(adj(m), [p[3][0], p[3][1], 1]); return mm(m, [v[0],0,0, 0,v[1],0, 0,0,v[2]]); };
  function homography(src, dst) {
    const t = mm(basis(dst), adj(basis(src)));
    for (let i = 0; i < 9; i++) t[i] /= t[8];
    return `matrix3d(${t[0]},${t[3]},0,${t[6]},${t[1]},${t[4]},0,${t[7]},0,0,1,0,${t[2]},${t[5]},0,${t[8]})`;
  }
  window.homography = homography;

  // мышка и скорость скролла — общие для всех летающих предметов
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.__mouse = mouse;
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  let vel = 0, lastY = scrollY;

  // где на экране стоит кадр видео при данной «точке взгляда» fx
  let L = {};
  function frameBox(fx) {
    const { vw, vh, s } = L;
    const W = VW * s, H = VH * s;
    const left = W > vw ? clamp(vw / 2 - fx * s, vw - W, 0) : (vw - W) / 2;
    const top = (vh - H) / 2;
    return { left, top, W, H };
  }

  function layout() {
    const vw = innerWidth, vh = innerHeight;
    // компьютер: видео на весь экран. Телефон: чуть меньше, чтобы ноутбук целиком влез по ширине
    const cover = Math.max(vw / VW, vh / VH);
    const fitScreen = 0.92 * vw / (QUAD[1][0] - QUAD[0][0]);
    const s = vw / vh < 1 ? Math.max(vw / VW, Math.min(cover, fitScreen)) : cover;
    L = { vw, vh, s };

    const box = frameBox(END_X);
    wrap.style.width = box.W + 'px'; wrap.style.height = box.H + 'px';
    const quad = QUAD.map(([x, y]) => [x * s, y * s]);
    screen.style.transform = homography([[0,0],[SCREEN_W,0],[SCREEN_W,SCREEN_H],[0,SCREEN_H]], quad);
    const xs = quad.map(q => q[0]), ys = quad.map(q => q[1]);
    const bx = Math.min(...xs), by = Math.min(...ys), bw = Math.max(...xs) - bx, bh = Math.max(...ys) - by;
    Object.assign(L, { box, cx: bx + bw / 2, cy: by + bh / 2, zoom: Math.max(vw / bw, vh / bh) * 1.06 });
    render();
  }

  // ---- видео крутится скроллом (с мягким догоном, чтобы не дёргалось) ----
  let vTarget = 0, vShown = 0, ready = false;
  const unlock = () => { video.play().then(() => video.pause()).catch(() => {}); };
  video.addEventListener('loadeddata', () => { ready = true; });
  addEventListener('touchstart', unlock, { once: true, passive: true });
  if (video.readyState >= 2) ready = true;

  function render() {
    const { vw, vh, cx, cy, zoom, box } = L;
    const max = intro.offsetHeight - vh;
    const p = clamp(-intro.getBoundingClientRect().top / max, 0, 1);

    hint.style.opacity = (1 - seg(p, 0, .04)) * .7;

    // 1. видео: время по скроллу, кадр плавно «поворачивает» к ноутбуку
    const tv = seg(p, 0, T_VIDEO);
    vTarget = tv;
    const fx = lerp(START_X, END_X, smooth(seg(tv, .35, 1)));
    const b = frameBox(fx);
    video.style.cssText = `left:${b.left}px;top:${b.top}px;width:${b.W}px;height:${b.H}px`;
    // цветы колышутся, пока камера стоит; дальше уходят вместе с кадром видео
    const sc = b.W / VW;
    vaseFx.style.cssText = `left:${b.left + VASE[0] * sc}px;top:${b.top + VASE[1] * sc}px;width:${VASE[2] * sc}px;height:${VASE[3] * sc}px;opacity:${1 - seg(tv, .05, .1)}`;

    // кофе вокруг героини: плавает, тянется за мышкой, а на облёте разлетается в стороны
    const a1 = seg(p, 0, .2), b1 = ease(seg(p, .2, .45));
    fxs.forEach(({ el, out }, i) => {
      const bob = Math.sin(performance.now() / 1400 + i * 2) * 8;
      const dx = out[0] * vw * .5 * b1 + mouse.x * (14 + i * 8);
      const dy = out[1] * vh * .5 * b1 - a1 * 30 + bob + mouse.y * (10 + i * 6);
      const rot = (i % 2 ? 1 : -1) * (6 + b1 * 40) + vel * (i % 2 ? 1 : -1) * 4;
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${1 + a1 * .1 + b1 * 1.1}) rotate(${rot}deg)`;
      el.style.opacity = 1 - seg(p, .32, .45);
    });

    // 2. последний кадр: поверх видео та же картинка с экраном, куда ляжет сайт
    l2.style.opacity = p >= T_VIDEO - .002 ? 1 : 0;
    screen.style.opacity = ease(seg(p, T_VIDEO, T_SCREEN));

    // 3. нырок в экран
    const d = ease(seg(p, T_SCREEN, T_DIVE));
    const s = Math.exp(lerp(0, Math.log(zoom), d));
    const px = lerp(box.left + cx, vw / 2, d), py = lerp(box.top + cy, vh / 2, d);
    wrap.style.transform = `translate(${px - cx * s}px, ${py - cy * s}px) scale(${s})`;

    // 4. ноутбук сменяется настоящим первым экраном сайта
    const narrow = vw / vh < 1.3;
    mini.style.opacity = narrow ? 1 - seg(p, .84, .89) : 1;
    const f = narrow ? seg(p, .89, .96) : seg(p, .88, .96);
    flat.style.opacity = f;
    flat.classList.toggle('on', f > .99);
    document.body.classList.toggle('past-intro', p > .97);
  }

  function tick() {
    // мягкий догон видео и мышки
    vShown += (vTarget - vShown) * .2;
    if (ready && video.duration) {
      const t = Math.min(vShown * video.duration, video.duration - .04);
      if (Math.abs(video.currentTime - t) > .02 && !video.seeking) video.currentTime = t;
    }
    mouse.x += (mouse.tx - mouse.x) * .06; mouse.y += (mouse.ty - mouse.y) * .06;
    const dy = scrollY - lastY; lastY = scrollY;
    vel += (clamp(dy / 12, -6, 6) - vel) * .12;
    window.__vel = vel;
    if (scrollY < intro.offsetHeight) render();
    requestAnimationFrame(tick);
  }

  addEventListener('resize', layout);
  layout();
  requestAnimationFrame(tick);
})();

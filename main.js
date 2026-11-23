// Собирает блоки из data.js и включает анимации появления.
(() => {
  const S = window.SITE;
  const $ = id => document.getElementById(id);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- контакты ----------
  document.querySelectorAll('[data-link]').forEach(a => {
    const url = S.contacts[a.dataset.link];
    if (url) { a.href = url; a.rel = 'noopener'; }   // открываем в той же вкладке: так ссылки работают везде, даже где новые вкладки запрещены
  });

  // ---------- услуги ----------
  $('svcGrid').innerHTML = S.services.map((s, i) => `
    <article class="svc reveal${s.wide ? ' wide' : ''}${s.site ? ' site' : ''}">
      <div>
        <span class="num">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
      </div>
      ${s.shot ? `<figure class="site-shot"><span class="bar"><i></i><i></i><i></i></span><img src="${esc(s.shot)}" alt="Скрин сайта" loading="lazy"></figure>` : ''}
      <span class="price-wrap"><span class="price">${s.old ? `<s>${esc(s.old)}</s>` : ''}${s.from ? '<small>от</small>' : ''}${esc(s.price)}</span>${s.note ? `<span class="price-note">${esc(s.note)}</span>` : ''}</span>
    </article>`).join('');

  // ---------- портфолио ----------
  const catLabel = Object.fromEntries(S.categories.map(c => [c.id, c.label]));
  $('filters').innerHTML = S.categories.map((c, i) =>
    `<button role="tab" data-cat="${c.id}" aria-selected="${i === 0}">${esc(c.label)}</button>`).join('');
  const eye = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 5C6.5 5 2.7 9.4 1.5 12c1.2 2.6 5 7 10.5 7s9.3-4.4 10.5-7C21.3 9.4 17.5 5 12 5Zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-2.3a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"/></svg>';
  $('works').innerHTML = S.portfolio.map((w, i) => {
    const media = w.poster || w.video || w.slides;
    return `
    <button class="work reveal${media ? ' has-media' : ''}${(w.ratio || '').startsWith('16') ? ' wide' : ''}" data-i="${i}" data-cat="${w.cat}" data-tone="${i % 4}"
      style="--ratio:${w.ratio || '9/16'}" aria-label="${esc(w.title)}">
      ${w.poster ? `<img class="poster" src="${esc(w.poster)}" alt="" loading="lazy">` : ''}
      ${w.loop ? `<video class="loop" muted loop playsinline preload="none" data-src="${esc(w.loop)}"></video>` : ''}
      ${w.views ? `<span class="views">${eye}${esc(w.views)}</span>` : ''}
      ${w.slides ? `<span class="slides-ic">${w.slides.length} слайдов</span>` : ''}
      <span class="ph">
        <span class="cat">${esc(catLabel[w.cat] || '')}</span>
        <span class="play"></span>
        <span><span class="wt">${esc(w.title)}</span>${media ? '' : '<span class="soon">скоро здесь кейс</span>'}</span>
      </span>
    </button>`;
  }).join('');

  $('filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('filters').querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', x === b));
    document.querySelectorAll('.work').forEach(w =>
      w.classList.toggle('hide', b.dataset.cat !== 'all' && w.dataset.cat !== b.dataset.cat));
  });

  // превью: на компьютере при наведении, на телефоне когда карточка на экране
  const playLoop = (w, on) => {
    const v = w.querySelector('video.loop'); if (!v) return;
    if (on) { if (!v.src) v.src = v.dataset.src; v.play().then(() => w.classList.add('playing')).catch(() => {}); }
    else { v.pause(); w.classList.remove('playing'); }
  };
  const touch = matchMedia('(hover: none)').matches;
  document.querySelectorAll('.work').forEach(w => {
    if (!touch) {
      w.addEventListener('mouseenter', () => playLoop(w, true));
      w.addEventListener('mouseleave', () => playLoop(w, false));
    }
  });
  if (touch) {
    const vio = new IntersectionObserver(es => es.forEach(e => playLoop(e.target, e.isIntersecting)), { threshold: .6 });
    document.querySelectorAll('.work').forEach(w => vio.observe(w));
  }

  // окно просмотра: видео или листалка карусели
  const modal = $('modal'), mv = $('modalVideo'), gal = $('gallery');
  const close = () => { modal.classList.remove('open', 'gal', 'wide'); modal.setAttribute('aria-hidden', 'true'); mv.pause(); };
  $('works').addEventListener('click', e => {
    const el = e.target.closest('.work'); if (!el) return;
    const w = S.portfolio[+el.dataset.i];
    if (w.slides) {
      gal.innerHTML = w.slides.map(src => `<img src="${esc(src)}" alt="" loading="lazy">`).join('');
      gal.scrollLeft = 0; modal.classList.add('gal');
    } else if (w.video) {
      mv.src = w.video; if (w.poster) mv.poster = w.poster;
      modal.classList.toggle('wide', (w.ratio || '').startsWith('16'));
      mv.play().catch(() => {});
    } else return;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  });
  $('modalClose').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // ---------- результаты ----------
  $('results').innerHTML = S.results.map(r => `
    <figure class="shot reveal"><div class="tape"></div><img src="${esc(r.img)}" alt="${esc(r.note)}" loading="lazy">
      <b>${esc(r.label)}</b><span>${esc(r.note)}</span></figure>`).join('');

  // ---------- почему я ----------
  $('notes').innerHTML = S.why.map(n => `
    <div class="pin reveal"><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></div>`).join('');

  // ---------- этапы ----------
  $('steps').innerHTML = S.steps.map(t => `<li class="reveal"><p>${esc(t)}</p></li>`).join('');

  // ---------- пунктир, соединяющий шаги ----------
  // проходит через центры кружков; между рядами огибает текст снизу
  const drawSteps = () => {
    const wrapEl = document.querySelector('.steps-wrap'), path = $('stepsPath');
    if (!wrapEl || !path) return;
    const items = [...document.querySelectorAll('#steps li')];
    const pts = items.map(li => {
      // offset* не учитывают анимацию появления, поэтому линия не съезжает
      const r = { left: li.offsetLeft, top: li.offsetTop, height: li.offsetHeight, bottom: li.offsetTop + li.offsetHeight };
      const cs = getComputedStyle(li), bs = getComputedStyle(li, '::before');
      const w = parseFloat(bs.width), h = parseFloat(bs.height);
      const row = cs.display === 'flex';
      return { x: r.left + w / 2, y: row ? r.top + r.height / 2 : r.top + parseFloat(cs.paddingTop) + h / 2, bottom: r.bottom, top: r.top };
    });
    // точки пути: на переходе в новый ряд — обход по промежутку между рядами
    const P = [];
    pts.forEach((p, i) => {
      const prev = pts[i - 1];
      if (prev && p.top > prev.bottom - 4 && p.x < prev.x - 20) {
        const gap = (prev.bottom + p.top) / 2;
        P.push([prev.x + 40, gap], [p.x - 40, gap]);
      }
      P.push([p.x, p.y]);
    });
    // плавная кривая через точки (Catmull-Rom → кубические Безье)
    let d = `M${P[0][0]},${P[0][1]}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
    }
    path.setAttribute('d', d);
  };
  addEventListener('resize', drawSteps);
  addEventListener('load', drawSteps);
  document.fonts && document.fonts.ready.then(drawSteps);
  drawSteps();

  // ---------- линии-каракули рисуются ----------
  document.querySelectorAll('main .doodle').forEach(svg => {
    const p = svg.querySelector('path'); if (!p) return;
    svg.style.setProperty('--len', Math.ceil(p.getTotalLength()));
    svg.classList.add('draw');
  });

  // ---------- появление по скроллу ----------
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    // соседи в одной сетке появляются по очереди
    const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('reveal') || c.classList.contains('draw')) : [];
    el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 80 + 'ms';
    el.classList.add('in');
    io.unobserve(el);
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal, .draw').forEach(el => io.observe(el));

  // после появления убираем задержку, чтобы наведение было мгновенным
  document.addEventListener('transitionend', e => { if (e.target.classList.contains('in')) e.target.style.transitionDelay = ''; });

  // ---------- предметы плывут при скролле ----------
  const fis = [...document.querySelectorAll('main .fi')];
  const moveFis = () => {
    const vh = innerHeight, m = window.__mouse || { x: 0, y: 0 }, v = window.__vel || 0;
    fis.forEach((el, i) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      const d = (r.top + r.height / 2 - vh / 2) / vh;      // -1…1 относительно центра экрана
      const sp = +el.dataset.speed || 0, rot = +el.dataset.rot || 0;
      const depth = 18 + Math.abs(sp) * 120;               // ближние предметы сильнее тянутся за мышкой
      const x = m.x * depth * (i % 2 ? 1 : -1) + d * rot * 6;
      const y = d * sp * vh + m.y * depth * .7;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${d * rot + v * (i % 2 ? 2.5 : -2.5)}deg)`;
    });
  };
  // предметы живут каждый кадр: скролл, мышка и скорость прокрутки
  const loopFis = () => { moveFis(); requestAnimationFrame(loopFis); };
  requestAnimationFrame(loopFis);

  // клик по предмету: подпрыгивает и крутится
  document.querySelectorAll('.fi>img, .fi>.device, .fx').forEach(el => {
    el.addEventListener('click', () => { el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing'); });
    el.addEventListener('animationend', e => { if (e.animationName === 'boing') el.classList.remove('boing'); });
  });

  // карточки услуг и заметки наклоняются за мышкой
  if (!touch) document.querySelectorAll('#svcGrid .svc, #notes .pin, .shot, .polaroid').forEach(card => {
    card.classList.add('tilt');
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
  addEventListener('resize', moveFis);
  moveFis();

  // ---------- видео внутри телефонов и ноутбука ----------
  // ролик ставим ровно в экран по четырём углам (они измерены на картинке предмета)
  const fitScreens = () => document.querySelectorAll('.device[data-quad]').forEach(dev => {
    const v = dev.querySelector('video'), img = dev.querySelector('img');
    const [sw] = dev.dataset.size.split(',').map(Number);
    const k = img.offsetWidth / sw; if (!k) return;
    const q = dev.dataset.quad.split(' ').map(p => p.split(',').map(n => +n * k));
    const front = dev.hasAttribute('data-front');
    // экран за прозрачной рамкой — чуть шире, чтобы не было щелей; экран поверх — ровно по углам
    const grow = front ? 1 : 1.03;
    const cx = q.reduce((a, p) => a + p[0], 0) / 4, cy = q.reduce((a, p) => a + p[1], 0) / 4;
    const qq = q.map(([x, y]) => [cx + (x - cx) * grow, cy + (y - cy) * grow]);
    const [W, H] = dev.dataset.box.split(',').map(Number);
    v.style.width = W + 'px'; v.style.height = H + 'px';
    v.style.transform = window.homography([[0, 0], [W, 0], [W, H], [0, H]], qq);
    v.classList.add('fitted');
  });
  addEventListener('resize', fitScreens);
  addEventListener('load', fitScreens);
  document.querySelectorAll('.device img').forEach(i => i.complete ? 0 : i.addEventListener('load', fitScreens));
  fitScreens();
  const pio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target.querySelector('video'); if (!v) return;
    if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
  }), { threshold: .2 });
  document.querySelectorAll('.device').forEach(d => pio.observe(d));

  // ---------- плавающая кнопка «Заказать» ----------
  const fo = $('floatOrder'), contact = $('contact');
  let contactVisible = false;
  new IntersectionObserver(([en]) => { contactVisible = en.isIntersecting; tick(); }).observe(contact);
  const tick = () => fo.classList.toggle('show', document.body.classList.contains('past-intro') && !contactVisible);
  addEventListener('scroll', tick, { passive: true });

  // ---------- плавный скролл ----------
  const startLenis = () => {
    if (!window.Lenis || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = window.lenis = new Lenis({ lerp: .085, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return;
      const t = document.querySelector(a.getAttribute('href')); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { duration: 1.6 });
    });
  };
  if (document.readyState === 'complete') startLenis(); else addEventListener('load', startLenis);
})();

// ---------- цветочки за мышкой ----------
// при движении мышки рассыпаются маленькие цветы, по клику (и касанию на телефоне) — букетик
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#D8156F', '#F2A7C7', '#F8DCE8', '#E85A9A'];
  const layer = document.createElement('div');
  layer.className = 'petals';
  document.body.appendChild(layer);
  let count = 0;
  const spawn = (x, y, big) => {
    if (count > 40) return;
    const size = (big ? 20 : 16) + Math.random() * (big ? 18 : 12);
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('class', 'petal');
    el.innerHTML = '<use href="#flower"/>';
    el.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;color:${colors[Math.random() * colors.length | 0]};` +
      `--dx:${(Math.random() - .5) * (big ? 160 : 60)}px;--dy:${(big ? 60 : 40) + Math.random() * (big ? 120 : 60)}px;--rot:${(Math.random() - .5) * 360}deg;--t:${1.1 + Math.random() * .7}s`;
    layer.appendChild(el); count++;
    el.addEventListener('animationend', () => { el.remove(); count--; });
  };
  let lx = 0, ly = 0;
  if (matchMedia('(hover: hover)').matches) {
    addEventListener('pointermove', e => {
      if (Math.hypot(e.clientX - lx, e.clientY - ly) < 46) return;
      lx = e.clientX; ly = e.clientY;
      spawn(e.clientX, e.clientY, false);
    }, { passive: true });
  }
  addEventListener('pointerdown', e => { for (let i = 0; i < 7; i++) spawn(e.clientX, e.clientY, true); }, { passive: true });
})();

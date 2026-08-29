/* ============================================================
   VDN Consulting — sistema de movimiento
   Se aplica solo: no hay que tocar el HTML de ninguna página.
   Todo respeta prefers-reduced-motion.
   ============================================================ */

(function () {
  'use strict';

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. Barra de progreso de lectura
     --------------------------------------------------------- */
  (function progress() {
    var bar = document.createElement('div');
    bar.className = 'scrollbar-progress';
    bar.innerHTML = '<i></i>';
    document.body.appendChild(bar);
    var fill = bar.firstChild, tick = false;

    var sync = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      fill.style.width = Math.min(100, Math.max(0, pct)).toFixed(2) + '%';
    };
    sync();
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () { sync(); tick = false; });
    }, { passive: true });
  })();

  /* ---------------------------------------------------------
     2. Marcado automático de lo que se revela
     Se etiqueta el DOM sin tocar el HTML fuente.
     --------------------------------------------------------- */
  var GROUPS = '.syms,.caps,.cases,.plans,.steps,.metrics,.tiers,.units,.faq,.checklist,.trust-in';
  var SOLO = 'section > .wrap > .eyebrow, section > .wrap > h2, section > .wrap > .lede,' +
             'section > .wrap > .spec, section > .wrap > .compare, section > .wrap > figure,' +
             'section > .wrap > .submark, .rack-head > *, .cta-grid > *, .hero-grid > *,' +
             '.uhero-grid > *, .calc > *, .unext > a';

  function tag() {
    document.querySelectorAll(SOLO).forEach(function (el) {
      if (el.closest('.vhero')) return;
      el.classList.add('rv');
    });
    document.querySelectorAll(GROUPS).forEach(function (g) {
      var i = 0;
      Array.prototype.forEach.call(g.children, function (c) {
        c.classList.add('rv');
        c.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
        i++;
      });
    });
  }

  /* ---------------------------------------------------------
     3. Contadores: los números suben desde cero
     --------------------------------------------------------- */
  function countUp(el) {
    var raw = el.textContent;
    var m = raw.replace(/\u2212/g, '-').match(/-?\d+(?:[.,]\d+)?/);
    if (!m) return;
    var token = m[0];
    var sep = token.indexOf(',') > -1 ? ',' : '.';
    var decimals = token.split(/[.,]/)[1] ? token.split(/[.,]/)[1].length : 0;
    var target = parseFloat(token.replace(',', '.'));
    var idx = raw.replace(/\u2212/g, '-').indexOf(token);
    var pre = raw.slice(0, idx), post = raw.slice(idx + token.length);
    var t0 = null, dur = 1100;

    var frame = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = (target * eased).toFixed(decimals);
      if (sep === ',') v = v.replace('.', ',');
      el.textContent = pre + v + post;
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------
     4. Observador único para todo
     --------------------------------------------------------- */
  function observe() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in');

        if (el.classList.contains('case-num') || el.classList.contains('metric-val')) countUp(el);
        if (el.classList.contains('rack')) el.classList.add('booted');

        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    document.querySelectorAll('.rv, .rack').forEach(function (el) { io.observe(el); });
    if (!REDUCE) document.querySelectorAll('.case-num, .metric-val').forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     5. Marquesina de tecnologías
     --------------------------------------------------------- */
  function marquee() {
    var strip = document.querySelector('.trust-in');
    if (!strip || REDUCE) return;
    var label = strip.querySelector('span');
    var marks = Array.prototype.slice.call(strip.querySelectorAll('b'));
    if (marks.length < 4) return;

    var box = document.createElement('div');
    box.className = 'marquee';
    var track = document.createElement('div');
    track.className = 'marquee-track';
    for (var pass = 0; pass < 3; pass++) {
      marks.forEach(function (b) { track.appendChild(b.cloneNode(true)); });
    }
    box.appendChild(track);
    strip.innerHTML = '';
    if (label) strip.appendChild(label);
    strip.appendChild(box);
    strip.classList.add('is-marquee');
  }

  /* ---------------------------------------------------------
     Arranque
     --------------------------------------------------------- */
  function init() {
    tag();
    marquee();
    if (REDUCE) {
      document.querySelectorAll('.rv').forEach(function (el) {
        el.classList.add('in');
        el.style.transitionDelay = '';
      });
      document.querySelectorAll('.rack').forEach(function (r) { r.classList.add('booted'); });
      return;
    }
    document.documentElement.classList.add('motion');
    observe();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ============================================================
   Luces flotantes para secciones claras.
   Se activa en cualquier elemento con <canvas class="lights">.
   ============================================================ */
(function () {
  'use strict';
  var cv = document.querySelector('.lights');
  if (!cv) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = cv.getContext('2d'), w = 0, h = 0, ps = [], raf = null;
  var A = [[74, 64, 208], [13, 143, 138]];   // índigo y teal

  function build() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.max(18, Math.min(52, Math.round(w * h / 26000)));
    ps = [];
    for (var i = 0; i < n; i++) {
      ps.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 2.6 + 0.8,
        vy: -(Math.random() * 0.16 + 0.05),
        vx: (Math.random() - 0.5) * 0.09,
        a: Math.random() * 0.4 + 0.12,
        ph: Math.random() * 6.28,
        c: A[Math.random() < 0.28 ? 1 : 0]
      });
    }
  }

  function step(ts) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      p.y += p.vy; p.x += p.vx; p.ph += 0.013;
      if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
      if (p.x < -12) p.x = w + 12;
      if (p.x > w + 12) p.x = -12;
      var pulso = p.a * (0.55 + 0.45 * Math.sin(p.ph));
      var c = p.c;
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + pulso.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, 6.284); ctx.fill();
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (pulso * 1.5).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.5, 0, 6.284); ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }

  build();
  raf = requestAnimationFrame(step);
  new IntersectionObserver(function (e) {
    if (e[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(step); }
    else if (raf) { cancelAnimationFrame(raf); raf = null; }
  }).observe(cv);

  var t = null;
  window.addEventListener('resize', function () {
    clearTimeout(t); t = setTimeout(build, 180);
  });
})();

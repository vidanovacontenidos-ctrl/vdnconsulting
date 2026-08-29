/* Sala de Máquinas — comportamiento compartido.
   Todo es opcional: cada bloque comprueba que sus elementos existan
   antes de correr, así el mismo archivo sirve para todas las páginas. */

(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Reloj del panel de operaciones ---- */
  var clock = document.getElementById('clock');
  if (clock) {
    var tick = function () {
      var d = new Date();
      clock.textContent =
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0');
    };
    tick();
    if (!reduce) setInterval(tick, 1000);
  }

  /* ---- Recomendador de plan por cantidad de puestos ---- */
  var seats = document.getElementById('seats');
  if (seats) {
    var tiers = document.querySelectorAll('.tier');
    var out = {
      seats: document.getElementById('seatsOut'),
      plan: document.getElementById('qPlan'),
      cover: document.getElementById('qCover'),
      sla: document.getElementById('qSla'),
      eng: document.getElementById('qEng'),
      fit: document.getElementById('qFit')
    };
    var sel = document.querySelector('.tier.sel') || tiers[0];
    var word = out.seats.querySelector('small').textContent;
    var manual = false;

    var suggest = function (n) {
      var best = tiers[0];
      tiers.forEach(function (t) {
        if (n >= +t.dataset.min) best = t;
      });
      return best;
    };

    var render = function () {
      var n = parseInt(seats.value, 10);
      out.seats.innerHTML = n + '<small>' + word + '</small>';
      out.plan.textContent = sel.dataset.plan;
      out.cover.textContent = sel.dataset.cover;
      out.sla.textContent = sel.dataset.sla;
      out.eng.textContent = sel.dataset.eng;
      var fits = n >= +sel.dataset.min && n <= +sel.dataset.max;
      out.fit.textContent = fits ? out.fit.dataset.ok : out.fit.dataset.no.replace('{p}', suggest(n).dataset.plan);
      out.fit.className = 'fit' + (fits ? '' : ' off');
    };

    tiers.forEach(function (t) {
      t.addEventListener('click', function () {
        tiers.forEach(function (x) { x.classList.remove('sel'); });
        t.classList.add('sel'); sel = t; manual = true; render();
      });
    });
    seats.addEventListener('input', function () {
      if (!manual) {
        var b = suggest(parseInt(seats.value, 10));
        tiers.forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel'); sel = b;
      }
      render();
    });
    render();
  }

  /* ---- Formulario de diagnóstico ---- */
  var form = document.getElementById('form');
  if (form) {
    var required = ['f1', 'f2', 'f3', 'f4'];
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      required.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (!el.value.trim()) { el.style.borderColor = 'var(--alert)'; ok = false; }
        else { el.style.borderColor = ''; }
      });
      if (!ok) return;
      /* Reemplazar por el envío real: fetch a Formspree, HubSpot o tu backend. */
      document.getElementById('formFields').style.display = 'none';
      document.getElementById('formOk').style.display = 'block';
    });
    required.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', function () { this.style.borderColor = ''; });
    });
  }
})();

/* ---- Recordar el idioma elegido ---- */
(function () {
  'use strict';
  var sw = document.querySelector('.lang');
  if (!sw) return;
  sw.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || a.classList.contains('on')) return;
    try { localStorage.setItem('vdn-lang', a.textContent.trim().toLowerCase()); } catch (err) {}
  });
})();

/* ---- Hero de video: animación por carácter y estado de la barra ---- */
(function () {
  'use strict';
  var hero = document.querySelector('.vhero');
  if (!hero) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var h1 = hero.querySelector('h1');
  var CHAR = 30;      // ms entre caracteres
  var START = 200;    // ms antes de arrancar

  /* Partir el titular en caracteres. El texto vive en data-text,
     con | como salto de línea, para que el HTML quede legible. */
  if (h1 && h1.dataset.text) {
    var lines = h1.dataset.text.split('|');
    var n = 0;
    h1.innerHTML = lines.map(function (line) {
      var words = line.split(' ').map(function (word) {
        var chars = word.split('').map(function (c) {
          var d = reduce ? 0 : n++ * CHAR;
          return '<span class="ch" style="transition-delay:' + d + 'ms">' + c + '</span>';
        }).join('');
        return '<span class="wd">' + chars + '</span>';
      });
      n++;
      return '<span class="ln">' + words.join(' ') + '</span>';
    }).join('');
    h1.setAttribute('aria-label', lines.join(' '));
  }

  var reveal = function () {
    if (h1) h1.classList.add('go');
    hero.querySelectorAll('.fade').forEach(function (el) {
      var d = reduce ? 0 : parseInt(el.dataset.delay || '0', 10);
      setTimeout(function () { el.classList.add('go'); }, d);
    });
  };
  reduce ? reveal() : setTimeout(reveal, START);

  /* La barra es vidrio sobre el video y vuelve a clara al bajar. */
  var nav = document.querySelector('nav');
  if (!nav) return;
  var sync = function () {
    var limit = hero.offsetHeight - nav.offsetHeight - 8;
    nav.classList.toggle('over', window.scrollY < limit);
  };
  sync();
  var tick = false;
  window.addEventListener('scroll', function () {
    if (tick) return;
    tick = true;
    requestAnimationFrame(function () { sync(); tick = false; });
  }, { passive: true });
  window.addEventListener('resize', sync);
})();

/* ---- Fondo animado del hero: topología de red con pulsos ---- */
(function () {
  'use strict';
  var cv = document.querySelector('.vhero-net');
  if (!cv) return;

  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INK = '233,235,255';      // trazo de los enlaces
  var PULSE = '#8F87FF';        // pulso principal
  var PULSE_ALT = '#5FD3CD';    // pulso de acento
  var nodes = [], links = [], pulses = [], w = 0, h = 0, dpr = 1, raf = null;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var n = Math.max(14, Math.min(34, Math.round(w * h / 42000)));
    nodes = [];
    for (var i = 0; i < n; i++) {
      nodes.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .16, vy: (Math.random() - .5) * .16,
        r: Math.random() * 1.4 + 1
      });
    }
    var reach = Math.min(w, h) * 0.34;
    links = [];
    for (var a = 0; a < nodes.length; a++)
      for (var b = a + 1; b < nodes.length; b++) {
        var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
        if (Math.sqrt(dx * dx + dy * dy) < reach) links.push([a, b]);
      }
    pulses = [];
  }

  function spawn() {
    if (!links.length || pulses.length > 7) return;
    var l = links[Math.floor(Math.random() * links.length)];
    pulses.push({ a: l[0], b: l[1], t: 0, sp: 0.0035 + Math.random() * 0.004,
                  c: Math.random() < 0.22 ? PULSE_ALT : PULSE });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    ctx.lineWidth = 1;
    for (var i = 0; i < links.length; i++) {
      var A = nodes[links[i][0]], B = nodes[links[i][1]];
      var dx = A.x - B.x, dy = A.y - B.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      var reach = Math.min(w, h) * 0.34;
      ctx.strokeStyle = 'rgba(' + INK + ',' + (0.13 * (1 - d / reach)).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(' + INK + ',0.30)';
    for (var j = 0; j < nodes.length; j++) {
      ctx.beginPath(); ctx.arc(nodes[j].x, nodes[j].y, nodes[j].r, 0, 6.284); ctx.fill();
    }

    for (var k = pulses.length - 1; k >= 0; k--) {
      var p = pulses[k], N1 = nodes[p.a], N2 = nodes[p.b];
      var x = N1.x + (N2.x - N1.x) * p.t, y = N1.y + (N2.y - N1.y) * p.t;
      var fade = Math.sin(p.t * Math.PI);
      ctx.globalAlpha = fade * 0.85;
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 6.284); ctx.fill();
      ctx.globalAlpha = fade * 0.22;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.284); ctx.fill();
      ctx.globalAlpha = 1;
      p.t += p.sp;
      if (p.t >= 1) pulses.splice(k, 1);
    }
  }

  function step() {
    for (var i = 0; i < nodes.length; i++) {
      var nd = nodes[i];
      nd.x += nd.vx; nd.y += nd.vy;
      if (nd.x < 0 || nd.x > w) nd.vx *= -1;
      if (nd.y < 0 || nd.y > h) nd.vy *= -1;
    }
    if (Math.random() < 0.045) spawn();
    draw();
    raf = requestAnimationFrame(step);
  }

  build();
  if (reduce) { draw(); }
  else {
    step();
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(step); }
      else if (raf) { cancelAnimationFrame(raf); raf = null; }
    }).observe(cv);
  }

  var t = null;
  window.addEventListener('resize', function () {
    clearTimeout(t); t = setTimeout(function () { build(); if (reduce) draw(); }, 180);
  });
})();

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
    h1.innerHTML = lines.map(function (line, li) {
      return '<span class="ln">' + line.split('').map(function (c) {
        var d = reduce ? 0 : n++ * CHAR;
        var ch = c === ' ' ? '\u00A0' : c;
        return '<span class="ch" style="transition-delay:' + d + 'ms">' + ch + '</span>';
      }).join('') + '</span>';
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

/* Selector de territorios de la unidad U5.
   Cada territorio cambia paleta, tipografía y tono a la vez. */
(function () {
  'use strict';
  var box = document.getElementById('terr');
  if (!box) return;

  var T = [
    { id: 'editorial',
      bg: '#F7F5FF', ink: '#16123A', dim: '#5B5780', acc: '#5B4BE8', acc2: '#0D8F8A',
      disp: "'Instrument Serif',serif", body: "'Instrument Sans',sans-serif",
      sw: ['#16123A', '#5B4BE8', '#B9B0FF', '#F7F5FF'],
      dispName: 'Instrument Serif', bodyName: 'Instrument Sans' },
    { id: 'tecnico',
      bg: '#0E0B24', ink: '#F2F0FF', dim: '#9A93C7', acc: '#8B7CFF', acc2: '#14C8BE',
      disp: "'Archivo',sans-serif", body: "'Instrument Sans',sans-serif",
      sw: ['#0E0B24', '#8B7CFF', '#14C8BE', '#F2F0FF'],
      dispName: 'Archivo Expanded', bodyName: 'Instrument Sans' },
    { id: 'expresivo',
      bg: '#150A33', ink: '#FFFFFF', dim: '#C0A9E8', acc: '#C084FC', acc2: '#38E0D4',
      disp: "'Bricolage Grotesque',sans-serif", body: "'Space Grotesk',sans-serif",
      sw: ['#150A33', '#C084FC', '#38E0D4', '#FFFFFF'],
      dispName: 'Bricolage Grotesque', bodyName: 'Space Grotesk' },
    { id: 'sobrio',
      bg: '#FFFFFF', ink: '#0B0B12', dim: '#63637A', acc: '#2C2A6B', acc2: '#0D8F8A',
      disp: "'Playfair Display',serif", body: "'Instrument Sans',sans-serif",
      sw: ['#0B0B12', '#2C2A6B', '#C9C8DA', '#FFFFFF'],
      dispName: 'Playfair Display', bodyName: 'Instrument Sans' }
  ];

  var C = window.TERR_COPY || {};
  var tabs = document.querySelectorAll('.tbt');
  var sw = box.querySelectorAll('.terr-sw i');
  var el = {
    kicker: box.querySelector('.terr-kicker'),
    disp: box.querySelector('.terr-disp'),
    copy: box.querySelector('.terr-copy'),
    tone: box.querySelector('.terr-tone'),
    meta: box.querySelector('.terr-meta')
  };

  function apply(i) {
    var t = T[i], c = C[t.id] || {};
    box.style.setProperty('--t-bg', t.bg);
    box.style.setProperty('--t-ink', t.ink);
    box.style.setProperty('--t-dim', t.dim);
    box.style.setProperty('--t-acc', t.acc);
    box.style.setProperty('--t-acc2', t.acc2);
    box.style.setProperty('--t-disp', t.disp);
    box.style.setProperty('--t-body', t.body);
    t.sw.forEach(function (col, n) { if (sw[n]) sw[n].style.background = col; });

    el.kicker.textContent = c.kicker || '';
    el.disp.textContent = c.title || '';
    el.copy.textContent = c.copy || '';
    el.tone.textContent = c.tone || '';
    el.meta.innerHTML =
      (C.lblDisp || 'Display') + ' <b>' + t.dispName + '</b><br>' +
      (C.lblBody || 'Texto') + ' <b>' + t.bodyName + '</b><br>' +
      (C.lblAcc || 'Acento') + ' <b>' + t.acc + '</b><br>' +
      (C.lblBase || 'Fondo') + ' <b>' + t.bg + '</b>';

    tabs.forEach(function (b, n) { b.classList.toggle('on', n === i); });
  }

  tabs.forEach(function (b, n) { b.addEventListener('click', function () { apply(n); }); });
  apply(0);
})();

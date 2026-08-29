/* ============================================================
   VDN Consulting — popup de promoción de sitios web
   Aparece una vez por sesión: a los 28 s, al salir con el mouse,
   o al llegar al 55% de la página. Lo que ocurra primero.
   ============================================================ */

(function () {
  'use strict';

  var T = {
    es: {
      cupo: 'Quedan 4 cupos para este mes',
      h2: 'Tu sitio nuevo, con precio cerrado.',
      lede: 'Diseño propio, no plantilla comprada. El código queda a tu nombre y el plazo va por escrito. Si durante el proyecto pedís algo fuera del alcance, se cotiza aparte y lo aprobás antes.',
      planes: [
        { tag: 'Presencia', name: 'Landing', usd: '300', ars: '$300.000',
          cuota: 'o <b>3 cuotas sin interés</b>', entrega: 'Lista en 7 días',
          items: ['Una página, secciones a medida', 'Formulario y botón de WhatsApp', 'Carga optimizada, se ve bien en celular', 'Google Analytics configurado', 'Dominio y hosting el primer año'] },
        { tag: 'El más elegido', name: 'Comercial', usd: '750', ars: '$750.000', top: true,
          cuota: 'o <b>6 cuotas sin interés</b>', entrega: 'Lista en 3 semanas',
          items: ['Hasta 12 secciones', 'Blog que edita tu equipo', 'Redacción de textos incluida', 'Posicionamiento técnico en Google', 'Conexión con tu CRM', 'Panel de métricas', '3 meses de ajustes sin cargo'] },
        { tag: 'Venta online', name: 'Tienda', usd: '1.400', ars: '$1.400.000',
          cuota: 'o <b>6 cuotas sin interés</b>', entrega: 'Lista en 5 semanas',
          items: ['Catálogo sin límite de productos', 'Mercado Pago y transferencia', 'Sincronía con tu stock', 'Envíos y seguimiento', 'Cupones y promociones', 'Capacitación grabada'] }
      ],
      cta: 'Consultar por WhatsApp',
      pie: 'Precios en dólares, <b>se facturan en pesos al cambio del día</b>. Cuotas con Mercado Pago.',
      menos: 'Ahora no',
      wa: 'Hola, vi la promo de sitios web. Quiero consultar por el plan '
    },
    en: {
      cupo: '4 slots left this month',
      h2: 'Your new site, at a fixed price.',
      lede: 'Original design, never a purchased template. The code ends up in your name and the timeline is in writing. Anything outside the scope is quoted separately and you approve it first.',
      planes: [
        { tag: 'Presence', name: 'Landing', usd: '900', ars: '',
          cuota: 'or <b>3 monthly payments</b>', entrega: 'Live in 7 days',
          items: ['One page, sections to fit', 'Contact form and click-to-message', 'Fast loading, built mobile first', 'Analytics configured', 'Domain and hosting, first year'] },
        { tag: 'Most chosen', name: 'Commercial', usd: '2.400', ars: '', top: true,
          cuota: 'or <b>6 monthly payments</b>', entrega: 'Live in 3 weeks',
          items: ['Up to 12 sections', 'Blog your team can edit', 'Copywriting included', 'Technical SEO', 'CRM integration', 'Conversion dashboard', '90 days of revisions'] },
        { tag: 'Selling online', name: 'Store', usd: '4.200', ars: '',
          cuota: 'or <b>6 monthly payments</b>', entrega: 'Live in 5 weeks',
          items: ['Unlimited catalog', 'Card and ACH checkout', 'Sync with real inventory', 'Shipping and tracking', 'Coupons and promotions', 'Recorded training'] }
      ],
      cta: 'Ask on WhatsApp',
      pie: 'Prices in US dollars. Payment plans available.',
      menos: 'Not now',
      wa: "Hi, I saw the website promo. I'd like to ask about the "
    }
  };

  var lang = document.documentElement.lang.indexOf('es') === 0 ? 'es' : 'en';
  var t = T[lang];
  var TEL = '5491100000000';
  var visto = false;
  try { visto = sessionStorage.getItem('vdn-promo') === '1'; } catch (e) {}

  function marcar() { try { sessionStorage.setItem('vdn-promo', '1'); } catch (e) {} }

  function construir() {
    var box = document.createElement('div');
    box.className = 'promo';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', t.h2);

    var cards = t.planes.map(function (p) {
      var precio = p.ars
        ? 'USD ' + p.usd + '<small>' + p.ars + ' aprox.</small>'
        : '$' + p.usd + '<small>USD</small>';
      return '<div class="pz' + (p.top ? ' top' : '') + '">'
        + '<div class="pz-tag">' + p.tag + '</div>'
        + '<h3>' + p.name + '</h3>'
        + '<div class="pz-num">' + precio + '</div>'
        + '<div class="pz-cuota">' + p.cuota + '<br>' + p.entrega + '</div>'
        + '<ul>' + p.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>'
        + '<a class="btn ' + (p.top ? 'btn-primary' : 'btn-ghost') + '" target="_blank" rel="noopener" '
        + 'href="https://wa.me/' + TEL + '?text=' + encodeURIComponent(t.wa + p.name + '.') + '">' + t.cta + '</a>'
        + '</div>';
    }).join('');

    box.innerHTML =
      '<div class="promo-vel" data-cerrar></div>'
      + '<div class="promo-box">'
      + '<button class="promo-x" data-cerrar aria-label="Cerrar">&times;</button>'
      + '<div class="promo-cupo"><span class="dot"></span>' + t.cupo + '</div>'
      + '<h2>' + t.h2 + '</h2><p>' + t.lede + '</p>'
      + '<div class="promo-grid">' + cards + '</div>'
      + '<div class="promo-pie"><span>' + t.pie + '</span>'
      + '<button class="promo-menos" data-cerrar>' + t.menos + '</button></div>'
      + '</div>';

    document.body.appendChild(box);
    return box;
  }

  var caja = null, antes = null;

  function abrir() {
    if (visto) return;
    visto = true; marcar();
    if (!caja) caja = construir();
    antes = document.activeElement;
    caja.classList.add('on');
    document.body.style.overflow = 'hidden';
    var foco = caja.querySelector('.promo-x');
    if (foco) foco.focus();
  }

  function cerrar() {
    if (!caja) return;
    caja.classList.remove('on');
    document.body.style.overflow = '';
    if (antes && antes.focus) antes.focus();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cerrar]')) cerrar();
    if (e.target.closest('[data-promo]')) { e.preventDefault(); visto = false; abrir(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrar();
  });

  if (!visto) {
    var reloj = setTimeout(abrir, 28000);
    var salida = function (e) {
      if (e.clientY < 8) { clearTimeout(reloj); abrir(); document.removeEventListener('mouseout', salida); }
    };
    document.addEventListener('mouseout', salida);
    var scroll = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.55) {
        clearTimeout(reloj); abrir(); window.removeEventListener('scroll', scroll);
      }
    };
    window.addEventListener('scroll', scroll, { passive: true });
  }
})();

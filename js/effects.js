/* Free Farmhouse: decorative motion (all of it respects prefers-reduced-motion). */
(function () {
  'use strict';
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = function () { return mq.matches; };
  window.FF_REDUCED_MOTION = reduce;

  /* ---------- Olive branches (original, procedurally drawn SVG) ----------
     Slender olive-green leaves along gently curving stems, with small olive
     berries tucked in here and there. Each strand sways on its own timing. */
  function oliveSVG(seed) {
    var rnd = (function (s) { return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })(seed);
    var strands = '';
    var stems = [
      { x: 24, len: 250, bend: 34 }, { x: 62, len: 360, bend: 58 }, { x: 108, len: 290, bend: 22 },
      { x: 148, len: 330, bend: 64 }, { x: 196, len: 210, bend: 30 }
    ];
    function leaf(px, py, ang, L, w, cls) {
      return '<path class="' + cls + '" d="M0 0 C ' + (L * 0.3) + ' ' + (-w) + ', ' + (L * 0.75) + ' ' + (-w * 0.9) + ', ' + L + ' 0 C ' + (L * 0.75) + ' ' + (w * 0.9) + ', ' + (L * 0.3) + ' ' + w + ', 0 0Z" transform="translate(' + px.toFixed(1) + ' ' + py.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"/>' +
        '<path class="vein" d="M1 0 L' + (L * 0.85).toFixed(1) + ' 0" transform="translate(' + px.toFixed(1) + ' ' + py.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"/>';
    }
    stems.forEach(function (st, si) {
      var x0 = st.x, y0 = 0, x1 = st.x + st.bend, y1 = st.len;
      var cx = st.x + st.bend * 0.05, cy = st.len * 0.6;
      var path = 'M' + x0 + ' ' + y0 + ' Q' + cx + ' ' + cy + ' ' + x1 + ' ' + y1;
      var leaves = '', berries = '';
      var n = Math.round(st.len / 26);
      for (var i = 2; i <= n; i++) {
        var t = i / n;
        var px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
        var py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
        var side = i % 2 ? 1 : -1;
        var ang = 90 + side * (32 + rnd() * 24) - st.bend * 0.3 * t;
        var L = 18 + rnd() * 10;
        leaves += leaf(px, py, ang, L, 3.2 + rnd() * 1.2, rnd() < 0.3 ? 'lf lf--light' : 'lf');
        // olive berries: small, slightly oval, on short stalks, roughly every 3rd node
        if (rnd() < 0.34 && i < n) {
          var bAng = (90 - side * 40) * Math.PI / 180;
          var bx = px + Math.cos(bAng) * 9, by = py + Math.sin(bAng) * 9;
          berries += '<path class="stalk" d="M' + px.toFixed(1) + ' ' + py.toFixed(1) + ' L' + bx.toFixed(1) + ' ' + by.toFixed(1) + '"/>' +
            '<ellipse class="berry" cx="' + bx.toFixed(1) + '" cy="' + (by + 2).toFixed(1) + '" rx="3.4" ry="4.4"/>';
          if (rnd() < 0.5) berries += '<ellipse class="berry berry--dark" cx="' + (bx + side * 6).toFixed(1) + '" cy="' + (by + 5).toFixed(1) + '" rx="3" ry="3.9"/>';
        }
      }
      // tip leaf
      leaves += leaf(x1, y1, 90 + st.bend * 0.15, 20, 3.4, 'lf');
      strands += '<g class="strand" style="--d:' + (si * 0.7).toFixed(1) + 's;--dur:' + (7 + si * 1.3).toFixed(1) + 's">' +
        '<path class="stem" d="' + path + '"/>' + leaves + berries + '</g>';
    });
    return '<svg viewBox="0 0 280 420" preserveAspectRatio="xMidYMin meet">' + strands + '</svg>';
  }
  /* A single horizontal olive sprig (used as a flourish around quotes, dividers). */
  function sprigSVG(seed, len) {
    var rnd = (function (s) { return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })(seed);
    len = len || 220;
    var x0 = 6, y0 = 30, x1 = len, y1 = 26, cx = len * 0.5, cy = 6 + rnd() * 10;
    var out = '<path class="stem" d="M' + x0 + ' ' + y0 + ' Q' + cx + ' ' + cy + ' ' + x1 + ' ' + y1 + '"/>';
    var n = Math.round(len / 18), berries = '';
    for (var i = 1; i <= n; i++) {
      var t = i / (n + 0.6);
      var px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      var py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
      var side = i % 2 ? -1 : 1;
      var ang = side * (40 + rnd() * 18) - 8;
      var L = 14 + rnd() * 8 - t * 4, w = 3 + rnd();
      out += '<path class="' + (rnd() < .3 ? 'lf lf--light' : 'lf') + '" d="M0 0 C ' + (L * .3) + ' ' + (-w) + ', ' + (L * .75) + ' ' + (-w * .9) + ', ' + L + ' 0 C ' + (L * .75) + ' ' + (w * .9) + ', ' + (L * .3) + ' ' + w + ', 0 0Z" transform="translate(' + px.toFixed(1) + ' ' + py.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')"/>';
      if (rnd() < .28) berries += '<ellipse class="berry' + (rnd() < .5 ? ' berry--dark' : '') + '" cx="' + (px + 3).toFixed(1) + '" cy="' + (py + 7 * -side).toFixed(1) + '" rx="3.6" ry="2.8"/>';
    }
    out += '<path class="lf" d="M0 0 C 5 -3.4, 13 -3, 17 0 C 13 3, 5 3.4, 0 0Z" transform="translate(' + x1 + ' ' + y1 + ') rotate(-6)"/>';
    return '<svg viewBox="0 0 ' + (len + 22) + ' 60" aria-hidden="true">' + out + berries + '</svg>';
  }
  document.querySelectorAll('[data-sprig]').forEach(function (el, i) {
    el.innerHTML = sprigSVG(parseInt(el.getAttribute('data-seed'), 10) || (i * 37 + 11), parseInt(el.getAttribute('data-len'), 10) || 220);
  });

  document.querySelectorAll('[data-willow]').forEach(function (el, i) {
    el.innerHTML = oliveSVG(parseInt(el.getAttribute('data-seed'), 10) || (i * 46 + 31));
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce()) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
    window.FF_observeReveal = function (el) { io.observe(el); };
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    window.FF_observeReveal = function (el) { el.classList.add('is-visible'); };
  }

  /* ---------- Floating petals & light motes in the hero ---------- */
  var canvas = document.getElementById('hero-petals');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [], running = false, heroVisible = true, raf = 0;
    var colors = ['rgba(255,255,255,0.9)', 'rgba(232,214,236,0.85)', 'rgba(244,226,190,0.9)', 'rgba(214,226,206,0.85)'];
    function size() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(initial) {
      var petal = Math.random() < 0.55;
      return {
        petal: petal,
        x: Math.random() * W,
        y: initial ? Math.random() * H : -20,
        r: petal ? 4 + Math.random() * 5 : 1 + Math.random() * 2.2,
        vy: petal ? 0.25 + Math.random() * 0.45 : -0.05 + Math.random() * 0.15,
        vx: 0.1 + Math.random() * 0.3,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.004 + Math.random() * 0.01,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.02,
        c: petal ? colors[(Math.random() * colors.length) | 0] : 'rgba(217,169,91,' + (0.25 + Math.random() * 0.4).toFixed(2) + ')',
        tw: Math.random() * Math.PI * 2
      };
    }
    function init() {
      size();
      var count = Math.round(Math.min(46, Math.max(18, W / 32)));
      parts = []; for (var i = 0; i < count; i++) parts.push(make(true));
    }
    function draw(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.petal) {
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.shadowColor = 'rgba(90,70,50,0.12)'; ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(0, -p.r);
        ctx.bezierCurveTo(p.r * 0.9, -p.r * 0.6, p.r * 0.7, p.r * 0.7, 0, p.r);
        ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.7, -p.r * 0.9, -p.r * 0.6, 0, -p.r);
        ctx.fill();
      } else {
        var a = 0.55 + 0.45 * Math.sin(p.tw);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.sway += p.swaySpeed; p.tw += 0.03;
        p.x += p.vx + Math.sin(p.sway) * 0.4;
        p.y += p.vy + (p.petal ? 0 : Math.cos(p.sway) * 0.1);
        p.rot += p.vr;
        if (p.y > H + 20 || p.x > W + 20 || p.y < -30) { parts[i] = make(false); parts[i].x = Math.random() * W * 0.9 - W * 0.1; if (!p.petal) parts[i].y = Math.random() * H; }
        draw(p);
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!running && !reduce() && heroVisible && !document.hidden) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function staticDraw() { ctx.clearRect(0, 0, W, H); parts.forEach(draw); }
    init();
    if (reduce()) staticDraw(); else start();
    window.addEventListener('resize', function () { init(); if (reduce()) staticDraw(); });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; heroVisible ? start() : stop(); }).observe(canvas);
    }
    mq.addEventListener && mq.addEventListener('change', function () { if (reduce()) { stop(); staticDraw(); } else start(); });
  }

  /* ---------- Gentle parallax on the family photo ---------- */
  var famImg = document.getElementById('family-photo');
  if (famImg) {
    var ticking = false;
    function parallax() {
      ticking = false;
      if (reduce()) { famImg.style.transform = ''; return; }
      var r = famImg.parentElement.getBoundingClientRect();
      var vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var progress = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1..1
      famImg.style.transform = 'translate3d(0,' + (progress * -28).toFixed(1) + 'px,0) scale(1.08)';
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
    parallax();
  }

  /* ---------- Soft tilt on product cards (fine pointers only) ---------- */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  window.FF_attachTilt = function (card) {
    if (!fine.matches) return;
    card.addEventListener('pointermove', function (e) {
      if (reduce()) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', (y * -5).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
      card.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(0) + '%');
      card.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(0) + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
    });
  };

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();

/* Free Farmhouse · practice storefront logic.
   IMPORTANT: This is a demo. Nothing here makes network requests: no orders,
   payments, or messages are sent anywhere. Card details are never stored. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  var PRODUCTS = window.FF_PRODUCTS || [];
  var byId = {}; PRODUCTS.forEach(function (p) { byId[p.id] = p; });
  var STORAGE_KEY = 'freeFarmhouse.cart.v1';
  var DELIVERY_FEE_EXAMPLE = 5; // clearly labeled as an example fee in the UI
  var reduce = window.FF_REDUCED_MOTION || function () { return false; };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  var fmt = function (n) { return money.format(n); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };

  function mediaHTML(p, cls) {
    if (p.image) return '<img src="' + p.image + '" alt="' + esc(cls === 'thumb' ? '' : p.alt) + '" loading="lazy" width="480" height="600">';
    return p.art();
  }

  /* ================= Products ================= */
  var grid = $('#product-grid');
  grid.innerHTML = PRODUCTS.map(function (p, i) {
    var media = p.image
      ? '<div class="card-media">' + mediaHTML(p) + '</div>'
      : '<div class="card-media card-media--art">' + p.art() + '<span class="art-tag">Illustration · photo coming soon</span></div>';
    return '' +
      '<li data-category="' + p.category + '" class="reveal" style="--delay:' + ((i % 4) * 0.08).toFixed(2) + 's">' +
      '<article class="card tone-' + p.tone + '" data-id="' + p.id + '" aria-labelledby="t-' + p.id + '">' +
      '<span class="card-cat">' + esc(p.categoryLabel) + '</span>' + media +
      '<div class="card-body">' +
      '<h3 class="card-title" id="t-' + p.id + '">' + esc(p.name) + '</h3>' +
      '<div class="card-meta"><span class="card-size">' + esc(p.size) + '</span><span class="card-price">' + fmt(p.price).replace('.00', '') + '</span></div>' +
      '<p class="card-desc">' + esc(p.description) + '</p>' +
      '<div class="card-actions">' +
      '<div class="qty" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
      '<button type="button" data-step="-1" aria-label="Decrease quantity">&minus;</button>' +
      '<input type="number" min="1" max="20" value="1" aria-label="Quantity" inputmode="numeric">' +
      '<button type="button" data-step="1" aria-label="Increase quantity">+</button>' +
      '</div>' +
      '<button class="btn btn--primary add-btn" type="button" data-add="' + p.id + '">' +
      '<span class="add-label">Add to Cart</span>' +
      '<span class="added-label" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>Added</span>' +
      '</button>' +
      '</div></div></article></li>';
  }).join('');
  $$('li.reveal', grid).forEach(function (li) { window.FF_observeReveal && window.FF_observeReveal(li); });
  $$('.card', grid).forEach(function (c) { window.FF_attachTilt && window.FF_attachTilt(c); });

  function clampQty(v) { v = parseInt(v, 10); if (isNaN(v) || v < 1) v = 1; if (v > 20) v = 20; return v; }

  grid.addEventListener('click', function (e) {
    var step = e.target.closest('[data-step]');
    if (step) {
      var input = step.parentElement.querySelector('input');
      input.value = clampQty(+input.value + +step.dataset.step);
      return;
    }
    var add = e.target.closest('[data-add]');
    if (add) {
      var card = add.closest('.card');
      var q = clampQty(card.querySelector('.qty input').value);
      addToCart(add.dataset.add, q, card.querySelector('.card-media'));
      card.querySelector('.qty input').value = 1;
      add.classList.add('is-added');
      clearTimeout(add._t); add._t = setTimeout(function () { add.classList.remove('is-added'); }, 1600);
    }
  });
  grid.addEventListener('change', function (e) { if (e.target.matches('.qty input')) e.target.value = clampQty(e.target.value); });

  // quick add buttons (spotlight)
  $$('[data-quick-add]').forEach(function (b) {
    b.addEventListener('click', function () {
      var src = $('.spotlight-photo');
      addToCart(b.dataset.quickAdd, 1, src);
    });
  });

  /* ---------- Filters ---------- */
  var filters = $$('.filter');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      filters.forEach(function (x) { x.classList.toggle('is-active', x === f); x.setAttribute('aria-selected', x === f ? 'true' : 'false'); });
      var cat = f.dataset.filter;
      $$('#product-grid > li').forEach(function (li) {
        var show = cat === 'all' || li.dataset.category === cat;
        li.hidden = !show;
        if (show && !reduce()) { li.classList.remove('is-visible'); void li.offsetWidth; li.classList.add('is-visible'); }
      });
    });
  });
  // arrow-key navigation between tabs
  $('.filters').addEventListener('keydown', function (e) {
    var i = filters.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      var n = filters[(i + (e.key === 'ArrowRight' ? 1 : -1) + filters.length) % filters.length];
      n.focus(); n.click();
    }
  });

  /* ================= Cart ================= */
  var cart = loadCart();
  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw.filter(function (l) { return byId[l.id] && l.qty > 0; }).map(function (l) { return { id: l.id, qty: clampQty(l.qty) }; }) : [];
    } catch (err) { return []; }
  }
  function saveCart() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (err) { /* storage unavailable: cart still works in memory */ } }
  function count() { return cart.reduce(function (s, l) { return s + l.qty; }, 0); }
  function subtotal() { return cart.reduce(function (s, l) { return s + byId[l.id].price * l.qty; }, 0); }

  function addToCart(id, qty, sourceEl) {
    var line = cart.find(function (l) { return l.id === id; });
    if (line) line.qty = Math.min(line.qty + qty, 20); else cart.push({ id: id, qty: qty });
    saveCart();
    flyToCart(byId[id], sourceEl, function () { renderCart(); bumpCart(); });
    toast('Added ' + qty + ' × ' + byId[id].name + ' to your basket');
  }
  function setQty(id, qty) {
    var line = cart.find(function (l) { return l.id === id; });
    if (!line) return;
    if (qty < 1) { removeLine(id); return; }
    line.qty = clampQty(qty); saveCart(); renderCart();
  }
  function removeLine(id) {
    var li = $('#cart-list [data-line="' + id + '"]');
    var done = function () { cart = cart.filter(function (l) { return l.id !== id; }); saveCart(); renderCart(); };
    if (li && !reduce()) { li.classList.add('is-removing'); setTimeout(done, 320); } else done();
  }

  var countEl = $('#cart-count'), cartBtn = $('#cart-open');
  function renderCart() {
    var c = count();
    countEl.textContent = c;
    countEl.classList.toggle('is-empty', c === 0);
    cartBtn.querySelector('.visually-hidden').textContent = 'Open cart,';
    var list = $('#cart-list');
    list.innerHTML = cart.map(function (l) {
      var p = byId[l.id];
      return '<li class="cart-item" data-line="' + p.id + '">' +
        '<div class="cart-thumb">' + mediaHTML(p, 'thumb') + '</div>' +
        '<div class="cart-info"><h3>' + esc(p.name) + '</h3><span class="small">' + esc(p.size) + ' · ' + fmt(p.price) + ' each</span>' +
        '<div class="cart-row"><div class="qty" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
        '<button type="button" data-cart-step="-1" aria-label="Decrease quantity of ' + esc(p.name) + '">&minus;</button>' +
        '<input type="number" min="1" max="20" value="' + l.qty + '" aria-label="Quantity of ' + esc(p.name) + '" data-cart-qty>' +
        '<button type="button" data-cart-step="1" aria-label="Increase quantity of ' + esc(p.name) + '">+</button></div>' +
        '<span class="cart-line">' + fmt(p.price * l.qty) + '</span></div>' +
        '<button class="remove-btn" type="button" data-remove aria-label="Remove ' + esc(p.name) + ' from basket">Remove</button>' +
        '</div></li>';
    }).join('');
    $('#cart-empty').hidden = cart.length > 0;
    $('#cart-foot').hidden = cart.length === 0;
    $('#cart-subtotal').textContent = fmt(subtotal());
    if ($('#checkout').open) renderSummary();
  }
  $('#cart-list').addEventListener('click', function (e) {
    var li = e.target.closest('[data-line]'); if (!li) return;
    var id = li.dataset.line, line = cart.find(function (l) { return l.id === id; });
    var st = e.target.closest('[data-cart-step]');
    if (st) { setQty(id, line.qty + +st.dataset.cartStep); var again = $('#cart-list [data-line="' + id + '"] [data-cart-step="' + st.dataset.cartStep + '"]'); again && again.focus(); }
    if (e.target.closest('[data-remove]')) removeLine(id);
  });
  $('#cart-list').addEventListener('change', function (e) {
    if (!e.target.matches('[data-cart-qty]')) return;
    var id = e.target.closest('[data-line]').dataset.line;
    var v = parseInt(e.target.value, 10);
    setQty(id, isNaN(v) ? 1 : v);
  });

  function bumpCart() {
    if (reduce()) return;
    cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump');
  }
  function flyToCart(p, fromEl, done) {
    if (reduce() || !fromEl || !cartBtn.animate) { done(); return; }
    var a = fromEl.getBoundingClientRect(), b = cartBtn.getBoundingClientRect();
    if (a.bottom < 0 || a.top > innerHeight) { done(); return; }
    var size = 84;
    var ghost = document.createElement('div');
    ghost.className = 'fly-ghost'; ghost.setAttribute('aria-hidden', 'true');
    ghost.innerHTML = mediaHTML(p, 'thumb');
    ghost.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (a.left + a.width / 2 - size / 2) + 'px;top:' + (a.top + a.height / 2 - size / 2) + 'px';
    document.body.appendChild(ghost);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    var anim = ghost.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx * 0.45 + 'px,' + (dy * 0.45 - 90) + 'px) scale(.75) rotate(-8deg)', opacity: 1, offset: .55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.18) rotate(10deg)', opacity: .4 }
    ], { duration: 820, easing: 'cubic-bezier(.5,0,.3,1)' });
    anim.onfinish = function () { ghost.remove(); done(); };
  }

  /* ================= Dialog helpers ================= */
  var lastFocus = {};
  function openDialog(d) {
    if (d.open) return;
    lastFocus[d.id] = document.activeElement;
    d.showModal();
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('is-open'); }); });
  }
  function closeDialog(d, cb) {
    if (!d.open) { cb && cb(); return; }
    d.classList.remove('is-open');
    var finish = function () {
      d.close();
      if (!$$('dialog[open]').length) document.body.classList.remove('is-locked');
      var lf = lastFocus[d.id]; if (lf && lf.focus && !cb) lf.focus();
      cb && cb();
    };
    reduce() ? finish() : setTimeout(finish, 380);
  }
  $$('dialog').forEach(function (d) {
    d.addEventListener('cancel', function (e) { e.preventDefault(); closeDialog(d); });
    d.addEventListener('click', function (e) {
      if (e.target === d) closeDialog(d); // backdrop click
      var c = e.target.closest('[data-close]');
      if (c) {
        var href = c.getAttribute('href');
        if (href && href.charAt(0) === '#') { e.preventDefault(); closeDialog(d, function () { document.querySelector(href).scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' }); }); }
        else closeDialog(d);
      }
    });
  });

  var drawer = $('#cart-drawer'), checkout = $('#checkout');
  cartBtn.addEventListener('click', function () { renderCart(); openDialog(drawer); });
  $('#price-list-open').addEventListener('click', function () { openDialog($('#price-list')); });

  /* ================= Checkout ================= */
  var form = $('#checkout-form');
  $('#checkout-open').addEventListener('click', function () {
    if (!cart.length) return;
    closeDialog(drawer, function () {
      resetCheckoutView();
      renderSummary();
      openDialog(checkout);
      setTimeout(function () { $('#co-name').focus(); }, 60);
    });
  });
  $('#edit-cart').addEventListener('click', function () { closeDialog(checkout, function () { openDialog(drawer); }); });

  function fulfillment() { return (form.querySelector('input[name="fulfillment"]:checked') || {}).value || 'pickup'; }
  function payment() { return (form.querySelector('input[name="payment"]:checked') || {}).value; }
  var FUL = {
    pickup: { label: 'Local pickup (Tallapoosa)', fee: 0, feeText: 'Free', note: "We'll reach out to arrange a pickup time in Tallapoosa. Exact pickup details are shared after you order." },
    delivery: { label: 'Local delivery', fee: DELIVERY_FEE_EXAMPLE, feeText: fmt(DELIVERY_FEE_EXAMPLE) + ' (example)', note: 'Local delivery around the Tallapoosa / Haralson County area. The $5.00 fee is an example value for this practice site.' },
    shipping: { label: 'Shipping', fee: 0, feeText: 'Calculated later', note: "Shipping cost isn't calculated on this practice site; it would be confirmed with you before anything ships." }
  };
  var PAY = {
    card: 'Credit / Debit Card', paypal: 'PayPal', applepay: 'Apple Pay', googlepay: 'Google Pay', venmo: 'Venmo', cashapp: 'Cash App', cash: 'Cash on Pickup'
  };
  var PAY_TEXT = {
    paypal: "On a live site you'd be handed off to PayPal to finish paying. Here, nothing happens and no account is contacted.",
    applepay: "On a live site, Apple Pay would open on supported devices. Here, it's a demo button only.",
    googlepay: "On a live site, Google Pay would open in your browser. Here, it's a demo button only.",
    venmo: "On a live site, we'd share how to send payment with Venmo after confirming your order. Nothing is requested here.",
    cashapp: "On a live site, we'd share how to send payment with Cash App after confirming your order. Nothing is requested here.",
    cash: 'Pay with cash when you pick up your order in Tallapoosa. Nothing is due now.'
  };

  function total() { return subtotal() + FUL[fulfillment()].fee; }
  function summaryItems() {
    return cart.map(function (l) {
      var p = byId[l.id];
      return '<li><div class="summary-thumb">' + mediaHTML(p, 'thumb') + '<span class="q">' + l.qty + '</span></div>' +
        '<span class="nm">' + esc(p.name) + '<small>' + esc(p.size) + ' · ' + l.qty + ' × ' + fmt(p.price) + '</small></span>' +
        '<span class="pr">' + fmt(p.price * l.qty) + '</span></li>';
    }).join('');
  }
  function renderSummary() {
    var f = FUL[fulfillment()];
    $('#summary-list').innerHTML = summaryItems();
    $('#sum-subtotal').textContent = fmt(subtotal());
    $('#sum-ful-label').textContent = f.label;
    $('#sum-ful').textContent = f.feeText;
    $('#sum-total').textContent = fmt(total()) + (fulfillment() === 'shipping' ? ' + shipping' : '');
    $('#place-total').textContent = fmt(total());
    $('#sum-note').textContent = fulfillment() === 'delivery' ? 'Delivery fee shown is an example value.' : '';
  }
  function syncFulfillment() {
    var f = fulfillment();
    $('#fulfillment-note').textContent = FUL[f].note;
    var needsAddr = f !== 'pickup';
    $('#address-fields').hidden = !needsAddr;
    $$('#address-fields input').forEach(function (i) { i.required = needsAddr; });
    var cash = form.querySelector('input[value="cash"]');
    cash.disabled = f !== 'pickup';
    $('#cash-choice').title = f !== 'pickup' ? 'Cash is only available with local pickup' : '';
    if (cash.disabled && cash.checked) { form.querySelector('input[value="card"]').checked = true; syncPayment(); }
    renderSummary();
  }
  function syncPayment() {
    var p = payment();
    $('#pay-panel-card').hidden = p !== 'card';
    $('#pay-panel-other').hidden = p === 'card' || !p;
    if (p && p !== 'card') $('#pay-other-text').textContent = PAY_TEXT[p];
    $('#pay-error').hidden = true;
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'fulfillment') syncFulfillment();
    if (e.target.name === 'payment') syncPayment();
    if (e.target.id === 'co-notes-toggle') $('#notes-field').hidden = !e.target.checked;
  });

  // light input formatting for the demo card fields (never stored or sent)
  $('#cc-number').addEventListener('input', function (e) {
    var d = e.target.value.replace(/\D/g, '').slice(0, 19);
    e.target.value = d.replace(/(.{4})/g, '$1 ').trim();
  });
  $('#cc-exp').addEventListener('input', function (e) {
    var d = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  });
  $('#cc-cvc').addEventListener('input', function (e) { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });

  function setError(input, msg) {
    var err = input.parentElement.querySelector('.field-error');
    if (!err) return;
    if (!err.id) err.id = input.id + '-err';
    if (msg) {
      input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', err.id);
      err.textContent = msg; err.hidden = false;
    } else {
      input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby');
      err.textContent = ''; err.hidden = true;
    }
  }
  function luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var n = +num[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function validateCheckout() {
    var bad = [];
    function check(id, fn) { var el = $('#' + id); var msg = fn(el.value.trim()); setError(el, msg); if (msg) bad.push(el); }
    check('co-name', function (v) { return v.length < 2 ? 'Please enter your name.' : ''; });
    check('co-phone', function (v) { return v.replace(/\D/g, '').length < 10 ? 'Please enter a 10-digit phone number.' : ''; });
    check('co-email', function (v) { return !EMAIL_RE.test(v) ? 'Please enter a valid email address.' : ''; });
    if (fulfillment() !== 'pickup') {
      check('co-street', function (v) { return v.length < 4 ? 'Please enter a street address.' : ''; });
      check('co-city', function (v) { return v.length < 2 ? 'City is required.' : ''; });
      check('co-state', function (v) { return !/^[A-Za-z]{2}$/.test(v) ? 'Use a 2-letter state.' : ''; });
      check('co-zip', function (v) { return !/^\d{5}(-\d{4})?$/.test(v) ? 'Enter a 5-digit ZIP.' : ''; });
    } else {
      ['co-street', 'co-city', 'co-state', 'co-zip'].forEach(function (id) { setError($('#' + id), ''); });
    }
    var p = payment();
    if (!p) { $('#pay-error').textContent = 'Please choose a payment method.'; $('#pay-error').hidden = false; bad.push(form.querySelector('input[name="payment"]')); }
    if (p === 'card') {
      check('cc-name', function (v) { return v.length < 2 ? 'Enter the name on the card.' : ''; });
      check('cc-number', function (v) { var d = v.replace(/\D/g, ''); return d.length < 13 || !luhn(d) ? "That card number doesn't look right. (Demo tip: 4242 4242 4242 4242)" : ''; });
      check('cc-exp', function (v) {
        var m = /^(\d{2})\/(\d{2})$/.exec(v); if (!m) return 'Use MM/YY.';
        var mm = +m[1], yy = 2000 + +m[2]; if (mm < 1 || mm > 12) return 'Month should be 01–12.';
        var now = new Date(); if (yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1)) return 'This card looks expired.';
        return '';
      });
      check('cc-cvc', function (v) { return !/^\d{3,4}$/.test(v) ? 'Enter the 3–4 digit code.' : ''; });
    } else {
      ['cc-name', 'cc-number', 'cc-exp', 'cc-cvc'].forEach(function (id) { setError($('#' + id), ''); });
    }
    if (!cart.length) bad.push($('#edit-cart'));
    return bad;
  }
  form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target, ''); });

  function orderNumber() {
    var a = new Uint32Array(1); (window.crypto || window.msCrypto).getRandomValues(a);
    var d = new Date();
    return 'FF-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + String(a[0] % 10000).padStart(4, '0');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // never submits anywhere
    var bad = validateCheckout();
    if (bad.length) {
      bad[0].focus();
      toast('Please check the highlighted fields.');
      return;
    }
    var f = fulfillment(), p = payment();
    var order = {
      number: orderNumber(),
      items: summaryItems(),
      subtotal: subtotal(),
      ful: FUL[f], fulKey: f,
      total: total(),
      pay: PAY[p],
      name: $('#co-name').value.trim(),
      email: $('#co-email').value.trim()
    };
    // Wipe demo card fields immediately: they are never stored or transmitted.
    ['cc-name', 'cc-number', 'cc-exp', 'cc-cvc'].forEach(function (id) { $('#' + id).value = ''; });
    showConfirmation(order);
    cart = []; saveCart(); renderCart();
  });

  function showConfirmation(o) {
    $('#checkout-main').hidden = true;
    $('.demo-banner', checkout).hidden = true;
    $('#checkout-title').textContent = 'Order confirmed';
    $('#confirm-number').textContent = '#' + o.number;
    var first = o.name.split(/\s+/)[0];
    $('#confirm-lede').textContent = 'Thank you, ' + first + '! A confirmation would be sent to ' + o.email + ' on the live site. ' +
      (o.fulKey === 'pickup' ? "We'd reach out to set up your pickup in Tallapoosa." : o.fulKey === 'delivery' ? "We'd reach out to schedule your local delivery." : "We'd confirm shipping costs with you before anything ships.");
    $('#confirm-list').innerHTML = o.items;
    $('#confirm-totals').innerHTML =
      '<div><dt>Subtotal</dt><dd>' + fmt(o.subtotal) + '</dd></div>' +
      '<div><dt>' + esc(o.ful.label) + '</dt><dd>' + esc(o.ful.feeText) + '</dd></div>' +
      '<div><dt>Sales tax</dt><dd>Not calculated (demo)</dd></div>' +
      '<div class="total"><dt>Total</dt><dd>' + fmt(o.total) + (o.fulKey === 'shipping' ? ' + shipping' : '') + '</dd></div>';
    $('#confirm-meta').innerHTML =
      '<div><dt>Fulfillment</dt><dd>' + esc(o.ful.label) + '</dd></div>' +
      '<div><dt>Payment method</dt><dd>' + esc(o.pay) + ' (demo, not charged)</dd></div>';
    var conf = $('#confirmation');
    conf.hidden = false;
    checkout.querySelector('.modal-panel').scrollTop = 0; checkout.scrollTop = 0;
    conf.focus({ preventScroll: true });
    checkout.scrollTop = 0;
    petalBurst();
  }
  function resetCheckoutView() {
    $('#checkout-main').hidden = false;
    $('.demo-banner', checkout).hidden = false;
    $('#confirmation').hidden = true;
    $('#checkout-title').textContent = 'Checkout';
    syncFulfillment(); syncPayment();
  }
  $('#confirm-done').addEventListener('click', function () {
    closeDialog(checkout, function () { resetCheckoutView(); form.reset(); syncFulfillment(); syncPayment(); $('#notes-field').hidden = true; $('#shop').scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' }); });
  });

  function petalBurst() {
    if (reduce() || !document.body.animate) return;
    var colors = ['#c3b4d4', '#9db096', '#d8a752', '#f6efe2', '#7a8a45', '#ece5f2'];
    var cx = innerWidth / 2, cy = innerHeight * 0.32;
    for (var i = 0; i < 46; i++) {
      var el = document.createElement('span');
      el.className = 'petal-burst'; el.setAttribute('aria-hidden', 'true');
      el.style.left = cx + 'px'; el.style.top = cy + 'px'; el.style.background = colors[i % colors.length];
      checkout.appendChild(el);
      var ang = Math.random() * Math.PI * 2, dist = 120 + Math.random() * 320;
      var tx = Math.cos(ang) * dist, ty = Math.sin(ang) * dist * 0.6 + 260 + Math.random() * 200;
      el.animate([
        { transform: 'translate(0,0) rotate(0) scale(.4)', opacity: 0 },
        { transform: 'translate(' + tx * .5 + 'px,' + (Math.sin(ang) * dist * .5 - 80) + 'px) rotate(' + (180 * Math.random()) + 'deg) scale(1)', opacity: 1, offset: .3 },
        { transform: 'translate(' + tx + 'px,' + ty + 'px) rotate(' + (540 * Math.random()) + 'deg) scale(.8)', opacity: 0 }
      ], { duration: 2200 + Math.random() * 1200, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = (function (n) { return function () { n.remove(); }; })(el);
    }
  }

  /* ================= Contact (demo only) ================= */
  var cform = $('#contact-form');
  cform.addEventListener('submit', function (e) {
    e.preventDefault(); // nothing is sent anywhere
    var bad = [];
    function check(id, fn) { var el = $('#' + id); var msg = fn(el.value.trim()); setError(el, msg); if (msg) bad.push(el); }
    check('c-name', function (v) { return v.length < 2 ? 'Please enter your name.' : ''; });
    check('c-email', function (v) { return !EMAIL_RE.test(v) ? 'Please enter a valid email address.' : ''; });
    check('c-msg', function (v) { return v.length < 5 ? 'Please write a short message.' : ''; });
    if (bad.length) { bad[0].focus(); return; }
    $('#contact-success-name').textContent = ', ' + $('#c-name').value.trim().split(/\s+/)[0];
    cform.hidden = true;
    var s = $('#contact-success'); s.hidden = false; s.focus();
  });
  cform.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target, ''); });
  $('#contact-reset').addEventListener('click', function () { cform.reset(); cform.hidden = false; $('#contact-success').hidden = true; $('#c-name').focus(); });

  /* ================= Nav ================= */
  var toggle = $('#menu-toggle'), nav = $('#site-nav');
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open);
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { toggle.click(); toggle.focus(); } });
  // current-section highlight
  if ('IntersectionObserver' in window) {
    var links = $$('a', nav);
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) links.forEach(function (l) { var on = l.getAttribute('href') === '#' + x.target.id; l.classList.toggle('is-current', on); on ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['shop', 'family', 'values', 'contact'].forEach(function (id) { so.observe(document.getElementById(id)); });
  }

  /* ================= Little delights ================= */
  // Scripture fades in word by word
  $$('.verse blockquote p').forEach(function (p) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = w; frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          n.classList.add('w'); n.style.setProperty('--i', i++);
        }
      });
    })(p);
  });
  // Warm sun glow follows the pointer in the hero
  var hero = $('.hero');
  if (window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      if (reduce()) return;
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  /* ---------- Toasts ---------- */
  function toast(msg) {
    var region = $('#toasts');
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21s-7-4.6-7-10.2C5 7.6 7.4 5.5 10 5.5c1 0 1.6.4 2 .9.4-.5 1-.9 2-.9 2.6 0 5 2.1 5 5.3C19 16.4 12 21 12 21Z" fill="currentColor"/></svg><span></span>';
    t.querySelector('span').textContent = msg;
    region.appendChild(t);
    while (region.children.length > 2) region.firstChild.remove();
    setTimeout(function () { t.classList.add('is-leaving'); setTimeout(function () { t.remove(); }, 400); }, 2600);
  }

  $('#year').textContent = new Date().getFullYear();
  syncFulfillment(); syncPayment();
  renderCart();
})();

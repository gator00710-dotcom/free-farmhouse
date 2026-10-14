/* Free Farmhouse product catalog.
   Names, sizes, and prices are taken verbatim from the client's printed price list.
   Descriptions are intentionally generic (no ingredient lists or health claims). */
(function () {
  'use strict';

  // Label-style illustrations for products that don't have a real photo yet.
  // These are drawings, not photos, and are marked "Illustration" on the card.
  function labelArt(opts) {
    var o = Object.assign({ top: 'BREATHE', script: 'easy', sub: 'ALL NATURAL', size: '4 oz', kind: 'jar', accent: '#8fa58a' }, opts);
    var uid = 'a' + Math.random().toString(36).slice(2, 8);
    var vessel;
    if (o.kind === 'jar') {
      vessel =
        '<ellipse cx="200" cy="402" rx="112" ry="12" fill="#3a3129" opacity=".14"/>' +
        '<rect x="96" y="150" width="208" height="250" rx="34" fill="url(#amb' + uid + ')"/>' +
        '<rect x="104" y="160" width="20" height="226" rx="10" fill="#fff" opacity=".12"/>' +
        '<rect x="90" y="104" width="220" height="62" rx="12" fill="#1f1b18"/>' +
        '<rect x="90" y="104" width="220" height="14" rx="7" fill="#fff" opacity=".08"/>' +
        '<g opacity=".18" stroke="#fff">' + Array.from({ length: 20 }, function (_, i) { return '<path d="M' + (100 + i * 10.5) + ' 110v50"/>'; }).join('') + '</g>' +
        '<rect x="114" y="200" width="172" height="164" rx="6" fill="#f6efe2"/>';
    } else {
      vessel =
        '<ellipse cx="200" cy="404" rx="86" ry="11" fill="#3a3129" opacity=".14"/>' +
        '<path d="M166 92h68v34c0 8 6 12 14 18 22 16 38 30 38 62v180c0 16-12 22-26 22H142c-14 0-26-6-26-22V206c0-32 16-46 38-62 8-6 12-10 12-18Z" fill="url(#amb' + uid + ')"/>' +
        '<rect x="126" y="196" width="16" height="190" rx="8" fill="#fff" opacity=".12"/>' +
        '<rect x="158" y="56" width="84" height="48" rx="8" fill="#1f1b18"/>' +
        '<g opacity=".2" stroke="#fff">' + Array.from({ length: 10 }, function (_, i) { return '<path d="M' + (164 + i * 8) + ' 60v40"/>'; }).join('') + '</g>' +
        '<rect x="124" y="214" width="152" height="156" rx="6" fill="#f6efe2"/>';
    }
    var cy = o.kind === 'jar' ? 0 : 6; // vertical label offset
    var cx = 200;
    return '' +
      '<svg class="label-art" viewBox="0 0 400 440" role="img" aria-label="Illustration of ' + o.alt + '">' +
      '<defs>' +
      '<linearGradient id="amb' + uid + '" x1="0" x2="1"><stop offset="0" stop-color="#4a2a12"/><stop offset=".45" stop-color="#7a4a20"/><stop offset="1" stop-color="#3b200d"/></linearGradient>' +
      '</defs>' +
      vessel +
      '<g font-family="Cormorant Garamond, Georgia, serif" text-anchor="middle" fill="#3a3129">' +
      // tiny house seal
      '<circle cx="' + cx + '" cy="' + (232 + cy) + '" r="17" fill="none" stroke="#3a3129" stroke-width="1.2"/>' +
      '<path d="M' + (cx - 9) + ' ' + (236 + cy) + 'h18v-6l-9-6-9 6Z" fill="none" stroke="#3a3129" stroke-width="1.1"/>' +
      '<text x="' + cx + '" y="' + (280 + cy) + '" font-size="25" font-weight="700" letter-spacing="7">' + o.top + '</text>' +
      '<text x="' + cx + '" y="' + (316 + cy) + '" font-size="34" font-family="Parisienne, cursive" fill="' + o.accent + '">' + o.script + '</text>' +
      '<text x="' + cx + '" y="' + (338 + cy) + '" font-size="11" font-family="Mulish, Arial, sans-serif" letter-spacing="2.5" font-weight="700">' + o.sub + '</text>' +
      '<text x="' + cx + '" y="' + (356 + cy) + '" font-size="11" font-family="Mulish, Arial, sans-serif" letter-spacing="1.5" fill="#6b5e51">' + o.size + '</text>' +
      '</g>' +
      // original olive sprigs framing the label art
      oliveCorner(48, 70, 1) + oliveCorner(352, 70, -1) +
      '</svg>';
  }

  function oliveCorner(x, y, dir) {
    var g = '<g transform="translate(' + x + ' ' + y + ') scale(' + dir + ' 1)">' +
      '<path d="M0 0 C 18 6, 34 22, 46 48" fill="none" stroke="#56622c" stroke-width="1.6" stroke-linecap="round"/>';
    var pts = [[8, 2, 20], [16, 8, -30], [24, 14, 45], [31, 22, -10], [37, 31, 65], [42, 40, 20]];
    pts.forEach(function (q, i) {
      g += '<path d="M0 0 C 5 -3.4, 13 -3, 17 0 C 13 3, 5 3.4, 0 0Z" fill="' + (i % 3 === 1 ? '#a3b06a' : '#7a8a45') + '" transform="translate(' + q[0] + ' ' + q[1] + ') rotate(' + q[2] + ')"/>';
    });
    g += '<ellipse cx="21" cy="21" rx="3.6" ry="4.6" fill="#6e7a35"/><ellipse cx="27" cy="27" rx="3.2" ry="4" fill="#4b4a2a"/>';
    return g + '</g>';
  }

  window.FF_PRODUCTS = [
    {
      id: 'pure-skin-makeup-remover',
      name: 'Pure Skin Makeup Remover',
      size: '4 oz',
      price: 12,
      category: 'skin',
      categoryLabel: 'Skin Care',
      tone: 'cream',
      image: 'images/product-pure-skin.jpg',
      alt: 'Stacked jars of Pure Skin makeup remover with cream labels and black lids on a pine shelf.',
      description: 'An all-natural makeup remover for your evening routine, in a 4 oz jar.'
    },
    {
      id: 'sleepy-time-linen-spray',
      name: 'Sleepy Time Linen Spray',
      size: '4 oz',
      price: 8,
      category: 'home',
      categoryLabel: 'Home & Linen',
      tone: 'lavender',
      image: 'images/product-sleepy-time-linen.jpg',
      alt: 'Amber Sleepy Time linen spray bottles with lavender-colored labels on a pine shelf.',
      description: 'A soft mist for pillows and linens, made for slow, restful evenings.'
    },
    {
      id: 'purely-clean-linen-spray',
      name: 'Purely Clean Linen Spray',
      size: '4 oz',
      price: 8,
      category: 'home',
      categoryLabel: 'Home & Linen',
      tone: 'sage',
      image: 'images/product-purely-clean-linen.jpg',
      alt: 'Amber Purely Clean linen spray bottles with sage green labels on a pine shelf.',
      description: 'A light, fresh mist for sheets, towels, and everyday linens.'
    },
    {
      id: 'purely-clean-all-purpose',
      name: 'Purely Clean All Purpose Spray',
      size: '16 oz',
      price: 12,
      category: 'home',
      categoryLabel: 'Home & Linen',
      tone: 'sage',
      image: 'images/product-purely-clean-all-purpose.jpg',
      alt: 'Large amber Purely Clean all purpose spray bottles with sage labels and black trigger sprayers.',
      description: 'An all-natural, all-purpose spray for everyday cleaning around the house.'
    },
    {
      id: 'lemon-drop-all-purpose',
      name: 'Lemon Drop All Purpose Spray',
      size: '16 oz',
      price: 12,
      category: 'home',
      categoryLabel: 'Home & Linen',
      tone: 'honey',
      image: 'images/product-lemon-drop.jpg',
      alt: 'Large amber Lemon Drop all purpose spray bottles with sunny yellow labels and black trigger sprayers.',
      description: 'A cheerful all-natural, all-purpose spray for counters and everyday surfaces.'
    },
    {
      id: 'sweet-cream-soap',
      name: 'Sweet Cream Foam Hand Soap',
      size: '8 oz',
      price: 20,
      category: 'soap',
      categoryLabel: 'Hand Soap',
      tone: 'honey',
      image: 'images/product-sweet-cream.jpg',
      alt: 'An amber glass foaming pump bottle of Sweet Cream all natural hand soap, 8 oz, held in a hand.',
      description: 'All-natural foaming hand soap in an amber glass pump bottle.'
    },
    {
      id: 'sweet-cream-refill',
      name: 'Sweet Cream Foam Hand Soap Refill',
      size: '8 oz',
      price: 10,
      category: 'soap',
      categoryLabel: 'Hand Soap',
      tone: 'cream',
      art: function () { return labelArt({ top: 'SWEET', script: 'cream', sub: 'HAND SOAP REFILL', size: '8 OZ', kind: 'bottle', accent: '#a8742a', alt: 'a Sweet Cream hand soap refill bottle' }); },
      description: 'Refill your Sweet Cream pump bottle and keep the glass in use.'
    },
    {
      id: 'breathe-easy-chest-rub',
      name: 'Breathe Easy Chest Rub',
      size: '4 oz',
      price: 10,
      category: 'skin',
      categoryLabel: 'Skin Care',
      tone: 'sage',
      art: function () { return labelArt({ top: 'BREATHE', script: 'easy', sub: 'CHEST RUB', size: '4 OZ', kind: 'jar', accent: '#6f8a6b', alt: 'a Breathe Easy Chest Rub jar' }); },
      description: 'An all-natural chest rub, a cozy addition to quiet evenings at home.'
    }
  ];
})();

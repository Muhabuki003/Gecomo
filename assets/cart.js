/* ==========================================================================
   GECOMO — shared cart engine
   One persistent cart across every page (shop, product pages, tracking).
   - Cart is stored in localStorage so it survives navigation between pages.
   - Checkout builds a native Shopify cart permalink (variantId:qty,...), so
     it works with pinned variant IDs even if the live Storefront fetch fails.

   Product pages add items with:
     GecomoCart.add({
       title:  'Waterproof Dual-Ended Eyebrow Pencil',
       image:  'https://.../pencil.jpg',
       meta:   '2 pencils · Dark Brown, Black',
       price:  47.99,                       // final line price shown in cart
       lines:  [ { variantId: '533..', qty: 1 }, { variantId: '533..', qty: 1 } ]
     });
   ========================================================================== */
(function(){
  "use strict";

  var SHOPIFY_DOMAIN = 'ehh05e-7q.myshopify.com';
  var STORAGE_KEY = 'gecomo_cart_v1';

  function load(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch(e){ return []; }
  }
  function save(cart){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch(e){}
  }
  function fmt(n){ return '$' + Number(n).toFixed(2); }

  var cart = load();

  // ---- Inject drawers + overlay once, at the end of <body> ----
  function injectMarkup(){
    if (document.getElementById('cartDrawer')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div id="overlay"></div>' +
      '<aside id="menuDrawer" aria-label="Menu">' +
        '<div class="menu-head"><a href="index.html" class="logo">GECOMO</a><button id="closeMenu" type="button" aria-label="Close menu">&times;</button></div>' +
        '<nav class="menu-links">' +
          '<a href="index.html#shop">Shop All</a>' +
          '<a href="stamp.html">Brow Stamp</a>' +
          '<a href="pencil.html">Brow Pencil</a>' +
          '<a href="bundle.html">Sets + Duos</a>' +
        '</nav>' +
        '<nav class="menu-sub">' +
          '<a href="track.html">Track Order</a>' +
          '<a href="stamp.html#faq">FAQ</a>' +
          '<a href="index.html#guarantee">60-Day Guarantee</a>' +
          '<a href="stamp.html#guide">Free Brow Playbook</a>' +
        '</nav>' +
      '</aside>' +
      '<aside id="cartDrawer">' +
        '<div class="cart-head"><h3>Your cart</h3><button id="closeCart" type="button">&times;</button></div>' +
        '<div id="cartItems"></div>' +
        '<div class="cart-foot">' +
          '<div class="cart-subtotal"><span>Subtotal</span><strong id="cartSubtotal">$0.00</strong></div>' +
          '<button id="checkoutBtn" class="btn btn-dark" type="button">Checkout</button>' +
          '<p id="checkoutNote" style="display:none;"></p>' +
        '</div>' +
      '</aside>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  }

  function els(){
    return {
      overlay: document.getElementById('overlay'),
      drawer: document.getElementById('cartDrawer'),
      items: document.getElementById('cartItems'),
      subtotal: document.getElementById('cartSubtotal'),
      note: document.getElementById('checkoutNote'),
      count: document.getElementById('cartCount')
    };
  }

  function updateCount(){
    var e = els();
    var qty = cart.reduce(function(s, c){
      return s + (c.lines || []).reduce(function(a, l){ return a + (l.qty || 1); }, 0);
    }, 0);
    if (e.count) e.count.textContent = qty;
  }

  function renderCart(){
    var e = els();
    if (!e.items) return;
    e.items.innerHTML = '';
    if (cart.length === 0){
      e.items.innerHTML = '<p class="cart-empty">Your cart is empty.<br><a href="index.html">Browse the shop &rarr;</a></p>';
    } else {
      cart.forEach(function(c){
        var row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML =
          '<img src="' + c.image + '" alt="' + c.title + '">' +
          '<div style="flex:1;">' +
            '<div style="font-weight:600;">' + c.title + '</div>' +
            '<div style="font-size:13px;color:var(--brown-dark);">' + (c.meta || '') + '</div>' +
            '<div style="font-size:15px;margin-top:4px;">' + fmt(c.price) + '</div>' +
          '</div>' +
          '<button class="rm" type="button" aria-label="Remove">&times;</button>';
        row.querySelector('.rm').addEventListener('click', function(){
          cart = cart.filter(function(x){ return x.id !== c.id; });
          save(cart); renderCart(); updateCount();
        });
        e.items.appendChild(row);
      });
    }
    var sub = cart.reduce(function(s, c){ return s + Number(c.price || 0); }, 0);
    if (e.subtotal) e.subtotal.textContent = fmt(sub);
  }

  function open(){
    var e = els();
    closeMenu();
    if (e.overlay) e.overlay.classList.add('show');
    if (e.drawer) e.drawer.classList.add('show');
  }
  function close(){
    var e = els();
    if (e.overlay) e.overlay.classList.remove('show');
    if (e.drawer) e.drawer.classList.remove('show');
    if (e.note) e.note.style.display = 'none';
  }

  // ---- Mobile menu drawer ----
  function openMenu(){
    close();
    var overlay = document.getElementById('overlay');
    var menu = document.getElementById('menuDrawer');
    if (overlay) overlay.classList.add('show');
    if (menu) menu.classList.add('show');
  }
  function closeMenu(){
    var menu = document.getElementById('menuDrawer');
    if (menu) menu.classList.remove('show');
  }
  function closeAll(){
    closeMenu();
    close();
  }

  function checkout(){
    var e = els();
    if (cart.length === 0) return;
    var counts = {};
    var ok = true;
    cart.forEach(function(c){
      (c.lines || []).forEach(function(l){
        var id = l.variantId ? String(l.variantId).split('/').pop() : null;
        if (!id){ ok = false; return; }
        counts[id] = (counts[id] || 0) + (l.qty || 1);
      });
    });
    var ids = Object.keys(counts);
    if (ok && ids.length > 0){
      var parts = ids.map(function(id){ return id + ':' + counts[id]; }).join(',');
      window.location.href = 'https://' + SHOPIFY_DOMAIN + '/cart/' + parts;
    } else if (e.note){
      e.note.textContent = 'Something went wrong building your checkout. Please refresh and try again.';
      e.note.style.display = 'block';
    }
  }

  // ---- Public API ----
  window.GecomoCart = {
    add: function(entry){
      entry.id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      cart.push(entry);
      save(cart);
      renderCart();
      updateCount();
      open();
    },
    open: open,
    close: close,
    count: function(){ return cart.length; },
    domain: SHOPIFY_DOMAIN
  };

  // ---- Wire up once DOM is ready ----
  function init(){
    injectMarkup();
    var e = els();
    if (e.overlay) e.overlay.addEventListener('click', closeAll);
    var closeBtn = document.getElementById('closeCart');
    if (closeBtn) closeBtn.addEventListener('click', close);
    var checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    var cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', open);
    var menuBtn = document.getElementById('menuBtn');
    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    var closeMenuBtn = document.getElementById('closeMenu');
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeAll);
    renderCart();
    updateCount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

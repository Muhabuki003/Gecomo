/* ==========================================================================
   GECOMO — shared Shopify Storefront helper
   One place that fetches live product data (pricing + IMAGES) by handle, so
   every page always reflects what's currently in Shopify. Change a product
   photo in Shopify admin and it updates the site automatically — no code edit.

   Usage:
     GecomoShopify.fetchProduct('eyebrow-makeup-stamp')
       .then(function(product){ ... use product.images / product.variants ... });

   Or, the zero-config path used by the shop homepage — any <img> with a
   data-shopify-handle attribute is auto-filled with that product's current
   featured image on page load:
     <img data-shopify-handle="waterproof-dual-ended-eyebrow-pencil" src="fallback.jpg">
   ========================================================================== */
(function(){
  "use strict";

  var DOMAIN = 'ehh05e-7q.myshopify.com';
  var TOKEN  = '40d6d0459487c81052405c45b704f6fc';
  var API    = '2024-07';

  // Simple in-page cache so multiple consumers of the same handle share one request.
  var cache = {};

  function fetchProduct(handle){
    if (!handle) return Promise.resolve(null);
    if (cache[handle]) return cache[handle];

    var query =
      '{ product(handle: "' + handle + '") {' +
        ' title' +
        ' featuredImage { url altText }' +
        ' images(first: 12) { edges { node { url altText } } }' +
        ' variants(first: 30) { edges { node { id title availableForSale price { amount currencyCode } compareAtPrice { amount } } } }' +
      ' } }';

    cache[handle] = fetch('https://' + DOMAIN + '/api/' + API + '/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
      body: JSON.stringify({ query: query })
    })
    .then(function(res){ return res.json(); })
    .then(function(json){ return (json && json.data && json.data.product) || null; })
    .catch(function(e){ console.warn('Shopify Storefront fetch failed for "' + handle + '" — using fallback content.', e); return null; });

    return cache[handle];
  }

  // Flatten product.images edges into a simple [{url, altText}] array.
  function imageList(product){
    if (!product) return [];
    var list = [];
    if (product.featuredImage && product.featuredImage.url) list.push(product.featuredImage);
    var edges = (product.images && product.images.edges) || [];
    edges.forEach(function(e){
      if (e.node && e.node.url && !list.some(function(x){ return x.url === e.node.url; })) list.push(e.node);
    });
    return list;
  }

  // Auto-fill any <img data-shopify-handle="..."> with a live Shopify image.
  //   data-shopify-index="N"  -> use the Nth image (default 0 = featured)
  // If the product has no image at that index, the image's closest
  // [data-shopify-window] container is hidden so we never show an empty frame.
  // On a failed fetch the existing (fallback) src is left untouched.
  function hydrateImages(root){
    var imgs = (root || document).querySelectorAll('img[data-shopify-handle]');
    imgs.forEach(function(img){
      var handle = img.getAttribute('data-shopify-handle');
      var idx = parseInt(img.getAttribute('data-shopify-index') || '0', 10);
      fetchProduct(handle).then(function(p){
        if (!p) return; // keep whatever fallback src is already in the HTML
        var list = imageList(p);
        var pick = list[idx];
        if (pick && pick.url) {
          img.src = pick.url;
          if (pick.altText) img.alt = pick.altText;
        } else {
          var box = img.closest('[data-shopify-window]');
          if (box) box.style.display = 'none'; else img.style.display = 'none';
        }
      });
    });
  }

  window.GecomoShopify = {
    domain: DOMAIN,
    fetchProduct: fetchProduct,
    imageList: imageList,
    hydrateImages: hydrateImages
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ hydrateImages(); });
  else hydrateImages();
})();

/* Reblooma — measurement layer.
 *
 * Paste your IDs below. Anything left blank simply doesn't load, so the site
 * works fine with none of them set. Nothing here sends names, emails or phone
 * numbers anywhere; only page views and the fact that a sign-up happened.
 *
 *   gtmId        Google Tag Manager   'GTM-XXXXXXX'   — the plumbing; add future tools here, not in code
 *   ga4Id        Google Analytics 4   'G-XXXXXXXXXX'  — visitors, pages, drop-off
 *   metaPixelId  Meta (Facebook/IG)   '1234567890'    — which ad produced a sign-up
 *   redditId     Reddit Ads           'a2_xxxxxxxx'   — same, for Reddit
 *   clarityId    Microsoft Clarity    'xxxxxxxxxx'    — free heatmaps and session replays
 *
 * If you run GTM, you can leave ga4Id / metaPixelId / redditId blank and add
 * those tags inside GTM instead. Set them here only if you'd rather skip GTM.
 */
window.REBLOOMA_ANALYTICS = Object.assign({
  gtmId: '',
  ga4Id: '',
  metaPixelId: '',
  redditId: '',
  clarityId: 'ys3dc2u8io'
}, window.REBLOOMA_ANALYTICS || {});

(function () {
  'use strict';
  var cfg = window.REBLOOMA_ANALYTICS;
  window.dataLayer = window.dataLayer || [];

  function script(src, attrs) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s);
    return s;
  }

  // ---- Google Tag Manager ----
  if (cfg.gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    script('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(cfg.gtmId));
  }

  // ---- Google Analytics 4 (only when not handled inside GTM) ----
  if (cfg.ga4Id) {
    script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4Id));
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', cfg.ga4Id);
  }

  // ---- Meta pixel ----
  if (cfg.metaPixelId) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', cfg.metaPixelId);
    fbq('track', 'PageView');
  }

  // ---- Reddit pixel ----
  if (cfg.redditId) {
    !function (w, d) {
      if (!w.rdt) {
        var p = w.rdt = function () { p.sendEvent ? p.sendEvent.apply(p, arguments) : p.callQueue.push(arguments); };
        p.callQueue = [];
        var t = d.createElement('script'); t.src = 'https://www.redditstatic.com/ads/pixel.js'; t.async = true;
        var s = d.getElementsByTagName('script')[0]; s.parentNode.insertBefore(t, s);
      }
    }(window, document);
    rdt('init', cfg.redditId);
    rdt('track', 'PageVisit');
  }

  // ---- Microsoft Clarity ----
  if (cfg.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', cfg.clarityId);
  }

  // ---- Forward the site's own events to each platform ----
  // site.js pushes { event: 'waitlist_signup' | 'consultation_started', role, testing_practice }
  var seen = window.dataLayer.length;
  function forward(entry) {
    if (!entry || !entry.event) return;
    if (entry.event === 'waitlist_signup' || entry.event === 'consultation_started') {
      var label = entry.event === 'consultation_started' ? 'Consultation' : 'Waitlist';
      if (window.fbq) fbq('track', 'Lead', { content_name: label, content_category: entry.role || '' });
      if (window.rdt) rdt('track', 'SignUp');
      if (window.gtag && cfg.ga4Id) gtag('event', entry.event, { role: entry.role || '' });
      if (window.clarity) clarity('set', 'signup', label.toLowerCase());
    }
  }
  // dataLayer is a plain array, so watch it rather than wrapping GTM's own push
  setInterval(function () {
    while (seen < window.dataLayer.length) forward(window.dataLayer[seen++]);
  }, 500);
})();

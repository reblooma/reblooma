/* Reblooma practice directory.
 *
 * WHERE THE DATA COMES FROM
 *   1. window.REBLOOMA.directoryApi — a live endpoint (the internal practice database),
 *      called as `${directoryApi}?zip=&radius=&lat=&lng=`, returning { practices: [...] }.
 *      Set it in assets/site.js when the API exists. It takes priority.
 *   2. assets/practices.json — a static export, used when no API is configured.
 *
 * Either way the records share one shape; see "_schema" in assets/practices.json.
 *
 * SEARCH
 *   "Use my location" gives real distances (browser geolocation + haversine against
 *   each practice's lat/lng). A typed ZIP, city or state matches on those fields;
 *   to turn a typed ZIP into real distances, set window.REBLOOMA.geocodeUrl to an
 *   endpoint taking {zip} and returning { lat, lng } — or let the API handle it.
 */
(function () {
  'use strict';

  var cfg = (window.REBLOOMA = window.REBLOOMA || {});
  var els = {};
  var all = [];         // every practice we know about
  var origin = null;    // { lat, lng } once we have the patient's location

  document.addEventListener('DOMContentLoaded', function () {
    els.form = document.getElementById('dir-form');
    els.query = document.getElementById('dir-query');
    els.radius = document.getElementById('dir-radius');
    els.locate = document.getElementById('dir-locate');
    els.status = document.getElementById('dir-status');
    els.results = document.getElementById('dir-results');
    els.empty = document.getElementById('dir-empty');
    els.count = document.getElementById('dir-count');
    if (!els.form) return;

    els.form.addEventListener('submit', function (e) { e.preventDefault(); search(); });
    els.locate.addEventListener('click', useMyLocation);

    load().then(function () {
      // A zip in the URL (?zip=78704) runs the search straight away.
      var zip = new URLSearchParams(location.search).get('zip');
      if (zip) { els.query.value = zip; search(); } else { render([]); }
    });
  });

  function load() {
    var url = cfg.directoryApi || 'assets/practices.json';
    return fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (data) { all = (data && data.practices) || []; })
      .catch(function () {
        all = [];
        say('The directory is unavailable right now. Please try again later.');
      });
  }

  function useMyLocation() {
    if (!navigator.geolocation) return say('Your browser can\'t share a location.');
    say('Finding your location…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      els.query.value = '';
      search();
    }, function () {
      say('We couldn\'t get your location. Enter a ZIP code instead.');
    }, { timeout: 10000 });
  }

  function search() {
    var q = els.query.value.trim().toLowerCase();
    var radius = parseInt(els.radius.value, 10);

    if (!origin && q && cfg.geocodeUrl) {
      return fetch(cfg.geocodeUrl.replace('{zip}', encodeURIComponent(q)))
        .then(function (r) { return r.json(); })
        .then(function (p) { origin = { lat: p.lat, lng: p.lng }; run(q, radius); })
        .catch(function () { run(q, radius); });
    }
    run(q, radius);
  }

  function run(q, radius) {
    var matches = all.map(function (p) {
      var copy = Object.assign({}, p);
      copy.distance = origin && p.lat != null && p.lng != null
        ? miles(origin.lat, origin.lng, p.lat, p.lng) : null;
      return copy;
    }).filter(function (p) {
      if (p.distance != null) return p.distance <= radius;
      if (!q) return true;
      return [p.zip, p.city, p.state, p.name].join(' ').toLowerCase().indexOf(q) > -1;
    }).sort(function (a, b) {
      if (a.distance != null && b.distance != null) return a.distance - b.distance;
      return (a.city || '').localeCompare(b.city || '');
    });

    say(origin ? 'Showing practices within ' + radius + ' miles of you.' : '');
    render(matches);
  }

  function render(list) {
    els.count.textContent = list.length
      ? list.length + (list.length === 1 ? ' practice' : ' practices')
      : '';
    els.results.innerHTML = list.map(card).join('');
    els.empty.classList.toggle('hidden', list.length > 0);
    els.results.classList.toggle('hidden', list.length === 0);
  }

  function card(p) {
    var where = p.setting === 'mobile'
      ? (p.serves || 'Comes to you')
      : [p.address, [p.city, p.state].filter(Boolean).join(', '), p.zip].filter(Boolean).join(' · ');
    var links = [
      p.booking_url ? '<a class="btn-primary font-ui-button text-ui-button px-5 py-2" href="' + p.booking_url + '" target="_blank" rel="noopener">Book</a>' : '',
      p.website ? '<a class="font-ui-button text-ui-button text-primary hover:underline self-center" href="' + p.website + '" target="_blank" rel="noopener">Website</a>' : '',
      p.phone ? '<a class="font-ui-button text-ui-button text-primary hover:underline self-center" href="tel:' + p.phone.replace(/[^0-9+]/g, '') + '">' + p.phone + '</a>' : ''
    ].filter(Boolean).join('');
    return '<article class="bg-[#f3f0ed] border border-[#16181a]/[0.08] rounded-[4px] shadow-sm p-6 flex flex-col gap-3">' +
      '<div class="flex items-start justify-between gap-4">' +
        '<div><h3 class="font-headline-sm text-[20px] text-ink">' + esc(p.name) + '</h3>' +
        '<p class="font-label-caps text-label-caps uppercase text-ink/42 mt-1">' + esc(p.setting || '') + '</p></div>' +
        (p.distance != null ? '<span class="font-[\'Lora\'] text-[1.1rem] brand-gradient-text shrink-0">' + p.distance.toFixed(1) + ' mi</span>' : '') +
      '</div>' +
      '<p class="text-[0.9rem] text-ink/62">' + esc(where) + '</p>' +
      (p.modalities && p.modalities.length
        ? '<p class="text-[0.82rem] text-ink/62">' + p.modalities.map(esc).join(' · ') + '</p>' : '') +
      (p.accepting === false ? '<p class="text-[0.82rem] text-ink/42 italic">Not taking new patients right now</p>' : '') +
      (links ? '<div class="flex gap-4 pt-2 mt-auto">' + links + '</div>' : '') +
    '</article>';
  }

  function miles(lat1, lng1, lat2, lng2) {
    var R = 3958.8, toRad = Math.PI / 180;
    var dLat = (lat2 - lat1) * toRad, dLng = (lng2 - lng1) * toRad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function say(msg) {
    els.status.textContent = msg || '';
    els.status.classList.toggle('hidden', !msg);
  }
})();

/* Reblooma — shared site behaviour: mobile menu, UTM capture, waitlist modal → GoHighLevel. */

// ---------------------------------------------------------------------------
// CONFIG — paste your GoHighLevel workflow "Inbound Webhook" URL below.
// While it's empty the form runs in test mode: it works end to end but saves nothing.
// ---------------------------------------------------------------------------
window.REBLOOMA = Object.assign({
  waitlistWebhook: '', // e.g. 'https://services.leadconnectorhq.com/hooks/<location>/webhook-trigger/<id>'
  // Where "Start my consultation" sends patients once their details are captured.
  consultationUrl: 'https://drb.ai/and/reblooma',
}, window.REBLOOMA || {});

(function () {
  'use strict';

  // ---------- small storage helpers (storage can throw in private mode) ----------
  function readJSON(key) {
    try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }
  function writeJSON(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  // ---------- attribution: keep the first-touch UTMs for the whole visit ----------
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
  (function captureAttribution() {
    if (readJSON('rb_attr')) return;
    var params = new URLSearchParams(location.search);
    var attr = { landing_page: location.pathname, referrer: document.referrer || '' };
    UTM_KEYS.forEach(function (k) { if (params.get(k)) attr[k] = params.get(k); });
    writeJSON('rb_attr', attr);
  })();

  // ---------- mobile menu ----------
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-menu-toggle]');
    if (!toggle) return;
    var menu = document.getElementById('mobile-menu');
    var open = menu.hasAttribute('hidden');
    if (open) menu.removeAttribute('hidden'); else menu.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // ---------- waitlist modal ----------
  var modal, form, state;

  var MODAL_HTML =
    '<div id="waitlist-modal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-primary/40 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-labelledby="wl-title">' +
    '<div class="bg-[#f3f0ed] border border-primary/10 rounded-[4px] shadow-2xl max-w-md w-full p-8 relative max-h-[92vh] overflow-y-auto">' +
    '<button type="button" class="absolute top-4 right-4 text-secondary hover:text-primary" data-wl-close aria-label="Close"><span class="material-symbols-outlined">close</span></button>' +
    '<form novalidate>' +
      // honeypot — real people never see or fill this
      '<input type="text" name="company_website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true">' +

      // Step 1 — who
      '<div class="wl-step" data-step="1">' +
        '<p class="font-label-caps text-label-caps text-secondary mb-2 uppercase tracking-widest" data-wl-progress></p>' +
        '<h3 id="wl-title" class="font-headline-sm text-headline-sm text-primary mb-2">Join the Reblooma waitlist</h3>' +
        '<p class="text-on-surface-variant mb-6">Which describes you?</p>' +
        '<div class="grid grid-cols-2 gap-4 mb-2">' +
          '<button type="button" class="wl-choice btn-secondary py-4 hover:bg-primary/5" data-role="patient" aria-pressed="false">Patient</button>' +
          '<button type="button" class="wl-choice btn-secondary py-4 hover:bg-primary/5" data-role="practitioner" aria-pressed="false">Practitioner</button>' +
        '</div>' +
      '</div>' +

      // Step 2 — contact
      '<div class="wl-step hidden" data-step="2">' +
        '<p class="font-label-caps text-label-caps text-secondary mb-2 uppercase tracking-widest" data-wl-progress></p>' +
        '<h3 class="font-headline-sm text-headline-sm text-primary mb-6" data-wl-contact-title>Where should we reach you?</h3>' +
        '<label class="block mb-6"><span class="font-label-caps text-label-caps uppercase text-secondary">Full name</span>' +
          '<input class="wl-input" name="full_name" type="text" autocomplete="name" placeholder="Jane Doe" required></label>' +
        '<label class="block mb-2"><span class="font-label-caps text-label-caps uppercase text-secondary">Email</span>' +
          '<input class="wl-input" name="email" type="email" autocomplete="email" placeholder="jane@example.com" required></label>' +
        '<p class="wl-error hidden mb-2" data-wl-error></p>' +
        '<div class="flex gap-3 mt-8"><button type="button" class="btn-secondary px-5 py-3" data-wl-back>Back</button><button type="button" class="btn-primary flex-1 py-3" data-wl-next>Continue</button></div>' +
      '</div>' +

      // Step 3 — location & details
      '<div class="wl-step hidden" data-step="3">' +
        '<p class="font-label-caps text-label-caps text-secondary mb-2 uppercase tracking-widest" data-wl-progress></p>' +
        '<h3 class="font-headline-sm text-headline-sm text-primary mb-6">Almost done</h3>' +
        '<div class="grid grid-cols-3 gap-4 mb-6">' +
          '<label class="block col-span-2"><span class="font-label-caps text-label-caps uppercase text-secondary">City</span>' +
            '<input class="wl-input" name="city" type="text" autocomplete="address-level2" placeholder="Austin" required></label>' +
          '<label class="block"><span class="font-label-caps text-label-caps uppercase text-secondary">State</span>' +
            '<input class="wl-input" name="state" type="text" autocomplete="address-level1" placeholder="TX" maxlength="20" required></label>' +
        '</div>' +
        '<div data-wl-practitioner class="hidden">' +
          '<label class="block mb-6"><span class="font-label-caps text-label-caps uppercase text-secondary">Practice name <span class="normal-case tracking-normal font-normal">(optional)</span></span>' +
            '<input class="wl-input" name="practice_name" type="text" autocomplete="organization"></label>' +
          '<label class="flex items-start gap-3 mb-6 text-[0.9rem] text-on-surface-variant cursor-pointer">' +
            '<input type="checkbox" name="testing_practice" value="yes" class="mt-1 rounded-sm border-primary/30 text-primary focus:ring-0">' +
            '<span>I\'d like to be a <b class="text-primary">testing practice</b> and help shape how Reblooma is priced.</span></label>' +
        '</div>' +
        '<label class="block mb-2"><span class="font-label-caps text-label-caps uppercase text-secondary">Mobile <span class="normal-case tracking-normal font-normal">(optional)</span></span>' +
          '<input class="wl-input" name="phone" type="tel" autocomplete="tel" placeholder="(555) 555-0123"></label>' +
        '<label class="flex items-start gap-3 mt-3 mb-2 text-[0.78rem] leading-snug text-on-surface-variant cursor-pointer">' +
          '<input type="checkbox" name="sms_consent" value="yes" class="mt-0.5 rounded-sm border-primary/30 text-primary focus:ring-0">' +
          '<span>Text me launch updates. Msg &amp; data rates may apply; reply STOP to opt out.</span></label>' +
        '<p class="wl-error hidden mb-2" data-wl-error></p>' +
        '<div class="flex gap-3 mt-8"><button type="button" class="btn-secondary px-5 py-3" data-wl-back>Back</button><button type="submit" class="btn-primary flex-1 py-3" data-wl-submit>Join the waitlist</button></div>' +
        '<p class="text-[0.72rem] text-on-surface-variant/70 mt-4">We\'ll only contact you about Reblooma. Unsubscribe anytime.</p>' +
      '</div>' +

      // Done
      '<div class="wl-step hidden" data-step="done">' +
        '<div class="text-center py-6">' +
          '<span class="material-symbols-outlined text-primary text-[64px] mb-4">check_circle</span>' +
          '<h3 class="font-headline-sm text-headline-sm text-primary mb-2" data-wl-done-title>You\'re on the list.</h3>' +
          '<p class="text-on-surface-variant" data-wl-done-text>We\'ll be in touch as we get closer to launch.</p>' +
          '<p class="hidden mt-4 text-[0.75rem] text-[#93000a]" data-wl-testmode>Test mode: the waitlist isn\'t connected to GoHighLevel yet, so nothing was saved.</p>' +
          '<button type="button" class="btn-primary mt-8 px-8 py-3" data-wl-close>Close</button>' +
          '<a class="btn-primary mt-8 px-8 py-3 hidden" data-wl-consult-link href="#">Continue to Dr. B</a>' +
        '</div>' +
      '</div>' +
    '</form></div></div>';

  function $(sel, root) { return (root || modal).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || modal).querySelectorAll(sel)); }

  function ensureModal() {
    if (modal) return;
    document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
    modal = document.getElementById('waitlist-modal');
    form = modal.querySelector('form');

    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-wl-close]')) return closeModal();
      var choice = e.target.closest('[data-role]');
      if (choice) {
        setRole(choice.getAttribute('data-role'));
        // A practitioner who backed out of the consultation flow joins the waitlist instead.
        if (state.role !== 'patient') state.consult = false;
        $('[data-wl-submit]').textContent = submitLabel();
        $('[data-wl-contact-title]').textContent = state.consult ? 'Start your consultation' : 'Where should we reach you?';
        return showStep(2);
      }
      if (e.target.closest('[data-wl-back]')) {
        if (state.step === 3) return showStep(2);
        state.presetRole = null; // let them change who they are
        return showStep(1);
      }
      if (e.target.closest('[data-wl-next]')) { if (validateStep(2)) showStep(3); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });
    form.addEventListener('submit', onSubmit);
    // The submit button lives on step 3 and is hidden on step 2, so Enter wouldn't submit there.
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') {
        e.preventDefault();
        if (state.step === 2) { if (validateStep(2)) showStep(3); } else if (state.step === 3) { form.requestSubmit(); }
      }
    });
  }

  function setRole(role) {
    state.role = role;
    $$('[data-role]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-role') === role)); });
    $('[data-wl-practitioner]').classList.toggle('hidden', role !== 'practitioner');
  }

  function showStep(step) {
    state.step = step;
    $$('.wl-step').forEach(function (el) { el.classList.toggle('hidden', el.getAttribute('data-step') !== String(step)); });
    var total = state.presetRole ? 2 : 3;
    var n = state.presetRole ? step - 1 : step;
    $$('[data-wl-progress]').forEach(function (p) { p.textContent = 'Step ' + n + ' of ' + total; });
    var first = $('.wl-step[data-step="' + step + '"] input:not([type=hidden]):not(.hidden), .wl-step[data-step="' + step + '"] button');
    if (first) setTimeout(function () { first.focus(); }, 30);
  }

  function validateStep(step) {
    var fields = $$('.wl-step[data-step="' + step + '"] input[required]');
    var bad = fields.filter(function (f) { return !f.value.trim() || !f.checkValidity(); });
    var err = $('.wl-step[data-step="' + step + '"] [data-wl-error]');
    if (bad.length) {
      err.textContent = bad[0].type === 'email' && bad[0].value ? 'That email doesn\'t look quite right.' : 'Please fill in the highlighted fields.';
      err.classList.remove('hidden');
      bad[0].focus();
      return false;
    }
    err.classList.add('hidden');
    return true;
  }

  function openModal(opts) {
    ensureModal();
    form.reset();
    state = {
      step: 1, role: null, presetRole: null, cta: opts.cta || '',
      testing: opts.role === 'testing',
      consult: opts.role === 'consult'
    };
    $$('[data-wl-error]').forEach(function (e) { e.classList.add('hidden'); });
    $('[data-wl-testmode]').classList.add('hidden');
    $('[data-wl-submit]').disabled = false;
    $('[data-wl-submit]').textContent = submitLabel();
    $('[data-wl-contact-title]').textContent = state.consult ? 'Start your consultation' : 'Where should we reach you?';
    $('[data-wl-close].btn-primary').classList.remove('hidden');
    $('[data-wl-consult-link]').classList.add('hidden');

    var role = opts.role === 'testing' || opts.role === 'consult'
      ? (state.consult ? 'patient' : 'practitioner')
      : opts.role;
    if (role === 'patient' || role === 'practitioner') {
      state.presetRole = role;
      setRole(role);
      if (state.testing) form.elements.testing_practice.checked = true;
      showStep(2);
    } else {
      setRole(null);
      showStep(1);
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.documentElement.style.overflow = 'hidden';
  }

  function submitLabel() { return state.consult ? 'Continue to consultation' : 'Join the waitlist'; }

  function closeModal() {
    clearTimeout(state && state.redirectTimer);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.documentElement.style.overflow = '';
  }

  function onSubmit(e) {
    e.preventDefault();
    if (state.step !== 3 || !validateStep(3)) return;
    var f = form.elements;
    if (f.company_website.value) return showStep('done'); // bot

    var name = f.full_name.value.trim().split(/\s+/);
    var role = state.role || 'unknown';
    var testing = role === 'practitioner' && f.testing_practice.checked;
    var tags = ['waitlist', 'role-' + role];
    if (state.consult) tags.push('consultation-started');
    if (testing) tags.push('testing-practice-interest');
    if (f.sms_consent.checked && f.phone.value.trim()) tags.push('sms-opt-in');

    var payload = Object.assign({
      first_name: name[0] || '',
      last_name: name.slice(1).join(' '),
      full_name: f.full_name.value.trim(),
      email: f.email.value.trim(),
      phone: f.phone.value.trim(),
      city: f.city.value.trim(),
      state: f.state.value.trim(),
      role: role,
      practice_name: role === 'practitioner' ? f.practice_name.value.trim() : '',
      testing_practice: testing ? 'yes' : 'no',
      sms_consent: f.sms_consent.checked && f.phone.value.trim() ? 'yes' : 'no',
      tags: tags.join(','),
      source_page: location.pathname,
      cta: state.cta,
      intent: state.consult ? 'consultation' : 'waitlist',
      submitted_at: new Date().toISOString()
    }, readJSON('rb_attr') || {});

    var btn = $('[data-wl-submit]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    send(payload).then(function (sent) {
      (window.dataLayer = window.dataLayer || []).push({
        event: state.consult ? 'consultation_started' : 'waitlist_signup', role: role, testing_practice: testing
      });
      $('[data-wl-testmode]').classList.toggle('hidden', sent);
      if (state.consult) return goToConsultation(sent);
      $('[data-wl-done-title]').textContent = 'You\'re on the list.';
      $('[data-wl-done-text]').textContent = testing
        ? 'Thanks — we\'ll reach out personally about joining as a testing practice.'
        : 'We\'ll be in touch as we get closer to launch.';
      showStep('done');
    }).catch(function () {
      // Don't block someone from their consultation just because the lead didn't save.
      if (state.consult) return goToConsultation(true);
      var err = $('.wl-step[data-step="3"] [data-wl-error]');
      err.textContent = 'Something went wrong. Please try again, or email hello@reblooma.com.';
      err.classList.remove('hidden');
    }).then(function () {
      btn.disabled = false;
      btn.textContent = submitLabel();
    });
  }

  // Hand the patient to Dr. B. No personal details go in the URL.
  function goToConsultation(autoRedirect) {
    var url = window.REBLOOMA.consultationUrl;
    $('[data-wl-done-title]').textContent = 'Thanks — one more step.';
    $('[data-wl-done-text]').textContent = 'Your letter comes from a consultation with Dr. B, an independent telehealth practice. ' +
      (autoRedirect ? 'We\'re taking you there now.' : 'Continue when you\'re ready.');
    $('[data-wl-close].btn-primary').classList.add('hidden');
    var link = $('[data-wl-consult-link]');
    link.href = url;
    link.classList.remove('hidden');
    showStep('done');
    // In test mode, stay put so the test-mode notice can be read.
    if (autoRedirect) state.redirectTimer = setTimeout(function () { location.assign(url); }, 2500);
  }

  // Sent as form-encoded with no-cors so the browser doesn't need a CORS preflight
  // from GoHighLevel. The response is opaque, so a network failure is the only error we see.
  function send(payload) {
    var url = window.REBLOOMA.waitlistWebhook;
    if (!url) {
      console.warn('[Reblooma] waitlistWebhook is not set in assets/site.js — test mode, nothing saved.', payload);
      return Promise.resolve(false);
    }
    return fetch(url, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(payload) })
      .then(function () { return true; });
  }

  // Any element with data-waitlist opens the modal.
  //   data-waitlist=""             ask who they are
  //   data-waitlist="patient"      skip straight to contact details
  //   data-waitlist="practitioner"
  //   data-waitlist="testing"      practitioner, with "testing practice" pre-ticked
  //   data-waitlist="consult"      patient; after capture, sends them to Dr. B (consultationUrl)
  //   data-cta="hero"              label for which button it was (sent to GHL)
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-waitlist]');
    if (!trigger) return;
    e.preventDefault();
    openModal({ role: trigger.getAttribute('data-waitlist'), cta: trigger.getAttribute('data-cta') || '' });
  });

  // Deep links: reblooma.com/#waitlist, #waitlist-practitioner, #waitlist-testing
  function openFromHash() {
    var m = location.hash.match(/^#waitlist(?:-(patient|practitioner|testing))?$/);
    if (m) openModal({ role: m[1] || '', cta: 'deep-link' });
  }
  window.addEventListener('hashchange', openFromHash);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openFromHash); else openFromHash();
})();

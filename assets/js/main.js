/* ==========================================================================
   JP NEWMAN — main.js
   Vanilla, deferred, dependency-free. Every behaviour here is an enhancement:
   the page is fully readable and navigable if this file never runs.
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = {
    /* Paste the GHL-hosted form submit URL here (NOT a raw inbound webhook).
       Until it is set, the form runs in a safe demo state: it validates and
       shows the confirmation copy without sending anything. */
    NEWSLETTER_ENDPOINT: '',
    NEWSLETTER_TAG: 'source:jpnewman-newsletter',
    MIN_FILL_MS: 2500
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- utils */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Analytics: provider-agnostic and never throws. */
  function track(name, props) {
    try {
      if (typeof window.plausible === 'function') window.plausible(name, props ? { props: props } : undefined);
      if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: name }, props || {}));
    } catch (e) { /* analytics must never break the page */ }
  }

  $$('[data-event]').forEach(function (el) {
    el.addEventListener('click', function () { track(el.getAttribute('data-event')); });
  });

  /* ------------------------------------------------------------------ nav */

  var nav = $('#nav');
  var toggle = $('#nav-toggle');
  var drawer = $('#nav-drawer');

  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function closeDrawer() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeDrawer();
        toggle.focus();
      }
    });

    /* If the viewport grows past the mobile breakpoint while the drawer is
       open, the drawer is hidden by CSS — make sure state and scroll-lock
       don't get stranded. */
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
      if (e.matches) closeDrawer();
    });
  }

  /* -------------------------------------------------------------- reveals */

  var revealables = $$('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------- scroll spy */

  var navLinks = $$('.nav__link[href^="#"]');
  var sections = navLinks
    .map(function (link) { return document.getElementById(link.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* --------------------------------------------------------------- footer */

  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------------- newsletter form */

  var form = $('#newsletter-form');

  if (form) {
    var loadedAt = Date.now();
    var status = $('#form-status');
    var submit = $('#nl-submit');
    var fFirst = $('#f-first');
    var fEmail = $('#f-email');
    var first = $('#first_name');
    var email = $('#email');
    var honeypot = $('#company');

    var setStatus = function (msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form__status' + (kind ? ' is-' + kind : '');
    };

    /* Clear the invalid state as soon as the visitor starts fixing it. */
    [[fFirst, first], [fEmail, email]].forEach(function (pair) {
      if (pair[1]) pair[1].addEventListener('input', function () { pair[0].classList.remove('is-invalid'); });
    });

    var validEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Bots: hidden field filled, or the form completed implausibly fast.
         Both fail silently so a scraper learns nothing. */
      if (honeypot && honeypot.value) return;
      if (Date.now() - loadedAt < CONFIG.MIN_FILL_MS) return;

      var ok = true;
      if (!first.value.trim()) { fFirst.classList.add('is-invalid'); ok = false; }
      if (!validEmail(email.value.trim())) { fEmail.classList.add('is-invalid'); ok = false; }

      if (!ok) {
        setStatus('Please check the fields above.', 'err');
        (fFirst.classList.contains('is-invalid') ? first : email).focus();
        return;
      }

      submit.disabled = true;
      setStatus('Sending…');

      var done = function () {
        form.reset();
        submit.disabled = false;
        setStatus('You’re in. Check your inbox to confirm your subscription.', 'ok');
        track('Newsletter Opt-in');
      };

      /* Demo state — no endpoint configured yet. */
      if (!CONFIG.NEWSLETTER_ENDPOINT) {
        window.setTimeout(done, 500);
        return;
      }

      var body = new FormData();
      body.append('first_name', first.value.trim());
      body.append('email', email.value.trim());
      body.append('tag', CONFIG.NEWSLETTER_TAG);

      fetch(CONFIG.NEWSLETTER_ENDPOINT, { method: 'POST', body: body })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          done();
        })
        .catch(function () {
          submit.disabled = false;
          setStatus('Something went wrong. Please try again, or email hello@jpnewman.com.', 'err');
          track('Newsletter Error');
        });
    });
  }

  /* ------------------------------------------------------------- failsafe */

  /* If anything above throws in an older browser, make sure no revealable
     element is ever left invisible. */
  window.addEventListener('error', function () {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  });
})();

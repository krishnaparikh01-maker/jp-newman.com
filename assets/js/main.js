/* ==========================================================================
   JP NEWMAN — main.js
   Vanilla, deferred, dependency-free. Every behaviour here is an enhancement:
   the page is fully readable and navigable if this file never runs.
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = {
    /* GoHighLevel inbound webhook for the "JP Newman Site - Newsletter"
       workflow, in the same sub-account (KV9ByFOi2JhXySNLQzjH) that
       fulfillionaire.com uses. This site has its own workflow so its signups
       can be reported on separately; the workflow creates or updates the
       contact and applies both tags. */
    NEWSLETTER_ENDPOINT: 'https://services.leadconnectorhq.com/hooks/' +
      'KV9ByFOi2JhXySNLQzjH/webhook-trigger/926fcf55-96c8-47d8-a026-e79939a09e71',

    /* The workflow applies the tags itself, so this is sent for the record
       only. It matches the tag fulfillionaire.com's own signups carry.
       SOURCE lands on the contact's Contact Source field. */
    NEWSLETTER_TAG: 'fulfillionaire newsletter lead',
    NEWSLETTER_SOURCE: 'jpnewman.com',

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

    /* True only once Turnstile has actually rendered. If the script is blocked
       or fails to load, the check is skipped rather than locking everyone out
       of subscribing. */
    var widgetReady = false;
    (function waitForTurnstile(tries) {
      if (window.turnstile && document.querySelector('#nl-turnstile iframe')) { widgetReady = true; return; }
      if (tries > 0) window.setTimeout(function () { waitForTurnstile(tries - 1); }, 400);
    })(25);
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

      /* Require a completed Turnstile challenge before anything is sent.
         Rendering the widget alone protects nothing — the token has to be
         checked, which is the step fulfillionaire.com is missing. The token
         is also forwarded, so it can be verified server-side later without
         touching this file.

         Note the honest limit: with no backend there is nothing to validate
         the token against, so this stops bots that do not solve the challenge
         in a real browser, not one posting straight to the webhook. The
         honeypot, the fill-time check and double opt-in cover the rest. */
      var token = '';
      if (widgetReady && window.turnstile) {
        try { token = window.turnstile.getResponse() || ''; } catch (e) { token = ''; }
        if (!token) {
          setStatus('Please complete the verification above.', 'err');
          return;
        }
      }

      submit.disabled = true;
      setStatus('Sending…');

      var done = function () {
        form.reset();
        submit.disabled = false;
        setStatus('You’re in. The next issue lands in your inbox.', 'ok');
        track('Newsletter Opt-in');
      };

      /* Demo state — no endpoint configured yet. */
      if (!CONFIG.NEWSLETTER_ENDPOINT) {
        window.setTimeout(done, 500);
        return;
      }

      /* POST through a hidden iframe rather than fetch(). The GoHighLevel
         webhook sends no CORS headers, so a fetch() is blocked by the browser
         and the signup is silently lost. A form targeting an iframe is a plain
         navigation, which CORS does not apply to. This is the same approach
         fulfillionaire.com uses, for the same reason. */
      var iframe = document.createElement('iframe');
      iframe.name = 'nlTarget_' + Date.now();
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      var post = document.createElement('form');
      post.method = 'POST';
      post.action = CONFIG.NEWSLETTER_ENDPOINT;
      post.target = iframe.name;
      post.style.display = 'none';

      var fields = {
        /* GoHighLevel's Create Contact maps a single "name", so send both:
           "name" fills Full name, "first_name" is kept for anything that
           reads the raw payload. */
        name: first.value.trim(),
        first_name: first.value.trim(),
        email: email.value.trim(),
        tags: CONFIG.NEWSLETTER_TAG,
        source: CONFIG.NEWSLETTER_SOURCE
      };
      if (token) fields['cf-turnstile-response'] = token;

      Object.keys(fields).forEach(function (key) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        post.appendChild(input);
      });

      document.body.appendChild(post);
      post.submit();

      /* The iframe gives no readable response (cross-origin), so success is
         assumed once the POST is away, then the scaffolding is cleaned up. */
      window.setTimeout(function () {
        done();
        if (window.turnstile && widgetReady) { try { window.turnstile.reset(); } catch (e) {} }
        post.remove();
        iframe.remove();
      }, 900);
    });
  }

  /* ------------------------------------------------- belief: read more */

  /* The manifesto is 13 paragraphs. On a desktop it reads alongside a sticky
     heading and costs nothing; on a phone it is 2140px, the single longest
     thing on the page. Collapse it to the pivot line and let people open it.

     Progressive enhancement on purpose: the markup ships complete and the
     clamp is applied here, so with JS off, or on a wide screen, the whole
     piece is simply there. Nothing is hidden from a crawler either - the
     text is in the DOM, only its height is constrained. */
  (function beliefReadMore() {
    var body = $('.belief__body');
    if (!body) return;

    var mq = window.matchMedia('(max-width: 640px)');
    var paras = $$('p', body).filter(function (el) { return el.parentNode === body; });

    /* Cut after the dimensions paragraph: lead, setup, the "true wealth
       isn't simply having more money" turn, then the five dimensions. It
       ends on a hook rather than mid-thought. */
    var CUT = 4;
    if (paras.length <= CUT + 2) return;

    var open = false;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'readmore';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'belief-body');
    body.id = 'belief-body';

    function label() {
      btn.innerHTML = open
        ? 'Show less <span class="arw" aria-hidden="true">&uarr;</span>'
        : 'Read the rest <span class="arw" aria-hidden="true">&darr;</span>';
    }

    /* Measured rather than a fixed px so the cut still lands on a paragraph
       break when the type scale or the copy changes.

       Rect deltas, not offsetTop: .is-clamped sets position:relative, which
       makes the body itself the offsetParent of its own paragraphs, so an
       offsetTop subtraction compares two different origins and returns a
       negative height. getBoundingClientRect is origin-independent. */
    function clampHeight() {
      var last = paras[CUT - 1];
      return last.getBoundingClientRect().bottom - body.getBoundingClientRect().top;
    }

    function collapse() {
      open = false;
      body.classList.add('is-clamped');
      body.style.maxHeight = clampHeight() + 'px';
      btn.setAttribute('aria-expanded', 'false');
      label();
    }

    function expand() {
      open = true;
      body.style.maxHeight = body.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
      label();
      /* Drop the cap once the transition is done so the section can still
         reflow if the device rotates or a font loads late. */
      window.setTimeout(function () {
        if (open) {
          body.classList.remove('is-clamped');
          body.style.maxHeight = '';
        }
      }, 450);
    }

    function teardown() {
      open = false;
      body.classList.remove('is-clamped');
      body.style.maxHeight = '';
      if (btn.parentNode) btn.parentNode.removeChild(btn);
    }

    function apply() {
      if (mq.matches) {
        if (!btn.parentNode) body.parentNode.insertBefore(btn, body.nextSibling);
        if (!open) collapse();
      } else {
        teardown();
      }
    }

    btn.addEventListener('click', function () {
      if (open) {
        collapse();
        body.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } else {
        expand();
        track('Belief Expanded');
      }
    });

    apply();

    /* Both, deliberately. The matchMedia change event is the right signal but
       does not fire in every environment, and if it is missed while collapsed
       the manifesto stays cut off at 489px on a wide screen. The debounced
       resize is the belt to its braces. */
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);

    var t;
    window.addEventListener('resize', function () {
      window.clearTimeout(t);
      t = window.setTimeout(apply, 150);
    });

    /* A late web-font load changes the measured height, so re-clamp once. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (mq.matches && !open) collapse();
      });
    }
  })();

  /* ------------------------------------------------------------- failsafe */

  /* If anything above throws in an older browser, make sure no revealable
     element is ever left invisible. */
  window.addEventListener('error', function () {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  });
})();

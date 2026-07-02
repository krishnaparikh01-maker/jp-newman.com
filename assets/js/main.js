/* =========================================================================
   JP-Newman.com — minimal progressive-enhancement script
   No dependencies. Everything degrades gracefully without it.
   ========================================================================= */
(function () {
  'use strict';

  // Failsafe: if anything below throws, never leave revealed content hidden.
  window.addEventListener('error', function () {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-in');
    });
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isSmall = window.matchMedia('(max-width: 40rem)').matches;

  /* ---------------------------------------------------------------------
     CONFIG — replace before launch (see README + OPEN ITEMS)
     --------------------------------------------------------------------- */
  var CONFIG = {
    // GHL form endpoint that triggers the existing double opt-in workflow.
    // TODO: set the real endpoint. Never expose a raw inbound webhook here —
    // use the GHL-hosted form submit URL. Leave empty to keep the demo state.
    NEWSLETTER_ENDPOINT: '',
    NEWSLETTER_TAG: 'source:jp-newman-newsletter',
    MIN_FILL_MS: 2500 // minimum-completion-time bot defense
  };

  /* ---------------------------------------------------------------------
     Analytics — safe wrapper. Fires custom events if a provider is present.
     Documented event names live in the README.
     --------------------------------------------------------------------- */
  function track(name, props) {
    try {
      if (typeof window.plausible === 'function') {
        window.plausible(name, props ? { props: props } : undefined);
      }
      // Cloudflare Web Analytics / others can hook window.dataLayer if desired.
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push(Object.assign({ event: name }, props || {}));
      }
    } catch (e) { /* analytics must never break the page */ }
  }

  // Wire declarative link/CTA events: any element with [data-event]
  document.querySelectorAll('[data-event]').forEach(function (el) {
    el.addEventListener('click', function () {
      track(el.getAttribute('data-event'));
    });
  });

  /* ---------------------------------------------------------------------
     Reveals — restrained fade-and-rise. Skipped entirely for reduced motion.
     --------------------------------------------------------------------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Numeral motif — focus grows from 0 (blurred, hero) to 1 (sharp, at the
     calculator climax), then flips ink to forest once we reach the cream beat.
     Uses rAF-throttled scroll; disabled on small screens (CSS handles those).
     --------------------------------------------------------------------- */
  var motif = document.getElementById('motif');
  var climax = document.getElementById('calculator');
  var creamBeat = document.getElementById('continue');

  if (motif && climax && !isSmall && !reduceMotion) {
    var ticking = false;

    function updateMotif() {
      ticking = false;
      var vh = window.innerHeight;
      // progress from top of document to the top of the calculator beat
      var target = climax.getBoundingClientRect().top + window.scrollY - vh * 0.4;
      var focus = window.scrollY / Math.max(target, 1);
      focus = Math.max(0, Math.min(1, focus));
      motif.style.setProperty('--motif-focus', focus.toFixed(3));

      // Flip motif ink to forest once the cream beat is in view
      if (creamBeat) {
        var creamTop = creamBeat.getBoundingClientRect().top;
        motif.classList.toggle('is-cream', creamTop < vh * 0.5);
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateMotif);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateMotif();
  }

  /* ---------------------------------------------------------------------
     Newsletter form — honeypot + min-fill time + validation + states.
     --------------------------------------------------------------------- */
  var form = document.getElementById('newsletter-form');
  if (form) {
    var startedAt = Date.now();
    var statusEl = document.getElementById('form-status');
    var submitBtn = document.getElementById('nl-submit');
    var firstEl = document.getElementById('first_name');
    var emailEl = document.getElementById('email');
    var honeyEl = document.getElementById('company');

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setInvalid(el, invalid) {
      el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    }
    function setStatus(msg, kind) {
      statusEl.textContent = msg || '';
      statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
    }

    // Clear invalid state as the user corrects a field
    [firstEl, emailEl].forEach(function (el) {
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') === 'true') setInvalid(el, false);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Client-side validation
      var okFirst = firstEl.value.trim().length > 0;
      var okEmail = EMAIL_RE.test(emailEl.value.trim());
      setInvalid(firstEl, !okFirst);
      setInvalid(emailEl, !okEmail);
      if (!okFirst) { firstEl.focus(); return; }
      if (!okEmail) { emailEl.focus(); return; }

      // Bot defenses: filled honeypot or too-fast submit -> pretend success,
      // do not send. Real users never trip these.
      var trapped = (honeyEl && honeyEl.value !== '') ||
                    (Date.now() - startedAt < CONFIG.MIN_FILL_MS);

      if (!CONFIG.NEWSLETTER_ENDPOINT) {
        // Demo state until the GHL endpoint is configured.
        setStatus('Check your inbox to confirm your subscription.', 'success');
        track('Newsletter Opt-in', { state: trapped ? 'blocked' : 'demo' });
        form.reset();
        return;
      }

      if (trapped) {
        setStatus('Check your inbox to confirm your subscription.', 'success');
        return; // silently drop
      }

      // Loading state
      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      setStatus('', null);

      var payload = new FormData();
      payload.append('first_name', firstEl.value.trim());
      payload.append('email', emailEl.value.trim());
      payload.append('tag', CONFIG.NEWSLETTER_TAG);

      fetch(CONFIG.NEWSLETTER_ENDPOINT, {
        method: 'POST',
        body: payload
      }).then(function (res) {
        if (!res.ok) throw new Error('Bad response ' + res.status);
        setStatus('Check your inbox to confirm your subscription.', 'success');
        track('Newsletter Opt-in', { state: 'submitted' });
        form.reset();
      }).catch(function () {
        setStatus('Something went wrong. Please try again in a moment.', 'error');
        track('Newsletter Error');
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll-depth to the primary calculator beat (fires once).
     --------------------------------------------------------------------- */
  if (climax && 'IntersectionObserver' in window) {
    var depthObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          track('Scroll Depth: Calculator Beat');
          depthObserver.disconnect();
        }
      });
    }, { threshold: 0.35 });
    depthObserver.observe(climax);
  }
})();

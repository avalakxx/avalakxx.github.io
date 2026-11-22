/* =====================================================================
   THE SELECT — js/home.js
   Renders the home page from window.SITE and wires its motion.
   Every section renders inside safe(): missing data skips that piece.
   ===================================================================== */
(function (w, d) {
  'use strict';

  var KT = w.KT;
  if (!KT) return;
  var SITE = w.SITE || {};
  var h = KT.h, fmt = KT.fmt, esc = KT.esc, $ = KT.$, $$ = KT.$$;
  var G = w.gsap, ST = w.ScrollTrigger;
  var HAS_GSAP = !!(G && ST);
  var ANIM = HAS_GSAP && !KT.reduced;
  if (HAS_GSAP) G.registerPlugin(ST);

  // enum labels that the content overlay cannot translate
  KT.addStrings('en', { 'job.full-time': 'full-time', 'job.part-time': 'part-time', 'job.co-founder': 'co-founder', 'job.freelance': 'freelance' });
  KT.addStrings('en', { 'cv.open': 'Open CV (PDF) in a new tab', 'role': 'ROLE', 'read.case': 'Read case' });
  KT.addStrings('uk', { 'cv.open': 'Відкрити CV (PDF) у новій вкладці', 'role': 'РОЛЬ', 'read.case': 'Читати кейс' });
  KT.addStrings('uk', { 'job.full-time': 'повна зайнятість', 'job.part-time': 'часткова зайнятість', 'job.co-founder': 'співзасновник', 'job.freelance': 'фриланс' });
  // portrait turnaround: alt suffix per angle, toy angle group label
  KT.addStrings('en', { 'angle.front': 'front view', 'angle.profile': 'profile view', 'angle.back': 'view from behind', 'toy.angles': 'Camera angle' });
  KT.addStrings('uk', { 'angle.front': 'анфас', 'angle.profile': 'у профіль', 'angle.back': 'зі спини', 'toy.angles': 'Ракурс камери' });

  var ANGLES = ['front', 'profile', 'back'];
  // Source for one angle of the portrait; missing angle → the main portrait.
  function angleSrc(id) {
    var p = SITE.person || {}, a = p.portraitAngles || {};
    return a[id] || p.portrait || '';
  }
  function angleAlt(id) {
    return KT.t('portrait', null, { name: KT.plain((SITE.person || {}).name || 'KT') }) + ', ' + KT.t('angle.' + id);
  }

  var fitters = [];     // run after fonts load and on resize
  var motions = [];     // ScrollTrigger setups, run once after first fit

  function safe(name, fn) {
    try { fn(); } catch (e) { if (w.console) console.warn('[KT] ' + name + ' skipped:', e); }
  }
  function sec(id) { return d.getElementById(id); }
  function drop(id) { var s = sec(id); if (s) s.remove(); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function secHead(label, title, id, intro) {
    var head = h('header', { class: 'sec-head' });
    if (label) head.appendChild(h('p', { class: 'label sec-head__label', html: fmt(label), 'data-reveal': 'fade' }));
    if (title) head.appendChild(h('h2', { class: 't-display t-l sec-head__title', id: id, html: fmt(title), 'data-reveal': 'lines' }));
    if (intro) head.appendChild(h('p', { class: 't-body sec-head__intro', html: fmt(intro), 'data-reveal': 'up' }));
    return head;
  }

  /* ================================================================ HERO */
  var hero = { lines: [], chars: [], circle: null, arrow: null, note: null, introDone: false };
  var W_BASE = 800, W_MIN = 300, W_RADIUS = 260;

  function renderHero() {
    var el = sec('top'), H = SITE.hero || {}, p = SITE.person || {}, meta = SITE.meta || {};
    if (!el) return;
    var meta1 = (p.short || 'KT') + ' — ' + KT.t('portfolio') + ' ' + (meta.year || '') + ' / ' + KT.t('roll') + ' 01';
    var metaRow = h('div', { class: 'hero__meta' },
      h('span', { class: 'label label--fg hero__m', text: meta1 }),
      p.location ? h('span', { class: 'label hero__m', html: fmt(p.location) }) : null,
      h('span', { class: 'label hero__m', text: KT.t('frame') + ' 00' })
    );

    var lines = (H.titleLines || []).map(KT.plain);
    // The name. >=768px: the lines sit on one row; phones: stacked. Either way
    // fitHero sizes them together to the full width. (The outline "ghost" of
    // the old title is gone: the portrait no longer overlaps the name.)
    var title = h('h1', { class: 'hero__title t-display', id: 'hero-title', 'aria-label': lines.join(' ') });
    var mkLine = function (t, store) {
      var inner = h('span', { class: 'fit__inner hero__text' });
      t.split('').forEach(function (ch) {
        if (ch === ' ') { inner.appendChild(d.createTextNode(' ')); return; }
        var s = h('span', { class: 'hero__ch', text: ch });
        inner.appendChild(s);
        store.push(s);
      });
      var line = h('span', { class: 'hero__line fit', 'aria-hidden': 'true', style: { '--len': Math.max(4, t.length) } },
        h('span', { class: 'hero__mask' }, h('span', { class: 'hero__rise' }, inner)));
      return { line: line, inner: inner };
    };
    lines.forEach(function (t, i) {
      if (i) title.appendChild(d.createTextNode(' '));
      var real = [];
      var a = mkLine(t, real);
      title.appendChild(a.line);
      hero.lines.push({ line: a.line, inner: a.inner });
      real.forEach(function (s) { hero.chars.push({ el: s, w: W_BASE, x: 0, y: 0 }); });
    });

    // portrait frame
    var shot = h('div', { class: 'hero__shot has-pencil' });
    var edge = h('div', { class: 'hero__edge', 'aria-hidden': 'true' },
      h('span', { html: '17A ' + KT.icon('tri') }),
      h('span', { text: (p.short || 'KT') + ' 400' })
    );
    var take0 = (H.takes || [])[0] || {};
    var fig = KT.media(
      { type: 'image', src: angleSrc('front'), alt: angleAlt('front'), ratio: '3/4', slot: 'Portrait', spec: '3:4' },
      { eager: true, className: 'hero__frame', caption: take0.caption || H.frameCaption || '' }
    );
    hero.img = fig.mediaEl;
    hero.photo = fig.querySelector('.frame__media');
    hero.imgs = hero.img ? [hero.img] : [];
    buildTurnaround(fig);
    // No pencil circle, arrow or handwritten notes on the hero portrait (removed at Klim's request).
    hero.circle = null; hero.arrow = null; hero.note = null;
    var tagline = null;
    shot.append(edge, fig);

    // foot: role, level, one-liner, CTAs (See the work -> CV -> copy email)
    var actions = h('div', { class: 'hero__actions' },
      h('a', { class: 'btn btn--solid hero__cta', href: '#work', html: esc(KT.plain(H.ctaWork || KT.t('selected.work'))) + ' ' + KT.icon('arrow-down') }),
      p.cv ? h('a', { class: 'btn hero__cv', href: p.cv, target: '_blank', rel: 'noopener', 'aria-label': KT.t('cv.open'), html: esc(KT.plain(H.ctaCv || KT.t('cv'))) + ' <span class="hero__cv-ext">PDF</span>' + KT.icon('arrow-ne') }) : null
    );
    if (p.email) {
      var copyBtn = h('button', {
        class: 'btn hero__copy', type: 'button', 'data-cursor': 'COPY',
        'aria-label': KT.t('copy.email', null, { email: p.email }),
        html: '<span class="hero__copy-mail">' + esc(p.email) + '</span><span class="hero__copy-state" data-copy-label>' + esc(KT.t('copy')) + '</span>' + KT.icon('copy')
      });
      copyBtn.addEventListener('click', function () { KT.copy(p.email, copyBtn); });
      actions.appendChild(copyBtn);
    }
    var level = null;
    if (H.level) {
      level = h('p', { class: 'label label--fg hero__level' });
      KT.plain(H.level).split(/\s+·\s+/).forEach(function (part, i, all) {
        level.appendChild(h('span', { class: 'hero__lv' + (i === all.length - 1 ? ' hero__lv--on' : ''), text: part.replace(/-/g, '‑') })); // GEN-AI never breaks
        if (i < all.length - 1) level.appendChild(h('span', { class: 'hero__sep', 'aria-hidden': 'true', text: ' · ' }));
      });
    }
    var foot = h('div', { class: 'hero__foot' },
      H.role ? h('p', { class: 't-display t-sentence hero__role', html: fmt(H.role) }) : null,
      level,
      H.sub ? h('p', { class: 't-body hero__sub', html: fmt(H.sub) }) : null,
      actions
    );

    el.append(metaRow, h('div', { class: 'hero__stage' }, title, shot, foot, tagline));

    fitters.push(fitHero);
    if (ANIM) {
      // pre-intro state, set in the same task as render: no flash
      G.set($$('.hero__rise', el), { yPercent: 112 });
      G.set($$('.hero__m', el), { yPercent: 100, opacity: 0 });
      G.set(heroIntroBlocks(el), { opacity: 0, y: 18 });
      if (hero.imgs.length) G.set(hero.imgs, { filter: 'brightness(2.4) contrast(.3) blur(12px)', scale: 1.06 });
      if (hero.note) G.set(hero.note, { opacity: 0, scale: .4, rotate: -16 });
      if (tagline) G.set(tagline, { opacity: 0, y: 18 });
      G.set($$('.grid-overlay span'), { scaleY: 0 });
    }
    motions.push(heroMotion);
  }

  /* ---- turnaround: front / profile (mirrored for "left") / back ----
     Three stacked <img> in the same frame, exactly one visible: a swap is a
     hard cut (class toggle), never a crossfade. Inputs:
       · fine pointer, no reduced motion: he turns toward the cursor
       · scroll (any device, no reduced motion): he turns his back once the
         portrait leaves the top of the viewport ("back to work")
       · touch or reduced motion: a tap/click cycles front → profile → back */
  function buildTurnaround(fig) {
    var front = hero.img, box = hero.photo, H = SITE.hero || {};
    if (!front || !box) return;
    if (angleSrc('profile') === angleSrc('front') && angleSrc('back') === angleSrc('front')) return; // one photo: nothing to turn
    var imgs = { front: front };
    front.setAttribute('data-angle', 'front');
    ['profile', 'back'].forEach(function (id) {
      var im = h('img', { class: 'is-off', src: angleSrc(id), alt: angleAlt(id), decoding: 'async', loading: 'eager', fetchpriority: 'low', 'data-angle': id });
      box.appendChild(im);
      imgs[id] = im;
      hero.imgs.push(im);
    });
    // decode up front so the first cut to each angle is instant
    hero.imgs.forEach(function (im) { if (im.decode) im.decode().catch(function () {}); });

    var takes = {};
    (H.takes || []).forEach(function (t) { if (t && t.angle) takes[t.angle] = t; });
    var capTxt = fig.querySelector('.frame__txt');
    var cur = 'front', curFlip = false;
    function show(id, flip) {
      flip = id === 'profile' && !!flip;
      if (id === cur && flip === curFlip) return;
      ANGLES.forEach(function (k) { imgs[k].classList.toggle('is-off', k !== id); });
      imgs.profile.classList.toggle('is-flip', flip);
      var t = takes[id] || {}, c = (flip && t.flippedCaption) || t.caption || (id === 'front' ? H.frameCaption : '');
      if (capTxt && c) capTxt.innerHTML = KT.fmt(c);
      cur = id; curFlip = flip;
      box.setAttribute('data-angle', id + (flip ? '-flip' : ''));
      if (!KT.reduced) { // one-frame contact-sheet flash
        box.classList.add('is-cut');
        requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.remove('is-cut'); }); });
      }
    }

    var pointerMode = KT.fine && !KT.reduced;
    var st = { side: 0, tap: 0, back: false }; // side: -1 left (flipped), 0 front, 1 right
    function resolve() {
      if (st.back) return show('back');
      if (!pointerMode) return show(ANGLES[st.tap]);
      show(st.side ? 'profile' : 'front', st.side < 0);
    }

    // pointer: split left / right of the portrait, with hysteresis
    var lx = null, praf = null;
    function evalPointer() {
      praf = null;
      var side = 0;
      if (lx != null) {
        var r = box.getBoundingClientRect(), wd = r.width || 1;
        var enter = Math.max(32, wd * .18), stay = Math.max(8, wd * .05);
        side = st.side;
        if (lx > r.right + enter) side = 1;
        else if (lx < r.left - enter) side = -1;
        else if (side === 1 && lx < r.right + stay) side = 0;
        else if (side === -1 && lx > r.left - stay) side = 0;
      }
      if (side !== st.side) { st.side = side; resolve(); }
    }
    if (pointerMode) {
      d.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        lx = e.clientX;
        if (!praf) praf = requestAnimationFrame(evalPointer);
      }, { passive: true });
      d.addEventListener('mouseout', function (e) { // pointer left the window → face the camera
        if (e.relatedTarget) return;
        lx = null;
        evalPointer();
      });
    }

    // scroll: back once ~30% of the portrait is above the viewport (returns at ~15%)
    if (!KT.reduced) {
      var sraf = null;
      var evalScroll = function () {
        sraf = null;
        var r = box.getBoundingClientRect(), rh = r.height || 1;
        var b = st.back ? r.top < -rh * .15 : r.top < -rh * .3;
        if (b !== st.back) { st.back = b; resolve(); }
        if (pointerMode && lx != null) evalPointer(); // portrait moved under a still cursor
      };
      w.addEventListener('scroll', function () { if (!sraf) sraf = requestAnimationFrame(evalScroll); }, { passive: true });
      w.addEventListener('load', evalScroll); // restored scroll position on reload
    }

    // tap / click: cycle the angles (user-initiated, so allowed with reduced motion)
    if (!pointerMode) {
      fig.classList.add('is-turnable');
      fig.addEventListener('click', function () {
        st.tap = (st.tap + 1) % ANGLES.length;
        resolve();
      });
    }
  }

  function heroIntroBlocks(el) {
    var f = $('.hero__foot', el);
    return (f ? [].slice.call(f.children) : []).concat([$('.hero__edge', el), $('.hero__frame .frame__cap', el), $('.hero__tagline', el)]).filter(Boolean);
  }

  // Fit the name to the full width at the base weight (proximity weights only
  // ever make letters lighter, so the fitted name can never overflow). All
  // lines share one size: on one row (>=768) their widths plus the word gap
  // fill the width; stacked (phones) the longest line does.
  function fitHero() {
    var title = $('.hero__title', sec('top'));
    if (!title || !hero.lines.length) return;
    hero.chars.forEach(function (c) { c.el.style.fontWeight = ''; });
    var avail = title.clientWidth;
    title.classList.add('is-measuring');
    hero.lines.forEach(function (o) { o.line.style.fontSize = '100px'; });
    var widths = hero.lines.map(function (o) { return o.inner.getBoundingClientRect().width; });
    var row = getComputedStyle(title).flexDirection === 'row';
    var gap = row && hero.lines[1] ? parseFloat(getComputedStyle(hero.lines[1].line).marginLeft) || 0 : 0;
    title.classList.remove('is-measuring');
    var need = row ? widths.reduce(function (a, b) { return a + b; }, 0) + gap * (hero.lines.length - 1) : Math.max.apply(null, widths);
    if (!need || !avail) return;
    var fs = Math.max(12, 100 * avail / need);
    hero.lines.forEach(function (o) { o.line.style.fontSize = fs.toFixed(2) + 'px'; });
    hero.chars.forEach(applyWeight);
    var first = hero.lines[0];
    if (first) sec('top').style.setProperty('--l1', first.line.offsetHeight + 'px');
  }

  function applyWeight(c) {
    var v = Math.round(c.w) >= W_BASE - 1 ? '' : String(Math.round(c.w));
    c.el.style.fontWeight = v;
  }

  // Failsafe: force every intro element to its final visible state.
  function finishIntro() {
    if (hero.introDone) return;
    hero.introDone = true;
    var el = sec('top');
    if (hero.tl) { try { hero.tl.progress(1); } catch (e) { /* fall through */ } }
    if (el) {
      $$('.hero__rise, .hero__m', el).concat(heroIntroBlocks(el), $$('.grid-overlay span'), hero.imgs.concat([hero.note]).filter(Boolean))
        .forEach(function (n) { n.style.transform = ''; n.style.opacity = ''; n.style.filter = ''; n.style.visibility = ''; });
    }
    if (hero.note) hero.note.style.opacity = 1;
    if (hero.circle) hero.circle.draw(0);
    if (hero.arrow) hero.arrow.draw(0);
  }

  function heroMotion() {
    var el = sec('top');
    if (!el) return;
    // Intro choreography (~1.6s)
    if (ANIM && !hero.introDone) {
      var tl = hero.tl = G.timeline({ defaults: { ease: 'expo.out' }, onComplete: function () { hero.introDone = true; } });
      tl.to($$('.grid-overlay span'), { scaleY: 1, duration: .7, stagger: .025, ease: 'power3.inOut' }, 0)
        .to($$('.hero__m', el), { yPercent: 0, opacity: 1, duration: .6, stagger: .06 }, .1)
        .to($$('.hero__rise', el), { yPercent: 0, duration: 1, stagger: .12 }, .2);
      if (hero.imgs.length) tl.to(hero.imgs, { filter: 'brightness(1) contrast(1) blur(0px)', scale: 1, duration: 1.05, ease: 'power2.out', clearProps: 'filter' }, .45);
      tl.to(heroIntroBlocks(el), { opacity: 1, y: 0, duration: .7, stagger: .06 }, .7)
        .add(function () { if (hero.circle) hero.circle.draw(); }, .9)
        .add(function () { if (hero.arrow) hero.arrow.draw(); }, 1.3);
      if (hero.note) tl.to(hero.note, { opacity: 1, scale: 1, rotate: -6, duration: .55, ease: 'back.out(2.6)' }, 1.4);
    } else {
      finishIntro();
    }
    if (ANIM) {
      // scroll: the name compresses, the portrait drifts
      G.to($('.hero__title', el), {
        scaleY: .88, transformOrigin: '50% 0%', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true }
      });
      G.to($('.hero__shot', el), {
        yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    // Kinetic weight: letters near the pointer get lighter (fine pointers only)
    if (!KT.fine || KT.reduced || !hero.chars.length) return;
    var title = $('.hero__title', el);
    var raf = null, active = false, px = 0, py = 0, measuredAt = 0;
    function measure() {
      var tr = title.getBoundingClientRect();
      hero.chars.forEach(function (c) {
        var r = c.el.getBoundingClientRect();
        c.x = r.left + r.width / 2 - tr.left;
        c.y = r.top + r.height / 2 - tr.top;
      });
      measuredAt = performance.now();
    }
    function loop() {
      raf = null;
      var moving = false;
      hero.chars.forEach(function (c) {
        var target = W_BASE;
        if (active) {
          var dd = Math.hypot(c.x - px, c.y - py), f = clamp(1 - dd / W_RADIUS, 0, 1);
          f = f * f * (3 - 2 * f); // smoothstep falloff
          target = W_BASE - (W_BASE - W_MIN) * f;
        }
        var nw = c.w + (target - c.w) * .18;
        if (Math.abs(target - nw) < .6) nw = target; else moving = true;
        if (Math.round(nw) !== Math.round(c.w)) { c.w = nw; applyWeight(c); } else c.w = nw;
      });
      if (moving) raf = requestAnimationFrame(loop);
    }
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || w.innerWidth < 768) return;
      if (!active || performance.now() - measuredAt > 250) measure();
      var tr = title.getBoundingClientRect();
      px = e.clientX - tr.left; py = e.clientY - tr.top;
      active = true;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    el.addEventListener('pointerleave', function () {
      active = false;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  /* =============================================================== STATS */
  function renderStats() {
    var el = sec('stats'), list = SITE.stats || [];
    if (!el) return;
    if (!list.length) return drop('stats');
    var ol = h('ol', { class: 'stats__row' });
    list.forEach(function (s, i) {
      var val = h('span', { class: 'stat__val', text: s.value || '' });
      var fig = h('span', { class: 'stat__fig fit__inner' + (i === 0 ? ' has-pencil' : '') }, val);
      if (i === 0) fig.appendChild(KT.pencil('underline', { variant: 1, delay: 900 }));
      var li = h('li', { class: 'stat', 'data-reveal': 'up', 'data-reveal-delay': i * 90 },
        h('span', { class: 'stat__no label', 'aria-hidden': 'true', text: s.frame || KT.pad(i + 1) }),
        h('p', { class: 'stat__num t-display fit' }, fig),
        s.label ? h('p', { class: 'stat__label', html: fmt(s.label) }) : null
      );
      ol.appendChild(li);
      statFits.push({ el: li.querySelector('.stat__num'), val: val, value: s.value || '' });
      if (ANIM && typeof s.num === 'number' && isFinite(s.num)) {
        var dec = s.num % 1 ? 1 : 0;
        var show = function (n) {
          n = dec ? n : Math.round(n);
          var str = n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: dec, minimumFractionDigits: dec }) : n.toFixed(dec);
          val.textContent = (s.prefix || '') + str + (s.suffix || '');
        };
        // ranges like "30–50" count up from their lower bound
        var from = /\d/.test(s.prefix || '') ? (parseFloat(String(s.prefix).replace(/[^\d.]/g, '')) || 0) : 0;
        if (from >= s.num) from = 0;
        show(from);
        KT.inView(li, function () {
          var o = { v: from };
          var tw = G.to(o, {
            v: s.num, duration: 1.6, delay: .15 + i * .08, ease: 'power3.out',
            // snap to the exact final string near the end (no '4,999+')
            onUpdate: function () { if (tw.progress() > .97) val.textContent = s.value || ''; else show(o.v); },
            onComplete: function () { val.textContent = s.value || ''; }
          });
        }, { threshold: .4 });
      }
    });
    el.appendChild(ol);
    // shrink-to-fit the numbers (measured with the final value string)
    fitters.push(function () {
      statFits.forEach(function (f) {
        var cur = f.val.textContent;
        f.val.textContent = f.value;
        shrinkFit(f.el);
        f.val.textContent = cur;
      });
    });
  }
  var statFits = [];

  // Fit an element's .fit__inner to its width, but never above its CSS size.
  function shrinkFit(el) {
    if (!el) return;
    el.style.fontSize = '';
    var max = parseFloat(getComputedStyle(el).fontSize) || 0;
    if (max) KT.fit(el, { max: max, min: 10 });
  }

  /* =============================================================== ABOUT */
  function renderAbout() {
    var el = sec('about'), A = SITE.about;
    if (!el) return;
    if (!A) return drop('about');
    var main = h('div', { class: 'about__main' });
    if (A.label) main.appendChild(h('p', { class: 'label sec-head__label', html: fmt(A.label), 'data-reveal': 'fade' }));
    var st = h('h2', { class: 'about__statement t-display t-sentence', id: 'about-title' });
    // '*word*' marks the circled pick; asterisks are stripped. No marker → no circle.
    KT.plain(A.statement || '').split(/(\*[^*]+\*)/).forEach(function (part) {
      if (!part) return;
      if (/^\*[^*]+\*$/.test(part)) {
        var pick = h('span', { class: 'w w--pick has-pencil', text: part.slice(1, -1) });
        pick.appendChild(KT.pencil('circle', { variant: 1, className: 'about__circle', delay: 200 }));
        st.appendChild(pick);
        return;
      }
      part.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) st.appendChild(d.createTextNode(' '));
        else st.appendChild(h('span', { class: 'w', text: tok }));
      });
    });
    main.appendChild(st);
    if (A.body && A.body.length) {
      main.appendChild(h('div', { class: 'about__body' }, A.body.map(function (p, i) {
        return h('p', { class: 't-body', html: fmt(p), 'data-reveal': 'up', 'data-reveal-delay': i * 80 });
      })));
    }
    var grid = h('div', { class: 'about__grid grid' }, main);
    if (A.toy && A.toy.modes && A.toy.modes.length) grid.appendChild(renderToy(A.toy));
    el.appendChild(grid);

    if (ANIM) motions.push(function () {
      var ws = $$('.w', st);
      G.fromTo(ws, { opacity: .15 }, {
        opacity: 1, ease: 'none', stagger: .12,
        scrollTrigger: { trigger: st, start: 'top 82%', end: 'bottom 42%', scrub: .4 }
      });
    });
  }

  /* -------------------------------------------------- toy: direct the shot */
  function renderToy(toy) {
    var p = SITE.person || {}, modes0;
    var aside = h('aside', { class: 'about__toy toy', 'aria-labelledby': 'toy-title' });
    var head = h('div', { class: 'toy__head' },
      h('h3', { class: 'label label--fg toy__title', id: 'toy-title', html: fmt(toy.title || '') }),
      toy.hint ? h('p', { class: 'hand toy__hint', html: fmt(toy.hint) }) : null
    );
    var pname = KT.plain(p.name || 'KT');
    modes0 = toy.modes[0] || {};
    // ANGLE control: which photo of the turnaround the canvas renders
    var angles = (toy.angles || []).filter(function (a) { return a && ANGLES.indexOf(a.id) > -1; });
    var angle0 = angles.filter(function (a) { return a.id === toy.angleDefault; })[0] || angles[0] || { id: 'front' };
    var canvas = h('canvas', { class: 'toy__canvas', role: 'img', 'aria-label': KT.t('portrait', null, { name: pname }) });
    var img = h('img', { class: 'toy__img', alt: angleAlt(angle0.id), hidden: true, decoding: 'async' });
    var stage = h('div', { class: 'frame__media toy__stage' }, canvas, img);
    var cap = h('figcaption', { class: 'frame__cap' },
      h('span', { class: 'frame__no', text: '17A' }),
      h('span', { class: 'frame__txt toy__mode-label', text: '' })
    );
    var fig = h('figure', { class: 'frame toy__frame', style: { '--ratio': '3 / 4' } }, stage, cap);
    var chips = h('div', { class: 'toy__modes', role: 'group', 'aria-label': KT.t('toy.modes') });
    var angleBar = null;
    if (angles.length > 1) {
      angleBar = h('div', { class: 'toy__angles', role: 'group', 'aria-label': KT.t('toy.angles') },
        h('span', { class: 'label toy__angles-label', 'aria-hidden': 'true', html: fmt(toy.angleLabel || 'ANGLE') }),
        h('div', { class: 'toy__seg' }, angles.map(function (a) {
          var b = h('button', { class: 'toy__seg-btn', type: 'button', 'aria-pressed': a.id === angle0.id ? 'true' : 'false', 'data-angle': a.id, html: fmt(a.label || a.id) });
          b.addEventListener('click', function () { selectAngle(a); });
          return b;
        }))
      );
    }
    var typed = h('span', { class: 'toy__typed', 'aria-hidden': 'true' });
    var srp = h('span', { class: 'sr-only', 'aria-live': 'polite' });
    var prompt = h('p', { class: 'toy__prompt t-mono' },
      h('span', { class: 'toy__ps', 'aria-hidden': 'true', text: '>' }), typed,
      h('span', { class: 'toy__caret', 'aria-hidden': 'true' }), srp);
    aside.append(head, fig, chips, angleBar || '', prompt);

    var modes = toy.modes;
    var state = { mode: null, angle: angle0, images: {}, W: 0, H: 0, dpr: 1, lum: null, src: null, buf: null, tainted: false, ready: false, anim: null, typeT: null, loadId: 0 };
    var ctx = canvas.getContext('2d');

    modes.forEach(function (m, i) {
      var b = h('button', { class: 'chip', type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false', 'data-mode': m.id, html: fmt(m.label || m.id) });
      b.addEventListener('click', function () { select(m, true); });
      chips.appendChild(b);
    });

    function curMode() { return modes.filter(function (m) { return m.id === state.mode; })[0] || modes0; }
    function promptText() {
      var t = KT.plain(curMode().prompt || '');
      return angles.length ? t + ' --angle ' + state.angle.id : t;
    }
    // caption + accessible name for the current mode × angle
    function labelShot() {
      var m = curMode(), ml = KT.plain(m.label || m.id || '');
      cap.lastChild.textContent = KT.t('toy.mode') + ' · ' + ml.toUpperCase() + (angles.length ? ' · ' + KT.plain(state.angle.label || state.angle.id).toUpperCase() : '');
      canvas.setAttribute('aria-label', KT.t('toy.render', null, { name: pname, mode: ml.toLowerCase() }) + ', ' + KT.t('angle.' + state.angle.id));
      img.alt = angleAlt(state.angle.id);
    }

    function selectAngle(a) {
      if (state.angle.id === a.id) return;
      state.angle = a;
      if (angleBar) $$('.toy__seg-btn', angleBar).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.angle === a.id ? 'true' : 'false'); });
      labelShot();
      typeOut(promptText());
      if (state.booted) loadAngle(a.id, true);
    }

    // load (once) and switch the canvas source; stale loads are ignored
    function loadAngle(id, animate) {
      var my = ++state.loadId, src = angleSrc(id);
      if (!src) return;
      img.src = src; // file:// fallback shows the <img>
      var use = function (image) {
        if (my !== state.loadId) return;
        state.image = image;
        if (setup()) { state.ready = true; paint(animate); }
      };
      var cached = state.images[id];
      if (cached && cached.complete && cached.naturalWidth) return use(cached);
      var image = cached || (state.images[id] = new Image());
      image.decoding = 'async';
      image.onload = function () { use(image); };
      if (!cached) image.src = src;
    }

    function typeOut(text) {
      clearTimeout(state.typeT);
      text = KT.plain(text || '');
      srp.textContent = text;
      if (KT.reduced) { typed.textContent = text; return; }
      var i = 0;
      typed.textContent = '';
      (function tick() {
        typed.textContent = text.slice(0, ++i);
        if (i < text.length) state.typeT = setTimeout(tick, 16 + Math.random() * 22);
      })();
    }

    function select(m, animate) {
      if (state.mode === m.id && animate) return;
      state.mode = m.id;
      $$('.chip', chips).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.mode === m.id ? 'true' : 'false'); });
      labelShot();
      typeOut(promptText());
      paint(animate);
    }

    /* ---- pixel work ---- */
    var PAPER = [237, 235, 228], INK = [14, 14, 12], BLUE = [31, 53, 255];
    function setup() {
      var r = stage.getBoundingClientRect();
      if (!r.width) return false;
      state.dpr = Math.min(w.devicePixelRatio || 1, 2);
      state.W = Math.round(r.width * state.dpr);
      state.H = Math.round(r.height * state.dpr);
      // resizing clears the canvas: skip it when only the source photo changes,
      // so an angle switch wipes the new render over the old one
      if (canvas.width !== state.W || canvas.height !== state.H) { canvas.width = state.W; canvas.height = state.H; }
      var src = state.src = d.createElement('canvas');
      src.width = state.W; src.height = state.H;
      var sx = src.getContext('2d');
      // cover-crop
      var iw = state.image.naturalWidth, ih = state.image.naturalHeight;
      var s = Math.max(state.W / iw, state.H / ih);
      var dw = iw * s, dh = ih * s;
      sx.drawImage(state.image, (state.W - dw) / 2, (state.H - dh) / 2, dw, dh);
      state.buf = d.createElement('canvas');
      state.buf.width = state.W; state.buf.height = state.H;
      try {
        var data = sx.getImageData(0, 0, state.W, state.H).data;
        var lum = new Float32Array(state.W * state.H);
        for (var i = 0, j = 0; i < lum.length; i++, j += 4) {
          var L = (.2126 * data[j] + .7152 * data[j + 1] + .0722 * data[j + 2]) / 255;
          lum[i] = clamp((L - .5) * 1.15 + .5, 0, 1);
        }
        state.lum = lum;
        state.tainted = false;
      } catch (e) {
        state.tainted = true;
      }
      return true;
    }

    var R = {
      raw: function (c) { c.drawImage(state.src, 0, 0); },
      halftone: function (c) {
        var W = state.W, H = state.H, lum = state.lum, cell = 6 * state.dpr;
        c.fillStyle = 'rgb(' + PAPER + ')'; c.fillRect(0, 0, W, H);
        c.fillStyle = 'rgb(' + INK + ')';
        var cs = Math.SQRT1_2, diag = Math.hypot(W, H) / 2 + cell;
        c.beginPath();
        for (var v = -diag; v < diag; v += cell) {
          for (var u = -diag; u < diag; u += cell) {
            var x = (u - v) * cs + W / 2, y = (u + v) * cs + H / 2;
            if (x < 0 || y < 0 || x >= W || y >= H) continue;
            var L = lum[(y | 0) * W + (x | 0)];
            var rad = cell * .5 * Math.sqrt(1 - L) * 1.22;
            if (rad < .35) continue;
            c.moveTo(x + rad, y);
            c.arc(x, y, rad, 0, Math.PI * 2);
          }
        }
        c.fill();
      },
      ascii: function (c) {
        var W = state.W, H = state.H, lum = state.lum, ramp = ' .:-=+*#%@';
        var fs = 9 * state.dpr, cw = fs * .62, ch = fs * 1.15;
        c.fillStyle = 'rgb(' + PAPER + ')'; c.fillRect(0, 0, W, H);
        c.fillStyle = 'rgb(' + INK + ')';
        c.font = '500 ' + fs + 'px "JetBrains Mono", ui-monospace, monospace';
        c.textBaseline = 'top';
        for (var y = 0; y < H; y += ch) {
          for (var x = 0; x < W; x += cw) {
            var L = lum[(Math.min(H - 1, y + ch / 2) | 0) * W + (Math.min(W - 1, x + cw / 2) | 0)];
            var k = Math.round((1 - L) * (ramp.length - 1));
            if (k > 0) c.fillText(ramp[k], x, y);
          }
        }
      },
      blueprint: function (c) {
        var W = state.W, H = state.H, lum = state.lum;
        var img = c.createImageData(W, H), o = img.data;
        for (var i = 0, j = 0; i < lum.length; i++, j += 4) {
          var t = lum[i];
          o[j] = BLUE[0] + (PAPER[0] - BLUE[0]) * t;
          o[j + 1] = BLUE[1] + (PAPER[1] - BLUE[1]) * t;
          o[j + 2] = BLUE[2] + (PAPER[2] - BLUE[2]) * t;
          o[j + 3] = 255;
        }
        c.putImageData(img, 0, 0);
        var step = 16 * state.dpr;
        c.lineWidth = Math.max(1, state.dpr * .75);
        [['rgba(237,235,228,.32)', 0], ['rgba(31,53,255,.16)', 0]].forEach(function (s) {
          c.strokeStyle = s[0];
          c.beginPath();
          for (var x = step; x < W; x += step) { c.moveTo(x + .5, 0); c.lineTo(x + .5, H); }
          for (var y = step; y < H; y += step) { c.moveTo(0, y + .5); c.lineTo(W, y + .5); }
          c.stroke();
        });
      },
      threshold: function (c) {
        var W = state.W, H = state.H, lum = state.lum, dpr = state.dpr;
        var B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
        var img = c.createImageData(W, H), o = img.data;
        for (var y = 0; y < H; y++) {
          var by = ((y / dpr) | 0) & 3;
          for (var x = 0; x < W; x++) {
            var i = y * W + x, j = i * 4;
            var bx = ((x / dpr) | 0) & 3;
            var v = lum[i] + (B[by * 4 + bx] / 16 - .5) * .24;
            var col = v > .5 ? PAPER : INK;
            o[j] = col[0]; o[j + 1] = col[1]; o[j + 2] = col[2]; o[j + 3] = 255;
          }
        }
        c.putImageData(img, 0, 0);
      },
      pixel: function (c) {
        var W = state.W, H = state.H, lum = state.lum, b = Math.round(14 * state.dpr), levels = 6;
        for (var y = 0; y < H; y += b) {
          for (var x = 0; x < W; x += b) {
            var s = 0, n = 0;
            for (var yy = y + b * .2; yy < Math.min(H, y + b); yy += b * .3) {
              for (var xx = x + b * .2; xx < Math.min(W, x + b); xx += b * .3) { s += lum[(yy | 0) * W + (xx | 0)]; n++; }
            }
            var L = n ? s / n : 1;
            L = Math.round(L * (levels - 1)) / (levels - 1);
            var v = Math.round(INK[0] + (PAPER[0] - INK[0]) * L);
            c.fillStyle = 'rgb(' + v + ',' + v + ',' + (v - 4) + ')';
            c.fillRect(x, y, b, b);
          }
        }
      }
    };

    function paint(animate) {
      if (!state.ready) return;
      if (state.tainted) {
        // file:// or cross-origin: CSS-filter approximation on an <img>
        canvas.hidden = true;
        img.hidden = false;
        stage.dataset.mode = state.mode;
        return;
      }
      var fn = R[state.mode] || R.raw;
      var bc = state.buf.getContext('2d');
      bc.clearRect(0, 0, state.W, state.H);
      try { fn(bc); } catch (e) { R.raw(bc); }
      if (state.anim) cancelAnimationFrame(state.anim);
      if (!animate || KT.reduced) { ctx.drawImage(state.buf, 0, 0); return; }
      var t0 = performance.now(), dur = 560, W = state.W, H = state.H, line = 2 * state.dpr;
      (function step(now) {
        var t = clamp((now - t0) / dur, 0, 1);
        var e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        var y = Math.round(e * H);
        if (y > 0) ctx.drawImage(state.buf, 0, 0, W, y, 0, 0, W, y);
        if (t < 1) {
          ctx.fillStyle = 'rgb(' + BLUE + ')';
          ctx.fillRect(0, y, W, line);
          state.anim = requestAnimationFrame(step);
        } else {
          ctx.drawImage(state.buf, 0, 0);
          state.anim = null;
        }
      })(t0);
    }

    function bootToy() {
      if (!angleSrc(state.angle.id)) return;
      state.booted = true;
      loadAngle(state.angle.id, false);
      w.addEventListener('resize', KT.debounce(function () {
        if (!state.image) return;
        if (!state.ready) { if (setup()) { state.ready = true; paint(false); } return; }
        var r = stage.getBoundingClientRect();
        if (Math.round(r.width * state.dpr) === state.W) return;
        if (setup()) paint(false);
      }, 200));
    }

    state.mode = modes[0].id;
    labelShot();
    srp.textContent = promptText();
    typed.textContent = promptText();
    // render when the toy approaches the viewport (canvas work is one-off per mode)
    KT.inView(aside, bootToy, { threshold: 0, rootMargin: '400px 0px' });
    return aside;
  }

  /* ================================================================ WORK */
  var work = { tracks: [], discs: [] };

  function discEl(side) {
    var id = 'disc-' + esc(side.id || 'x');
    var ring = esc(((side.name || 'SIDE') + ' · ' + ((SITE.person || {}).short || 'KT') + ' · 33 RPM · ' + (side.title || '') + ' · ').toUpperCase());
    var grooves = '';
    [92, 86, 80, 74, 68, 61, 54, 47].forEach(function (r) { grooves += '<circle class="disc__groove" cx="100" cy="100" r="' + r + '"/>'; });
    var html =
      '<svg class="disc__svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">' +
        '<defs><path id="' + id + '" d="M100 100m-30 0a30 30 0 1 1 60 0a30 30 0 1 1-60 0"/></defs>' +
        '<circle class="disc__vinyl" cx="100" cy="100" r="98"/>' + grooves +
        '<path class="disc__shine" d="M100 12A88 88 0 0 1 176 56"/>' +
        '<path class="disc__shine disc__shine--b" d="M100 188A88 88 0 0 1 24 144"/>' +
        '<circle class="disc__label" cx="100" cy="100" r="40"/>' +
        '<text class="disc__ring"><textPath href="#' + id + '" textLength="184" lengthAdjust="spacing">' + ring + '</textPath></text>' +
        '<text class="disc__side" x="100" y="96" text-anchor="middle">' + esc(side.id || '') + '</text>' +
        '<circle class="disc__hole" cx="100" cy="100" r="3.2"/>' +
      '</svg>';
    var el = h('div', { class: 'disc', html: html });
    work.discs.push({ el: el, svg: el.firstChild, angle: Math.random() * 360, speed: 1, target: 1, visible: false });
    return el;
  }

  function trackEl(c) {
    var a = h('a', { class: 'track', href: 'case.html?id=' + encodeURIComponent(c.id), 'data-case': c.id, 'data-cursor': 'OPEN' });
    var tags = (c.tags && c.tags.length) ? h('span', { class: 'tags track__tags' }, c.tags.slice(0, 3).map(function (t) { return h('span', { class: 'tag', html: fmt(t) }); })) : null;
    // ROLE · role · team · period (cases[id].card)
    var cd = c.card || null, roleLine = null;
    if (cd && (cd.role || cd.team || cd.period)) {
      roleLine = h('span', { class: 'track__role' },
        h('span', { class: 'track__role-k', text: KT.t('role') }),
        h('span', { class: 'track__role-v', html: [cd.role, cd.team, cd.period].filter(Boolean).map(fmt).join('<span class="track__role-sep" aria-hidden="true"> · </span>') }));
    }
    var read = h('span', { class: 'track__read', html: esc(KT.t('read.case')) + ' ' + KT.icon('arrow-right') });
    var cover = c.cover ? KT.media(c.cover, { id: c.track, className: 'track__cover', play: 'auto', controls: false }) : null;
    if (cover) cover.setAttribute('aria-hidden', 'true'); // visual duplicate; the link text names the case
    a.append(
      cover,
      h('span', { class: 'track__no' },
        h('span', { class: 'track__code', text: c.track || '' }),
        c.year && !(cd && cd.period) ? h('span', { class: 'track__year', html: fmt(c.year) }) : null),
      h('span', { class: 'track__main' },
        h('span', { class: 'track__title t-display t-sentence', html: fmt(c.title) }),
        h('span', { class: 'track__client', html: '<b>' + fmt(c.client) + '</b>' + (c.clientNote ? '<span class="track__cnote"> — ' + fmt(c.clientNote) + '</span>' : '') }),
        roleLine,
        c.oneLiner ? h('span', { class: 'track__line', html: fmt(c.oneLiner) }) : null,
        tags,
        read),
      c.result ? h('span', { class: 'track__result' },
        h('span', { class: 'track__value t-display', html: fmt(c.result.value) }),
        h('span', { class: 'track__rlabel', html: fmt(c.result.label) })) : null,
      h('span', { class: 'track__arrow', html: KT.icon('arrow-ne') })
    );
    work.tracks.push(a);
    return h('li', { class: 'tracks__item', 'data-reveal': 'up' }, a);
  }

  function renderWork() {
    var el = sec('work'), W = SITE.work, cases = SITE.cases || {};
    if (!el) return;
    if (!W) return drop('work');
    el.appendChild(h('div', { class: 'work__head' }, secHead(W.label, W.title, 'work-title', W.intro)));
    (W.sides || []).forEach(function (side) {
      var theme = side.theme === 'film' ? 'film' : 'paper';
      var s = h('div', { class: 'side', 'data-theme': theme, 'data-side': side.id || '' });
      // plain title in display type; the metaphor (SIDE A) is the mono caption
      var sname = fmt(side.name || ('SIDE ' + side.id));
      var head = h('header', { class: 'side__head' },
        h('h3', { class: 'side__name t-display fit', 'data-reveal': 'up', html: '<span class="label side__cap">' + sname + ' · 33 RPM</span><span class="fit__inner">' + fmt(side.title || sname) + '</span>' }),
        h('div', { class: 'side__meta', 'data-reveal': 'up' },
          side.note ? h('p', { class: 'hand side__note', html: fmt(side.note) }) : null),
        discEl(side)
      );
      var ol = h('ol', { class: 'tracks', 'aria-label': KT.plain((side.name || '') + ' — ' + (side.title || '')) });
      (side.tracks || []).forEach(function (id) { if (cases[id]) ol.appendChild(trackEl(cases[id])); });
      s.append(head, ol);
      el.appendChild(s);
    });

    fitters.push(function () { $$('.side__name', el).forEach(shrinkFit); });
    initDiscs();
    initPreview();
    motions.push(workFlip);
  }

  function initDiscs() {
    if (KT.reduced || !work.discs.length) return;
    var raf = null, last = 0;
    work.discs.forEach(function (o) {
      KT.inView(o.el, function (on) { o.visible = on; if (on) start(); }, { once: false, threshold: 0 });
    });
    function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    function loop(now) {
      var dt = Math.min(64, now - last) / 1000; last = now;
      var any = false;
      work.discs.forEach(function (o) {
        if (!o.visible) return;
        any = true;
        o.speed += (o.target - o.speed) * .06;
        o.angle = (o.angle + o.speed * 40 * dt) % 360;   // base: 40deg/s
        o.svg.style.transform = 'rotate(' + o.angle.toFixed(2) + 'deg)';
      });
      raf = any ? requestAnimationFrame(loop) : null;
    }
    work.boost = function (on, sideEl) {
      work.discs.forEach(function (o) { o.target = on && (!sideEl || sideEl.contains(o.el)) ? 9 : 1; });
      start();
    };
  }

  function initPreview() {
    if (!KT.fine || KT.reduced || !work.tracks.length) return;
    var cases = SITE.cases || {};
    var pv = h('div', { class: 'preview', 'aria-hidden': 'true' }, h('div', { class: 'preview__inner' }));
    d.body.appendChild(pv);
    var inner = pv.firstChild, cache = {}, cur = null;
    var x = 0, y = 0, tx = 0, ty = 0, rot = 0, raf = null, on = false;
    function loop() {
      x += (tx - x) * .14; y += (ty - y) * .14;
      var vx = tx - x;
      rot += (clamp(vx * .06, -9, 9) - rot) * .12;
      pv.style.transform = 'translate3d(' + (x + 28).toFixed(1) + 'px,' + (y - pv.offsetHeight * .55).toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
      raf = (on || Math.abs(tx - x) > .5) ? requestAnimationFrame(loop) : null;
    }
    function show(id, a) {
      var c = cases[id];
      if (!c || !c.cover) return;
      if (!cache[id]) {
        cache[id] = KT.media(c.cover, { id: c.track, className: 'preview__frame', play: 'none', caption: c.track + ' · ' + KT.plain(c.client || '') });
        inner.appendChild(cache[id]);
      }
      Object.keys(cache).forEach(function (k) {
        var f = cache[k], v = f.mediaEl;
        f.classList.toggle('is-active', k === id);
        if (v && v.tagName === 'VIDEO') { if (k === id) { var pp = v.play(); if (pp && pp.catch) pp.catch(function () {}); } else v.pause(); }
      });
      var th = a.closest('[data-theme]');
      pv.dataset.theme = th ? th.getAttribute('data-theme') : 'paper';
      cur = id;
    }
    work.tracks.forEach(function (a) {
      a.addEventListener('mouseenter', function (e) {
        if (w.innerWidth < 1024) return;
        tx = e.clientX; ty = e.clientY;
        if (!on && !pv.classList.contains('is-on')) { x = tx; y = ty; }
        on = true;
        show(a.dataset.case, a);
        pv.classList.add('is-on');
        if (work.boost) work.boost(true, a.closest('.side'));
        if (!raf) raf = requestAnimationFrame(loop);
      });
      a.addEventListener('mousemove', function (e) {
        tx = e.clientX; ty = e.clientY;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      a.addEventListener('mouseleave', function () {
        on = false;
        pv.classList.remove('is-on');
        if (work.boost) work.boost(false);
        var f = cur && cache[cur];
        if (f && f.mediaEl && f.mediaEl.tagName === 'VIDEO') f.mediaEl.pause();
      });
    });
    w.addEventListener('scroll', function () { if (on) { on = false; pv.classList.remove('is-on'); if (work.boost) work.boost(false); } }, { passive: true });
  }

  // Flip the record: the active side's theme drives the whole section,
  // the page background and the nav.
  function workFlip() {
    var el = sec('work'), sides = $$('.side', el);
    if (!ANIM || !el || sides.length < 2) return;
    sides.forEach(function (s) { s.dataset.sideTheme = s.getAttribute('data-theme'); s.removeAttribute('data-theme'); });
    el.classList.add('is-flippable');
    var flipT = null;
    var setTheme = function (th) {
      if (el.dataset.theme === th && d.body.dataset.theme === th) return;
      // colours + backgrounds move together for one beat
      el.classList.add('is-flipping');
      clearTimeout(flipT);
      flipT = setTimeout(function () { el.classList.remove('is-flipping'); }, 650);
      el.dataset.theme = th;
      d.body.dataset.theme = th;
      if (KT.navUpdate) KT.navUpdate();
    };
    // Film only while a film side's top is above 60% of the viewport and its
    // bottom below 40%; otherwise paper. No dependence on event order.
    var evaluate = function () {
      var vh = w.innerHeight, th = 'paper';
      sides.forEach(function (s) {
        if (s.dataset.sideTheme !== 'film') return;
        var r = s.getBoundingClientRect();
        if (r.top < vh * .6 && r.bottom > vh * .4) th = 'film';
      });
      setTheme(th);
    };
    work.evaluateTheme = evaluate;
    ST.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: evaluate, onRefresh: evaluate, onToggle: evaluate });
    var raf = null;
    var soon = function () { if (!raf) raf = requestAnimationFrame(function () { raf = null; evaluate(); }); };
    w.addEventListener('scroll', soon, { passive: true });
    w.addEventListener('resize', soon);
    w.addEventListener('pageshow', soon);
    w.addEventListener('hashchange', function () { setTimeout(evaluate, 60); });
    w.addEventListener('load', soon);
    evaluate();
    sides.forEach(function (s, i) {
      if (i > 0) {
        var disc = $('.disc__svg', s);
        if (disc) G.fromTo($('.disc', s), { rotateY: 180 }, {
          rotateY: 0, transformPerspective: 900, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: s, start: 'top 55%', toggleActions: 'play none none reverse' }
        });
      }
    });
  }

  /* ============================================================= PROCESS */
  function renderProcess() {
    var el = sec('process'), P = SITE.process;
    if (!el) return;
    if (!P || !P.steps || !P.steps.length) return drop('process');
    el.appendChild(secHead(P.label, P.title, 'process-title', P.intro));
    var NS = 'http://www.w3.org/2000/svg';
    var svg = d.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'graph__wires');
    svg.setAttribute('aria-hidden', 'true');
    var rail = h('div', { class: 'graph__rail', 'aria-hidden': 'true' }, h('span', { class: 'graph__rail-fill' }));
    var ol = h('ol', { class: 'graph__nodes' });
    var heroIdx = P.steps.findIndex(function (s) { return /select/i.test(s.name || ''); });
    if (heroIdx < 0) heroIdx = Math.min(3, P.steps.length - 1);
    var nodes = P.steps.map(function (s, i) {
      var isHero = i === heroIdx;
      var li = h('li', { class: 'node' + (isHero ? ' node--hero has-pencil' : ''), style: { '--i': i } },
        h('span', { class: 'node__port node__port--in', 'aria-hidden': 'true' }),
        h('span', { class: 'node__port node__port--out', 'aria-hidden': 'true' }),
        h('div', { class: 'node__bar' },
          h('span', { class: 'node__no', text: s.n || KT.pad(i + 1) }),
          h('span', { class: 'node__kind label', text: isHero ? KT.t('human') : KT.t('step') })),
        h('h3', { class: 'node__name t-display', html: fmt(s.name) }),
        s.desc ? h('p', { class: 'node__desc', html: fmt(s.desc) }) : null,
        (s.tools && s.tools.length) ? h('ul', { class: 'tags node__tools', 'aria-label': KT.t('tools') }, s.tools.map(function (t) { return h('li', { class: 'tag', html: fmt(t) }); })) : null
      );
      if (isHero) {
        li._pencil = KT.pencil('circle', { variant: 2, auto: !ANIM, className: 'node__circle' });
        li.appendChild(li._pencil);
      }
      ol.appendChild(li);
      return li;
    });
    var graph = h('div', { class: 'graph' }, svg, rail, ol);
    el.appendChild(graph);

    var wires = [], lastP = 0;
    function isRow() { return w.innerWidth >= 1200; }
    function layout() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      wires = [];
      if (!isRow()) { measureRail(); apply(lastP); return; }
      var gr = graph.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + gr.width.toFixed(1) + ' ' + gr.height.toFixed(1));
      for (var i = 0; i < nodes.length - 1; i++) {
        var a = $('.node__port--out', nodes[i]).getBoundingClientRect();
        var b = $('.node__port--in', nodes[i + 1]).getBoundingClientRect();
        var x1 = a.left + a.width / 2 - gr.left, y1 = a.top + a.height / 2 - gr.top;
        var x2 = b.left + b.width / 2 - gr.left, y2 = b.top + b.height / 2 - gr.top;
        var dx = Math.max(28, Math.abs(x2 - x1) * .6);
        var dd = 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'C' + (x1 + dx).toFixed(1) + ' ' + y1.toFixed(1) + ' ' + (x2 - dx).toFixed(1) + ' ' + y2.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
        var bg = d.createElementNS(NS, 'path'); bg.setAttribute('d', dd); bg.setAttribute('class', 'graph__wire-bg');
        var fg = d.createElementNS(NS, 'path'); fg.setAttribute('d', dd); fg.setAttribute('class', 'graph__wire');
        svg.append(bg, fg);
        var len = fg.getTotalLength();
        fg.style.strokeDasharray = len + ' ' + len;
        wires.push({ el: fg, len: len });
      }
      apply(lastP);
    }
    var railFracs = [];
    function measureRail() {
      var H = graph.offsetHeight || 1;
      railFracs = nodes.map(function (n) { return (n.offsetTop + 20) / H; });
    }
    function activate(n, on) {
      if (n.classList.contains('is-active') === on) return;
      n.classList.toggle('is-active', on);
      if (on && n._pencil) n._pencil.draw(250);
    }
    function apply(p) {
      lastP = p;
      if (isRow()) {
        var seg = nodes.length - 1;
        wires.forEach(function (wr, k) {
          var local = clamp(p * seg - k, 0, 1);
          wr.el.style.strokeDashoffset = (wr.len * (1 - local)).toFixed(1);
        });
        nodes.forEach(function (n, j) { activate(n, p > .004 && p * seg >= j - .02); });
      } else {
        rail.firstChild.style.transform = 'scaleY(' + p.toFixed(4) + ')';
        nodes.forEach(function (n, j) { activate(n, p > .004 && p >= railFracs[j] - .01); });
      }
    }

    fitters.push(layout);
    if (!ANIM) {
      // final state: whole graph connected
      lastP = 1;
      motions.push(function () { layout(); apply(1); });
      return;
    }
    motions.push(function () {
      ST.create({
        trigger: graph, start: 'top 72%', end: 'bottom 62%', scrub: .5,
        onUpdate: function (self) { apply(self.progress); },
        onRefresh: function (self) { apply(self.progress); }
      });
    });
  }

  /* =============================================================== SHEET */
  function renderSheet() {
    var el = sec('sheet'), Sh = SITE.sheet;
    if (!el) return;
    if (!Sh || Sh.hidden || !Sh.frames || !Sh.frames.length) return drop('sheet');
    el.appendChild(secHead(Sh.label, Sh.title, 'sheet-title', null));
    var frames = Sh.frames;
    var filters = (Sh.filters && Sh.filters.length) ? Sh.filters : ['all'];
    var bar = h('div', { class: 'sheet__bar' });
    var chips = h('div', { class: 'sheet__filters', role: 'group', 'aria-label': KT.t('filter.label') });
    filters.forEach(function (f, i) {
      var n = f === 'all' ? frames.length : frames.filter(function (x) { return x.kind === f; }).length;
      var b = h('button', { class: 'chip', type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false', 'data-filter': f,
        html: esc(KT.t('filter.' + f, f)) + ' <span class="chip__n">' + KT.pad(n) + '</span>' });
      chips.appendChild(b);
    });
    bar.appendChild(chips);
    if (Sh.note) bar.appendChild(h('p', { class: 'hand sheet__note', html: fmt(Sh.note) }));
    el.appendChild(bar);

    var grid = h('ul', { class: 'sheet__grid' });
    var selCount = 0, CIRCLE_TAKES = [3, 4, 5, 1, 2, 0], CIRCLE_TILT = [-3, 4, -6, 2, 5, -2];
    var cells = frames.map(function (f, i) {
      var cell = h('li', { class: 'cell' + (f.selected ? ' is-selected' : ''), 'data-kind': f.kind || 'image' });
      var media = f.media || null;
      var ratio = (media && media.ratio) || (f.kind === 'copy' ? '4/5' : '1/1');
      var fit = h('div', { class: 'cell__fit has-pencil', style: { '--ratio': ratio.replace('/', ' / '), '--r': KT.ratio(ratio).toFixed(4) } });
      fit.appendChild(frameBody(f, ratio, cell));
      if (f.selected) {
        // each circle a different take: variant, tilt and start point vary; ticks on two at most
        var k = selCount++;
        fit.appendChild(KT.pencil('circle', { variant: CIRCLE_TAKES[k % CIRCLE_TAKES.length], rotate: CIRCLE_TILT[k % CIRCLE_TILT.length], className: 'pencil--light cell__circle', delay: 120 + (k % 3) * 90 }));
        if (k === 0 || k === 2) fit.appendChild(KT.pencil('tick', { className: 'pencil--light cell__tick', delay: 700 }));
      }
      var open = h('button', { class: 'cell__open', type: 'button', 'data-cursor': 'VIEW',
        'aria-label': KT.t('frame.open', null, { id: f.id || i + 1, title: KT.plain(f.title || f.kind) }) + (f.selected ? ' ' + KT.t('frame.selected') : '') });
      open.addEventListener('click', function () { lightbox.open(i, open); });
      cell.append(
        h('div', { class: 'cell__stage' }, fit),
        h('p', { class: 'cell__cap' },
          h('span', { class: 'cell__id', text: f.id || KT.pad(i + 1) }),
          h('span', { class: 'cell__kind', text: KT.t('filter.' + f.kind, f.kind || '') }),
          h('span', { class: 'cell__tool' + (/^\s*\[\[[^\]]*\]\]\s*$/.test(f.tool || '') ? ' cell__tool--todo' : ''), html: fmt(f.tool || '') })),
        open
      );
      grid.appendChild(cell);
      return cell;
    });
    el.appendChild(grid);

    // filtering
    var current = filters[0];
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b || b.dataset.filter === current) return;
      current = b.dataset.filter;
      $$('.chip', chips).forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      var show = function (c, i) { return current === 'all' || frames[i].kind === current; };
      if (KT.reduced) {
        cells.forEach(function (c, i) { c.hidden = !show(c, i); });
        if (HAS_GSAP) ST.refresh();
        return;
      }
      grid.classList.add('is-filtering');
      setTimeout(function () {
        cells.forEach(function (c, i) {
          var s = show(c, i);
          c.hidden = !s;
          c.classList.toggle('is-entering', s);
        });
        void grid.offsetWidth;
        grid.classList.remove('is-filtering');
        requestAnimationFrame(function () { cells.forEach(function (c) { c.classList.remove('is-entering'); }); });
        if (HAS_GSAP) ST.refresh();
      }, 220);
      KT.announce(KT.t('frames.shown', null, { n: cells.filter(function (c) { return !c.hidden; }).length }));
    });

    var lightbox = buildLightbox(frames, cells);
  }

  function frameBody(f, ratio, cell) {
    var m = f.media;
    if (f.kind === 'copy' || (!m && f.text)) {
      var fig = h('figure', { class: 'frame copycard', style: { '--ratio': ratio.replace('/', ' / ') } });
      fig.appendChild(h('div', { class: 'frame__media copycard__media' },
        h('div', { class: 'copycard__inner' },
          h('span', { class: 'copycard__head', text: KT.t('copy.head') + ' · ' + (f.id || '') }),
          h('p', { class: 'copycard__text', html: fmt(f.text || f.title || '') }),
          h('span', { class: 'copycard__foot', html: fmt(f.tool || '') }))));
      return fig;
    }
    if (f.kind === 'voice' && m && !m.src) {
      var vf = KT.media(m, { id: f.id });
      var slot = $('.slot', vf);
      if (slot) {
        slot.classList.add('slot--wave');
        slot.insertAdjacentHTML('afterbegin', '<span class="slot__wave">' + KT.wave(f.id, 40) + '</span>');
      }
      return vf;
    }
    return KT.media(m, { id: f.id, hoverHost: cell });
  }

  /* -------------------------------------------------------------- lightbox */
  function buildLightbox(frames, cells) {
    var dlg = h('dialog', { class: 'lightbox', 'data-theme': 'film', 'aria-labelledby': 'lb-title' });
    var counter = h('span', { class: 'label lightbox__count' });
    var closeBtn = h('button', { class: 'lightbox__btn', type: 'button', 'aria-label': KT.t('lb.close'), html: KT.icon('close') });
    var prevBtn = h('button', { class: 'lightbox__btn', type: 'button', 'aria-label': KT.t('lb.prev'), html: KT.icon('prev') });
    var nextBtn = h('button', { class: 'lightbox__btn', type: 'button', 'aria-label': KT.t('lb.next'), html: KT.icon('next') });
    var stage = h('div', { class: 'lightbox__stage' });
    var info = h('div', { class: 'lightbox__info' });
    dlg.append(
      h('div', { class: 'lightbox__top' }, counter, h('div', { class: 'lightbox__nav' }, prevBtn, nextBtn, closeBtn)),
      h('div', { class: 'lightbox__body' }, stage, info)
    );
    d.body.appendChild(dlg);
    var idx = 0, opener = null;

    function visibleIdx() {
      return cells.map(function (c, i) { return c.hidden ? -1 : i; }).filter(function (i) { return i >= 0; });
    }
    function render(i) {
      idx = i;
      var f = frames[i], list = visibleIdx(), pos = list.indexOf(i);
      counter.textContent = KT.t('frame') + ' ' + (f.id || KT.pad(i + 1)) + ' · ' + KT.pad(pos + 1) + ' / ' + KT.pad(list.length);
      stage.innerHTML = '';
      var ratio = (f.media && f.media.ratio) || (f.kind === 'copy' ? '4/5' : '1/1');
      var fit = h('div', { class: 'lightbox__fit has-pencil', style: { '--ratio': ratio.replace('/', ' / '), '--r': KT.ratio(ratio).toFixed(4) } });
      if (f.kind === 'copy' || !f.media) fit.appendChild(frameBody(f, ratio, fit));
      else if (f.kind === 'voice' && !f.media.src) fit.appendChild(frameBody(f, ratio, fit));
      else fit.appendChild(KT.media(f.media, { id: f.id, eager: true, play: 'auto' }));
      stage.appendChild(fit);

      info.innerHTML = '';
      var titleRow = h('div', { class: 'lightbox__title-row has-pencil' },
        h('h2', { class: 't-display t-s t-sentence lightbox__title', id: 'lb-title', html: fmt(f.title || '') }));
      var tick = null;
      if (f.selected) { tick = KT.pencil('tick', { auto: false, className: 'lightbox__tick' }); titleRow.appendChild(tick); }
      info.append(
        h('p', { class: 'label' }, KT.t('filter.' + f.kind, f.kind || '') + ' · ' + (f.selected ? KT.t('lb.selected') : KT.t('lb.outtake'))),
        titleRow,
        f.tool ? h('p', { class: 'lightbox__tool' }, h('span', { class: 'label', text: KT.t('lb.tool') }), h('span', { html: fmt(f.tool) })) : null,
        f.prompt ? h('div', { class: 'receipt' },
          h('div', { class: 'receipt__head' }, h('span', { text: KT.t('receipt') }), h('span', { text: KT.t('receipt.no') + ' ' + (f.id || '') })),
          h('p', { class: 'receipt__body', html: fmt(f.prompt) }),
          h('div', { class: 'receipt__foot' }, h('span', { html: fmt(f.tool || '') }), h('span', { text: f.selected ? KT.t('lb.selected') : KT.t('lb.notselected') }))) : null,
        f.note ? h('p', { class: 'hand lightbox__note', html: fmt(f.note) }) : null
      );
      requestAnimationFrame(function () {
        if (tick) tick.draw(600);
      });
      prevBtn.disabled = list.length < 2;
      nextBtn.disabled = list.length < 2;
    }
    function step(dir) {
      var list = visibleIdx();
      if (list.length < 2) return;
      var pos = list.indexOf(idx);
      render(list[(pos + dir + list.length) % list.length]);
    }
    function close() {
      dlg.classList.remove('is-open');
      d.documentElement.classList.remove('is-locked');
      $$('video, audio', dlg).forEach(function (m) { m.pause(); });
      setTimeout(function () {
        if (dlg.open) dlg.close();
        if (opener) opener.focus();
      }, KT.reduced ? 0 : 260);
    }
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'Tab') {
        var f = $$('button:not([disabled]), a[href], audio[controls], [tabindex]:not([tabindex="-1"])', dlg).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    return {
      open: function (i, from) {
        opener = from || null;
        render(i);
        if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
        d.documentElement.classList.add('is-locked');
        requestAnimationFrame(function () { dlg.classList.add('is-open'); });
        closeBtn.focus();
      }
    };
  }

  /* ============================================================= TOOLKIT */
  function renderToolkit() {
    var el = sec('toolkit'), T = SITE.tools;
    if (!el) return;
    if (!T || !T.groups || !T.groups.length) return drop('toolkit');
    el.appendChild(secHead(T.label, T.title, 'toolkit-title', null));
    var names = [];
    T.groups.forEach(function (g) { (g.items || []).forEach(function (it) { if (it.name) names.push(KT.plain(it.name)); }); });

    // marquee (decorative: the table below carries the same names)
    var mq = h('div', { class: 'marquee', 'aria-hidden': 'true' });
    var rows = [names, names.slice().reverse()].map(function (list, r) {
      var group = h('div', { class: 'marquee__group' });
      for (var k = 0; k < 2; k++) list.forEach(function (n) {
        group.appendChild(h('span', { class: 'marquee__item t-display', text: n }));
        group.appendChild(h('span', { class: 'marquee__sep', html: '<svg viewBox="0 0 20 20"><path d="M10 0v20M0 10h20M3 3l14 14M17 3L3 17"/></svg>' }));
      });
      var track = h('div', { class: 'marquee__track' }, group, group.cloneNode(true));
      var row = h('div', { class: 'marquee__row' + (r ? ' marquee__row--b' : '') }, track);
      mq.appendChild(row);
      return { track: track, group: group, dir: r ? 1 : -1, x: 0, gw: 0 };
    });
    el.appendChild(mq);

    // table
    var rig = h('div', { class: 'rig' });
    T.groups.forEach(function (g, gi) {
      rig.appendChild(h('div', { class: 'rig__group', 'data-reveal': 'up' },
        h('h3', { class: 'rig__name label label--fg' }, h('span', { class: 'rig__gno', text: KT.pad(gi + 1) }), h('span', { html: fmt(g.name) })),
        h('ul', { class: 'rig__items' }, (g.items || []).map(function (it) {
          return h('li', { class: 'rig__item' },
            h('span', { class: 'rig__tool t-display t-sentence', html: fmt(it.name) }),
            h('span', { class: 'rig__use', html: fmt(it.use || '') }));
        }))
      ));
    });
    el.appendChild(rig);

    fitters.push(function () { rows.forEach(function (r) { r.gw = r.group.offsetWidth; }); });
    if (KT.reduced) return;
    motions.push(function () {
      var visible = false, raf = null, last = 0, vel = 0, st = null;
      if (HAS_GSAP) st = ST.create({ trigger: el, start: 'top bottom', end: 'bottom top' });
      KT.inView(mq, function (on) { visible = on; if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }, { once: false, threshold: 0 });
      function loop(now) {
        var dt = Math.min(64, now - last) / 1000; last = now;
        var v = st ? Math.abs(st.getVelocity()) : 0;
        vel += (Math.min(v, 4000) - vel) * .08;
        var speed = 70 + vel * .35;
        rows.forEach(function (r) {
          if (!r.gw) return;
          r.x = (r.x + r.dir * speed * dt) % r.gw;
          if (r.x > 0) r.x -= r.gw;
          r.track.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0)';
        });
        raf = visible ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ============================================================== RECORD */
  function renderRecord() {
    var el = sec('record'), Rc = SITE.record, p = SITE.person || {};
    if (!el) return;
    if (!Rc) return drop('record');
    el.appendChild(secHead(Rc.label, Rc.title, 'record-title', null));
    var xp = Rc.experience || [];
    if (xp.length) {
      var ol = h('ol', { class: 'ledger' });
      xp.forEach(function (x, i) {
        var pid = 'xp-' + i, open = i === 0;
        var btn = h('button', { class: 'ledger__btn', type: 'button', id: pid + '-btn', 'aria-expanded': open ? 'true' : 'false', 'aria-controls': pid },
          h('span', { class: 'ledger__period label', html: fmt(x.period || '') }),
          h('span', { class: 'ledger__role t-display t-sentence', html: fmt(x.role || '') }),
          h('span', { class: 'ledger__org' }, h('b', { html: fmt(x.org || '') }), x.orgNote ? h('span', { class: 'ledger__onote', html: fmt(x.orgNote) }) : null),
          x.type ? h('span', { class: 'ledger__type' }, h('span', { class: 'tag', html: fmt(KT.t('job.' + x.type, x.type)) })) : null,
          h('span', { class: 'ledger__icon', 'aria-hidden': 'true' }));
        var panel = h('div', { class: 'ledger__panel', id: pid, role: 'region', 'aria-labelledby': pid + '-btn' },
          h('div', { class: 'ledger__panel-inner' },
            h('ul', { class: 'ledger__points' }, (x.points || []).map(function (pt) { return h('li', { html: fmt(pt) }); }))));
        if (!open) { panel.inert = true; panel.setAttribute('aria-hidden', 'true'); }
        var li = h('li', { class: 'ledger__row' + (open ? ' is-open' : ''), 'data-reveal': 'up' }, h('h3', { class: 'ledger__h' }, btn), panel);
        btn.addEventListener('click', function () {
          var isOpen = li.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          panel.inert = !isOpen;
          if (isOpen) panel.removeAttribute('aria-hidden'); else panel.setAttribute('aria-hidden', 'true');
          if (HAS_GSAP) setTimeout(function () { ST.refresh(); }, 520);
        });
        ol.appendChild(li);
      });
      el.appendChild(ol);
    }
    var cols = h('div', { class: 'record__cols' });
    if (Rc.education && Rc.education.length) {
      cols.appendChild(h('div', { class: 'record__col', 'data-reveal': 'up' },
        h('h3', { class: 'label', text: KT.t('education') }),
        h('ul', { class: 'record__list' }, Rc.education.map(function (e) {
          return h('li', null,
            h('span', { class: 'record__k', html: fmt(e.school) }),
            h('span', { class: 'record__v', html: fmt([e.detail, e.period].filter(Boolean).join(' · ')) }));
        }))));
    }
    if (Rc.languages && Rc.languages.length) {
      cols.appendChild(h('div', { class: 'record__col', 'data-reveal': 'up', 'data-reveal-delay': 80 },
        h('h3', { class: 'label', text: KT.t('languages') }),
        h('ul', { class: 'record__list' }, Rc.languages.map(function (l) {
          return h('li', null, h('span', { class: 'record__k', html: fmt(l.name) }), h('span', { class: 'record__v', html: fmt(l.level) }));
        }))));
    }
    if (p.cv) {
      cols.appendChild(h('div', { class: 'record__cv', 'data-reveal': 'up', 'data-reveal-delay': 160 },
        h('a', { class: 'btn btn--solid', href: p.cv, download: '', html: esc(KT.t('cv.download')) + ' ' + KT.icon('download') })));
    }
    el.appendChild(cols);
  }

  /* ============================================================= CONTACT */
  var contactLines = [];
  function renderContact() {
    var el = sec('contact'), C = SITE.contact, p = SITE.person || {};
    if (!el) return;
    if (!C) return drop('contact');
    if (C.label) el.appendChild(h('p', { class: 'label sec-head__label', html: fmt(C.label), 'data-reveal': 'fade' }));
    var title = h('h2', { class: 'contact__title t-display', id: 'contact-title', 'data-reveal': 'mask' });
    (C.titleLines || []).forEach(function (t, i) {
      if (i) title.appendChild(d.createTextNode(' '));
      var line = h('span', { class: 'contact__line fit' },
        h('span', { class: 'line-mask' }, h('span', { class: 'line-inner', style: { '--i': i } }, h('span', { class: 'fit__inner contact__text', html: fmt(t) }))));
      title.appendChild(line);
      contactLines.push(line);
    });
    el.appendChild(title);
    if (C.body) el.appendChild(h('p', { class: 't-lead contact__body', html: fmt(C.body), 'data-reveal': 'up' }));

    if (p.email) {
      var mail = h('div', { class: 'contact__mail has-pencil', 'data-reveal': 'up' });
      var btn = h('button', { class: 'contact__email fit', type: 'button', 'data-cursor': 'COPY', 'aria-label': KT.t('copy.email', null, { email: p.email }) },
        h('span', { class: 'fit__inner contact__email-txt', text: p.email }));
      var state = h('span', { class: 'contact__state label', 'data-copy-label': '', text: KT.t('contact.click') });
      btn.addEventListener('click', function () { KT.copy(p.email, mail); });
      var arrow = KT.pencil('arrow', { flip: 'y', note: KT.t('note.write'), className: 'contact__arrow', variant: 0, delay: 300 });
      mail.append(arrow, btn, h('p', { class: 'contact__hint' }, state, h('a', { class: 'contact__mailto label', href: 'mailto:' + p.email, text: KT.t('contact.mailapp') })));
      el.appendChild(mail);
      fitters.push(function () { KT.fit(btn, { fill: .96, max: 168 }); });
      magnet(mail, btn);
    }
    var links = (C.links || []).filter(function (l) { return l && l.url; });
    if (links.length) {
      el.appendChild(h('ul', { class: 'contact__links', 'data-reveal': 'up' }, links.map(function (l) {
        var ext = /^https?:/i.test(l.url), dl = /\.pdf$/i.test(l.url);
        return h('li', null, h('a', {
          class: 'contact__link', href: l.url,
          target: ext ? '_blank' : null, rel: ext ? 'noopener noreferrer' : null, download: dl ? '' : null
        }, h('span', { class: 'label', html: fmt(l.label) }), h('span', { class: 'contact__lv', html: fmt(l.value) + ' ' + KT.icon(dl ? 'download' : 'arrow-ne') })));
      })));
    }
    fitters.push(function () { contactLines.forEach(function (l) { KT.fit(l); }); });
  }

  function magnet(area, target) {
    if (!KT.fine || KT.reduced) return;
    var x = 0, y = 0, tx = 0, ty = 0, raf = null;
    function loop() {
      x += (tx - x) * .15; y += (ty - y) * .15;
      target.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .1 ? requestAnimationFrame(loop) : null;
    }
    area.addEventListener('pointermove', function (e) {
      var r = target.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) * .08, -24, 24);
      ty = clamp((e.clientY - (r.top + r.height / 2)) * .3, -14, 14);
      if (!raf) raf = requestAnimationFrame(loop);
    });
    area.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  /* ================================================================ BOOT */
  function runFitters() { fitters.forEach(function (f) { safe('fit', f); }); }

  function boot() {
    safe('meta', function () { KT.applyMeta(); });
    safe('chrome', KT.chrome);
    safe('nav', function () { KT.renderNav('home'); });
    safe('hero', renderHero);
    safe('stats', renderStats);
    safe('about', renderAbout);
    safe('work', renderWork);
    safe('process', renderProcess);
    safe('sheet', renderSheet);
    safe('toolkit', renderToolkit);
    safe('record', renderRecord);
    safe('contact', renderContact);
    // consecutive "NN — " prefixes over the sections that actually rendered (sheet may be hidden)
    safe('numbering', function () {
      var n = 0;
      KT.$$('.sec-head__label').forEach(function (el) {
        if (!/^\d\d\s—\s/.test(el.textContent)) return;
        n++;
        el.innerHTML = el.innerHTML.replace(/^\d\d(\s—\s)/, KT.pad(n) + '$1');
      });
    });
    safe('footer', KT.renderFooter);
    safe('cursor', KT.cursor);
    safe('reveal', function () { KT.reveal(d); });
    runFitters(); // provisional fit with fallback fonts
    // Failsafe: intro must be in its final state 4s after DOMContentLoaded
    // (throttled background tab, missing GSAP, slow fonts…)
    setTimeout(function () { safe('intro failsafe', finishIntro); KT.revealSweep(); }, 4000);

    KT.fontsReady(1800).then(function () {
      runFitters();
      motions.forEach(function (m) { safe('motion', m); });
      if (HAS_GSAP) ST.refresh();
      if (work.evaluateTheme) work.evaluateTheme();
      if (KT.navUpdate) KT.navUpdate();
    });

    var lastW = w.innerWidth;
    w.addEventListener('resize', KT.debounce(function () {
      // ignore mobile URL-bar height jitter
      if (w.innerWidth === lastW && KT.isMobile()) return;
      lastW = w.innerWidth;
      runFitters();
      if (HAS_GSAP) ST.refresh();
      if (work.evaluateTheme) work.evaluateTheme();
    }, 180));
    // late layout shifts (images, fonts swapping) -> recompute triggers once
    w.addEventListener('load', function () { runFitters(); if (HAS_GSAP) ST.refresh(); });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);

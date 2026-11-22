/* =====================================================================
   THE SELECT — js/core.js
   Shared library for every page (home + case study). No dependencies;
   GSAP is optional and only used by page scripts. Reads window.SITE.

   API (window.KT)
   ---------------------------------------------------------------------
   Flags
     KT.reduced              bool   prefers-reduced-motion: reduce
     KT.fine                 bool   (hover:hover) and (pointer:fine)
     KT.isMobile()           bool   viewport < 768px

   Language (content/i18n.js runs first and merges SITE_UK into SITE)
     KT.lang                 'en' | 'uk'
     KT.t(key, fallback, vars)  UI string for KT.lang ({name} placeholders)
     KT.addStrings(lang, map)   extend the UI dictionary from a page script
     KT.applyMeta(title?, desc?) sync <title>/description/og from SITE.meta
     KT.langSwitch(className)   EN / UA toggle (also built into the nav)
     KT.revealSweep()           force [data-reveal] above the viewport to final

   Strings
     KT.esc(str)            HTML-escape anything (null -> '')
     KT.fmt(str)             esc + [[note]] -> <mark class="todo">note</mark>
     KT.plain(str)           strip [[ ]] brackets (for alt / aria-label)
     KT.pad(n, len=2)        '7' -> '07'
     KT.ratio('16/9')        -> 1.777 (number)

   DOM
     KT.$(sel, root) / KT.$$(sel, root)
     KT.h(tag, attrs, ...children)  create element. attrs: class, html,
                             text, style(obj|str), data(obj), on{Event}
                             handlers, anything else -> setAttribute.
                             children: Node | string (text) | array.
     KT.icon(name)           inline SVG string: image video audio play
                             pause close prev next arrow-down arrow-up
                             arrow-right arrow-ne download copy tri menu
     KT.announce(msg)        polite screen-reader announcement
     KT.inView(el, cb, {once=true, threshold=.2, rootMargin})
                             IntersectionObserver helper; cb(isIn, entry)
     KT.debounce(fn, ms)
     KT.fontsReady(timeout=2500) -> Promise (document.fonts.ready, capped)

   Media
     KT.media(media, {id, eager, className, number, caption, play,
                      hoverHost, ratio}) -> <figure class="frame">
         media = {type:'image'|'video'|'audio', src, poster, alt, ratio,
                  slot, spec}. src === '' renders a designed .slot.
         play: 'hover' (default: hover on fine pointers, in-view on
               touch) | 'auto' (in-view everywhere) | 'none'.
     KT.slot(media, {id}) -> <div class="slot"> placeholder
     KT.wave(seed, bars=48) -> SVG string of a deterministic waveform

   Blue pencil
     KT.pencil(kind, {note, auto=true, delay=0, duration, variant,
                      className, flip:'x'|'y'|'xy', rotate:deg}) -> <span class="pencil pencil--kind">
         Arrows point up-right by default; flip mirrors the stroke only
         (the note stays readable); rotate tilts the stroke (deg).
         circle has 6 variants (0-2 heavy overshoot, 3-5 lighter takes).
         Stroke weight is CSS: .pencil path { stroke-width } (3.25 default;
         modifier .pencil--light = 2.5).
         kind: circle | underline | arrow | cross | tick
         Absolutely positioned overlay; parent needs position:relative
         (use .has-pencil). Draws itself when it enters the viewport
         (auto) or when you call el.draw(delayMs). el.reset() rewinds.

   Type & motion
     KT.splitWords(el) -> [span.w]   wraps words, keeps inline markup
     KT.splitLines(el) -> [span.line-inner]  masks per rendered line
     KT.reveal(root)   wires [data-reveal] = "up" (default) | "lines" |
                       "mask" (already has .line-mask/.line-inner) |
                       "fade"; adds .is-in on enter. [data-reveal-delay]
                       in ms. Final state shown instantly when reduced.
     KT.fit(el, {fill=1, min=12, max})  fit-to-width: sets font-size so
                       el's .fit__inner fills el's content box. -> px

   Chrome
     KT.chrome()             grid overlay + grain (once per page)
     KT.renderNav(active)    fixed header + mobile menu. active: section id
                             to highlight ('work' on case pages) or
                             'home' to auto-track sections by scroll.
     KT.renderFooter()       shared footer (mounts into #site-footer)
     KT.cursor()             blue trailing dot; [data-cursor="VIEW|PLAY|
                             COPY|OPEN"] grows it into a label chip
     KT.copy(text, el)       clipboard + "Copied" state on el's
                             [data-copy-label] -> Promise<bool>
     KT.boot(active)         chrome + nav + footer + cursor in one call
   ===================================================================== */
(function (w, d) {
  'use strict';

  var KT = (w.KT = w.KT || {});
  var S = function () { return w.SITE || {}; };
  var mm = function (q) { return w.matchMedia ? w.matchMedia(q) : { matches: false }; };

  KT.reduced = mm('(prefers-reduced-motion: reduce)').matches;
  KT.fine = mm('(hover: hover) and (pointer: fine)').matches;
  KT.isMobile = function () { return w.innerWidth < 768; };
  d.documentElement.classList.add('js');
  if (KT.reduced) d.documentElement.classList.add('reduced');

  /* ---------------------------------------------------------------- i18n */
  // Language is decided by content/i18n.js (window.KT_LANG). UI strings that
  // are not content live here, for both languages.
  KT.lang = (w.KT_LANG || d.documentElement.lang || 'en').toLowerCase().indexOf('uk') === 0 ? 'uk' : 'en';
  var DICT = {
    en: {
      'nav.about': 'About', 'nav.work': 'Work', 'nav.process': 'Process', 'nav.sheet': 'Sheet', 'nav.record': 'Experience', 'nav.contact': 'Contact',
      'nav.primary': 'Primary', 'nav.home': '{name}, home', 'status': 'Open to work', 'frame': 'FRAME',
      'menu': 'Menu', 'menu.close': 'Close menu', 'skip': 'Skip to content',
      'lang.label': 'Language', 'lang.en': 'English', 'lang.uk': 'Ukrainian',
      'cv': 'CV', 'cv.download': 'Download CV (PDF)', 'top': 'Back to top',
      'copy': 'Copy', 'copied': 'Copied', 'copy.fail': 'Press Ctrl+C',
      'copy.done': 'Copied to clipboard: {text}', 'copy.failed': 'Copy failed. Select the text and copy it manually.',
      'copy.email': 'Copy email address {email}',
      'slot': 'SLOT', 'slot.for': 'Placeholder for {type}', 'type.image': 'image', 'type.video': 'video', 'type.audio': 'audio',
      'play': 'Play', 'pause': 'Pause', 'sound': 'Sound', 'sound.off': 'Sound off', 'sound.on': 'Sound on', 'audio': 'audio',
      // home
      'portfolio': 'PORTFOLIO', 'roll': 'ROLL', 'selected.work': 'Selected work', 'portrait': 'Portrait of {name}',
      'toy.mode': 'MODE', 'toy.modes': 'Render mode', 'toy.render': 'Portrait of {name}, {mode} render',
      'step': 'STEP', 'human': 'HUMAN', 'tools': 'Tools',
      'filter.label': 'Filter frames by kind', 'filter.all': 'all', 'filter.image': 'image', 'filter.video': 'video',
      'filter.voice': 'voice', 'filter.copy': 'copy', 'frames.shown': '{n} frames shown',
      'frame.open': 'Open frame {id}: {title}', 'frame.selected': '(selected)', 'copy.head': 'COPY',
      'lb.close': 'Close', 'lb.prev': 'Previous frame', 'lb.next': 'Next frame', 'lb.tool': 'Tool',
      'lb.selected': 'SELECTED', 'lb.outtake': 'OUTTAKE', 'lb.notselected': 'NOT SELECTED',
      'receipt': 'PROMPT RECEIPT', 'receipt.no': 'NO.',
      'education': 'Education', 'languages': 'Languages',
      'contact.click': 'Click to copy', 'contact.mailapp': 'or open mail app', 'note.write': 'write here',
      'tracks': 'tracks'
    },
    uk: {
      'nav.about': 'Про мене', 'nav.work': 'Роботи', 'nav.process': 'Процес', 'nav.sheet': 'Кадри', 'nav.record': 'Досвід', 'nav.contact': 'Контакт',
      'nav.primary': 'Основна навігація', 'nav.home': '{name}, на головну', 'status': 'Відкритий до пропозицій', 'frame': 'КАДР',
      'menu': 'Меню', 'menu.close': 'Закрити меню', 'skip': 'Перейти до змісту',
      'lang.label': 'Мова', 'lang.en': 'English', 'lang.uk': 'Українська',
      'cv': 'CV', 'cv.download': 'Завантажити CV (PDF)', 'top': 'Нагору',
      'copy': 'Копіювати', 'copied': 'Скопійовано', 'copy.fail': 'Натисніть Ctrl+C',
      'copy.done': 'Скопійовано: {text}', 'copy.failed': 'Не вдалося скопіювати. Виділіть текст і скопіюйте вручну.',
      'copy.email': 'Скопіювати адресу {email}',
      'slot': 'СЛОТ', 'slot.for': 'Тут буде {type}', 'type.image': 'зображення', 'type.video': 'відео', 'type.audio': 'аудіо',
      'play': 'Відтворити', 'pause': 'Пауза', 'sound': 'Звук', 'sound.off': 'Звук вимк.', 'sound.on': 'Звук увімк.', 'audio': 'аудіо',
      'portfolio': 'ПОРТФОЛІО', 'roll': 'ПЛІВКА', 'selected.work': 'Обрані роботи', 'portrait': 'Портрет: {name}',
      'toy.mode': 'РЕЖИМ', 'toy.modes': 'Режим обробки', 'toy.render': 'Портрет: {name}, режим «{mode}»',
      'step': 'КРОК', 'human': 'ЛЮДИНА', 'tools': 'Інструменти',
      'filter.label': 'Фільтр кадрів за типом', 'filter.all': 'усі', 'filter.image': 'зображення', 'filter.video': 'відео',
      'filter.voice': 'голос', 'filter.copy': 'текст', 'frames.shown': 'Показано кадрів: {n}',
      'frame.open': 'Відкрити кадр {id}: {title}', 'frame.selected': '(у відборі)', 'copy.head': 'ТЕКСТ',
      'lb.close': 'Закрити', 'lb.prev': 'Попередній кадр', 'lb.next': 'Наступний кадр', 'lb.tool': 'Інструмент',
      'lb.selected': 'У ВІДБОРІ', 'lb.outtake': 'ВІДСІЯНИЙ ДУБЛЬ', 'lb.notselected': 'НЕ ВІДІБРАНО',
      'receipt': 'ЧЕК ПРОМПТУ', 'receipt.no': '№',
      'education': 'Освіта', 'languages': 'Мови',
      'contact.click': 'Натисніть, щоб скопіювати', 'contact.mailapp': 'або відкрити пошту', 'note.write': 'пишіть сюди',
      'tracks': 'треки'
    }
  };
  // KT.t(key, fallback, vars): UI string in the current language → English
  // → fallback → key. vars fill {placeholders}.
  KT.t = function (key, fallback, vars) {
    var s = (DICT[KT.lang] && DICT[KT.lang][key]);
    if (s == null) s = DICT.en[key];
    if (s == null) s = fallback != null ? fallback : key;
    if (vars) s = String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  };
  // Extend the dictionary (e.g. from a page script): KT.addStrings('uk', {...})
  KT.addStrings = function (lang, map) {
    DICT[lang] = DICT[lang] || {};
    Object.keys(map || {}).forEach(function (k) { DICT[lang][k] = map[k]; });
  };
  // Update <title>, description and OG tags (call after SITE is merged).
  KT.applyMeta = function (title, desc) {
    var m = (w.SITE || {}).meta || {};
    title = title || m.title; desc = desc || m.description;
    if (title) d.title = KT.plain(title);
    var set = function (sel, v) { var el = d.querySelector(sel); if (el && v) el.setAttribute('content', KT.plain(v)); };
    set('meta[name="description"]', desc);
    set('meta[property="og:title"]', title);
    set('meta[property="og:description"]', desc);
    var loc = d.querySelector('meta[property="og:locale"]');
    if (!loc && d.head) { loc = d.createElement('meta'); loc.setAttribute('property', 'og:locale'); d.head.appendChild(loc); }
    if (loc) loc.setAttribute('content', KT.lang === 'uk' ? 'uk_UA' : 'en_US');
  };

  /* ------------------------------------------------------------ strings */
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  KT.esc = function (s) {
    return s == null ? '' : String(s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  };
  KT.fmt = function (s) {
    return KT.esc(s).replace(/\[\[([\s\S]+?)\]\]/g, function (_, t) {
      return '<mark class="todo">' + t.trim() + '</mark>';
    });
  };
  KT.plain = function (s) {
    return s == null ? '' : String(s).replace(/\[\[([\s\S]+?)\]\]/g, '$1');
  };
  KT.pad = function (n, len) {
    n = String(n == null ? '' : n);
    while (n.length < (len || 2)) n = '0' + n;
    return n;
  };
  KT.ratio = function (r) {
    if (typeof r === 'number') return r;
    var m = String(r || '').split('/');
    var a = parseFloat(m[0]), b = parseFloat(m[1] || 1);
    return a > 0 && b > 0 ? a / b : 1.5;
  };

  /* ---------------------------------------------------------------- DOM */
  KT.$ = function (s, r) { return (r || d).querySelector(s); };
  KT.$$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  KT.h = function (tag, attrs) {
    var el = d.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style') {
        if (typeof v === 'string') el.style.cssText = v;
        else Object.keys(v).forEach(function (p) { el.style.setProperty(p, v[p]); });
      } else if (k === 'data') Object.keys(v).forEach(function (p) { el.dataset[p] = v[p]; });
      else if (/^on[A-Z]/.test(k)) el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    var add = function (c) {
      if (c == null || c === false) return;
      if (Array.isArray(c)) c.forEach(add);
      else el.appendChild(typeof c === 'string' ? d.createTextNode(c) : c);
    };
    for (var i = 2; i < arguments.length; i++) add(arguments[i]);
    return el;
  };

  var ICONS = {
    image: '<rect x="3" y="5" width="18" height="14"/><circle cx="9" cy="10" r="1.6"/><path d="M3 17l6-5 4 3 3-3 5 4"/>',
    video: '<rect x="3" y="6" width="13" height="12"/><path d="M16 10l5-3v10l-5-3"/>',
    audio: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
    play: '<path d="M7 5l12 7-12 7z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" stroke="none"/>',
    close: '<path d="M5 5l14 14M19 5L5 19"/>',
    prev: '<path d="M15 5l-7 7 7 7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    'arrow-down': '<path d="M12 4v16M6 14l6 6 6-6"/>',
    'arrow-up': '<path d="M12 20V4M6 10l6-6 6 6"/>',
    'arrow-right': '<path d="M4 12h16M14 6l6 6-6 6"/>',
    'arrow-ne': '<path d="M7 17L17 7M8 7h9v9"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    copy: '<rect x="8" y="8" width="12" height="12"/><path d="M16 8V4H4v12h4"/>',
    tri: '<path d="M8 6l8 6-8 6z" fill="currentColor" stroke="none"/>',
    menu: '<path d="M4 8h16M4 16h16"/>'
  };
  KT.icon = function (name, cls) {
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  };

  var live;
  KT.announce = function (msg) {
    if (!live) {
      live = KT.h('div', { class: 'sr-only', 'aria-live': 'polite', role: 'status' });
      d.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 30);
  };

  KT.inView = function (el, cb, o) {
    o = o || {};
    var once = o.once !== false;
    if (!('IntersectionObserver' in w)) { cb(true); return null; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { cb(true, e); if (once) io.disconnect(); }
        else if (!once) cb(false, e);
      });
    }, { threshold: o.threshold == null ? .2 : o.threshold, rootMargin: o.rootMargin || '0px' });
    io.observe(el);
    return io;
  };

  KT.debounce = function (fn, ms) {
    var t;
    return function () {
      var a = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, a); }, ms || 150);
    };
  };

  KT.fontsReady = function (timeout) {
    var p = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
    return Promise.race([p, new Promise(function (r) { setTimeout(r, timeout || 2500); })]);
  };

  /* -------------------------------------------------------------- media */
  KT.wave = function (seed, bars) {
    bars = bars || 48;
    var h = 2166136261;
    String(seed || 'kt').split('').forEach(function (c) { h = Math.imul(h ^ c.charCodeAt(0), 16777619); });
    var rnd = function () { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
    var out = '', bw = 100 / bars;
    for (var i = 0; i < bars; i++) {
      var env = Math.sin(Math.PI * (i + .5) / bars) * .7 + .3;
      var amp = Math.max(.08, env * (.35 + rnd() * .65));
      var hgt = (amp * 92).toFixed(2), y = ((100 - amp * 92) / 2).toFixed(2);
      out += '<rect x="' + (i * bw + bw * .2).toFixed(2) + '" y="' + y + '" width="' + (bw * .6).toFixed(2) + '" height="' + hgt + '"/>';
    }
    return '<svg class="wave__bars" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + out + '</svg>';
  };

  KT.slot = function (m, o) {
    m = m || {}; o = o || {};
    var type = m.type || 'image';
    // "SLOT · " collapses away on very narrow slots (container query), leaving the id
    var label = o.id ? '<span class="slot__tag-k">' + KT.esc(KT.t('slot')) + ' · </span>' + KT.esc(o.id) : KT.esc(KT.t('slot'));
    var el = KT.h('div', {
      class: 'slot slot--' + type,
      role: 'img',
      'aria-label': KT.t('slot.for', null, { type: KT.t('type.' + type, type) }) + (m.slot ? ': ' + KT.plain(m.slot) : '')
    });
    el.innerHTML =
      '<svg class="slot__x" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0L100 100M100 0L0 100"/></svg>' +
      '<span class="slot__tag">' + label + '</span>' +
      '<span class="slot__ratio">' + KT.esc((m.ratio || '').replace('/', ':')) + '</span>' +
      '<span class="slot__body">' +
        '<span class="slot__icon">' + KT.icon(type === 'audio' ? 'audio' : type) + '</span>' +
        (m.slot ? '<span class="slot__text">' + KT.fmt(m.slot) + '</span>' : '') +
        (m.spec ? '<span class="slot__spec">' + KT.esc(m.spec) + '</span>' : '') +
      '</span>';
    return el;
  };

  // On-frame video controls: play/pause + sound toggle (muted by default).
  // Clicking the video toggles play/pause. Only one video has sound at a time.
  function videoUI(v, box, st) {
    var pb = KT.h('button', { class: 'vctl__btn vctl__play', type: 'button' });
    var sb = KT.h('button', { class: 'vctl__btn vctl__snd', type: 'button', 'aria-pressed': 'false', 'aria-label': KT.t('sound') });
    var bar = KT.h('div', { class: 'vctl' }, pb, sb);
    var sync = function () {
      var playing = !v.paused;
      pb.innerHTML = KT.icon(playing ? 'pause' : 'play');
      pb.setAttribute('aria-label', KT.t(playing ? 'pause' : 'play'));
      sb.setAttribute('aria-pressed', v.muted ? 'false' : 'true');
      sb.textContent = KT.t(v.muted ? 'sound.off' : 'sound.on');
    };
    var toggle = function () {
      if (v.paused) { st.manual = false; v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else { st.manual = true; v.pause(); }
    };
    pb.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    sb.addEventListener('click', function (e) {
      e.stopPropagation();
      if (v.muted) {
        KT.$$('video').forEach(function (o) { if (o !== v && !o.muted) o.muted = true; });
        v.muted = false;
        if (v.paused && !st.manual) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      } else v.muted = true;
    });
    v.addEventListener('click', toggle);
    v.style.cursor = 'pointer';
    ['play', 'pause', 'volumechange'].forEach(function (ev) { v.addEventListener(ev, sync); });
    sync();
    box.appendChild(bar);
  }

  function wireVideo(v, host, mode, box, controls) {
    if (mode === 'none') return;
    var st = { manual: false };
    if (controls !== false && box) videoUI(v, box, st);
    var play = function () {
      if (st.manual) return;
      if (v.preload !== 'auto') v.preload = 'auto';
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    };
    var pause = function () { v.pause(); };
    var leave = function () { if (v.muted) pause(); }; // keep going while the viewer chose sound
    if (KT.reduced) return; // poster only; start with the play button
    if (mode === 'hover' && KT.fine) {
      host.addEventListener('mouseenter', play);
      host.addEventListener('mouseleave', leave);
      host.addEventListener('focusin', play);
      host.addEventListener('focusout', leave);
    } else {
      KT.inView(v, function (on) { on ? play() : pause(); }, { once: false, threshold: .5 });
    }
  }

  function audioPlayer(m, o) {
    var wrap = KT.h('div', { class: 'wave' });
    var audio = KT.h('audio', { preload: 'none', src: m.src });
    var btn = KT.h('button', { class: 'wave__play', type: 'button', 'aria-label': KT.t('play') + ' ' + KT.plain(m.alt || KT.t('audio')), 'data-cursor': 'PLAY', html: KT.icon('play') });
    var bars = KT.h('div', { class: 'wave__track', html: KT.wave(o.id || m.src) + '<div class="wave__fill">' + KT.wave(o.id || m.src) + '</div>' });
    var fill = bars.querySelector('.wave__fill');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (audio.paused) {
        KT.$$('audio').forEach(function (a) { if (a !== audio) a.pause(); });
        var p = audio.play(); if (p && p.catch) p.catch(function () {});
      } else audio.pause();
    });
    audio.addEventListener('play', function () { btn.innerHTML = KT.icon('pause'); btn.setAttribute('aria-label', KT.t('pause')); wrap.classList.add('is-playing'); });
    audio.addEventListener('pause', function () { btn.innerHTML = KT.icon('play'); btn.setAttribute('aria-label', KT.t('play') + ' ' + KT.plain(m.alt || KT.t('audio'))); wrap.classList.remove('is-playing'); });
    audio.addEventListener('timeupdate', function () {
      var p = audio.duration ? audio.currentTime / audio.duration : 0;
      fill.style.clipPath = 'inset(0 ' + (100 - p * 100).toFixed(2) + '% 0 0)';
    });
    wrap.append(btn, bars, audio);
    return wrap;
  }

  KT.media = function (m, o) {
    o = o || {};
    var ratio = (m && m.ratio) || o.ratio || '16/9';
    var fig = KT.h('figure', { class: 'frame ' + (o.className || '') });
    fig.style.setProperty('--ratio', ratio.replace('/', ' / '));
    fig.style.setProperty('--r', KT.ratio(ratio).toFixed(4));
    var box = KT.h('div', { class: 'frame__media' });
    var el = null;

    if (!m || !m.src) {
      box.appendChild(KT.slot(m || {}, o));
      fig.classList.add('is-slot');
    } else if (m.type === 'video') {
      el = KT.h('video', {
        muted: true, loop: true, playsinline: true, preload: o.eager ? 'metadata' : 'none',
        poster: m.poster || null, 'aria-label': KT.plain(m.alt || '')
      });
      el.muted = true;
      el.appendChild(KT.h('source', { src: m.src, type: /\.webm$/i.test(m.src) ? 'video/webm' : 'video/mp4' }));
      box.appendChild(el);
      wireVideo(el, o.hoverHost || fig, o.play || 'hover', box, o.controls);
      fig.dataset.kind = 'video';
    } else if (m.type === 'audio') {
      box.appendChild(audioPlayer(m, o));
      fig.dataset.kind = 'audio';
    } else {
      el = KT.h('img', {
        src: m.src, alt: KT.plain(m.alt || ''), decoding: 'async',
        loading: o.eager ? 'eager' : 'lazy', fetchpriority: o.eager ? 'high' : null
      });
      box.appendChild(el);
      fig.dataset.kind = 'image';
    }
    fig.appendChild(box);
    fig.mediaEl = el;

    if (o.number || o.caption) {
      fig.appendChild(KT.h('figcaption', {
        class: 'frame__cap',
        html: (o.number ? '<span class="frame__no">' + KT.esc(o.number) + '</span>' : '') +
              (o.caption ? '<span class="frame__txt">' + KT.fmt(o.caption) + '</span>' : '')
      }));
    }
    return fig;
  };

  /* ------------------------------------------------------- blue pencil */
  // Hand-tuned beziers. Circles overshoot their start; each kind has
  // variants so repeated marks never look stamped.
  var PENCIL = {
    circle: {
      vb: [200, 120], par: 'none',
      v: [
        ['M118 9C70 2 14 14 7 52C1 88 46 114 102 113C160 112 197 90 194 54C191 20 148 3 92 8C66 10 46 17 33 27'],
        ['M24 34C44 10 104 2 150 8C186 14 199 40 192 68C184 100 132 117 84 114C34 111 3 90 6 58C8 32 40 12 84 7C102 5 124 6 140 10'],
        ['M160 14C120 0 46 4 16 32C-2 50 8 90 54 106C98 120 166 112 188 82C204 58 190 22 140 10C112 4 80 6 60 14'],
        // 3-5: lighter, rounder takes with different start points (sheet frames)
        ['M190 70C196 34 150 6 98 6C46 6 6 28 6 62C6 96 50 116 104 114C152 112 188 96 194 66C196 52 190 40 178 30'],
        ['M62 112C24 104 4 84 6 58C8 24 54 4 108 6C160 8 196 28 194 62C192 94 152 114 98 115C80 115 64 112 52 108'],
        ['M8 50C14 20 58 4 110 6C162 8 198 30 194 64C190 98 146 116 94 114C42 112 4 94 6 60C7 46 16 34 30 24']
      ]
    },
    underline: {
      vb: [200, 24], par: 'none',
      v: [
        ['M3 14C40 10 82 15 122 11C152 8 178 9 197 7'],
        ['M5 10C50 15 110 8 160 12C176 13 188 11 196 9', 'M30 19C80 16 130 19 176 16']
      ]
    },
    arrow: {
      vb: [120, 90], par: 'xMidYMid meet',
      v: [
        ['M6 82C22 76 52 62 72 44C88 30 98 20 108 10', 'M84 9C92 9 101 8 109 9C108 17 107 26 105 33'],
        ['M4 70C30 74 60 64 80 46C92 34 100 24 106 12', 'M86 14C93 12 100 11 107 11C108 19 109 27 108 34']
      ]
    },
    cross: {
      vb: [100, 100], par: 'none',
      v: [['M10 14C34 36 62 64 92 90', 'M88 10C66 32 40 62 12 92']]
    },
    tick: {
      vb: [64, 52], par: 'xMidYMid meet',
      v: [['M5 30C11 33 17 40 23 47C32 30 45 15 60 4']]
    }
  };
  var pencilCount = 0;
  var SVGNS = 'http://www.w3.org/2000/svg';

  KT.pencil = function (kind, o) {
    o = o || {};
    var def = PENCIL[kind] || PENCIL.circle;
    kind = PENCIL[kind] ? kind : 'circle';
    var variant = def.v[(o.variant != null ? o.variant : pencilCount++) % def.v.length];
    var wrap = KT.h('span', { class: 'pencil pencil--' + kind + ' ' + (o.className || ''), 'aria-hidden': 'true' });
    var svg = d.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + def.vb[0] + ' ' + def.vb[1]);
    svg.setAttribute('preserveAspectRatio', def.par);
    svg.setAttribute('class', 'pencil__svg');
    svg.setAttribute('focusable', 'false');
    var tf = [];
    if (o.rotate) tf.push('rotate(' + o.rotate + 'deg)');
    if (o.flip) tf.push('scale(' + (/x/.test(o.flip) ? -1 : 1) + ',' + (/y/.test(o.flip) ? -1 : 1) + ')');
    if (tf.length) svg.style.transform = tf.join(' ');
    var paths = variant.map(function (dd) {
      var p = d.createElementNS(SVGNS, 'path');
      p.setAttribute('d', dd);
      p.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(p);
      return p;
    });
    wrap.appendChild(svg);
    if (o.note) wrap.appendChild(KT.h('span', { class: 'pencil__note', html: KT.fmt(o.note) }));

    var done = false;
    function lengthOf(p) {
      var user = 0;
      try { user = p.getTotalLength(); } catch (e) { return 600; }
      var r = svg.getBoundingClientRect();
      var sx = r.width / def.vb[0], sy = r.height / def.vb[1];
      if (def.par !== 'none') sx = sy = Math.min(sx, sy);
      var scr = 0, prev = null, N = 32;
      for (var i = 0; i <= N; i++) {
        var pt = p.getPointAtLength(user * i / N);
        if (prev) scr += Math.hypot((pt.x - prev.x) * sx, (pt.y - prev.y) * sy);
        prev = pt;
      }
      return Math.max(user, scr) * 1.06 + 4;
    }
    wrap.draw = function (delay) {
      if (done) return;
      done = true;
      delay = delay != null ? delay : (o.delay || 0);
      if (KT.reduced) { wrap.classList.add('is-drawn'); return; }
      var total = 0;
      var lens = paths.map(function (p) { var L = lengthOf(p); total += L; return L; });
      var dur = o.duration || Math.min(1100, 380 + total * .9);
      var t = delay;
      paths.forEach(function (p, i) {
        var L = lens[i], pd = dur * (L / total);
        p.style.transition = 'none';
        p.style.strokeDasharray = L + ' ' + L;
        p.style.strokeDashoffset = L;
        p.getBoundingClientRect();
        p.style.transition = 'stroke-dashoffset ' + pd + 'ms cubic-bezier(.55,.05,.35,1) ' + t + 'ms';
        t += pd * .92;
      });
      wrap.classList.add('is-armed');
      requestAnimationFrame(function () {
        paths.forEach(function (p) { p.style.strokeDashoffset = 0; });
        wrap.style.setProperty('--note-delay', Math.round(t * .8) + 'ms');
        wrap.classList.add('is-drawn');
      });
      setTimeout(function () {
        paths.forEach(function (p) { p.style.transition = ''; p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
      }, t + 120);
    };
    wrap.reset = function () {
      done = false;
      wrap.classList.remove('is-drawn', 'is-armed');
    };
    if (o.auto !== false) {
      // observe once attached
      requestAnimationFrame(function () {
        KT.inView(wrap, function () { wrap.draw(); }, { threshold: .35 });
      });
    }
    return wrap;
  };

  /* --------------------------------------------------- split + reveal */
  KT.splitWords = function (el) {
    if (el._words) return el._words;
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) frag.appendChild(d.createTextNode(' '));
            else { var s = KT.h('span', { class: 'w', text: p }); words.push(s); frag.appendChild(s); }
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('w') && !n.classList.contains('pencil')) {
          walk(n);
        }
      });
    })(el);
    el._words = words;
    return words;
  };

  KT.splitLines = function (el) {
    if (el._lines) return el._lines;
    // Elements with inline markup keep their markup: one mask for the lot.
    if (el.querySelector('*')) {
      var inner = KT.h('span', { class: 'line-inner' });
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(KT.h('span', { class: 'line-mask' }, inner));
      return (el._lines = [inner]);
    }
    var words = KT.splitWords(el), rows = [], top = null;
    words.forEach(function (wd) {
      var t = wd.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { rows.push([]); top = t; }
      rows[rows.length - 1].push(wd.textContent);
    });
    el.textContent = '';
    var inners = rows.map(function (r, i) {
      var inn = KT.h('span', { class: 'line-inner', text: r.join(' '), style: { '--i': i } });
      el.appendChild(KT.h('span', { class: 'line-mask' }, inn));
      return inn;
    });
    el.setAttribute('aria-label', words.map(function (x) { return x.textContent; }).join(' '));
    return (el._lines = inners);
  };

  // Failsafe: anything already scrolled past (above the viewport top) is
  // forced to its final state — IntersectionObserver never reports it after
  // an anchor jump / bfcache restore / throttled background tab.
  var sweepT = 0;
  KT.revealSweep = function () {
    KT.$$('[data-reveal]:not(.is-in)').forEach(function (el) {
      if (el.getBoundingClientRect().bottom <= 0) el.classList.add('is-in', 'is-split');
    });
  };
  function sweepSoon() {
    if (sweepT) return;
    sweepT = setTimeout(function () { sweepT = 0; KT.revealSweep(); }, 160);
  }
  var sweepWired = false;
  function wireSweep() {
    if (sweepWired) return;
    sweepWired = true;
    w.addEventListener('scroll', sweepSoon, { passive: true });
    w.addEventListener('hashchange', sweepSoon);
    w.addEventListener('pageshow', sweepSoon);
    w.addEventListener('resize', sweepSoon);
    setTimeout(KT.revealSweep, 4000);
  }

  KT.reveal = function (root) {
    root = root || d;
    wireSweep();
    sweepSoon();
    KT.$$('[data-reveal]', root).forEach(function (el) {
      if (el._revealed) return;
      el._revealed = true;
      var kind = el.getAttribute('data-reveal') || 'up';
      if (el.dataset.revealDelay) el.style.setProperty('--reveal-delay', el.dataset.revealDelay + 'ms');
      if (KT.reduced) { el.classList.add('is-in', 'is-split'); return; }
      var watch = function () {
        KT.inView(el, function () { el.classList.add('is-in'); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
      };
      if (kind === 'lines') {
        // line breaks depend on the webfont: split once it has loaded
        KT.fontsReady().then(function () {
          try { KT.splitLines(el); } catch (e) { /* keep text as is */ }
          el.classList.add('is-split');
          watch();
        });
      } else watch();
    });
  };

  KT.fit = function (el, o) {
    if (!el) return 0;
    o = o || {};
    var inner = el.querySelector('.fit__inner') || el.firstElementChild;
    if (!inner) return 0;
    var cs = getComputedStyle(el);
    var avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    el.classList.add('is-measuring');
    el.style.fontSize = '100px';
    var wdt = inner.getBoundingClientRect().width;
    el.classList.remove('is-measuring');
    if (!wdt || !avail) return 0;
    var fs = 100 * avail * (o.fill || 1) / wdt;
    fs = Math.max(o.min || 12, Math.min(o.max || Infinity, fs));
    el.style.fontSize = fs.toFixed(2) + 'px';
    return fs;
  };

  /* -------------------------------------------------------------- chrome */
  // Outer-contour-only outline for text: dilate the glyphs, then cut the
  // original away so only a ring remains. Unlike -webkit-text-stroke this
  // ignores the overlapping inner contours of variable fonts. The ring keeps
  // the element's own text colour. Use: filter: url(#kt-outline). Idempotent.
  KT.outlineFilter = function () {
    if (d.getElementById('kt-outline')) return;
    d.body.insertAdjacentHTML('beforeend',
      '<svg width="0" height="0" aria-hidden="true" style="position:absolute">' +
      '<filter id="kt-outline" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">' +
      '<feMorphology in="SourceGraphic" operator="dilate" radius="1.5" result="fat"/>' +
      '<feComposite in="fat" in2="SourceGraphic" operator="out"/>' +
      '</filter></svg>');
  };

  KT.chrome = function () {
    KT.outlineFilter();
    if (KT.$('.grid-overlay')) return;
    var g = KT.h('div', { class: 'grid-overlay', 'aria-hidden': 'true' });
    var inner = KT.h('div', { class: 'grid-overlay__inner' });
    for (var i = 0; i < 12; i++) inner.appendChild(KT.h('span'));
    g.appendChild(inner);
    d.body.appendChild(g);
    d.body.appendChild(KT.h('div', { class: 'grain', 'aria-hidden': 'true' }));
  };

  // page order (plain labels only; the metaphors live in the section captions)
  var NAV = [
    ['work', 'Work'], ['about', 'About'], ['process', 'Process'], ['sheet', 'Sheet'], ['record', 'Experience'], ['contact', 'Contact']
  ];

  // NAV minus sections switched off in content (sheet.hidden: true)
  function navItems() {
    var sh = S().sheet;
    return NAV.filter(function (n) { return !(n[0] === 'sheet' && sh && sh.hidden); });
  }

  // EN / UA two-state toggle (calls window.KT_I18N.set). Returns null when
  // i18n.js is not loaded.
  KT.langSwitch = function (cls) {
    var I = w.KT_I18N;
    if (!I || !I.set) return null;
    var langs = I.langs || ['en', 'uk'];
    var g = KT.h('div', { class: 'lang ' + (cls || ''), role: 'group', 'aria-label': KT.t('lang.label') });
    langs.forEach(function (l) {
      var on = l === KT.lang;
      var b = KT.h('button', { class: 'lang__btn', type: 'button', lang: l, 'aria-pressed': on ? 'true' : 'false', 'aria-label': KT.t('lang.' + l, l),
        html: '<span class="lang__box">' + (l === 'uk' ? 'UA' : l.toUpperCase()) + '</span>' });
      b.addEventListener('click', function () { if (!on) I.set(l); });
      g.appendChild(b);
    });
    return g;
  };

  KT.renderNav = function (active) {
    var site = S(), p = site.person || {};
    var skip = d.querySelector('.skip');
    if (skip) skip.textContent = KT.t('skip');
    var home = active === 'home' && !!d.getElementById('work');
    var href = function (id) { return (home ? '' : 'index.html') + '#' + id; };
    var mount = d.getElementById('site-header');
    var header = KT.h('header', { class: 'nav', id: 'site-header', 'data-theme': 'paper' });

    var brand = KT.h('a', { class: 'nav__brand', href: home ? '#top' : 'index.html', 'aria-label': KT.t('nav.home', null, { name: p.name || 'KT' }) },
      KT.h('span', { class: 'nav__name', text: p.name || 'Klim Tertychnyi' })
    );

    var list = KT.h('ul');
    navItems().forEach(function (n) {
      list.appendChild(KT.h('li', null, KT.h('a', { href: href(n[0]), 'data-nav': n[0], text: KT.t('nav.' + n[0], n[1]) })));
    });
    var links = KT.h('nav', { class: 'nav__links', 'aria-label': KT.t('nav.primary') }, list);

    var counter = KT.h('span', { class: 'nav__counter', 'aria-hidden': 'true', html: KT.esc(KT.t('frame')) + ' <b>01</b>/36' });
    var meta = KT.h('div', { class: 'nav__meta' },
      KT.h('a', { class: 'nav__status', href: href('contact') }, KT.h('span', { class: 'nav__dot', 'aria-hidden': 'true' }), p.status || KT.t('status')),
      counter,
      KT.langSwitch('nav__lang'),
      p.cv ? KT.h('a', { class: 'nav__cv', href: p.cv, download: '', 'aria-label': KT.t('cv.download'), html: KT.esc(KT.t('cv')) + ' ' + KT.icon('download') }) : null
    );
    var menuBtn = KT.h('button', { class: 'nav__menu-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'site-menu', html: '<span class="nav__menu-txt">' + KT.esc(KT.t('menu')) + '</span>' + KT.icon('menu') });
    meta.appendChild(menuBtn);
    header.append(brand, links, meta);

    if (mount) mount.replaceWith(header); else d.body.insertBefore(header, d.body.firstChild);

    /* mobile menu */
    var menu = KT.h('div', { class: 'menu', id: 'site-menu', 'data-theme': 'paper', role: 'dialog', 'aria-modal': 'true', 'aria-label': KT.t('menu'), hidden: true });
    var mlist = KT.h('ul', { class: 'menu__list' });
    navItems().forEach(function (n, i) {
      mlist.appendChild(KT.h('li', { style: { '--i': i } }, KT.h('a', { href: href(n[0]), class: 'menu__link', html: '<span class="menu__no">0' + (i + 1) + '</span>' + KT.esc(KT.t('nav.' + n[0], n[1])) })));
    });
    var closeBtn = KT.h('button', { class: 'menu__close', type: 'button', 'aria-label': KT.t('menu.close'), html: KT.icon('close') });
    var mfoot = KT.h('div', { class: 'menu__foot' },
      p.email ? KT.h('a', { href: 'mailto:' + p.email, text: p.email }) : null,
      p.cv ? KT.h('a', { href: p.cv, download: '', text: KT.t('cv.download') }) : null,
      KT.langSwitch('menu__lang')
    );
    menu.append(KT.h('div', { class: 'menu__top' }, KT.h('span', { class: 'nav__name', text: p.name || 'Klim Tertychnyi' }), closeBtn), mlist, mfoot);
    d.body.appendChild(menu);

    var lastFocus = null;
    function openMenu() {
      lastFocus = d.activeElement;
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
      menuBtn.setAttribute('aria-expanded', 'true');
      d.documentElement.classList.add('is-locked');
      setTimeout(function () { var f = menu.querySelector('a'); if (f) f.focus(); }, 60);
    }
    function closeMenu(noFocus) {
      menu.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      d.documentElement.classList.remove('is-locked');
      setTimeout(function () { menu.hidden = true; }, KT.reduced ? 0 : 420);
      if (!noFocus) menuBtn.focus();
    }
    menuBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', function () { closeMenu(); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(true); });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
      if (e.key === 'Tab') {
        var f = KT.$$('a, button', menu), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    w.addEventListener('resize', function () { if (!menu.hidden && w.innerWidth >= 1024) closeMenu(true); });

    /* scroll: frame counter + nav theme + active link */
    var frameEl = counter.querySelector('b'), lastFrame = -1, ticking = false;
    var navLinks = KT.$$('[data-nav]', header);
    if (!home && active) navLinks.forEach(function (a) { if (a.dataset.nav === active) a.setAttribute('aria-current', 'page'); });
    function update() {
      ticking = false;
      var max = d.documentElement.scrollHeight - w.innerHeight;
      var prog = max > 0 ? Math.min(1, Math.max(0, w.scrollY / max)) : 0;
      var fr = 1 + Math.round(prog * 35);
      if (fr !== lastFrame) { lastFrame = fr; frameEl.textContent = KT.pad(fr); }
      header.classList.toggle('is-scrolled', w.scrollY > 8);
      // theme under the bar
      var probe = d.elementFromPoint(w.innerWidth / 2, header.offsetHeight + 2);
      var themed = probe && probe.closest('[data-theme]:not(.nav)');
      var th = themed ? themed.getAttribute('data-theme') : 'paper';
      if (header.dataset.theme !== th) header.dataset.theme = th;
      if (home) {
        var mid = w.innerHeight * .4, cur = null;
        navItems().forEach(function (n) {
          var s = d.getElementById(n[0]);
          if (!s) return;
          var r = s.getBoundingClientRect();
          if (r.top <= mid && r.bottom > mid) cur = n[0];
        });
        navLinks.forEach(function (a) {
          if (a.dataset.nav === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      }
    }
    var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    w.addEventListener('scroll', req, { passive: true });
    w.addEventListener('resize', req);
    KT.navUpdate = req;
    update();
    return header;
  };

  KT.renderFooter = function () {
    var site = S(), p = site.person || {}, f = site.footer || {}, meta = site.meta || {};
    var name = (p.name || 'Klim Tertychnyi').toUpperCase();
    var foot = KT.h('footer', { class: 'foot', id: 'site-footer', 'data-theme': 'film' });
    var letters = KT.h('span', { class: 'foot__letters fit__inner', 'aria-hidden': 'true' });
    name.split('').forEach(function (ch) {
      letters.appendChild(KT.h('span', { class: 'foot__l' + (ch === ' ' ? ' foot__l--sp' : ''), html: ch === ' ' ? '&nbsp;' : KT.esc(ch) }));
    });
    var big = KT.h('p', { class: 'foot__name fit' }, KT.h('span', { class: 'sr-only', text: p.name || '' }), letters);
    var top = KT.h('button', { class: 'foot__top', type: 'button', html: KT.esc(KT.t('top')) + ' ' + KT.icon('arrow-up') });
    top.addEventListener('click', function () {
      w.scrollTo({ top: 0, behavior: KT.reduced ? 'auto' : 'smooth' });
      var t = d.getElementById('top') || d.querySelector('main');
      if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
    var row = KT.h('div', { class: 'foot__row' },
      f.note ? KT.h('p', { class: 'foot__note', html: KT.fmt(f.note) }) : null,
      KT.h('p', { class: 'foot__copy', text: '© ' + (meta.year || new Date().getFullYear()) + ' ' + (p.name || '') }),
      top
    );
    foot.append(KT.h('div', { class: 'foot__inner' }, big, row));
    var mount = d.getElementById('site-footer');
    if (mount) mount.replaceWith(foot); else d.body.appendChild(foot);
    var refit = function () { KT.fit(big, { fill: .94 }); };
    KT.fontsReady().then(refit);
    w.addEventListener('resize', KT.debounce(refit, 150));
    return foot;
  };

  KT.cursor = function () {
    if (!KT.fine || KT.reduced || KT.$('.cursor')) return;
    var c = KT.h('div', { class: 'cursor', 'aria-hidden': 'true' }, KT.h('span', { class: 'cursor__label' }));
    d.body.appendChild(c);
    var label = c.firstChild;
    var x = -100, y = -100, tx = -100, ty = -100, raf = null;
    function loop() {
      x += (tx - x) * .22; y += (ty - y) * .22;
      c.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .2 ? requestAnimationFrame(loop) : null;
    }
    w.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      c.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    d.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('[data-cursor]');
      if (t) { label.textContent = t.getAttribute('data-cursor'); c.classList.add('is-label'); }
      else c.classList.remove('is-label');
    });
    d.documentElement.addEventListener('mouseleave', function () { c.classList.remove('is-on'); });
    d.addEventListener('pointerdown', function () { c.classList.add('is-down'); });
    d.addEventListener('pointerup', function () { c.classList.remove('is-down'); });
  };

  KT.copy = function (text, el) {
    var finish = function (ok) {
      if (el) {
        var lab = el.querySelector('[data-copy-label]') || el;
        if (!lab.dataset.orig) lab.dataset.orig = lab.textContent;
        lab.textContent = ok ? KT.t('copied') : KT.t('copy.fail');
        el.classList.add('is-copied');
        clearTimeout(el._copyT);
        el._copyT = setTimeout(function () { lab.textContent = lab.dataset.orig; el.classList.remove('is-copied'); }, 1800);
      }
      KT.announce(ok ? KT.t('copy.done', null, { text: text }) : KT.t('copy.failed'));
      return ok;
    };
    var fallback = function () {
      var ta = KT.h('textarea', { style: 'position:fixed;top:-100px;opacity:0', readonly: true });
      ta.value = text; d.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = d.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return finish(ok);
    };
    if (navigator.clipboard && w.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return finish(true); }, fallback);
    }
    return Promise.resolve(fallback());
  };

  KT.boot = function (active) {
    KT.chrome();
    KT.renderNav(active);
    KT.renderFooter();
    KT.cursor();
  };
})(window, document);

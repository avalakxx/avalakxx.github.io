/* =====================================================================
   THE SELECT — js/case.js
   One case study = one track. Route: case.html?id=<caseId>
   Reads window.SITE.cases[id]; uses the shared window.KT library
   (js/core.js). Every block renders inside safe(): a broken block is
   skipped with a console warning, the rest of the page still renders.

   ROUTING & THEME
     • The side whose work.sides[].tracks contains the id gives the page
       theme ('paper' | 'film'). Not on any side -> paper.
     • Record order = Side A tracks, then Side B (A1→A2→B1→B2→A1).
       Cases with `hidden: true` (except the template) show "no such track" and are left out of the
       next/previous order and of the "no such track" tracklist.
     • Unknown / missing id -> designed "NO SUCH TRACK" state.

   LANGUAGE
     content/i18n.js (loaded before core.js) merges the Ukrainian overlay
     into SITE and sets window.KT_LANG. Content therefore arrives already
     translated; the page's own UI strings live in DICT below (en / uk),
     read through T('key', {vars}). Add a key to BOTH languages.

   CASE FIELDS
     id, track ('A1'), side ('A'), title, client, clientNote, oneLiner,
     year, role, tags[], tools[], result {value, label}, cover (media),
     blocks[], hidden (bool), underline (optional: the title word that
     gets the blue-pencil underline; default = first word with a digit,
     else the longest word).
     Any string may contain [[notes]] -> rendered as blue-pencil notes.
     media = {type:'image'|'video'|'audio', src, poster, alt, ratio,
              slot, spec}; src '' -> designed placeholder slot.

   BLOCK TYPES (blocks[] render in order; every field is optional unless
   noted; a block with nothing to show is dropped; unknown types are
   skipped with console.warn). `label` = the mono label in the sticky
   left column (each type has a default).

     {type:'text', label, heading, body:[...]}
         heading in display type, paragraphs in body type (~62ch).
         Needs heading or body.
     {type:'media', media, caption, size:'full'|'wide'|'half'}
         full = spans both zones · wide (default) = content zone ·
         half = half the content zone, caption beside (good for 9/16).
         Needs media.
     {type:'gallery', label, items:[media], columns:2|3, caption}
        each item may carry its own short caption (e.g. '16M views'),
        shown under the frame next to its number.
         numbered frames; filled images open the lightbox.
         Needs items.
     {type:'prompt', label, tool, prompt, takes, note, output: media}
         PROMPT RECEIPT slip + pencil arrow + output frame; note is a
         handwritten annotation. Needs prompt or output.
     {type:'takes', label, items:[media], selected: 1-based, note}
         contact sheet; the selected frame gets a circle + tick, the
         rest are dimmed, one or two get a pencil cross. Needs items.
     {type:'metrics', label, items:[{value, label}]}
         big-number strip (values may be words). Needs items[].value.
     {type:'beforeAfter', label, before:{title, points[], media},
                                 after:{title, points[], media}}
         two columns; if BOTH media are images with a src -> draggable
         comparison slider (pointer + keyboard) with the lists below.
     {type:'pipeline', label, steps:[{name, tool, desc}], media}
         vertical node workflow; tool 'Me' marks the human step.
     {type:'quote', text, author, role}           Needs text.
     {type:'credits', items:[{k, v}]}             Needs items.
   ===================================================================== */
(function (w, d) {
  'use strict';

  var KT = w.KT;
  if (!KT) return;
  var SITE = w.SITE || {};
  var CASES = SITE.cases || {};
  var h = KT.h, fmt = KT.fmt, esc = KT.esc, $ = KT.$, $$ = KT.$$;
  var G = w.gsap, ST = w.ScrollTrigger;
  var HAS_GSAP = !!(G && ST);
  var ANIM = HAS_GSAP && !KT.reduced;
  if (HAS_GSAP) G.registerPlugin(ST);

  /* ---- UI strings (content comes from SITE, already merged by i18n.js) */
  var LANG = /^uk/i.test(String(w.KT_LANG || d.documentElement.lang || 'en')) ? 'uk' : 'en';
  var DICT = {
    en: {
      back: 'The record', backAria: 'Back to the record', side: 'SIDE', track: 'TRACK',
      result: 'The result', cover: 'COVER', fr: 'FR', output: 'OUTPUT',
      client: 'Client', role: 'Role', year: 'Year', tools: 'Tools', tags: 'Tags',
      lText: 'NOTES', lMedia: 'FRAME', lGallery: 'GALLERY', lPrompt: 'PROMPT RECEIPT', lTakes: 'TAKES & SELECT',
      lMetrics: 'RESULT', lBA: 'BEFORE / AFTER', lPipe: 'THE PIPELINE', lQuote: 'ON THE RECORD', lCredits: 'CREDITS',
      blockOf: 'Block {n} of {t}',
      receipt: 'PROMPT RECEIPT', rTool: 'TOOL', rTakes: 'TAKES', rPrompt: 'PROMPT', rKeep: 'KEEP FOR YOUR RECORDS',
      copy: 'Copy prompt', copied: 'Copied', copyFail: 'Press Ctrl+C', pending: 'Prompt pending', pendingAria: 'Prompt not added yet',
      openFrame: 'Open frame {n}', take: 'Take {n} of {t}', takeSel: 'Take {n} of {t}, selected',
      openTake: 'Open take {n}', openTakeSel: 'Open take {n} (selected)',
      itemOf: '{l} {n} of {t}', itemOfSel: '{l} {n} of {t}, selected', openItem: 'Open {lc} {n}', openItemSel: 'Open {lc} {n} (selected)',
      before: 'BEFORE', after: 'AFTER',
      cmpAria: 'Before and after comparison. Arrow keys move the divider.',
      cmpValue: '{b}% before, {a}% after', cmpHint: 'Drag the divider, or focus it and use the arrow keys.',
      human: 'HUMAN', step: 'STEP',
      more: 'More tracks', next: 'NEXT TRACK', nextAria: 'Next track: {c}, {t}', prev: 'Previous', home: 'Back to the record',
      nf: 'NO SUCH TRACK', nfTitle: 'No such track', nfMeta: 'ERROR 404 · SILENT GROOVE', nfNoId: 'NO ID',
      nfLead: 'There is no track called “{id}” on this record.', nfLeadNone: 'No track was picked.',
      nfHand: 'drop the needle somewhere else ↓', nfDesc: 'This track is not on the record. Pick one from the tracklist.',
      lbAria: 'Image viewer', lbPrev: 'Previous image', lbNext: 'Next image', lbClose: 'Close', lbFrame: 'FRAME',
      lbAnn: 'Image {n} of {t}'
    },
    uk: {
      back: 'Платівка', backAria: 'Назад до платівки', side: 'СТОРОНА', track: 'ТРЕК',
      result: 'Результат', cover: 'ОБКЛАДИНКА', fr: 'КАДР', output: 'ГЕНЕРАЦІЯ',
      client: 'Клієнт', role: 'Роль', year: 'Рік', tools: 'Інструменти', tags: 'Теги',
      lText: 'НОТАТКИ', lMedia: 'КАДР', lGallery: 'ГАЛЕРЕЯ', lPrompt: 'ЧЕК ПРОМПТА', lTakes: 'ДУБЛІ Й ВІДБІР',
      lMetrics: 'РЕЗУЛЬТАТ', lBA: 'ДО / ПІСЛЯ', lPipe: 'ПАЙПЛАЙН', lQuote: 'ВІДГУК', lCredits: 'ТИТРИ',
      blockOf: 'Блок {n} з {t}',
      receipt: 'ЧЕК ПРОМПТА', rTool: 'ІНСТРУМЕНТ', rTakes: 'ДУБЛІ', rPrompt: 'ПРОМПТ', rKeep: 'ЗБЕРІГАЙТЕ ЧЕК',
      copy: 'Скопіювати промпт', copied: 'Скопійовано', copyFail: 'Натисніть Ctrl+C', pending: 'Промпт згодом', pendingAria: 'Промпт ще не додано',
      openFrame: 'Відкрити кадр {n}', take: 'Дубль {n} з {t}', takeSel: 'Дубль {n} з {t}, обраний',
      openTake: 'Відкрити дубль {n}', openTakeSel: 'Відкрити дубль {n} (обраний)',
      itemOf: '{l} {n} з {t}', itemOfSel: '{l} {n} з {t}, обраний', openItem: 'Відкрити {lc} {n}', openItemSel: 'Відкрити {lc} {n} (обраний)',
      before: 'ДО', after: 'ПІСЛЯ',
      cmpAria: 'Порівняння «до» і «після». Стрілки рухають роздільник.',
      cmpValue: '{b}% до, {a}% після', cmpHint: 'Потягніть роздільник або виберіть його й керуйте стрілками.',
      human: 'ЛЮДИНА', step: 'КРОК',
      more: 'Інші треки', next: 'НАСТУПНИЙ ТРЕК', nextAria: 'Наступний трек: {c}, {t}', prev: 'Попередній', home: 'Назад до платівки',
      nf: 'ТАКОГО ТРЕКУ НЕМАЄ', nfTitle: 'Такого треку немає', nfMeta: 'ПОМИЛКА 404 · ТИХА ДОРІЖКА', nfNoId: 'БЕЗ ID',
      nfLead: 'Треку «{id}» на цій платівці немає.', nfLeadNone: 'Трек не обрано.',
      nfHand: 'постав голку деінде ↓', nfDesc: 'Такого треку на платівці немає. Оберіть інший зі списку.',
      lbAria: 'Перегляд зображень', lbPrev: 'Попереднє зображення', lbNext: 'Наступне зображення', lbClose: 'Закрити', lbFrame: 'КАДР',
      lbAnn: 'Зображення {n} з {t}'
    }
  };
  // T('key', {n: 1}) -> string. Falls back to English, then to the key.
  function T(k, vars) {
    var s = own(DICT[LANG], k) ? DICT[LANG][k] : own(DICT.en, k) ? DICT.en[k] : k;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, v) { return vars[v] != null ? vars[v] : m; });
    return s;
  }

  var fitters = [];   // run after fonts load and on resize
  var motions = [];   // ScrollTrigger setups, run once after first fit
  var onFonts = [];   // one-off callbacks after fonts are ready
  var frameNo = 0;    // running frame counter (contact-sheet numbering)
  var promptNo = 0;

  function safe(name, fn) {
    try { return fn(); } catch (e) { if (w.console) console.warn('[KT case] ' + name + ' skipped:', e); }
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function has(v) { return v != null && String(v).trim() !== ''; }
  function arr(v) { return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : []; }
  function isTodo(s) { return /\[\[[\s\S]+?\]\]/.test(String(s == null ? '' : s)); }
  function nextFrame() { return KT.pad(++frameNo); }
  function own(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }
  function normMedia(m) {
    if (!m || typeof m !== 'object') return {};
    if (m.ratio != null && typeof m.ratio !== 'string') {
      var c = {}; Object.keys(m).forEach(function (k) { c[k] = m[k]; });
      c.ratio = String(m.ratio);
      return c;
    }
    return m;
  }
  function isImg(m) { return !!(m && typeof m === 'object' && m.src && (m.type || 'image') === 'image'); }

  /* ============================================================ ROUTING */
  var SIDES = ((SITE.work || {}).sides || []).filter(Boolean);
  function getCase(id) {
    return id && own(CASES, id) && CASES[id] && typeof CASES[id] === 'object' ? CASES[id] : null;
  }
  function sideOf(id) {
    for (var i = 0; i < SIDES.length; i++) if ((SIDES[i].tracks || []).indexOf(id) > -1) return SIDES[i];
    return null;
  }
  function themeOf(id) { var s = sideOf(id); return s && s.theme === 'film' ? 'film' : 'paper'; }
  function codeOf(c, id) { return KT.plain(c.track || String(id).toUpperCase()); }
  function sideName(c, id) {
    var s = sideOf(id);
    if (s) return KT.plain(s.name || (T('side') + ' ' + (s.id || '')));
    return c && has(c.side) ? T('side') + ' ' + KT.plain(c.side) : '';
  }
  var ORDER = [];
  SIDES.forEach(function (s) {
    (s.tracks || []).forEach(function (id) {
      var c = getCase(id);
      if (c && !c.hidden && ORDER.indexOf(id) < 0) ORDER.push(id);
    });
  });

  /* ======================================================== CASE HEADER */
  function pickUnderline(words, want) {
    var plain = words.map(function (x) { return x.replace(/[^\w\d+%$–-]/g, ''); });
    if (has(want)) {
      var k = plain.map(function (x) { return x.toLowerCase(); }).indexOf(String(want).toLowerCase().replace(/[^\w\d+%$–-]/g, ''));
      if (k > -1) return k;
    }
    for (var i = 0; i < words.length; i++) if (/\d/.test(words[i])) return i;
    var best = -1, len = 0;
    plain.forEach(function (x, i) { if (x.length > len) { len = x.length; best = i; } });
    return len >= 3 ? best : -1;
  }

  var title = { el: null, mark: null, width: 0 };

  function buildTitle(c, code) {
    var el = h('h1', { class: 'ch__title t-display t-sentence t-800', id: 'case-title' });
    var txt = has(c.title) ? String(c.title) : code;
    title.el = el;
    if (isTodo(txt)) {           // notes inside: no word split, plain rise
      el.innerHTML = fmt(txt);
      el.setAttribute('data-reveal', 'up');
      el.classList.add('is-split', 'is-done');
      return el;
    }
    var words = txt.trim().split(/\s+/);
    var pick = pickUnderline(words, c.underline);
    words.forEach(function (wd, i) {
      if (i) el.appendChild(d.createTextNode(' '));
      var s = h('span', { class: 'w', text: wd });
      if (i === pick) {
        s.classList.add('w--mark', 'has-pencil');
        title.mark = KT.pencil('underline', { auto: false, variant: 1, className: 'ch__under', duration: 700 });
        s.appendChild(title.mark);
      }
      el.appendChild(s);
    });
    // own mask reveal (KT.reveal would merge the lines because of the pencil span)
    el.setAttribute('data-reveal', 'mask');
    el._revealed = true;
    return el;
  }

  function splitTitle() {
    var el = title.el;
    if (!el) return 0;
    var words = $$('.w', el);
    if (!words.length) return 0;
    el.textContent = '';                          // flatten first (re-split on resize)
    words.forEach(function (wd, i) { if (i) el.appendChild(d.createTextNode(' ')); el.appendChild(wd); });
    var rows = [], top = null;
    words.forEach(function (wd) {
      var t = wd.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { rows.push([]); top = t; }
      rows[rows.length - 1].push(wd);
    });
    el.textContent = '';
    rows.forEach(function (r, i) {
      var inner = h('span', { class: 'line-inner', style: { '--i': i } });
      r.forEach(function (wd, k) { if (k) inner.appendChild(d.createTextNode(' ')); inner.appendChild(wd); });
      el.appendChild(h('span', { class: 'line-mask' }, inner));
    });
    title.width = el.clientWidth;
    return rows.length;
  }

  function revealTitle() {
    var el = title.el;
    if (!el || el.classList.contains('is-done')) return;
    var finish = function () {
      el.classList.add('is-done');
      if (title.mark) title.mark.draw(KT.reduced ? 0 : 120);
    };
    if (KT.reduced) { safe('title split', splitTitle); el.classList.add('is-split', 'is-in'); finish(); return; }
    KT.fontsReady(1500).then(function () {
      var n = safe('title split', splitTitle) || 1;
      el.classList.add('is-split');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.classList.add('is-in');
          setTimeout(finish, 1050 + n * 90);
        });
      });
    });
  }

  // KT.copy + the state label in the page language
  function copyText(text, el) {
    var lab = el.querySelector('[data-copy-label]') || el;
    if (!lab.dataset.orig) lab.dataset.orig = lab.textContent;
    return KT.copy(text, el).then(function (ok) {
      lab.textContent = ok ? T('copied') : T('copyFail');
      return ok;
    });
  }

  function backLink() {
    return h('a', { class: 'ch__back label label--fg', href: 'index.html#work', 'aria-label': T('backAria'),
      html: '<span class="ch__back-ar" aria-hidden="true">←</span> ' + esc(T('back')) });
  }

  function renderHeader(c, id, code) {
    var head = h('header', { class: 'ch', 'aria-labelledby': 'case-title' });
    var sn = sideName(c, id);
    head.appendChild(h('div', { class: 'ch__meta' },
      backLink(),
      h('span', { class: 'label label--fg ch__where', text: (sn ? sn + ' — ' : '') + T('track') + ' ' + code }),
      h('span', { class: 'label ch__year', html: fmt(c.year || '') })
    ));
    head.appendChild(buildTitle(c, code));

    var intro = h('div', { class: 'ch__intro' });
    if (has(c.oneLiner)) intro.appendChild(h('p', { class: 't-lead ch__lead', html: fmt(c.oneLiner), 'data-reveal': 'up', 'data-reveal-delay': 250 }));
    var spec = renderSpec(c);
    if (spec) intro.appendChild(spec);
    var result = safe('result', function () { return renderResult(c, code); });
    head.appendChild(h('div', { class: 'ch__grid' + (result ? '' : ' is-solo') }, intro, result || null));

    var cover = safe('cover', function () { return renderCover(c, code); });
    if (cover) head.appendChild(cover);
    return head;
  }

  function tagList(list, label) {
    var items = arr(list).filter(has);
    if (!items.length) return null;
    return h('ul', { class: 'tags', 'aria-label': label }, items.map(function (t) { return h('li', { class: 'tag', html: fmt(t) }); }));
  }

  function renderSpec(c) {
    var rows = [];
    if (has(c.client)) rows.push([T('client'), h('span', { class: 'ch__client', html: '<b>' + fmt(c.client) + '</b>' + (has(c.clientNote) ? '<span class="ch__cnote">' + fmt(c.clientNote) + '</span>' : '') })]);
    if (has(c.role)) rows.push([T('role'), h('span', { html: fmt(c.role) })]);
    if (has(c.year)) rows.push([T('year'), h('span', { html: fmt(c.year) })]);
    var tools = tagList(c.tools, T('tools')); if (tools) rows.push([T('tools'), tools]);
    var tags = tagList(c.tags, T('tags')); if (tags) rows.push([T('tags'), tags]);
    if (!rows.length) return null;
    return h('dl', { class: 'ch__spec', 'data-reveal': 'up', 'data-reveal-delay': 350 }, rows.map(function (r) {
      return h('div', { class: 'ch__row' }, h('dt', { class: 'label', text: r[0] }), h('dd', null, r[1]));
    }));
  }

  // value cell shared by the result and the metrics strip
  function valueEl(value, cls, withPencil) {
    var todo = isTodo(value);
    var txt = h('span', { class: 'cs-val__txt', html: fmt(value) });
    var inner = h('span', { class: 'cs-val__in' + (withPencil ? ' has-pencil' : '') }, txt);
    var multi = /\s/.test(KT.plain(value).trim()) && !todo;
    var p = h('p', { class: 'cs-val t-display t-sentence t-800 ' + (cls || '') + (todo ? ' is-todo' : '') + (multi ? ' is-multi' : '') }, inner);
    p._txt = txt; p._in = inner;
    if (!todo) fitters.push(function () { fitValue(p); });
    return p;
  }

  // Size a value to its cell: the CSS size is the ceiling; long phrases get a
  // smaller tier; the widest word must fit. Never overflows.
  function fitValue(p) {
    var inner = p._in;
    if (!inner || !p.clientWidth) return;
    p.style.fontSize = '';
    var max = parseFloat(getComputedStyle(p).fontSize) || 100;
    var txt = p._txt, finalTxt = txt && txt.dataset.final, cur = null;
    if (finalTxt) { cur = txt.textContent; txt.textContent = finalTxt; }
    var plain = KT.plain(inner.textContent).trim();
    var multi = p.classList.contains('is-multi');
    if (multi && plain.length > 9) max *= .58;
    p.style.fontSize = max.toFixed(2) + 'px';
    var avail = p.clientWidth * (p._fill || 1), wmax = 0;
    if (multi) {
      KT.splitWords(txt).forEach(function (wd) { wmax = Math.max(wmax, wd.getBoundingClientRect().width); });
    } else wmax = inner.getBoundingClientRect().width;
    if (cur != null) txt.textContent = cur;
    if (wmax > avail) p.style.fontSize = Math.max(18, max * avail / wmax).toFixed(2) + 'px';
  }

  function renderResult(c, code) {
    var R = c.result;
    if (!R || !has(R.value)) return null;
    var val = valueEl(R.value, 'cs-result__val', true);
    val._fill = .84;   // room for the pencil circle
    var circle = KT.pencil('circle', { auto: false, variant: 0, className: 'cs-result__circle', duration: 950 });
    val._in.appendChild(circle);
    onFonts.push(function () {
      if (KT.reduced) { circle.draw(0); return; }
      KT.inView(val, function () { circle.draw(650); }, { threshold: .4 });
    });
    return h('div', { class: 'cs-result', 'data-reveal': 'up', 'data-reveal-delay': 300 },
      h('div', { class: 'cs-result__bar' },
        h('span', { class: 'label label--accent', text: code + ' — 00' }),
        h('span', { class: 'label', text: T('result') })),
      h('div', { class: 'cs-result__body' },
        val,
        has(R.label) ? h('p', { class: 'cs-result__label', html: fmt(R.label) }) : null));
  }

  var coverFig = null;
  function renderCover(c, code) {
    if (!c.cover) return null;
    var m = normMedia(c.cover);
    var fig = KT.media(m, { id: code + '-COVER', eager: true, className: 'ch__cover', play: 'auto' });
    coverFig = fig;
    return h('div', { class: 'ch__cover-wrap', style: { '--ar': KT.ratio(String(m.ratio || '16/9')).toFixed(4) }, 'data-reveal': 'up', 'data-reveal-delay': 450 },
      h('div', { class: 'ch__edge', 'aria-hidden': 'true' },
        h('span', { html: esc(code) + ' — ' + esc(T('cover')) + ' ' + KT.icon('tri') }),
        h('span', { text: String(m.ratio || '16/9').replace('/', ':') + ' · ' + T('fr') + ' 00' })),
      fig);
  }

  // The cover is composed edge to edge: no scale / parallax inside the frame (it would crop the image).
  function coverMotion() {}

  /* ============================================================= BLOCKS */
  var DEFAULT_LABEL = {
    text: T('lText'), media: T('lMedia'), gallery: T('lGallery'), prompt: T('lPrompt'), takes: T('lTakes'),
    metrics: T('lMetrics'), beforeAfter: T('lBA'), pipeline: T('lPipe'), quote: T('lQuote'), credits: T('lCredits')
  };
  function frLabel(no) { return T('fr') + ' ' + no; }

  function capEl(no, text, extra) {
    return h('p', { class: 'cs-cap' + (extra ? ' ' + extra : '') },
      h('span', { class: 'cs-cap__no', text: frLabel(no) }),
      has(text) ? h('span', { class: 'cs-cap__txt', html: fmt(text) }) : null);
  }

  /* ---- text */
  function bText(b, ctx) {
    var body = typeof b.body === 'string' ? [b.body] : arr(b.body).filter(has);
    if (!has(b.heading) && !body.length) return null;
    var hid = 'blk-h-' + ctx.idx;
    return {
      heading: has(b.heading), headingId: hid,
      body: h('div', { class: 'cs-text' },
        has(b.heading) ? h('h2', { class: 't-display t-sentence cs-text__h', id: hid, html: fmt(b.heading), 'data-reveal': 'lines' }) : null,
        body.length ? h('div', { class: 'cs-text__body' }, body.map(function (p, i) {
          return h('p', { class: 't-body', html: fmt(p), 'data-reveal': 'up', 'data-reveal-delay': 80 + i * 70 });
        })) : null)
    };
  }

  /* ---- media */
  function bMedia(b, ctx) {
    if (!b.media || typeof b.media !== 'object') return null;
    var size = b.size === 'full' || b.size === 'half' ? b.size : 'wide';
    var m = normMedia(b.media), no = nextFrame();
    var fig = KT.media(m, { id: ctx.code + '-' + no, className: 'cs-frame' + (size === 'full' ? '' : ' cs-capped'), play: 'auto' });
    var cap = capEl(no, b.caption);
    var wrap = h('div', { class: 'cs-media cs-media--' + size }, h('div', { class: 'cs-media__fig', 'data-reveal': 'up' }, fig), h('div', { class: 'cs-media__side', 'data-reveal': 'up', 'data-reveal-delay': 120 }, cap));
    if (size === 'half' && has(b.caption)) {
      cap.classList.add('has-pencil');
      cap.insertBefore(KT.pencil('arrow', { variant: 0, flip: 'x', className: 'cs-media__arrow', delay: 250 }), cap.firstChild);
    }
    return { body: wrap, mod: size === 'full' ? 'full' : null };
  }

  /* ---- gallery */
  function openBtn(shots, k, label) {
    var btn = h('button', { class: 'cs-open', type: 'button', 'data-cursor': 'VIEW', 'aria-label': label });
    btn.addEventListener('click', function () { lightbox().open(shots, k, btn); });
    return btn;
  }

  function bGallery(b, ctx) {
    var items = arr(b.items).filter(function (x) { return typeof x === 'object'; });
    if (!items.length) return null;
    var cols = +b.columns === 2 ? 2 : +b.columns === 3 ? 3 : (items.length % 3 === 0 ? 3 : 2);
    var grid = h('ul', { class: 'cs-gallery', 'data-cols': cols });
    var shots = [];
    items.forEach(function (raw, i) {
      var m = normMedia(raw), no = nextFrame();
      var fig = KT.media(m, { id: ctx.code + '-' + no, number: frLabel(no), caption: has(raw.caption) ? raw.caption : '' });
      var li = h('li', { class: 'cs-gitem', 'data-reveal': 'up', 'data-reveal-delay': (i % cols) * 80 }, fig);
      if (isImg(m)) {
        var k = shots.push({ m: m, no: no }) - 1;
        li.classList.add('is-openable');
        li.appendChild(openBtn(shots, k, T('openFrame', { n: no }) + (m.alt ? ': ' + KT.plain(m.alt) : '')));
      }
      grid.appendChild(li);
    });
    return {
      body: h('div', { class: 'cs-gal' }, grid,
        has(b.caption) ? h('p', { class: 'cs-cap cs-cap--block', 'data-reveal': 'up', html: fmt(b.caption) }) : null)
    };
  }

  /* ---- prompt receipt */
  function bPrompt(b, ctx) {
    var hasOut = b.output && typeof b.output === 'object';
    if (!has(b.prompt) && !hasOut) return null;
    var no = KT.pad(++promptNo);
    var rows = [[T('rTool'), b.tool], [T('rTakes'), b.takes]].filter(function (r) { return has(r[1]); });
    var copy = null;
    if (has(b.prompt)) {
      var pending = /^\s*\[\[[\s\S]*\]\]\s*$/.test(String(b.prompt));
      copy = h('button', {
        class: 'btn cs-receipt__copy', type: 'button', 'data-cursor': pending ? null : 'COPY', disabled: pending,
        'aria-label': pending ? T('pendingAria') : null,
        html: KT.icon('copy') + '<span data-copy-label>' + esc(pending ? T('pending') : T('copy')) + '</span>'
      });
      if (!pending) copy.addEventListener('click', function () { copyText(KT.plain(b.prompt), copy); });
    }
    var receipt = h('div', { class: 'cs-receipt' },
      h('div', { class: 'cs-receipt__head' }, h('span', { text: T('receipt') }), h('span', { text: '№ ' + ctx.code + '-' + no })),
      h('p', { class: 'cs-receipt__sub', text: 'THE SELECT · ' + ((SITE.person || {}).short || 'KT') + ' · ' + T('track') + ' ' + ctx.code }),
      rows.length ? h('dl', { class: 'cs-receipt__rows' }, rows.map(function (r) {
        return h('div', { class: 'cs-receipt__row' }, h('dt', { text: r[0] }), h('dd', { html: fmt(r[1]) }));
      })) : null,
      has(b.prompt) ? h('div', { class: 'cs-receipt__prompt' },
        h('span', { class: 'cs-receipt__k', text: T('rPrompt') }),
        h('pre', { html: fmt(String(b.prompt)) })) : null,
      copy,
      h('div', { class: 'cs-receipt__foot' },
        h('span', { class: 'cs-receipt__bars', 'aria-hidden': 'true' }),
        h('span', { text: T('rKeep') }))
    );
    var slip = h('div', { class: 'cs-prompt__slip', 'data-reveal': 'up' }, h('div', { class: 'cs-slip' }, receipt));
    var note = has(b.note) ? h('p', { class: 'hand cs-prompt__note', html: fmt(b.note) }) : null;
    if (!hasOut) return { body: h('div', { class: 'cs-prompt is-solo' }, slip, note) };
    var ono = nextFrame();
    var out = KT.media(normMedia(b.output), { id: ctx.code + '-' + ono, number: T('output') + ' · ' + frLabel(ono), className: 'cs-capped cs-prompt__frame', play: 'auto' });
    var arrow = KT.pencil('arrow', { variant: 1, className: 'cs-prompt__arrow', delay: 350, duration: 650 });
    return {
      body: h('div', { class: 'cs-prompt' },
        slip,
        h('div', { class: 'cs-prompt__mid', 'aria-hidden': 'true' }, arrow),
        h('div', { class: 'cs-prompt__out', 'data-reveal': 'up', 'data-reveal-delay': 140 }, out, note))
    };
  }

  /* ---- takes & select */
  function bTakes(b, ctx) {
    var items = arr(b.items).filter(function (x) { return typeof x === 'object'; });
    if (!items.length) return null;
    var n = items.length;
    var sel = parseInt(b.selected, 10);
    sel = sel >= 1 && sel <= n ? sel - 1 : -1;
    var crosses = [];
    if (sel > -1 && n >= 3) {
      [(sel + 2) % n, n - 1 === sel ? 0 : n - 1].forEach(function (k) {
        if (k !== sel && crosses.indexOf(k) < 0 && crosses.length < (n >= 5 ? 2 : 1)) crosses.push(k);
      });
    }
    var il = has(b.itemLabel) ? String(b.itemLabel) : '';
    var grid = h('ol', { class: 'cs-takes' + (sel > -1 ? ' has-select' : '') });
    var shots = [], selLi = null, marks = [], crossMarks = [];
    items.forEach(function (raw, i) {
      var m = normMedia(raw), num = i + 1, isSel = i === sel;
      var fig = KT.media(m, { id: ctx.code + '-T' + num });
      var fr = h('div', { class: 'cs-take__frame has-pencil' }, fig);
      if (isSel) {
        var circ = KT.pencil('circle', { auto: false, variant: 2, className: 'cs-take__circle' });
        var tick = KT.pencil('tick', { auto: false, className: 'cs-take__tick' });
        fr.append(circ, tick);
        marks = [circ, tick];
      }
      if (crosses.indexOf(i) > -1) {
        var x = KT.pencil('cross', { auto: false, className: 'cs-take__cross' });
        fr.appendChild(x);
        crossMarks.push(x);
      }
      var li = h('li', { class: 'cs-take' + (isSel ? ' is-selected' : '') + (crosses.indexOf(i) > -1 ? ' is-crossed' : '') },
        h('div', { class: 'cs-take__edge', 'aria-hidden': 'true' },
          h('span', { class: 'cs-take__n', text: String(num) }),
          h('span', { class: 'cs-take__code', html: KT.icon('tri') + ' ' + num + 'A' })),
        fr,
        h('span', { class: 'sr-only', text: il ? T(isSel ? 'itemOfSel' : 'itemOf', { l: il, n: num, t: n }) : T(isSel ? 'takeSel' : 'take', { n: num, t: n }) }));
      if (isImg(m)) {
        var k = shots.push({ m: m, no: num + 'A' }) - 1;
        li.classList.add('is-openable');
        li.appendChild(openBtn(shots, k, il ? T(isSel ? 'openItemSel' : 'openItem', { lc: il.toLowerCase(), n: num }) : T(isSel ? 'openTakeSel' : 'openTake', { n: num })));
      }
      if (isSel) selLi = li;
      grid.appendChild(li);
    });

    var note = null;
    if (has(b.note)) {
      note = h('div', { class: 'cs-takes__note has-pencil' },
        sel > -1 ? KT.pencil('arrow', { auto: false, variant: 0, className: 'cs-takes__arrow' }) : null,
        h('p', { class: 'hand', html: fmt(b.note) }));
      if (selLi) fitters.push(function () {
        note.style.marginLeft = '';
        if (w.innerWidth < 480) return;
        var x = selLi.offsetLeft + selLi.offsetWidth * .35;
        note.style.marginLeft = clamp(x, 0, Math.max(0, grid.clientWidth - note.offsetWidth)).toFixed(0) + 'px';
      });
    }
    var wrap = h('div', { class: 'cs-takes-wrap' }, grid, note);
    var judge = function () {
      wrap.classList.add('is-judged');
      if (marks[0]) marks[0].draw(150);
      if (marks[1]) marks[1].draw(900);
      crossMarks.forEach(function (x, j) { x.draw(450 + j * 220); });
      var ar = note && $('.pencil', note);
      if (ar) ar.draw(1100);
    };
    onFonts.push(function () {
      if (KT.reduced) judge();
      else KT.inView(grid, judge, { threshold: .3 });
    });
    return { body: wrap };
  }

  /* ---- metrics */
  function countUp(txt, value, trigger, i) {
    var s = String(value);
    if (!ANIM || /\s|\[\[/.test(s)) return;
    var m = s.match(/^(.*?)(\d[\d,]*(?:\.\d+)?)(\D*)$/);
    if (!m) return;
    var num = parseFloat(m[2].replace(/,/g, ''));
    if (!isFinite(num) || num <= 0) return;
    var pre = m[1], suf = m[3], comma = /,/.test(m[2]), dec = (m[2].split('.')[1] || '').length;
    var from = parseFloat(((pre.match(/\d[\d,]*/) || ['0'])[0]).replace(/,/g, '')) || 0;
    if (from >= num) from = 0;
    var show = function (v) {
      var str = comma ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec);
      txt.textContent = pre + str + suf;
    };
    txt.dataset.final = s;
    show(from);
    KT.inView(trigger, function () {
      var o = { v: from };
      G.to(o, {
        v: num, duration: 1.6, delay: .15 + i * .08, ease: 'power3.out',
        onUpdate: function () { show(o.v); },
        onComplete: function () { txt.textContent = s; delete txt.dataset.final; }
      });
    }, { threshold: .4 });
  }

  function bMetrics(b) {
    var items = arr(b.items).filter(function (x) { return x && has(x.value); });
    if (!items.length) return null;
    var ol = h('ol', { class: 'cs-metrics', 'data-n': Math.min(items.length, 4) });
    // --len = longest value: CSS shrinks every number in the strip equally so the longest (e.g. "330–500") fits its column
    ol.style.setProperty('--len', Math.max.apply(null, [4].concat(items.map(function (it) { return String(KT.plain ? KT.plain(it.value) : it.value).length; }))));
    items.forEach(function (it, i) {
      var val = valueEl(it.value, 'cs-metric__val', false);
      var li = h('li', { class: 'cs-metric', 'data-reveal': 'up', 'data-reveal-delay': i * 90 },
        h('span', { class: 'label label--accent cs-metric__no', 'aria-hidden': 'true', text: KT.pad(i + 1) }),
        val,
        has(it.label) ? h('p', { class: 'cs-metric__label', html: fmt(it.label) }) : null);
      countUp(val._txt, it.value, li, i);
      ol.appendChild(li);
    });
    return { body: ol, mod: 'wide' };
  }

  /* ---- before / after */
  function compare(B, A) {
    var ratio = String(A.media.ratio || B.media.ratio || '16/9');
    var rp = ratio.split('/'), ar = (parseFloat(rp[0]) / parseFloat(rp[1] || 1)) || 16 / 9;
    var wrap = h('div', { class: 'cs-cmp', style: { '--ratio': ratio.replace('/', ' / '), '--ar': ar.toFixed(4) } });
    var after = h('img', { class: 'cs-cmp__img', src: A.media.src, alt: KT.plain(A.media.alt || 'After'), loading: 'lazy', decoding: 'async', draggable: 'false' });
    var before = h('img', { class: 'cs-cmp__img cs-cmp__before', src: B.media.src, alt: KT.plain(B.media.alt || 'Before'), loading: 'lazy', decoding: 'async', draggable: 'false' });
    var handle = h('div', {
      class: 'cs-cmp__handle', role: 'slider', tabindex: '0', 'aria-orientation': 'horizontal',
      'aria-label': T('cmpAria'),
      'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '50'
    }, h('span', { class: 'cs-cmp__knob', html: KT.icon('prev') + KT.icon('next') }));
    wrap.append(after, before,
      h('span', { class: 'cs-cmp__tag cs-cmp__tag--b', 'aria-hidden': 'true', text: T('before') }),
      h('span', { class: 'cs-cmp__tag cs-cmp__tag--a', 'aria-hidden': 'true', text: T('after') }),
      handle);
    var pos = 50, drag = false;
    function set(p) {
      pos = clamp(p, 0, 100);
      wrap.style.setProperty('--pos', pos.toFixed(2) + '%');
      var r = Math.round(pos);
      handle.setAttribute('aria-valuenow', String(r));
      handle.setAttribute('aria-valuetext', T('cmpValue', { b: r, a: 100 - r }));
    }
    function move(e) {
      var r = wrap.getBoundingClientRect();
      if (r.width) set((e.clientX - r.left) / r.width * 100);
    }
    wrap.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drag = true;
      wrap.classList.add('is-dragging');
      try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      move(e);
      handle.focus({ preventScroll: true });
    });
    wrap.addEventListener('pointermove', function (e) { if (drag) move(e); });
    var stop = function () { drag = false; wrap.classList.remove('is-dragging'); };
    wrap.addEventListener('pointerup', stop);
    wrap.addEventListener('pointercancel', stop);
    handle.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 2, k = e.key, nv = null;
      if (k === 'ArrowLeft' || k === 'ArrowDown') nv = pos - step;
      else if (k === 'ArrowRight' || k === 'ArrowUp') nv = pos + step;
      else if (k === 'PageDown') nv = pos - 20;
      else if (k === 'PageUp') nv = pos + 20;
      else if (k === 'Home') nv = 0;
      else if (k === 'End') nv = 100;
      if (nv === null) return;
      e.preventDefault();
      set(nv);
    });
    set(50);
    return wrap;
  }

  function bBeforeAfter(b, ctx) {
    var B = b.before && typeof b.before === 'object' ? b.before : {};
    var A = b.after && typeof b.after === 'object' ? b.after : {};
    var any = function (x) { return has(x.title) || arr(x.points).length || (x.media && typeof x.media === 'object'); };
    if (!any(B) && !any(A)) return null;
    var slider = isImg(B.media) && isImg(A.media);

    function col(x, kind) {
      var before = kind === 'before';
      var t = null;
      if (has(x.title)) {
        t = h('span', { class: 'cs-ba__t has-pencil', html: fmt(x.title) });
        t.appendChild(before
          ? KT.pencil('underline', { variant: 1, className: 'cs-ba__strike', delay: 250 })
          : KT.pencil('tick', { className: 'cs-ba__tick', delay: 650 }));
      }
      var media = null;
      if (!slider && x.media && typeof x.media === 'object') {
        var no = nextFrame();
        media = KT.media(normMedia(x.media), { id: ctx.code + '-' + no, number: T(kind) + ' · ' + frLabel(no) });
      }
      var pts = arr(x.points).filter(has);
      return h('div', { class: 'cs-ba__col cs-ba__col--' + kind, 'data-reveal': 'up', 'data-reveal-delay': before ? 0 : 120 },
        h('p', { class: 'label cs-ba__tag', html: esc(T(kind)) + '<span aria-hidden="true">' + (before ? '−' : '+') + '</span>' }),
        t ? h('h3', { class: 't-display t-sentence cs-ba__title' }, t) : null,
        media,
        pts.length ? h('ul', { class: 'cs-points' }, pts.map(function (p) { return h('li', { html: fmt(p) }); })) : null);
    }
    var cols = h('div', { class: 'cs-ba' }, col(B, 'before'), col(A, 'after'));
    if (!slider) return { body: cols };
    return { body: h('div', { class: 'cs-ba-wrap' }, h('div', { 'data-reveal': 'up' }, compare(B, A), capEl(nextFrame(), T('cmpHint'))), cols) };
  }

  /* ---- pipeline */
  function bPipeline(b, ctx) {
    var steps = arr(b.steps).filter(function (s) { return typeof s === 'object'; });
    var hasMedia = b.media && typeof b.media === 'object';
    if (!steps.length && !hasMedia) return null;
    var body = h('div', { class: 'cs-pipe-wrap' });
    if (steps.length) {
      var fill = h('span', { class: 'cs-pipe__fill' });
      var rail = h('div', { class: 'cs-pipe__rail', 'aria-hidden': 'true' }, fill);
      var ol = h('ol', { class: 'cs-pipe__nodes' });
      var nodes = steps.map(function (s, i) {
        var human = /^\s*(me|я)\s*$/i.test(KT.plain(s.tool || ''));
        var li = h('li', { class: 'cs-node' + (human ? ' cs-node--human has-pencil' : '') },
          h('span', { class: 'cs-node__port', 'aria-hidden': 'true' }),
          h('div', { class: 'cs-node__bar' },
            h('span', { class: 'cs-node__no', text: KT.pad(i + 1) }),
            h('span', { class: 'label cs-node__kind', text: human ? T('human') : T('step') })),
          has(s.name) ? h('h3', { class: 'cs-node__name t-display t-upper', html: fmt(s.name) }) : null,
          has(s.tool) ? h('p', { class: 'cs-node__tool' }, h('span', { class: 'tag', html: fmt(s.tool) })) : null,
          has(s.desc) ? h('p', { class: 'cs-node__desc', html: fmt(s.desc) }) : null);
        if (human) { li._pencil = KT.pencil('circle', { variant: 2, auto: false, className: 'cs-node__circle' }); li.appendChild(li._pencil); }
        ol.appendChild(li);
        return li;
      });
      var pipe = h('div', { class: 'cs-pipe' }, rail, ol);
      body.appendChild(pipe);

      var fracs = [], lastP = ANIM ? 0 : 1;
      var activate = function (n, on) {
        if (n.classList.contains('is-active') === on) return;
        n.classList.toggle('is-active', on);
        if (on && n._pencil) n._pencil.draw(250);
      };
      var apply = function (p) {
        lastP = p;
        fill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
        nodes.forEach(function (n, j) { activate(n, p > .004 && p >= fracs[j] - .01); });
      };
      fitters.push(function () {
        var H = ol.offsetHeight || 1;
        fracs = nodes.map(function (n) { return (n.offsetTop + 20) / H; });
        apply(lastP);
      });
      motions.push(function () {
        if (!ANIM) { apply(1); return; }
        ST.create({
          trigger: pipe, start: 'top 72%', end: 'bottom 62%', scrub: .5,
          onUpdate: function (self) { apply(self.progress); },
          onRefresh: function (self) { apply(self.progress); }
        });
      });
    }
    if (hasMedia) {
      var no = nextFrame();
      body.appendChild(h('div', { class: 'cs-pipe__media', 'data-reveal': 'up' },
        KT.media(normMedia(b.media), { id: ctx.code + '-' + no, number: frLabel(no), play: 'auto' })));
    }
    return { body: body };
  }

  /* ---- quote */
  function bQuote(b) {
    if (!has(b.text)) return null;
    return {
      body: h('figure', { class: 'cs-quote' },
        h('span', { class: 'cs-quote__mark', 'aria-hidden': 'true', 'data-reveal': 'fade', text: '“' }),
        h('blockquote', { class: 'cs-quote__text', 'data-reveal': 'up' },
          h('p', { html: fmt(b.text) + '<span class="cs-quote__close" aria-hidden="true">”</span>' })),
        (has(b.author) || has(b.role)) ? h('figcaption', { class: 'cs-quote__by', 'data-reveal': 'up', 'data-reveal-delay': 120 },
          has(b.author) ? h('span', { class: 'label label--fg', html: '— ' + fmt(b.author) }) : null,
          has(b.role) ? h('span', { class: 'label', html: fmt(b.role) }) : null) : null)
    };
  }

  /* ---- credits */
  function bCredits(b) {
    var items = arr(b.items).filter(function (x) { return typeof x === 'object' && (has(x.k) || has(x.v)); });
    if (!items.length) return null;
    return {
      body: h('dl', { class: 'cs-credits', 'data-reveal': 'up' }, items.map(function (it) {
        return h('div', { class: 'cs-credits__row' }, h('dt', { class: 'label', html: fmt(it.k || '') }), h('dd', { html: fmt(it.v || '') }));
      }))
    };
  }

  var RENDER = {
    text: bText, media: bMedia, gallery: bGallery, prompt: bPrompt, takes: bTakes,
    metrics: bMetrics, beforeAfter: bBeforeAfter, pipeline: bPipeline, quote: bQuote, credits: bCredits
  };

  function renderBlocks(c, code) {
    var built = [];
    arr(c.blocks).forEach(function (b, i) {
      if (typeof b !== 'object') return;
      var fn = own(RENDER, b.type) ? RENDER[b.type] : null;
      if (!fn) { if (w.console) console.warn('[KT case] unknown block type "' + b.type + '" (blocks[' + i + ']) skipped'); return; }
      var out = safe('blocks[' + i + '] ' + b.type, function () { return fn(b, { code: code, idx: i }); });
      if (out && out.body) built.push({ b: b, out: out });
    });
    if (!built.length) return null;
    var wrap = h('div', { class: 'cs-blocks' });
    built.forEach(function (x, k) {
      var b = x.b, out = x.out, n = k + 1;
      var label = has(b.label) ? b.label : (DEFAULT_LABEL[b.type] || '');
      var lid = 'blk-l-' + n;
      var side = h('div', { class: 'blk__side', 'data-reveal': 'fade' },
        h('span', { class: 'label label--accent blk__no', 'aria-hidden': 'true', text: KT.pad(n) + ' / ' + KT.pad(built.length) }),
        h('span', { class: 'sr-only', text: T('blockOf', { n: n, t: built.length }) }),
        out.heading
          ? h('p', { class: 'label label--fg blk__label', html: fmt(label) })
          : h('h2', { class: 'label label--fg blk__label', id: lid, html: fmt(label) }));
      wrap.appendChild(h('section', {
        class: 'blk blk--' + b.type + (out.mod ? ' blk--' + out.mod : ''),
        'aria-labelledby': out.heading ? out.headingId : lid
      }, side, h('div', { class: 'blk__body' }, out.body)));
    });
    return wrap;
  }

  /* ========================================================= NEXT TRACK */
  function balance(text) {
    text = text.trim();
    if (text.length <= 16 || !/\s/.test(text)) return [text];
    var mid = text.length / 2, best = -1, dist = Infinity;
    text.replace(/\s/g, function (m, i) { if (Math.abs(i - mid) < dist) { dist = Math.abs(i - mid); best = i; } return m; });
    return [text.slice(0, best), text.slice(best + 1)];
  }

  function renderNext(id) {
    var len = ORDER.length, pos = ORDER.indexOf(id), nextId = null, prevId = null;
    if (pos > -1) {
      if (len > 1) { nextId = ORDER[(pos + 1) % len]; prevId = ORDER[(pos - 1 + len) % len]; }
    } else if (len) { nextId = ORDER[0]; prevId = ORDER[len - 1]; }
    if (prevId === nextId) prevId = null;
    var N = getCase(nextId), P = getCase(prevId);

    var nav = h('nav', { class: 'nt', 'data-theme': N ? themeOf(nextId) : d.body.getAttribute('data-theme') || 'paper', 'aria-label': T('more') });
    if (N) {
      var code = codeOf(N, nextId), sn = sideName(N, nextId);
      var lines = balance(KT.plain(N.title || code));
      var title = h('p', { class: 'nt__title t-display t-sentence t-800', 'aria-hidden': 'true' });
      var fits = lines.map(function (t, i) {
        var inner = h('span', { class: 'fit__inner' });
        if (i === 0) inner.appendChild(h('span', { class: 'nt__code', text: code + ' ' }));
        inner.appendChild(d.createTextNode(t));
        var line = h('span', { class: 'nt__line fit', style: { '--len': Math.max(6, t.length + (i ? 0 : code.length + 1)) } }, inner);
        title.appendChild(line);
        return line;
      });
      var cover = N.cover ? KT.media(normMedia(N.cover), { id: code, className: 'nt__cover', play: 'none' }) : null;
      if (cover) cover.setAttribute('aria-hidden', 'true');
      var a = h('a', {
        class: 'nt__link', href: 'case.html?id=' + encodeURIComponent(nextId), 'data-cursor': 'OPEN',
        'aria-label': T('nextAria', { c: code, t: KT.plain(N.title || '') })
      },
        h('div', { class: 'nt__top' },
          h('span', { class: 'label label--accent nt__kicker', text: T('next') }),
          h('span', { class: 'label nt__where', text: (sn ? sn + ' — ' : '') + T('track') + ' ' + code }),
          h('span', { class: 'nt__arrow', html: KT.icon('arrow-right') })),
        cover,
        title);
      nav.appendChild(h('div', { 'data-reveal': 'up' }, a));
      fitters.push(function () { fits.forEach(function (l) { KT.fit(l, { fill: .995, min: 36, max: 200 }); }); });
    }
    var foot = h('div', { class: 'nt__foot' });
    if (P) {
      var pc = codeOf(P, prevId);
      foot.appendChild(h('a', { class: 'nt__small', href: 'case.html?id=' + encodeURIComponent(prevId),
        html: KT.icon('prev') + '<span><span class="nt__small-k">' + esc(T('prev')) + '</span> ' + esc(pc) + ' — ' + esc(KT.plain(P.title || '')) + '</span>' }));
    }
    foot.appendChild(h('a', { class: 'nt__small nt__small--home', href: 'index.html#work', html: '<span>' + esc(T('home')) + '</span>' + KT.icon('arrow-up') }));
    nav.appendChild(foot);
    return nav;
  }

  /* ===================================================== NO SUCH TRACK */
  function renderMissing(id) {
    var name = (SITE.person || {}).name || 'Klim Tertychnyi';
    d.title = T('nfTitle') + ' — ' + name;
    setMeta('meta[name="description"]', T('nfDesc'));
    var robots = h('meta', { name: 'robots', content: 'noindex' });
    d.head.appendChild(robots);
    var shown = id ? String(id).slice(0, 40) : '';
    var frag = d.createDocumentFragment();
    var cross = KT.pencil('cross', { auto: false, className: 'nf__cross', duration: 800 });
    var sec = h('section', { class: 'nf', 'aria-labelledby': 'nf-title' },
      h('div', { class: 'ch__meta' },
        backLink(),
        h('span', { class: 'label label--fg ch__where', text: T('nfMeta') }),
        h('span', { class: 'label ch__year', text: shown ? 'ID: ' + shown : T('nfNoId') })),
      h('h1', { class: 'nf__title t-display t-upper t-800', id: 'nf-title', 'data-reveal': 'up' },
        h('span', { class: 'nf__word has-pencil' }, T('nf'), cross)),
      h('div', { class: 'nf__intro' },
        h('p', { class: 't-lead nf__lead', 'data-reveal': 'up', 'data-reveal-delay': 120,
          text: shown ? T('nfLead', { id: shown }) : T('nfLeadNone') }),
        h('p', { class: 'hand nf__hand', 'data-reveal': 'up', 'data-reveal-delay': 240, text: T('nfHand') })));
    frag.appendChild(sec);
    onFonts.push(function () { cross.draw(KT.reduced ? 0 : 500); });

    SIDES.forEach(function (s) {
      var ids = (s.tracks || []).filter(function (t) { var c = getCase(t); return c && !c.hidden; });
      if (!ids.length) return;
      var hid = 'nf-side-' + esc(s.id || '');
      var ol = h('ol', { class: 'nf__list' }, ids.map(function (t) {
        var c = getCase(t);
        return h('li', { 'data-reveal': 'up' }, h('a', { class: 'nf__row', href: 'case.html?id=' + encodeURIComponent(t), 'data-cursor': 'OPEN' },
          h('span', { class: 'nf__code', text: codeOf(c, t) }),
          h('span', { class: 'nf__main' },
            h('span', { class: 'nf__t t-display t-sentence', html: fmt(c.title || t) }),
            has(c.client) ? h('span', { class: 'nf__client', html: fmt(c.client) }) : null),
          h('span', { class: 'nf__arrow', html: KT.icon('arrow-ne') })));
      }));
      frag.appendChild(h('section', { class: 'nf__side', 'data-theme': s.theme === 'film' ? 'film' : 'paper', 'aria-labelledby': hid },
        h('header', { class: 'nf__shead' },
          h('h2', { class: 't-display nf__sname-t', id: hid, html: fmt(s.name || (T('side') + ' ' + s.id)) }),
          has(s.title) ? h('p', { class: 'label', html: fmt(s.title) }) : null),
        ol));
    });
    return frag;
  }

  /* ========================================================== LIGHTBOX */
  var LB = null;
  function lightbox() {
    if (LB) return LB;
    var dlg = h('dialog', { class: 'cs-lb', 'data-theme': 'film', 'aria-label': T('lbAria') });
    var count = h('span', { class: 'label cs-lb__count' });
    var btn = function (icon, label) { return h('button', { class: 'cs-lb__btn', type: 'button', 'aria-label': label, html: KT.icon(icon) }); };
    var prev = btn('prev', T('lbPrev')), next = btn('next', T('lbNext')), close = btn('close', T('lbClose'));
    var stage = h('div', { class: 'cs-lb__stage' });
    var cap = h('p', { class: 'cs-lb__cap' });
    dlg.append(h('div', { class: 'cs-lb__top' }, count, h('div', { class: 'cs-lb__nav' }, prev, next, close)), stage, cap);
    d.body.appendChild(dlg);
    var list = [], idx = 0, opener = null;
    function render(i) {
      idx = i;
      var s = list[i];
      count.textContent = T('lbFrame') + ' ' + s.no + ' · ' + KT.pad(i + 1) + ' / ' + KT.pad(list.length);
      stage.innerHTML = '';
      stage.appendChild(h('img', { class: 'cs-lb__img', src: s.m.src, alt: KT.plain(s.m.alt || ''), decoding: 'async' }));
      cap.innerHTML = fmt(s.m.alt || '');
      prev.disabled = next.disabled = list.length < 2;
      KT.announce(T('lbAnn', { n: i + 1, t: list.length }));
    }
    function step(dir) { if (list.length > 1) render((idx + dir + list.length) % list.length); }
    function shut() {
      dlg.classList.remove('is-open');
      d.documentElement.classList.remove('is-locked');
      setTimeout(function () {
        if (dlg.open && dlg.close) dlg.close(); else dlg.removeAttribute('open');
        if (opener) opener.focus();
      }, KT.reduced ? 0 : 240);
    }
    close.addEventListener('click', shut);
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); shut(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target === stage) shut(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'Escape' && !dlg.showModal) { e.preventDefault(); shut(); }
    });
    LB = {
      open: function (shots, i, from) {
        list = shots; opener = from || null;
        render(i);
        if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
        d.documentElement.classList.add('is-locked');
        requestAnimationFrame(function () { dlg.classList.add('is-open'); });
        close.focus();
      }
    };
    return LB;
  }

  /* ===================================================== READ PROGRESS */
  function progress() {
    var bar = h('div', { class: 'cs-progress', 'aria-hidden': 'true' }, h('span', { class: 'cs-progress__bar' }));
    d.body.appendChild(bar);
    var fill = bar.firstChild, ticking = false;
    function upd() {
      ticking = false;
      var max = d.documentElement.scrollHeight - w.innerHeight;
      var p = max > 0 ? clamp(w.scrollY / max, 0, 1) : 0;
      fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } };
    w.addEventListener('scroll', req, { passive: true });
    w.addEventListener('resize', req);
    upd();
  }

  /* ============================================================== META */
  function setMeta(sel, val) {
    var m = d.querySelector(sel);
    if (m && has(val)) m.setAttribute('content', val);
  }

  function applyTheme(th) {
    d.body.setAttribute('data-theme', th);
    var main = d.getElementById('main');
    if (main) main.setAttribute('data-theme', th);
    setMeta('meta[name="theme-color"]', th === 'film' ? '#0F0F0E' : '#EDEBE4');
    var loc = d.querySelector('meta[property="og:locale"]');
    if (!loc && d.head) { loc = d.createElement('meta'); loc.setAttribute('property', 'og:locale'); d.head.appendChild(loc); }
    if (loc) loc.setAttribute('content', KT.lang === 'uk' ? 'uk_UA' : 'en_US');
  }

  /* ============================================================== BOOT */
  /* ---- scroll reset: a new case must open at the top, never at the old position */
  try { if ('scrollRestoration' in w.history) w.history.scrollRestoration = 'manual'; } catch (e) {}
  function toTop() {
    try { w.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch (e) { w.scrollTo(0, 0); }
    if (d.documentElement) d.documentElement.scrollTop = 0;
    if (d.body) d.body.scrollTop = 0;
  }
  var touched = false;   // user scrolled by hand: stop forcing the top
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { w.addEventListener(ev, function () { touched = true; }, { passive: true, once: true }); });
  function hasAnchor() {
    try {
      var a = decodeURIComponent((w.location.hash || '').replace(/^#/, '')).trim();
      return !!(a && !getCase(a) && d.getElementById(a));
    } catch (e) { return false; }
  }

  function runFitters() { fitters.forEach(function (f) { safe('fit', f); }); }

  function boot() {
    var id = '';
    try { id = (new URLSearchParams(w.location.search).get('id') || '').trim(); } catch (e) { id = ''; }
    var c = getCase(id);
    if (c && c.hidden && id !== 'template') c = null; // dropped cases: designed "no such track" state
    var root = d.getElementById('case') || d.getElementById('main');
    if (!hasAnchor()) toTop();
    applyTheme(c ? themeOf(id) : 'paper');
    requestAnimationFrame(function () { d.documentElement.classList.remove('cs-wait'); });
    safe('boot', function () { KT.boot('work'); });

    if (c) {
      var code = codeOf(c, id), name = (SITE.person || {}).name || 'Klim Tertychnyi';
      d.title = KT.plain(c.title || code) + ' — ' + code + ' — ' + name;
      var desc = KT.plain(c.oneLiner || c.title || '');
      setMeta('meta[name="description"]', desc);
      setMeta('meta[property="og:title"]', d.title);
      setMeta('meta[property="og:description"]', desc);
      if (isImg(c.cover)) setMeta('meta[property="og:image"]', c.cover.src);
      root.setAttribute('aria-labelledby', 'case-title');
      safe('header', function () { root.appendChild(renderHeader(c, id, code)); });
      safe('blocks', function () { var b = renderBlocks(c, code); if (b) root.appendChild(b); });
      safe('next', function () { root.appendChild(renderNext(id)); });
      motions.push(coverMotion);
    } else {
      safe('missing', function () { root.appendChild(renderMissing(id)); });
    }

    safe('progress', progress);
    safe('reveal', function () { KT.reveal(root); });
    safe('title', revealTitle);
    runFitters(); // provisional fit with fallback fonts

    if (!hasAnchor()) toTop();
    KT.fontsReady(1800).then(function () {
      runFitters();
      onFonts.forEach(function (f) { safe('fonts', f); });
      motions.forEach(function (m) { safe('motion', m); });
      if (!hasAnchor() && !touched) toTop();
      if (HAS_GSAP) ST.refresh();
      if (KT.navUpdate) KT.navUpdate();
    });

    var lastW = w.innerWidth;
    w.addEventListener('resize', KT.debounce(function () {
      if (w.innerWidth === lastW && KT.isMobile()) return;  // URL-bar jitter
      lastW = w.innerWidth;
      if (title.el && title.el.classList.contains('is-done') && title.el.clientWidth !== title.width) safe('title split', splitTitle);
      runFitters();
      if (HAS_GSAP) ST.refresh();
    }, 180));
    w.addEventListener('pageshow', function (e) { if (e.persisted && !hasAnchor()) toTop(); });
    w.addEventListener('load', function () { if (!hasAnchor() && !touched) toTop(); runFitters(); if (HAS_GSAP) ST.refresh(); });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);

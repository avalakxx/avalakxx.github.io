/* =====================================================================
   THE SELECT — content/i18n.js
   Load order: content/site.js → content/site.uk.js → content/i18n.js →
   js/core.js → page script (all defer).

   Language: ?lang=uk|en → localStorage 'kt-lang' → navigator.language
   ('uk*') → 'en'. For 'uk', window.SITE_UK (text-only overlay) is merged
   into window.SITE: objects by key, arrays BY INDEX, null/undefined in the
   overlay keeps the base value.

   Exposes: window.KT_LANG, window.KT_I18N = { lang, langs, set(lang), merge }
   set() stores the choice and reloads the same page without ?lang
   (other query params and the hash are kept).
   ===================================================================== */
(function (w, d) {
  'use strict';
  var LANGS = ['en', 'uk'];
  var KEY = 'kt-lang';

  function fromQuery() {
    try {
      var m = /[?&]lang=([a-z]{2})(?:&|$)/i.exec(w.location.search);
      return m ? m[1].toLowerCase() : null;
    } catch (e) { return null; }
  }
  function load() { try { return w.localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(l) { try { w.localStorage.setItem(KEY, l); } catch (e) { /* private mode */ } }
  function norm(l) { l = String(l || '').toLowerCase(); if (l === 'ua') l = 'uk'; return LANGS.indexOf(l) >= 0 ? l : null; }

  var q = norm(fromQuery());
  if (q) save(q);
  var nav = (w.navigator && (w.navigator.language || (w.navigator.languages || [])[0])) || '';
  var lang = q || norm(load()) || (/^uk/i.test(nav) ? 'uk' : 'en');

  function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function merge(base, over) {
    if (over === null || over === undefined) return base;
    if (Array.isArray(base) && Array.isArray(over)) {
      var out = base.slice();
      over.forEach(function (o, i) { out[i] = i < base.length ? merge(base[i], o) : o; });
      return out;
    }
    if (isObj(base) && isObj(over)) {
      var r = {};
      Object.keys(base).forEach(function (k) { r[k] = base[k]; });
      Object.keys(over).forEach(function (k) { r[k] = merge(base[k], over[k]); });
      return r;
    }
    return over;
  }

  if (lang === 'uk' && w.SITE && w.SITE_UK) {
    try { w.SITE = merge(w.SITE, w.SITE_UK); } catch (e) { /* keep English */ }
    // Ukrainian groups thousands with a space: "2,000+" -> "2 000+" (no-break space). Paths and links are left alone.
    var SKIP = { src: 1, poster: 1, href: 1, url: 1 };
    var nb = function (v, k) {
      if (typeof v === 'string') return SKIP[k] ? v : v.replace(/(\d),(?=\d{3}(?!\d))/g, '$1 ');
      if (Array.isArray(v)) return v.map(function (x) { return nb(x); });
      if (isObj(v)) { var o = {}; Object.keys(v).forEach(function (key) { o[key] = nb(v[key], key); }); return o; }
      return v;
    };
    try { w.SITE = nb(w.SITE); } catch (e) { /* keep as is */ }
  }

  d.documentElement.lang = lang;
  w.KT_LANG = lang;
  w.KT_I18N = {
    lang: lang,
    langs: LANGS.slice(),
    merge: merge,
    set: function (l) {
      l = norm(l);
      if (!l) return;
      save(l);
      var href = w.location.href, next = href;
      try {
        var u = new URL(href);
        u.searchParams.delete('lang');
        next = u.toString();
      } catch (e) {
        next = href.replace(/([?&])lang=[^&#]*&?/i, '$1').replace(/[?&](#|$)/, '$1');
      }
      if (next === href) w.location.reload(); else w.location.href = next;
    }
  };
})(window, document);

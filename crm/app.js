import { Store, STAGES, OPEN_STAGES, stageLabel, money, DEMO_KEY } from './store.js';
import { tgToast, errorToast } from './tg.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DAY = 864e5;

let leads = [];
let known = new Set();
let query = '';
let openId = null;
let lastFocus = null;
let grab = null; // where the pointer holds the card being dragged
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// ---------- dates ----------
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function daysUntil(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const t = new Date();
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())) / DAY);
}
function ago(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? 'yesterday' : `${d} d ago`;
}
const fullDate = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function followChip(lead) {
  if (!lead.follow_up || !OPEN_STAGES.has(lead.stage)) return '';
  const n = daysUntil(lead.follow_up);
  if (n < 0) return `<span class="chip overdue">Overdue ${-n} d</span>`;
  if (n === 0) return '<span class="chip due">Call today</span>';
  return `<span class="chip">Call ${n === 1 ? 'tomorrow' : `in ${n} d`}</span>`;
}
const noteCount = (lead) => lead.notes.filter((n) => n.kind === 'note').length;

// ---------- render ----------
function visible() {
  const q = query.trim().toLowerCase();
  if (!q) return leads;
  return leads.filter((l) => [l.name, l.phone, l.email, l.service].join(' ').toLowerCase().includes(q));
}

function renderKpis() {
  const weekAgo = Date.now() - 7 * DAY;
  const recent = leads.filter((l) => new Date(l.created_at) >= weekAgo);
  const open = leads.filter((l) => OPEN_STAGES.has(l.stage));
  const won = leads.filter((l) => l.stage === 'won');
  const lost = leads.filter((l) => l.stage === 'lost');
  const rate = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
  const due = open.filter((l) => l.follow_up && daysUntil(l.follow_up) <= 0).length;
  const sum = (list) => list.reduce((s, l) => s + (l.budget || 0), 0);
  $('#kpis').innerHTML = `
    <div class="kpi"><span>New leads, 7 days</span><b>${recent.length}</b><small>${recent.filter((l) => l.source === 'website').length} from the website form</small></div>
    <div class="kpi"><span>Open pipeline</span><b>${money(sum(open))}</b><small>${open.length} open deals</small></div>
    <div class="kpi"><span>Win rate</span><b>${rate}%</b><small>${won.length} won · ${money(sum(won))}</small></div>
    <div class="kpi ${due ? 'alert' : ''}"><span>Follow-ups due</span><b>${due}</b><small>${due ? 'Today or overdue' : 'All on track'}</small></div>`;
}

function cardHtml(lead) {
  const notes = noteCount(lead);
  return `<button class="card s-${lead.stage}${known.has(lead.id) ? '' : ' fresh'}" type="button" draggable="true" data-id="${lead.id}"
      aria-label="${esc(lead.name)}, ${esc(lead.service)}, ${esc(money(lead.budget))}, ${esc(stageLabel(lead.stage))}">
    <span class="card-top"><b title="${esc(lead.name)}">${esc(lead.name)}</b><time datetime="${esc(lead.created_at)}">${ago(lead.created_at)}</time></span>
    <span class="card-meta">${esc(lead.service)} · <b>${money(lead.budget)}</b></span>
    <span class="chips">${lead.source === 'website' ? '<span class="chip web">Website</span>' : ''}${followChip(lead)}${notes ? `<span class="chip">✎ ${notes}</span>` : ''}</span>
  </button>`;
}

function renderBoard() {
  const list = visible();
  $('#board').innerHTML = STAGES.map((stage) => {
    const items = list.filter((l) => l.stage === stage.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const total = items.reduce((s, l) => s + (l.budget || 0), 0);
    return `<div class="col s-${stage.id}" data-stage="${stage.id}" aria-label="${stage.label}, ${items.length} leads">
      <div class="col-head"><i></i>${stage.label}<span class="count">${items.length}</span><span class="sum">${money(total)}</span></div>
      ${items.map(cardHtml).join('') || `<div class="empty">${query ? 'No matches' : 'Drop a lead here'}</div>`}
    </div>`;
  }).join('');
  known = new Set(leads.map((l) => l.id));
}

function renderDrawer() {
  const lead = leads.find((l) => l.id === openId);
  const drawer = $('#drawer');
  if (!lead) { closeDrawer(); return; }
  const notes = [...lead.notes].reverse();
  drawer.className = `drawer open s-${lead.stage}`;
  drawer.innerHTML = `
    <header class="d-head">
      <div>
        <span class="pill">${esc(stageLabel(lead.stage))}</span>
        <h2 id="dTitle">${esc(lead.name)}</h2>
        <div class="muted">#${lead.id} · ${lead.source === 'website' ? 'Website form' : 'Added manually'} · ${ago(lead.created_at)}</div>
      </div>
      <button class="icon" type="button" data-close aria-label="Close">×</button>
    </header>
    <div class="contact">
      <a href="tel:${esc(lead.phone.replace(/[^0-9+]/g, ''))}">📞 ${esc(lead.phone)}</a>
      ${lead.email ? `<a href="mailto:${esc(lead.email)}">✉ ${esc(lead.email)}</a>` : ''}
    </div>
    <div class="facts">
      <div><span>Service</span><b>${esc(lead.service)}</b></div>
      <div><span>Budget</span><b>${money(lead.budget)}</b></div>
    </div>
    <div class="field" role="group" aria-labelledby="stageLbl">
      <span class="label" id="stageLbl">Stage</span>
      <div class="stages">${STAGES.map((s) => `<button type="button" class="s-${s.id}" data-stage="${s.id}" aria-pressed="${s.id === lead.stage}">${s.label}</button>`).join('')}</div>
    </div>
    <label class="field"><span class="label">Next follow-up</span><input type="date" id="dFollow" value="${esc(lead.follow_up || '')}"></label>
    ${lead.message ? `<div class="field"><span class="label">Request</span><p class="request">${esc(lead.message)}</p></div>` : ''}
    <form class="note-form" id="noteForm">
      <label class="field"><span class="label">Add a note</span><textarea name="text" rows="3" maxlength="2000" placeholder="Call summary, next step…" required></textarea></label>
      <button class="btn primary" type="submit">Save note</button>
    </form>
    <section class="timeline" aria-label="Activity">
      <h3>Activity</h3>
      <ol>${notes.map((n) => `<li class="${n.kind}"><p>${esc(n.text)}</p><time datetime="${esc(n.created_at)}">${fullDate(n.created_at)}</time></li>`).join('')}</ol>
    </section>`;
}

function render() {
  renderKpis();
  renderBoard();
  if (openId) renderDrawer();
}

// FLIP: after a re-render, cards glide from their old place to the new one instead of jumping.
// `from` sets the start box of one card: a dropped card starts where it was released.
function flip(update, from) {
  if (reduceMotion.matches || !Element.prototype.animate) { update(); return; }
  const before = new Map();
  for (const el of document.querySelectorAll('#board .card')) before.set(el.dataset.id, el.getBoundingClientRect());
  if (from) before.set(String(from.id), from);
  update();
  for (const el of document.querySelectorAll('#board .card')) {
    const a = before.get(el.dataset.id);
    if (!a) continue;
    const b = el.getBoundingClientRect();
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
      { duration: 240, easing: 'cubic-bezier(.2, .8, .2, 1)' });
  }
}

// ---------- drawer ----------
function openDrawer(id) {
  lastFocus = document.activeElement;
  openId = id;
  renderDrawer();
  const drawer = $('#drawer');
  drawer.setAttribute('aria-hidden', 'false');
  $('#scrim').hidden = false;
  document.body.style.overflow = 'hidden';
  $('[data-close]', drawer)?.focus();
}
function closeDrawer() {
  const drawer = $('#drawer');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  $('#scrim').hidden = true;
  document.body.style.overflow = '';
  const id = openId;
  openId = null;
  const card = document.querySelector(`.card[data-id="${id}"]`);
  (card || lastFocus)?.focus?.();
}

// ---------- data actions ----------
function upsert(lead) {
  const i = leads.findIndex((l) => l.id === lead.id);
  if (i >= 0) leads[i] = lead; else leads.push(lead);
}

async function run(promise) {
  try {
    const res = await promise;
    if (res.lead) upsert(res.lead);
    render();
    if (res.notification) tgToast(res.notification);
    return res;
  } catch (err) {
    errorToast(err.message);
    await reload();
    return null;
  }
}

async function moveLead(id, stage, from = null) {
  const lead = leads.find((l) => l.id === id);
  if (!lead || lead.stage === stage) return;
  lead.stage = stage; // optimistic: the card moves right away
  flip(render, from && { id, ...from });
  await run(Store.update(id, { stage }));
}

async function reload({ quiet = false } = {}) {
  try {
    leads = await Store.list();
  } catch (err) {
    if (!quiet) errorToast(err.message);
    return;
  }
  renderKpis();
  renderBoard();
  // don't wipe a note the user is typing
  if (openId && !$('#drawer').contains(document.activeElement)) renderDrawer();
}

// ---------- events ----------
function bind() {
  const board = $('#board');

  board.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) openDrawer(Number(card.dataset.id));
  });
  board.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    e.dataTransfer.setData('text/plain', card.dataset.id);
    e.dataTransfer.effectAllowed = 'move';
    card.classList.add('dragging');
    const r = card.getBoundingClientRect();
    grab = { dx: e.clientX - r.left, dy: e.clientY - r.top };
  });
  board.addEventListener('dragend', (e) => {
    grab = null;
    e.target.closest('.card')?.classList.remove('dragging');
    board.querySelectorAll('.col.over').forEach((c) => c.classList.remove('over'));
  });
  board.addEventListener('dragover', (e) => {
    const col = e.target.closest('.col');
    if (!col) return;
    e.preventDefault();
    if (!col.classList.contains('over')) {
      board.querySelectorAll('.col.over').forEach((c) => c.classList.remove('over'));
      col.classList.add('over');
    }
  });
  board.addEventListener('dragleave', (e) => {
    const col = e.target.closest('.col');
    if (col && !col.contains(e.relatedTarget)) col.classList.remove('over');
  });
  board.addEventListener('drop', (e) => {
    const col = e.target.closest('.col');
    if (!col) return;
    e.preventDefault();
    col.classList.remove('over');
    const id = Number(e.dataTransfer.getData('text/plain'));
    const from = grab && (e.clientX || e.clientY) ? { left: e.clientX - grab.dx, top: e.clientY - grab.dy } : null;
    if (id) moveLead(id, col.dataset.stage, from);
  });

  const drawer = $('#drawer');
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return closeDrawer();
    const btn = e.target.closest('[data-stage]');
    if (btn && openId) moveLead(openId, btn.dataset.stage);
  });
  drawer.addEventListener('change', (e) => {
    if (e.target.id === 'dFollow' && openId) run(Store.update(openId, { follow_up: e.target.value || null }));
  });
  drawer.addEventListener('submit', async (e) => {
    if (e.target.id !== 'noteForm') return;
    e.preventDefault();
    const text = e.target.elements.text.value.trim();
    if (!text || !openId) return;
    e.target.querySelector('button').disabled = true;
    await run(Store.addNote(openId, text));
  });
  $('#scrim').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openId && !$('#newDialog').open) closeDrawer();
  });

  $('#search').addEventListener('input', (e) => { query = e.target.value; renderBoard(); });

  const dialog = $('#newDialog');
  const form = $('#newForm');
  $('#newBtn').addEventListener('click', () => {
    form.reset();
    $('#newError').hidden = true;
    dialog.showModal();
    form.elements.name.focus();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target.closest('[data-cancel]') || e.target === dialog) dialog.close();
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    data.source = 'manual';
    const submit = form.querySelector('[type=submit]');
    submit.disabled = true;
    try {
      const res = await Store.create(data);
      dialog.close();
      upsert(res.lead);
      render();
      tgToast(res.notification);
    } catch (err) {
      $('#newError').textContent = err.message;
      $('#newError').hidden = false;
    } finally {
      submit.disabled = false;
    }
  });

  // Live updates: another tab (demo) or the website form (server) adds leads.
  if (Store.mode === 'demo') {
    window.addEventListener('storage', (e) => { if (e.key === DEMO_KEY) reload({ quiet: true }); });
  } else {
    setInterval(() => { if (!document.hidden && !dialog.open) reload({ quiet: true }); }, 10000);
  }
}

function renderStatus() {
  const tg = $('#tgStatus');
  const on = Store.mode === 'api' && Store.telegram;
  tg.classList.toggle('on', on);
  tg.title = on ? 'Telegram bot connected' : Store.mode === 'demo' ? 'Demo mode: messages are shown as previews' : 'Telegram bot not configured';
  $('.tg-label', tg).textContent = on ? 'Telegram connected' : Store.mode === 'demo' ? 'Telegram (preview)' : 'Telegram off';
  const badge = $('#modeBadge');
  if (Store.mode === 'demo') {
    badge.hidden = false;
    badge.innerHTML = '<b>Demo mode</b>Data lives in this browser. <button class="linkbtn" type="button" id="resetDemo">Reset demo data</button>';
    $('#resetDemo').addEventListener('click', async () => { Store.resetDemo(); await Store.init(); await reload(); });
  }
  $('#today').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

async function start() {
  await Store.init();
  renderStatus();
  bind();
  leads = await Store.list();
  known = new Set(leads.map((l) => l.id));
  render();
}

start().catch((err) => {
  $('#board').innerHTML = `<div class="loading">Could not load leads: ${esc(err.message)}</div>`;
});

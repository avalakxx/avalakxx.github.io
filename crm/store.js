// Data layer for Lead Desk.
// With the Python server running it talks to /api/*. Without it (e.g. on GitHub Pages)
// it switches to a demo store in localStorage, so the CRM and the form still work.

export const STAGES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'quote', label: 'Quote sent' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
];
export const OPEN_STAGES = new Set(['new', 'contacted', 'quote']);
export const SERVICES = ['Kitchen', 'Wardrobe', 'Bathroom', 'Full interior', 'Other'];
export const stageLabel = (id) => STAGES.find((s) => s.id === id)?.label ?? id;
export const money = (n) => '€' + Number(n || 0).toLocaleString('en-US');

export const DEMO_KEY = 'leaddesk-demo-v1';
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const createdText = (source) => (source === 'website' ? 'Lead came in from the website form' : 'Lead added manually');

// Same wording as the Telegram messages in server.py.
export function newLeadText(lead) {
  return [
    `🆕 New lead #${lead.id} — ${lead.source === 'website' ? 'website form' : 'added manually'}`,
    `${lead.name} · ${lead.service}`,
    `Budget: ${money(lead.budget)}`,
    `📞 ${lead.phone}`,
    lead.message ? `“${lead.message}”` : '',
  ].filter(Boolean).join('\n');
}
export const wonText = (lead) => `🎉 Deal won: ${lead.name} — ${lead.service}, ${money(lead.budget)}`;

let mode = 'demo';
let telegram = false;
let demo = null;

async function api(path, options = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, cache: 'no-store', ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ---------- demo store ----------

function saveDemo() {
  localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
}

async function loadDemo() {
  const raw = localStorage.getItem(DEMO_KEY);
  if (raw) {
    try { demo = JSON.parse(raw); return; } catch { /* broken data: reseed */ }
  }
  const seed = await (await fetch('seed.json')).json();
  const now = Date.now();
  const day = 864e5;
  demo = { nextLead: 1, nextNote: 1, leads: [] };
  for (const s of seed.leads) {
    const created = new Date(now - s.days_ago * day).toISOString();
    const lead = {
      id: demo.nextLead++, name: s.name, phone: s.phone, email: s.email || '', service: s.service,
      budget: s.budget, source: s.source, message: s.message || '', stage: s.stage,
      follow_up: s.follow_up_in == null ? null : ymd(new Date(now + s.follow_up_in * day)),
      created_at: created, updated_at: created,
      notes: [{ id: demo.nextNote++, kind: 'system', text: createdText(s.source), created_at: created }],
    };
    for (const n of s.notes || []) {
      lead.notes.push({ id: demo.nextNote++, kind: 'note', text: n.text, created_at: new Date(now - n.days_ago * day).toISOString() });
    }
    demo.leads.push(lead);
  }
  saveDemo();
}

function demoLead(id) {
  const lead = demo.leads.find((l) => l.id === id);
  if (!lead) throw new Error('Lead not found');
  return lead;
}

function demoNote(lead, kind, text) {
  lead.notes.push({ id: demo.nextNote++, kind, text, created_at: new Date().toISOString() });
}

function cleanNew(data) {
  const name = String(data.name || '').trim().slice(0, 100);
  const phone = String(data.phone || '').trim().slice(0, 24);
  if (!name) throw new Error('Name is required');
  if (!/^[0-9+()\-\s]{6,24}$/.test(phone)) throw new Error('Phone looks wrong: use digits, spaces, + and -');
  const email = String(data.email || '').trim().slice(0, 120);
  if (email && !email.includes('@')) throw new Error('Email looks wrong');
  return {
    name, phone, email,
    service: SERVICES.includes(data.service) ? data.service : 'Other',
    budget: Math.max(0, Math.min(Math.round(Number(data.budget) || 0), 10_000_000)),
    message: String(data.message || '').trim().slice(0, 1000),
    source: data.source === 'website' ? 'website' : 'manual',
  };
}

const clone = (v) => JSON.parse(JSON.stringify(v));

// ---------- public API ----------

export const Store = {
  get mode() { return mode; },
  get telegram() { return telegram; },

  async init() {
    try {
      const res = await fetch('api/health', { cache: 'no-store' });
      if (res.ok && (res.headers.get('content-type') || '').includes('json')) {
        const health = await res.json();
        mode = 'api';
        telegram = !!health.telegram;
        return;
      }
    } catch { /* no server: demo mode */ }
    mode = 'demo';
    await loadDemo();
  },

  async list() {
    if (mode === 'api') return (await api('api/leads')).leads;
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) demo = JSON.parse(raw); // pick up changes from other tabs
    return clone(demo.leads);
  },

  async create(data) {
    if (mode === 'api') return api('api/leads', { method: 'POST', body: JSON.stringify(data) });
    const fields = cleanNew(data);
    const stamp = new Date().toISOString();
    const lead = { id: demo.nextLead++, ...fields, stage: 'new', follow_up: null, created_at: stamp, updated_at: stamp, notes: [] };
    demoNote(lead, 'system', createdText(fields.source));
    demo.leads.push(lead);
    saveDemo();
    return { lead: clone(lead), notification: { text: newLeadText(lead), status: 'demo' } };
  },

  async update(id, patch) {
    if (mode === 'api') return api(`api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    const lead = demoLead(id);
    let notification = null;
    if ('stage' in patch && patch.stage !== lead.stage) {
      if (!STAGES.some((s) => s.id === patch.stage)) throw new Error('Unknown stage');
      demoNote(lead, 'system', `Stage: ${stageLabel(lead.stage)} → ${stageLabel(patch.stage)}`);
      const wasWon = lead.stage === 'won';
      lead.stage = patch.stage;
      if (patch.stage === 'won' && !wasWon) notification = { text: wonText(lead), status: 'demo' };
    }
    if ('follow_up' in patch && (patch.follow_up || null) !== lead.follow_up) {
      lead.follow_up = patch.follow_up || null;
      demoNote(lead, 'system', lead.follow_up ? `Follow-up set to ${lead.follow_up}` : 'Follow-up cleared');
    }
    lead.updated_at = new Date().toISOString();
    saveDemo();
    return { lead: clone(lead), notification };
  },

  async addNote(id, text) {
    if (mode === 'api') return api(`api/leads/${id}/notes`, { method: 'POST', body: JSON.stringify({ text }) });
    const clean = String(text || '').trim().slice(0, 2000);
    if (!clean) throw new Error('Note is empty');
    const lead = demoLead(id);
    demoNote(lead, 'note', clean);
    lead.updated_at = new Date().toISOString();
    saveDemo();
    return { lead: clone(lead) };
  },

  resetDemo() {
    localStorage.removeItem(DEMO_KEY);
  },
};

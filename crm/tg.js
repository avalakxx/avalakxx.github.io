// Toasts: a Telegram-style preview of what the bot posts, and plain error messages.

const STATUS = {
  queued: 'Sent to the team chat in Telegram',
  off: 'Telegram is not connected: the message went to the server log',
  demo: 'Demo mode: this is what the bot posts to the team chat',
};

function host() {
  let box = document.getElementById('toasts');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toasts';
    box.className = 'toasts';
    box.setAttribute('aria-live', 'polite');
    document.body.append(box);
  }
  return box;
}

function show(el, ms) {
  host().prepend(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 260);
  }, ms);
}

export function tgToast(notification) {
  if (!notification?.text) return;
  const el = document.createElement('div');
  el.className = 'tg-toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `
    <div class="tg-ava" aria-hidden="true">LD</div>
    <div class="tg-body">
      <div class="tg-head"><b>Lead Desk bot</b><span>now</span></div>
      <div class="tg-text"></div>
      <div class="tg-status"></div>
    </div>`;
  el.querySelector('.tg-text').textContent = notification.text;
  el.querySelector('.tg-status').textContent = STATUS[notification.status] || '';
  show(el, 7000);
}

export function errorToast(message) {
  const el = document.createElement('div');
  el.className = 'tg-toast error';
  el.setAttribute('role', 'alert');
  el.textContent = message || 'Something went wrong';
  show(el, 5000);
}

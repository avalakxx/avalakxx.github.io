import { Store } from './store.js';
import { tgToast } from './tg.js';

// ---------- quote form ----------
const form = document.getElementById('leadForm');
const done = document.getElementById('done');
const error = document.getElementById('formError');
const card = form.closest('.card');
const ready = Store.init();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  error.hidden = true;
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  data.source = 'website';
  const button = form.querySelector('[type=submit]');
  button.disabled = true;
  button.textContent = 'Sending…';
  try {
    await ready;
    const res = await Store.create(data);
    const first = res.lead.name.split(/\s+/)[0];
    document.getElementById('doneTitle').textContent = `Thank you, ${first}!`;
    // Two-column layout: keep the card's height so the headline and facts don't jump.
    if (matchMedia('(min-width: 901px)').matches) card.style.minHeight = `${card.offsetHeight}px`;
    form.hidden = true;
    done.hidden = false;
    done.focus();
    tgToast(res.notification);
  } catch (err) {
    error.textContent = err.message || 'Could not send the request. Please try again.';
    error.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = 'Request a call back';
  }
});

document.getElementById('again').addEventListener('click', () => {
  form.reset();
  done.hidden = true;
  form.hidden = false;
  card.style.minHeight = '';
  form.elements.name.focus();
});

// ---------- background video ----------
// The poster is a CSS background, so the page looks finished without the video.
// The video loads after the page, never with reduced motion or Save-Data, and fades in once it really plays.
// If autoplay is refused (iPhone Low Power Mode) the poster stays and the button offers "Play motion".
const stage = document.getElementById('stage');
const video = document.getElementById('heroVideo');
const toggle = document.getElementById('motionToggle');
const label = toggle.querySelector('.motion-label');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const portrait = matchMedia('(max-aspect-ratio: 4/5)'); // same query as the posters in form.css
const PREF_KEY = 'oakline-motion';

let loaded = false;
let userPaused = readPref() === 'paused';

function readPref() {
  try { return localStorage.getItem(PREF_KEY); } catch { return null; }
}
function writePref(paused) {
  try {
    if (paused) localStorage.setItem(PREF_KEY, 'paused');
    else localStorage.removeItem(PREF_KEY);
  } catch { /* private mode: the choice lasts for this page only */ }
}

function showToggle(paused) {
  toggle.hidden = false;
  toggle.classList.toggle('is-paused', paused);
  label.textContent = paused ? 'Play motion' : 'Pause motion';
}

function play() {
  video.muted = true; // iOS only autoplays muted video
  const attempt = video.play();
  if (attempt?.catch) attempt.catch(() => showToggle(true));
}

function loadVideo() {
  if (loaded || reduceMotion.matches || navigator.connection?.saveData) return;
  loaded = true;
  video.src = portrait.matches ? 'media/hero-portrait.mp4' : 'media/hero-1080.mp4';
  showToggle(userPaused);
  if (!userPaused) play(); // with preload="none", a paused visitor downloads nothing
}

video.addEventListener('playing', () => {
  stage.classList.add('is-playing');
  showToggle(false);
});

toggle.addEventListener('click', () => {
  if (video.paused) {
    userPaused = false;
    play();
  } else {
    userPaused = true;
    video.pause();
    showToggle(true);
  }
  writePref(userPaused);
});

document.addEventListener('visibilitychange', () => {
  if (!loaded) return;
  if (document.hidden) video.pause();
  else if (!userPaused && !reduceMotion.matches) play();
});

reduceMotion.addEventListener('change', () => {
  if (reduceMotion.matches) {
    video.pause();
    stage.classList.remove('is-playing');
    toggle.hidden = true;
  } else if (!loaded) {
    loadVideo();
  } else {
    showToggle(userPaused);
    if (!userPaused) play();
  }
});

function whenIdle(fn) {
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300));
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}
whenIdle(loadVideo);

// The video recedes as content scrolls over it: a flat dark layer goes from 0 to 60%.
let frame = 0;
function updateScrim() {
  frame = 0;
  const t = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.7)));
  stage.style.setProperty('--scrim', t.toFixed(3));
}
window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateScrim); }, { passive: true });
updateScrim();

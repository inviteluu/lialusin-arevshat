/* Заставка «Стеклянные двери»: стена с наличником, две створки с матовым стеклом и инициалами.
   Касание → створки уходят внутрь, камера проходит в проём, за ним уже стоит первое фото «прогулки».
   Проверка кадров: ?t=1.2 (кадр через 1,2 с после касания), ?skip=1, из консоли introAt(сек). */
(() => {
'use strict';
const D = window.WEDDING, FILM = window.FILM;
const $ = id => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const seg = (u, a, b) => clamp((u - a) / (b - a));
const eIO = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const qs = new URLSearchParams(location.search);

const doors = $('doors'), room = $('drRoom'), wall = $('drWall'), way = $('drWay'), ui = $('drUi');
const leafL = $('leafL'), leafR = $('leafR');
// раскадровка, секунды после касания
const T = { leaf0: .12, leaf1: 1.9, cam0: .5, cam1: 2.75, photo0: .2, photo1: 2.9, names0: 2.05, names1: 3.25, unlock: 2.4, end: 3.3 };
const ANGLE = 104;                   // на сколько градусов уходят створки (за 90° они прячутся за стену)
let W = 390, H = 844, dw = 0, dh = 0, dx = 0, dy = 0, sEnd = 1.8;

/* ---------- стена, наличник, пол ---------- */
function drawWall() {
  const fy = dy + dh, c = dw * .075, bb = Math.max(10, H * .017), r = n => n.toFixed(1);
  const L = dx - c, R = dx + dw + c;
  // доски пола сходятся к точке за проёмом
  const vx = W / 2, vy = dy + dh * .32, k = (H - fy) / (H - vy);
  let planks = '';
  for (let i = -14; i <= 14; i++) { const xb = vx + i * W * .11; planks += `M${r(xb)} ${H} L${r(xb + (vx - xb) * k)} ${r(fy)} `; }
  // филёнки на стене по бокам от двери
  let panels = '';
  const side = L - 6;
  if (side > 34) {
    const pw = side * .56, px = side * .22, rects = [[dy + dh * .03, dh * .55], [dy + dh * .64, dh * .27 - bb]];
    for (const [py, ph] of rects) for (const x of [px, W - px - pw]) {
      panels += `<rect x="${r(x)}" y="${r(py)}" width="${r(pw)}" height="${r(ph)}" fill="none" stroke="#d3c7b6" stroke-width="1.2"/>
        <rect x="${r(x + 3)}" y="${r(py + 3)}" width="${r(pw - 6)}" height="${r(ph - 6)}" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1"/>`;
    }
  }
  const head = dy - c, cap = c * 1.35;
  return `<defs>
    <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe8dd"/><stop offset="1" stop-color="#e0d6c8"/></linearGradient>
    <linearGradient id="gl" x1="0" y1="0" x2="1" y2=".7"><stop offset=".42" stop-color="#fff9ee" stop-opacity="0"/><stop offset=".6" stop-color="#fff9ee" stop-opacity=".5"/><stop offset=".78" stop-color="#fff9ee" stop-opacity="0"/></linearGradient>
    <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7835f"/><stop offset="1" stop-color="#8c6948"/></linearGradient>
    <linearGradient id="gfs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e1d0e" stop-opacity=".45"/><stop offset="1" stop-color="#2e1d0e" stop-opacity="0"/></linearGradient>
    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6e8" stop-opacity=".16"/><stop offset="1" stop-color="#fff6e8" stop-opacity="0"/></linearGradient>
    <radialGradient id="gv" cx=".5" cy=".46" r=".78"><stop offset=".55" stop-color="#3b2a19" stop-opacity="0"/><stop offset="1" stop-color="#3b2a19" stop-opacity=".3"/></radialGradient>
    <filter id="fb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${r(W * .012)}"/></filter>
    <filter id="fs" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${r(c * .45)}"/></filter>
  </defs>
  <path fill="url(#gw)" fill-rule="evenodd" d="M0 0 H${W} V${r(fy)} H0 Z M${r(dx)} ${r(dy)} V${r(fy)} H${r(dx + dw)} V${r(dy)} Z"/>
  ${panels}
  <path fill="url(#gl)" fill-rule="evenodd" d="M0 0 H${W} V${r(fy)} H0 Z M${r(L)} ${r(head - cap)} V${r(fy)} H${r(R)} V${r(head - cap)} Z"/>
  <rect x="${r(L + 3)}" y="${r(head - cap + 4)}" width="${r(R - L)}" height="${r(fy - head + cap - 4)}" fill="#3b2a19" opacity=".16" filter="url(#fs)"/>
  <path fill="#f3eee6" fill-rule="evenodd" d="M${r(L)} ${r(fy)} V${r(head)} H${r(R)} V${r(fy)} Z M${r(dx)} ${r(fy)} V${r(dy)} H${r(dx + dw)} V${r(fy)} Z"/>
  <g fill="none" stroke-width="1">
    <path stroke="#cdbfac" d="M${r(dx - c * .16)} ${r(fy)} V${r(dy - c * .16)} H${r(dx + dw + c * .16)} V${r(fy)}"/>
    <path stroke="#fffdf8" d="M${r(dx - c * .5)} ${r(fy)} V${r(dy - c * .5)} H${r(dx + dw + c * .5)} V${r(fy)}"/>
    <path stroke="#d9cebf" d="M${r(dx - c * .58)} ${r(fy)} V${r(dy - c * .58)} H${r(dx + dw + c * .58)} V${r(fy)}"/>
    <path stroke="#c9bba7" d="M${r(L)} ${r(fy)} V${r(head)} H${r(R)} V${r(fy)}"/>
  </g>
  <rect x="${r(L - c * .3)}" y="${r(head - cap)}" width="${r(R - L + c * .6)}" height="${r(cap)}" fill="#f1ebe2" stroke="#cdbfac" stroke-width="1"/>
  <rect x="${r(L - c * .55)}" y="${r(head - cap - c * .32)}" width="${r(R - L + c * 1.1)}" height="${r(c * .32)}" fill="#f6f2eb" stroke="#c9bba7" stroke-width="1"/>
  <path stroke="#fffdf8" stroke-width="1" d="M${r(L - c * .3)} ${r(head - cap * .45)} H${r(R + c * .3)}"/>
  <rect x="${r(L - 1.5)}" y="${r(fy - c * 1.7)}" width="${r(c + 1.5)}" height="${r(c * 1.7)}" fill="#ede6db" stroke="#cdbfac" stroke-width="1"/>
  <rect x="${r(dx + dw)}" y="${r(fy - c * 1.7)}" width="${r(c + 1.5)}" height="${r(c * 1.7)}" fill="#ede6db" stroke="#cdbfac" stroke-width="1"/>
  <rect x="-1" y="${r(fy - bb)}" width="${r(L - 0.5)}" height="${r(bb)}" fill="#f1ebe2" stroke="#d0c3b1" stroke-width="1"/>
  <rect x="${r(R + 1)}" y="${r(fy - bb)}" width="${r(W - R)}" height="${r(bb)}" fill="#f1ebe2" stroke="#d0c3b1" stroke-width="1"/>
  <rect x="0" y="${r(fy)}" width="${W}" height="${r(H - fy + 1)}" fill="url(#gf)"/>
  <path d="${planks}" stroke="#5a3e24" stroke-opacity=".28" stroke-width="1"/>
  <rect x="${r(dx)}" y="${r(fy)}" width="${r(dw)}" height="${r((H - fy) * .6)}" fill="url(#gr)"/>
  <g filter="url(#fb)" fill="#ffe7bf" opacity=".42">
    <path d="M${r(W * .6)} ${r(fy + (H - fy) * .3)} L${r(W * .86)} ${r(fy + (H - fy) * .3)} L${r(W * .98)} ${r(H * .995)} L${r(W * .7)} ${r(H * .995)} Z"/>
    <path d="M${r(W * .9)} ${r(fy + (H - fy) * .3)} L${r(W * 1.05)} ${r(fy + (H - fy) * .3)} L${r(W * 1.2)} ${r(H)} L${r(W * 1.03)} ${r(H)} Z"/>
  </g>
  <rect x="0" y="${r(fy)}" width="${W}" height="${r(Math.max(10, (H - fy) * .12))}" fill="url(#gfs)"/>
  <rect width="${W}" height="${H}" fill="url(#gv)"/>`;
}

function layout() {
  W = doors.clientWidth; H = doors.clientHeight;
  dh = Math.min(H * .56, W * .66 * 2.05); dw = dh / 2.05;
  dx = (W - dw) / 2; dy = H * .8 - dh;
  const s = doors.style;
  s.setProperty('--dx', dx + 'px'); s.setProperty('--dy', dy + 'px');
  s.setProperty('--dw', dw + 'px'); s.setProperty('--dh', dh + 'px'); s.setProperty('--fy', (dy + dh) + 'px');
  s.setProperty('--ct', (dy - dw * .075 * 2.67) + 'px');   // верх карниза над дверью
  const oy = dy + dh / 2;
  room.style.transformOrigin = `${W / 2}px ${oy}px`;
  sEnd = 1.06 * Math.max(W / dw, 2 * oy / dh, 2 * (H - oy) / dh);
  wall.setAttribute('viewBox', `0 0 ${W} ${H}`);
  wall.innerHTML = drawWall();
  // матовое стекло показывает размытое то же фото, что стоит за дверью
  [leafL, leafR].forEach((leaf, i) => {
    const img = leaf.querySelector('.frost');
    const gx = dx + i * dw / 2 + .13 * dw / 2, gy = dy + .05 * dh;
    Object.assign(img.style, { left: -gx + 'px', top: -gy + 'px', width: W + 'px', height: H + 'px' });
  });
}

/* ---------- раскадровка открытия ---------- */
function render(t) {
  const a = eIO(seg(t, T.leaf0, T.leaf1)) * ANGLE;
  leafL.style.transform = `rotateY(${a.toFixed(2)}deg)`;
  leafR.style.transform = `rotateY(${(-a).toFixed(2)}deg)`;
  doors.style.setProperty('--sh', (a * 1.3).toFixed(1) + 'px');          // блик бежит по стеклу
  const c = eIO(seg(t, T.cam0, T.cam1));
  room.style.transform = `scale(${(1 + (sEnd - 1) * c).toFixed(4)})`;
  ui.style.opacity = (1 - seg(t, 0, .35)).toFixed(3);
  FILM.intro = seg(t, T.photo0, T.photo1);
  FILM.names = seg(t, T.names0, T.names1);
  FILM.frame();
}
let running = false, done = false, unlocked = false, t0 = 0, frozen = false, ready = false, want = false;
function unlock() {
  if (unlocked) return;
  unlocked = true; FILM.open = true;
  document.body.classList.remove('locked'); document.body.classList.add('open');
}
function finish() {
  render(T.end); unlock(); done = true;
  doors.classList.add('gone');
  FILM.frame();
}
function loop(now) {
  if (frozen) return;
  const t = (now - t0) / 1000;
  render(t);
  if (t >= T.unlock) unlock();
  if (t < T.end) requestAnimationFrame(loop); else finish();
}
function start() {
  if (running || done) return;
  playMusic();                       // звук разрешён только в ответ на касание
  if (!ready) { want = true; return; }
  running = true;
  doors.classList.add('go');
  if (REDUCED) {
    doors.style.transition = 'opacity .7s'; doors.style.opacity = 0;
    FILM.intro = 1; FILM.names = 1;
    setTimeout(finish, 700);
    return;
  }
  t0 = performance.now(); requestAnimationFrame(loop);
}
// для проверки: introAt(1.2) — кадр через 1,2 с после касания
window.introAt = t => {
  frozen = true; running = true;
  if (t >= T.end) { finish(); return; }
  doors.classList.remove('gone'); doors.classList.add('go');
  render(t);
  if (t >= T.unlock) unlock();
};

doors.addEventListener('click', start);
doors.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } });
doors.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
addEventListener('resize', () => { if (!done) { layout(); if (running) FILM.frame(); } });

/* ---------- музыка: файл уже обрезан с нужного места, играет по кругу ---------- */
const musicBtn = $('music');
let audio = null, userPaused = false;
function playMusic() {
  if (!audio || !audio.paused) return;
  audio.play().then(() => musicBtn.classList.remove('off')).catch(() => musicBtn.classList.add('off'));
}
if (D.music) {
  audio = new Audio(D.music); audio.loop = true; audio.preload = 'auto';
  musicBtn.hidden = false; musicBtn.classList.add('off');
  document.body.classList.add('has-music');
  musicBtn.addEventListener('click', () => {
    if (audio.paused) { userPaused = false; playMusic(); } else { userPaused = true; audio.pause(); musicBtn.classList.add('off'); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (!audio.paused) audio.pause(); } else if (running && !userPaused) playMusic();
  });
}

/* ---------- запуск ---------- */
scrollTo(0, 0);
FILM.intro = 0; FILM.names = 0; FILM.open = false;
layout();
FILM.frame();
const hero = document.getElementById('phHero').querySelector('img');
const onReady = () => { if (ready) return; ready = true; if (want) start(); };
if (hero.complete && hero.naturalWidth) onReady(); else { hero.addEventListener('load', onReady); hero.addEventListener('error', onReady); }
setTimeout(onReady, 2500);          // фото грузится долго или не пришло — двери всё равно открываются
if (qs.has('skip')) window.introAt(99);
else if (qs.has('t')) window.introAt(parseFloat(qs.get('t')) || 0);
})();

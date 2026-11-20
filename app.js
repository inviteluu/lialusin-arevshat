/* Содержимое и «прогулка»: всё из data.js. Анимации считаются от прокрутки (без IntersectionObserver
   и без CSS-переходов на «тяжёлых» свойствах), поэтому одинаково идут на телефоне и в Edge без окна. */
(() => {
'use strict';
const D = window.WEDDING, UI = D.ui;
const $ = id => document.getElementById(id);
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (u, a, b) => clamp((u - a) / (b - a));
const eIn = t => t * t * t, eOut = t => 1 - (1 - t) ** 3;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const p2 = n => String(n).padStart(2, '0');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- дата и имена ---------- */
const dt = new Date(D.date);
const [first, second] = D.brideFirst ? [D.bride, D.groom] : [D.groom, D.bride];
D._ = {
  first, second, i1: D.initials[0], i2: D.initials[1],
  dateDots: `${p2(dt.getDate())} · ${p2(dt.getMonth() + 1)} · ${dt.getFullYear()}`,
  dateShort: `${p2(dt.getDate())}.${p2(dt.getMonth() + 1)}.${String(dt.getFullYear()).slice(2)}`,
  ddmm: `${p2(dt.getDate())}.${p2(dt.getMonth() + 1)}`,
  year: String(dt.getFullYear()),
  weekday: UI.weekdaysLong[(dt.getDay() + 6) % 7]
};

/* ---------- тексты и фото ---------- */
const get = path => path.split('.').reduce((o, k) => o == null ? o : o[k], D);
// «և» заглавными должно стать «ԵՎ», а браузер пишет «ԵՒ» — в заглавных блоках меняем заранее
const isUpper = el => el.hasAttribute('data-up') || getComputedStyle(el).textTransform === 'uppercase';
const words = v => String(v).split(/\s+/).filter(Boolean).map(w => `<span class="w">${esc(w)}</span>`).join(' ');
document.querySelectorAll('[data-t]').forEach(el => {
  let v = get(el.dataset.t);
  if (v == null) return;
  if (isUpper(el)) v = String(v).replace(/և/g, 'եվ');
  if (el.hasAttribute('data-words')) el.innerHTML = words(v); else el.textContent = v;
});
document.querySelectorAll('[data-ph]').forEach(el => { const v = get(el.dataset.ph); if (v != null) el.placeholder = v; });
document.querySelectorAll('[data-val]').forEach(el => { const v = get(el.dataset.val); if (v != null) el.value = v; });
document.querySelectorAll('img[data-photo]').forEach(img => { const s = D.photos[img.dataset.photo]; if (s) img.src = s; });
document.title = `${first} & ${second} — ${UI.docTitle}`;
$('para').innerHTML = words(D.invite.text);

/* ---------- программа: карточки столбиком и календарь ---------- */
const SK = window.SKETCHES;
const ARROW = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 L9 3 M4.5 3 H9 V7.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
const mapUrl = ev => ev.map || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([ev.place, ev.city].filter(Boolean).join(', '));
function calendarCard() {
  const y = dt.getFullYear(), m = dt.getMonth(), n = new Date(y, m + 1, 0).getDate();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const ring = '<svg viewBox="0 0 46 40" aria-hidden="true"><path pathLength="1" d="M30 5 C17 1 3 9 4 21 C5 34 23 39 35 33 C45 27 44 11 30 6 C25 4 19 5 15 8"/></svg>';
  let g = UI.weekdays.map(w => `<span class="wd">${esc(w)}</span>`).join('') + '<span></span>'.repeat(lead);
  for (let d = 1; d <= n; d++) g += d === dt.getDate() ? `<span class="on">${d}${ring}</span>` : `<span>${d}</span>`;
  return `<article class="card cal rv">
    <p class="kick">${esc(UI.calendarLabel)}</p>
    <p class="month">${esc(UI.months[m])} ${y}</p>
    <div class="grid">${g}</div>
  </article>`;
}
$('track').innerHTML = D.program.map(ev => {
  const k = SK[ev.icon] || SK.hall;
  return `<article class="card rv">
    <div class="card-top">
      <p class="time">${esc(ev.time)}</p>
      <div class="sk"><svg class="sketch" viewBox="${k.vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${k.svg}</svg></div>
    </div>
    <h3 class="tt">${esc(isUpperTitle(ev.title))}</h3>
    <p class="pl">${esc(ev.place)}${ev.city ? '<br>' + esc(ev.city) : ''}</p>
    ${ev.map || ev.place ? `<a class="map" href="${esc(mapUrl(ev))}" target="_blank" rel="noopener">${esc(UI.mapButton)}${ARROW}</a>` : ''}
  </article>`;
}).join('') + calendarCard();
function isUpperTitle(t) { return String(t).replace(/և/g, 'եվ'); }   // заголовки карточек набраны заглавными
document.querySelectorAll('.sketch path, .sketch circle').forEach(el => el.setAttribute('pathLength', '1'));

/* ---------- таймер ---------- */
const cEls = {};
document.querySelectorAll('[data-c]').forEach(b => cEls[b.dataset.c] = b);
function countdown() {
  const s = Math.max(0, Math.floor((dt - Date.now()) / 1000));
  const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  for (const k in v) cEls[k].textContent = k === 'd' ? v[k] : p2(v[k]);
}
countdown(); setInterval(countdown, 1000);

/* ---------- подгонка огромных имён под ширину ---------- */
function fitLines(box, lines, width, cap) {
  box.style.fontSize = '100px';
  const w = Math.max(...lines.map(l => l.offsetWidth));
  box.style.fontSize = Math.min(cap, 100 * width / w).toFixed(1) + 'px';
}

/* ---------- «прогулка» ---------- */
const film = $('film'), stage = $('stage'), shade = $('shade'), dark = $('dark'), cue = $('cue');
const PH = { hero: $('phHero'), close: $('phClose'), hands: $('phHands') };
const T = { hero: $('tHero'), invite: $('tInvite'), date: $('tDate'), letter: $('tLetter') };
const paraW = [...$('para').querySelectorAll('.w')], count = $('count');
const L = 6.9;                       // длина «прогулки» в экранах (высота .film = (L + 1) экрана)
let SW = 390, SH = 844, filmTop = 0, filmLen = 1;
const focal = { hero: [0, 0], close: [0, 0], hands: [0, 0] };
const FILM = window.FILM = { intro: 1, names: 1, open: true };   // doors.js ставит 0 и ведёт до 1

function focusOf(key) {
  const img = PH[key].querySelector('img'), iw = img.naturalWidth || 2, ih = img.naturalHeight || 3;
  const k = Math.max(SW / iw, SH / ih), f = (D.focus || {})[key] || [.5, .5];
  return [(SW - iw * k) / 2 + f[0] * iw * k, (SH - ih * k) / 2 + f[1] * ih * k];
}
// приближение к точке f: картинка всегда закрывает экран, потому что s ≥ 1
function zoom(el, s, f) {
  el.style.transform = `translate3d(${(f[0] * (1 - s)).toFixed(2)}px,${(f[1] * (1 - s)).toFixed(2)}px,0) scale(${s.toFixed(4)})`;
}
function show(el, o) { el.style.opacity = o.toFixed(3); el.style.visibility = o <= 0.001 ? 'hidden' : ''; }
// появление элементов по очереди (снизу, из размытия) и уход всей группы вверх
function reveal(el, pin, pout, items) {
  const n = items.length, gap = n > 1 ? Math.min(.12, .55 / (n - 1)) : 0, span = 1 - gap * (n - 1);
  items.forEach((it, i) => {
    const q = clamp((pin - i * gap) / span), e = eOut(q);
    it.style.opacity = q.toFixed(3);
    it.style.transform = q >= 1 ? '' : `translate3d(0,${((1 - e) * 26).toFixed(1)}px,0)`;
  });
  show(el, (pin > 0 ? 1 : 0) * (1 - pout));
  el.style.transform = pout > 0 ? `translate3d(0,${(-pout * 46).toFixed(1)}px,0)` : '';
  // размытие — одним фильтром на всю группу (по словам дорого для телефона)
  const b = REDUCED ? 0 : pout > 0 ? pout * 8 : pin < 1 ? (1 - pin) * 7 : 0;
  el.style.filter = b > .05 ? `blur(${b.toFixed(1)}px)` : '';
}
const items = {
  hero: [...T.hero.querySelectorAll('.nm, .meta')],
  invite: [...T.invite.querySelectorAll('.w')],
  date: [...T.date.children]
};

function filmFrame(u) {
  const ik = eOut(FILM.intro);
  // 1) пара у дверей: камера идёт к ним, затем растворяется во втором фото
  zoom(PH.hero, lerp(1.16, 1, ik) * lerp(1, 1.55, eIn(seg(u, .15, 1.35))), focal.hero);
  show(PH.hero, 1 - seg(u, 1.0, 1.35));
  reveal(T.hero, FILM.names, seg(u, .08, .55), items.hero);
  // 2) второе фото: «прилетаем» из приближения, текст приглашения, уходим в букет
  const sB = u < 2.9 ? lerp(1.3, 1, eOut(seg(u, 1.0, 2.05))) * lerp(1, 1.05, seg(u, 2.05, 2.9))
                     : 1.05 * lerp(1, 1.5, eIn(seg(u, 2.9, 3.6)));
  zoom(PH.close, sB, focal.close);
  show(PH.close, seg(u, 1.0, 1.35) - seg(u, 3.25, 3.6));
  reveal(T.invite, seg(u, 1.4, 2.0), seg(u, 2.62, 3.0), items.invite);
  // 3) руки и дата
  zoom(PH.hands, lerp(1.35, 1, eOut(seg(u, 3.25, 4.4))) * lerp(1, 1.06, seg(u, 4.4, L)), focal.hands);
  show(PH.hands, seg(u, 3.25, 3.6));
  show(shade, 1 - seg(u, 3.35, 3.8));
  dark.style.opacity = (.34 * seg(u, 3.55, 4.05) + .58 * seg(u, 4.75, 5.25)).toFixed(3);
  reveal(T.date, seg(u, 3.7, 4.2), seg(u, 4.72, 5.08), items.date);
  // 4) письмо гостям: слова «загораются» по мере прокрутки, затем таймер
  show(T.letter, seg(u, 4.95, 5.3));
  const pw = seg(u, 5.2, 6.15) * paraW.length;
  paraW.forEach((w, i) => { w.style.opacity = (.14 + .86 * clamp(pw - i)).toFixed(3); });
  const qc = seg(u, 6.1, 6.45);
  count.style.opacity = qc.toFixed(3);
  count.style.transform = qc >= 1 ? '' : `translate3d(0,${((1 - eOut(qc)) * 24).toFixed(1)}px,0)`;
  show(cue, FILM.open ? 1 - seg(u, 0, .12) : 0);
}

/* ---------- программа, появление блоков ---------- */
const prog = $('prog'), cards = [...$('track').children], bar = $('bar');
const rv = [...document.querySelectorAll('.rv')];
let progTop = 0, progH = 0, rvTop = [], cardTop = [];
const absTop = el => { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; };

function measure() {
  SW = stage.clientWidth; SH = stage.clientHeight;
  for (const k in focal) focal[k] = focusOf(k);
  fitLines($('names'), [...$('names').querySelectorAll('.nm')], SW - 44, SH * .14);
  const g = $('giant');
  fitLines(g, [...g.children], SW - 20, SH * .2);
  filmTop = absTop(film); filmLen = Math.max(1, film.offsetHeight - stage.offsetHeight);
  progTop = absTop(prog); progH = prog.offsetHeight;
  rvTop = rv.map(absTop); cardTop = cards.map(absTop);   // в кадре только читаем кэш
}

function sideFrame(y) {
  bar.classList.toggle('on-light', y > progTop - 40 && y < progTop + progH - 40);
  bar.classList.toggle('past', y > filmTop + filmLen + SH * .5);
  // рисунки на карточках прорисовываются, пока карточка поднимается по экрану
  cards.forEach((c, i) => {
    const d = REDUCED ? 1 : clamp((y + SH * .9 - cardTop[i]) / (SH * .5));
    c.style.setProperty('--d', (1 - d).toFixed(3));
  });
  rv.forEach((el, i) => {
    const q = REDUCED ? 1 : clamp((y + SH * .92 - rvTop[i]) / (SH * .24));
    el.style.opacity = q.toFixed(3);
    el.style.transform = q >= 1 ? '' : `translate3d(0,${((1 - eOut(q)) * 30).toFixed(1)}px,0)`;
  });
}

function frame() {
  const y = scrollY;
  if (y < filmTop + filmLen + SH) filmFrame(clamp((y - filmTop) / filmLen) * L);
  sideFrame(y);
}
FILM.frame = frame;
FILM.filmAt = u => { scrollTo(0, Math.round(filmTop + u / L * filmLen)); frame(); };
FILM.progAt = p => { scrollTo(0, Math.round(progTop + p * Math.max(0, progH - SH))); frame(); };
window.storyFrame = frame;          // phone-shots.ps1 вызывает его после каждой прокрутки
window.filmAt = FILM.filmAt;
window.progAt = FILM.progAt;

let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { ticking = false; frame(); });
}, { passive: true });
addEventListener('resize', () => {
  // высота меняется, когда прячется панель браузера, — пересчитываем всё, но без скачков
  measure(); frame();
});
document.querySelectorAll('.ph img').forEach(img => img.addEventListener('load', () => { measure(); frame(); }));
if (document.fonts) document.fonts.ready.then(() => { measure(); frame(); });
measure(); frame();

/* ---------- анкета: ответы приходят письмом на D.rsvp.email через formsubmit.co ---------- */
const form = $('rsvpForm'), errEl = $('formErr');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(form);
  const name = String(fd.get('name') || '').trim(), attend = fd.get('attend');
  if (!name || !attend) { errEl.textContent = UI.errFill; errEl.hidden = false; return; }
  if (fd.get('_honey')) return;                       // скрытое поле заполняют только спам-боты
  errEl.hidden = true;
  const btn = form.querySelector('button'), label = btn.textContent;
  btn.disabled = true; btn.textContent = UI.sending;
  const cnt = String(fd.get('count') || '').trim();
  const body = {
    [UI.mail.name]: name, [UI.mail.attend]: attend, [UI.mail.side]: fd.get('side') || '—',
    [UI.mail.count]: cnt || (attend === UI.attendYes ? '1' : '—'),
    _subject: D.rsvp.subject, _template: 'table', _captcha: 'false'
  };
  try {
    const r = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(D.rsvp.email), {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || (String(j.success) === 'false' && !/activat/i.test(j.message || ''))) throw new Error(j.message || r.status);
    form.hidden = true; $('rsvpDone').hidden = false;
    measure(); frame();
  } catch (err) {
    errEl.textContent = UI.errSend; errEl.hidden = false;
    btn.disabled = false; btn.textContent = label;
  }
});
})();

/* app.js — كل أكواد JavaScript للموقع: الدوال المشتركة ثم كود كل صفحة */
/* وظائف مشتركة: التخزين، تسجيل الدخول، حماية الصفحات، تسجيل الخروج */
const Store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};

const Auth = {
  user() { return Store.get('mh_session', null); },
  register(name, email, password) {
    const users = Store.get('mh_users', []);
    if (users.some(u => u.email === email)) return { ok: false, error: 'هذا البريد مسجّل من قبل. سجّل الدخول بدلاً من ذلك.' };
    users.push({ name, email, password });
    Store.set('mh_users', users);
    Store.set('mh_session', { name, email });
    return { ok: true };
  },
  login(email, password) {
    const u = Store.get('mh_users', []).find(x => x.email === email && x.password === password);
    if (!u) return { ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    Store.set('mh_session', { name: u.name, email: u.email });
    return { ok: true };
  },
  logout() { localStorage.removeItem('mh_session'); }
};

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.user();
  // الصفحات المحمية تتطلب تسجيل دخول
  if (document.body.dataset.protected === 'true' && !user) { location.replace('index.html'); return; }
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user ? user.name : '');
  const out = document.getElementById('logout');
  if (out) out.addEventListener('click', () => Auth.logout());
  const mb = document.getElementById('menuBtn'), nav = document.getElementById('mainNav');
  if (mb && nav) mb.addEventListener('click', () => nav.classList.toggle('open'));
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
});

/* ===== صفحة index ===== */
(function () {
  if (document.body.dataset.page !== 'index') return;
  if (Auth.user()) { location.replace('home.html'); return; }

  const $ = id => document.getElementById(id);
  const tabs = { login: $('tabLogin'), signup: $('tabSignup') };
  const forms = { login: $('loginForm'), signup: $('signupForm') };

  function show(which) {
    for (const k in tabs) {
      tabs[k].classList.toggle('on', k === which);
      forms[k].classList.toggle('hidden', k !== which);
    }
  }
  tabs.login.onclick = () => show('login');
  tabs.signup.onclick = () => show('signup');
  $('toSignup').onclick = e => { e.preventDefault(); show('signup'); };
  $('toLogin').onclick = e => { e.preventDefault(); show('login'); };
  if (location.hash === '#signup') show('signup');

  function error(el, text) { el.className = 'msg err'; el.textContent = text; }
  const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  forms.login.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('lEmail').value.trim().toLowerCase(), pass = $('lPass').value;
    if (!validEmail(email) || !pass) return error($('lMsg'), 'أدخل بريداً إلكترونياً صحيحاً وكلمة المرور.');
    const r = Auth.login(email, pass);
    r.ok ? location.href = 'home.html' : error($('lMsg'), r.error);
  });

  forms.signup.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('sName').value.trim(), email = $('sEmail').value.trim().toLowerCase();
    const p1 = $('sPass').value, p2 = $('sPass2').value, m = $('sMsg');
    if (name.length < 3) return error(m, 'اكتب اسمك الكامل (3 أحرف على الأقل).');
    if (!validEmail(email)) return error(m, 'أدخل بريداً إلكترونياً صحيحاً.');
    if (p1.length < 6) return error(m, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
    if (p1 !== p2) return error(m, 'كلمتا المرور غير متطابقتين.');
    const r = Auth.register(name, email, p1);
    r.ok ? location.href = 'home.html' : error(m, r.error);
  });
})();

/* ===== صفحة progress ===== */
(function () {
  if (document.body.dataset.page !== 'progress') return;
  const user = Auth.user(); if (!user) return;
  const KEY = 'mh_progress_' + user.email;
  const $ = id => document.getElementById(id);
  const SURAHS = ['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];

  let data = Store.get(KEY, { juz: 0, logs: [] });
  const save = () => Store.set(KEY, data);

  SURAHS.forEach((s, i) => $('surah').add(new Option((i + 1) + '. ' + s, s)));
  for (let i = 0; i <= 30; i++) $('juz').add(new Option(i + ' جزء', i));
  $('date').value = new Date().toISOString().slice(0, 10);

  function render() {
    const logs = data.logs;
    $('stJuz').textContent = data.juz;
    $('stNew').textContent = logs.filter(l => l.type === 'حفظ جديد').length;
    $('stRev').textContent = logs.filter(l => l.type === 'مراجعة').length;
    $('stAvg').textContent = logs.length ? (logs.reduce((a, l) => a + l.rating, 0) / logs.length).toFixed(1) : '–';
    const pct = Math.round(data.juz / 30 * 100);
    $('bar').style.width = pct + '%';
    $('barTxt').textContent = pct + '% من القرآن الكريم';
    $('juz').value = data.juz;

    const body = $('rows'); body.innerHTML = '';
    if (!logs.length) {
      const tr = body.insertRow(), td = tr.insertCell();
      td.colSpan = 6; td.className = 'empty'; td.textContent = 'لا توجد جلسات بعد. سجّل أول جلسة من النموذج أعلاه.';
      return;
    }
    logs.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach(l => {
      const tr = body.insertRow();
      tr.insertCell().textContent = l.date;
      const t = tr.insertCell(), tag = document.createElement('span');
      tag.className = 'tag' + (l.type === 'مراجعة' ? ' rev' : ''); tag.textContent = l.type; t.appendChild(tag);
      tr.insertCell().textContent = l.surah;
      tr.insertCell().textContent = l.from + ' – ' + l.to;
      tr.insertCell().textContent = l.rating + ' / 5';
      const d = document.createElement('button');
      d.className = 'del'; d.type = 'button'; d.textContent = 'حذف';
      d.onclick = () => { data.logs = data.logs.filter(x => x.id !== l.id); save(); render(); };
      tr.insertCell().appendChild(d);
    });
  }

  $('juz').onchange = e => { data.juz = +e.target.value; save(); render(); };

  $('logForm').addEventListener('submit', e => {
    e.preventDefault();
    const from = +$('from').value, to = +$('to').value, m = $('msg');
    if (!$('date').value) { m.className = 'msg err'; m.textContent = 'اختر التاريخ.'; return; }
    if (!from || !to || from < 1 || to < from) { m.className = 'msg err'; m.textContent = 'أدخل نطاق آيات صحيحاً (الآية الأخيرة لا تقل عن الأولى).'; return; }
    data.logs.push({ id: Date.now(), date: $('date').value, type: $('type').value, surah: $('surah').value, from, to, rating: +$('rating').value });
    save(); render();
    $('from').value = ''; $('to').value = '';
    m.className = 'msg ok'; m.textContent = 'تم حفظ الجلسة.';
  });

  render();
})();

/* ===== صفحة contact ===== */
(function () {
  if (document.body.dataset.page !== 'contact') return;
  const user = Auth.user(); if (!user) return;
  const $ = id => document.getElementById(id);
  $('name').value = user.name; $('email').value = user.email;

  $('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const m = $('msg'), name = $('name').value.trim(), email = $('email').value.trim(), text = $('text').value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { m.className = 'msg err'; m.textContent = 'أدخل اسمك وبريداً إلكترونياً صحيحاً.'; return; }
    if (text.length < 10) { m.className = 'msg err'; m.textContent = 'اكتب رسالة لا تقل عن 10 أحرف.'; return; }
    // حالياً تُحفظ الرسائل في المتصفح فقط. اربطها بخادم أو خدمة بريد لإرسالها فعلياً.
    const all = Store.get('mh_messages', []);
    all.push({ name, email, phone: $('phone').value.trim(), subject: $('subject').value, text, date: new Date().toISOString() });
    Store.set('mh_messages', all);
    $('text').value = '';
    m.className = 'msg ok'; m.textContent = 'تم إرسال رسالتك. شكراً لتواصلك.';
  });
})();

/* ===== صفحة mushaf ===== */
(function () {
  if (document.body.dataset.page !== 'mushaf') return;
  const user = Auth.user(); if (!user) return;
  const API = 'https://api.alquran.cloud/v1', KEY = 'mh_mushaf_' + user.email;
  const $ = id => document.getElementById(id);
  const toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const norm = s => s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[ٱأإآ]/g, 'ا');
  // عرض أي خطأ برمجي داخل الصفحة نفسها لتسهيل التشخيص
  window.addEventListener('error', e => { const s = $('status'); if (s) s.textContent = 'خطأ في الكود: ' + e.message + ' (سطر ' + e.lineno + ')'; });
  window.addEventListener('unhandledrejection', e => { const s = $('status'); if (s) s.textContent = 'خطأ: ' + ((e.reason && e.reason.message) || e.reason); });
  let st = Store.get(KEY, { surah: 1, size: 1.4, bm: null, v: 2 });
  if (st.v !== 2) { st.size = 1.4; st.v = 2; } // إعادة ضبط حجم الخط الافتراضي مرة واحدة
  const save = () => Store.set(KEY, st);
  let surahs = [], cur = 0;

  // يجلب من الإنترنت أول مرة ثم يحفظ نسخة في المتصفح للقراءة لاحقاً
  async function load(path, ck) {
    const c = Store.get(ck, null); if (c) return c;
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 12000);
    let r; try { r = await fetch(API + path, { signal: ctl.signal }); } finally { clearTimeout(t); }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json(); if (j.code !== 200) throw new Error('bad response');
    try { Store.set(ck, j.data); } catch (e) { /* مساحة التخزين ممتلئة: نتجاوز الحفظ */ }
    return j.data;
  }
  function fail(e) {
    const box = $('ayahs'); box.textContent = '';
    const p = document.createElement('p');
    p.textContent = 'تعذّر تحميل المصحف (' + (e && e.name === 'AbortError' ? 'انتهت المهلة' : (e && e.message) || 'خطأ غير معروف') + '). تأكد من اتصال الإنترنت ثم أعد المحاولة.';
    const b = document.createElement('button'); b.className = 'btn dark'; b.type = 'button'; b.textContent = 'إعادة المحاولة';
    b.onclick = () => init();
    const l = document.createElement('a'); l.href = API + '/surah/1/quran-uthmani'; l.target = '_blank'; l.textContent = 'اختبر الاتصال بالمصدر';
    l.style.cssText = 'font-size:1rem;margin-inline-start:14px;text-decoration:underline';
    box.append(p, b, l);
  }
  const size = () => { $('ayahs').style.fontSize = st.size + 'rem'; $('bism').style.fontSize = st.size + 'rem'; };

  function mark(n, a) {
    document.querySelectorAll('.ay.mark').forEach(e => e.classList.remove('mark'));
    const el = $('a' + a); if (el && st.bm && st.bm.surah === n && st.bm.ayah === a) el.classList.add('mark');
  }

  function render(d, focus) {
    const n = d.number; cur = n; st.surah = n; save();
    stopAudio(); list = d.ayahs;
    $('surah').value = n;
    $('title').textContent = d.name;
    $('meta').textContent = (d.revelationType === 'Meccan' ? 'مكية' : 'مدنية') + ' · ' + toAr(d.numberOfAyahs) + ' آية';
    $('bism').hidden = (n === 1 || n === 9);
    const box = $('ayahs'); box.textContent = '';
    d.ayahs.forEach(a => {
      let t = a.text;
      // نزيل البسملة من أول آية إن كانت مضمّنة في النص، لنعرضها كعنوان منفصل
      if (n !== 1 && n !== 9 && a.numberInSurah === 1 && norm(t).startsWith('بسم الله الرحمن الرحيم'))
        t = t.trim().split(/\s+/).slice(4).join(' ');
      const sp = document.createElement('span');
      sp.className = 'ay'; sp.id = 'a' + a.numberInSurah;
      sp.append(t + ' ');
      const no = document.createElement('span'); no.className = 'no'; no.textContent = toAr(a.numberInSurah);
      sp.append(no, ' ');
      sp.onclick = () => {
        st.bm = { surah: n, ayah: a.numberInSurah }; save(); mark(n, a.numberInSurah);
        if (idx >= 0 && !isSurah()) playAyah(a.numberInSurah - 1); // أثناء التلاوة: الضغط على آية ينقل التلاوة إليها
        $('status').textContent = 'تم وضع العلامة عند الآية ' + toAr(a.numberInSurah) + ' من سورة ' + d.name + '.';
      };
      box.append(sp);
    });
    $('jump').max = d.numberOfAyahs;
    if (st.bm && st.bm.surah === n) mark(n, st.bm.ayah);
    if (focus) { const el = $('a' + focus); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    else window.scrollTo({ top: 0 });
    if (wantPlay) { wantPlay = false; isSurah() ? playSurah() : playAyah(0); }
  }

  async function open(n, focus) {
    n = Math.min(114, Math.max(1, +n)); $('ayahs').textContent = 'جارٍ التحميل…';
    try { render(await load('/surah/' + n + '/quran-uthmani', 'mh_q_s' + n), focus); } catch (e) { fail(e); }
  }

  $('surah').onchange = e => open(e.target.value);
  $('prev').onclick = () => open(cur - 1);
  $('next').onclick = () => open(cur + 1);
  $('bigger').onclick = () => { st.size = Math.min(3.2, +(st.size + .2).toFixed(1)); save(); size(); };
  $('smaller').onclick = () => { st.size = Math.max(1, +(st.size - .2).toFixed(1)); save(); size(); };
  $('jump').addEventListener('change', e => { const a = +e.target.value; if (a >= 1) { const el = $('a' + a); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
  $('resume').onclick = () => {
    if (!st.bm) { $('status').textContent = 'لم تضع علامة بعد. اضغط على آية لوضع علامة.'; return; }
    st.bm.surah === cur ? $('a' + st.bm.ayah).scrollIntoView({ behavior: 'smooth', block: 'center' }) : open(st.bm.surah, st.bm.ayah);
  };

  // ===== التلاوة الصوتية (من cdn.islamic.network) =====
  const REC = { 'ar.mahermuaiqly': 128, 'ar.alafasy': 128, 'ar.husary': 128, 'ar.minshawi': 128, 'ar.sudais': 192, 'ar.shuraim': 128, 'ar.abdulbasit': 192, 'ar.hudhaify': 128, 'ar.ajamy': 128 };
  const au = new Audio(), pre = new Audio(); pre.preload = 'auto';
  let list = [], idx = -1, rep = 0, playing = false;
  const brs = id => [...new Set([REC[id], 128, 64, 192])]; // جودات بديلة إن لم تتوفر الأولى
  let bi = 0;
  const audioUrl = (a, b) => 'https://cdn.islamic.network/quran/audio/' + (b || REC[$('rec').value]) + '/' + $('rec').value + '/' + a.number + '.mp3';
  function ui() { $('play').textContent = playing ? 'إيقاف مؤقت' : (idx >= 0 ? 'متابعة' : 'تشغيل التلاوة'); }
  function hl(i) {
    document.querySelectorAll('.ay.playing').forEach(e => e.classList.remove('playing'));
    const el = i >= 0 && list[i] ? $('a' + list[i].numberInSurah) : null;
    if (el) { el.classList.add('playing'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
  function stopAudio() { au.pause(); au.removeAttribute('src'); idx = -1; playing = false; hl(-1); ui(); }
  function playAyah(i) {
    if (i < 0 || i >= list.length) { stopAudio(); $('status').textContent = 'انتهت السورة.'; return; }
    idx = i; rep = 0; bi = 0; playing = true;
    au.src = audioUrl(list[i]);
    au.defaultPlaybackRate = au.playbackRate = +$('speed').value;
    au.play().catch(() => { playing = false; ui(); $('status').textContent = 'تعذّر تشغيل الصوت. تأكد من اتصال الإنترنت.'; });
    hl(i); ui(); $('status').textContent = 'تُتلى الآية ' + toAr(list[i].numberInSurah);
    if (list[i + 1]) pre.src = audioUrl(list[i + 1]); // تحميل مسبق للآية التالية
  }
  // ===== صوت محمد الفقيه: السورة كاملة من MP3Quran.net =====
  const FAQIH = 'mp3q:faqih';
  let faqih = null, wantPlay = false;
  const isSurah = () => $('rec').value === FAQIH;
  function syncNote() {
    $('note').textContent = isSurah()
      ? 'صوت محمد الفقيه (المصدر: MP3Quran.net) متاح للسورة كاملة فقط: بدون تمييز للآية، والتكرار يعني تكرار السورة كلها، وزرّا السابقة والتالية ينقلانك بين السور.'
      : '';
  }
  async function faqihSrc(n) {
    if (!faqih) {
      const r = await fetch('https://mp3quran.net/api/v3/reciters?language=ar');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const rc = ((await r.json()).reciters || []).find(x => (x.name || '').includes('الفقيه'));
      if (!rc) throw new Error('القارئ غير موجود في المصدر');
      const m = (rc.moshaf || []).find(x => (x.name || '').includes('حفص')) || (rc.moshaf || [])[0];
      if (!m) throw new Error('لا توجد تلاوة متاحة');
      faqih = { server: m.server.replace(/\/?$/, '/'), list: String(m.surah_list || '').split(',').map(Number) };
    }
    if (!faqih.list.includes(n)) throw new Error('هذه السورة غير متوفرة بصوته');
    return faqih.server + String(n).padStart(3, '0') + '.mp3';
  }
  async function playSurah() {
    stopAudio(); idx = 0; rep = 0; playing = true; ui();
    $('status').textContent = 'جارٍ تحميل التلاوة…';
    try {
      au.src = await faqihSrc(cur);
      au.defaultPlaybackRate = au.playbackRate = +$('speed').value;
      await au.play();
      $('status').textContent = 'تُتلى السورة كاملة بصوت محمد الفقيه.';
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      playing = false; idx = -1; ui();
      $('status').textContent = 'تعذّر تشغيل تلاوة محمد الفقيه (' + ((e && e.message) || 'خطأ') + ').';
    }
  }
  function goSurah(d) { const n = cur + d; if (n < 1 || n > 114) return; wantPlay = true; open(n); }
  au.onended = () => {
    if (isSurah()) { if (++rep < +$('repeat').value) { au.currentTime = 0; au.play(); } else { stopAudio(); $('status').textContent = 'انتهت السورة.'; } return; }
    if (++rep < +$('repeat').value) { au.currentTime = 0; au.play(); } else playAyah(idx + 1);
  };
  au.onerror = () => {
    if (!au.getAttribute('src')) return;
    if (isSurah()) { playing = false; idx = -1; ui(); $('status').textContent = 'تعذّر تحميل تلاوة محمد الفقيه. تأكد من الإنترنت.'; return; }
    const all = brs($('rec').value);
    if (bi + 1 < all.length && list[idx]) { bi++; au.src = audioUrl(list[idx], all[bi]); au.play().catch(() => {}); return; }
    playing = false; ui(); $('status').textContent = 'تعذّر تحميل الصوت. تأكد من الإنترنت أو جرّب قارئاً آخر.';
  };
  au.onplaying = () => { if (bi > 0) REC[$('rec').value] = brs($('rec').value)[bi]; };
  $('play').onclick = () => {
    if (!list.length) return;
    if (playing) { au.pause(); playing = false; ui(); return; }
    if (idx >= 0) { au.play(); playing = true; ui(); return; }
    if (isSurah()) { playSurah(); return; }
    playAyah(st.bm && st.bm.surah === cur ? st.bm.ayah - 1 : 0);
  };
  $('pnext').onclick = () => isSurah() ? goSurah(1) : playAyah(idx < 0 ? 0 : idx + 1);
  $('pprev').onclick = () => isSurah() ? goSurah(-1) : playAyah(Math.max(0, idx < 0 ? 0 : idx - 1));
  $('speed').onchange = () => { st.speed = $('speed').value; save(); au.defaultPlaybackRate = au.playbackRate = +st.speed; };
  $('repeat').onchange = () => { st.rep = $('repeat').value; save(); };
  $('rec').onchange = () => { st.rec = $('rec').value; save(); syncNote(); const was = idx >= 0, from = idx; stopAudio(); if (was) { isSurah() ? playSurah() : playAyah(Math.max(0, from)); } };

  async function init() {
    size();
    $('rec').value = st.rec || 'ar.mahermuaiqly'; $('repeat').value = st.rep || '1'; $('speed').value = st.speed || '1'; syncNote();
    $('ayahs').textContent = 'جارٍ الاتصال بالمصدر…';
    try { surahs = await load('/surah', 'mh_q_list'); } catch (e) { return fail(e); }
    $('surah').textContent = '';
    surahs.forEach(s => $('surah').add(new Option(s.number + '. ' + s.name, s.number)));
    st.bm ? open(st.bm.surah, st.bm.ayah) : open(st.surah);
  }
  init();
})();

const SEERAH = [["قبل البعثة", "العرب قبل الإسلام", "كانت جزيرة العرب قبل البعثة مجتمعًا قبليًّا تغلب عليه عبادة الأصنام، وكانت مكة تضم الكعبة التي رفع قواعدها إبراهيم وإسماعيل عليهما السلام، وكانت قريش تتولى سقاية الحجيج وخدمة البيت. وبقيت عند بعض العرب بقايا من الحنيفية، وكانوا يفخرون بالكرم والشجاعة والشعر، وانتشرت معها مظاهر الظلم والثأر ووأد البنات."], ["قبل البعثة", "نسبه ومولده ﷺ", "هو محمد بن عبد الله بن عبد المطلب بن هاشم من قريش، ويتصل نسبه بإسماعيل بن إبراهيم عليهما السلام. وُلد في مكة يوم الاثنين من شهر ربيع الأول في عام الفيل، نحو سنة 570م. وتوفي أبوه عبد الله وهو حمل في بطن أمه على المشهور، فكفله جده عبد المطلب."], ["قبل البعثة", "الرضاعة واليتم", "استُرضع النبي ﷺ في بادية بني سعد عند حليمة السعدية، ثم عاد إلى أمه آمنة، وتوفيت وهو في السادسة من عمره بالأبواء في طريقها من المدينة إلى مكة. فكفله جده عبد المطلب، ولما توفي وله نحو ثماني سنين كفله عمه أبو طالب ودافع عنه حتى بعد البعثة."], ["قبل البعثة", "شبابه ﷺ وزواجه", "عمل ﷺ في رعي الغنم ثم في التجارة، واشتهر بين قومه بالصادق الأمين. شهد حلف الفضول الذي قام لنصرة المظلوم، وتزوج خديجة بنت خويلد رضي الله عنها وهو في الخامسة والعشرين. وعند تجديد بناء الكعبة اختلفت قريش فيمن يضع الحجر الأسود، فاتفقوا على تحكيمه فوضعه بيده في ثوب حمله زعماء القبائل."], ["العهد المكي", "بدء الوحي", "كان ﷺ يتعبد في غار حراء، ولما بلغ الأربعين نزل عليه جبريل عليه السلام بأول الوحي: ﴿اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ﴾. فرجع إلى خديجة يرجف فؤاده فطمأنته وثبّتته، وذهبت به إلى ورقة بن نوفل فأخبره أنه نبي هذه الأمة وأنه سيُؤذى ويُخرج من قومه."], ["العهد المكي", "الدعوة السرية", "بدأ ﷺ بدعوة أقرب الناس إليه، فآمنت خديجة، وأبو بكر الصديق، وعلي بن أبي طالب وكان صغيرًا، ومولاه زيد بن حارثة. ثم أسلم على يد أبي بكر عدد من كبار الصحابة كعثمان وطلحة والزبير وعبد الرحمن بن عوف وسعد بن أبي وقاص. واستمرت الدعوة سرية نحو ثلاث سنين، واتخذ المسلمون دار الأرقم بن أبي الأرقم مكانًا للقاء والتعلم."], ["العهد المكي", "الجهر بالدعوة", "أمر الله نبيه بإنذار عشيرته الأقربين، فصعد ﷺ جبل الصفا ونادى قريشًا وسألهم: لو أخبرتكم أن خيلًا بالوادي تريد أن تغير عليكم أكنتم مصدقيّ؟ قالوا: نعم، ما جربنا عليك إلا صدقًا. فدعاهم إلى التوحيد، فاعترضه عمه أبو لهب وأساء إليه، فنزلت فيه سورة المسد."], ["العهد المكي", "إيذاء قريش للمسلمين", "اشتد أذى قريش على من أسلم، فعُذّب بلال بن رباح وخباب بن الأرت وآل ياسر، واستُشهدت سمية بنت خياط رضي الله عنها فكانت أول شهيدة في الإسلام. وعرضت قريش على النبي ﷺ المال والملك والزعامة مقابل أن يترك دعوته، فرفض ذلك كله وثبت على ما أمره الله به."], ["العهد المكي", "الهجرة إلى الحبشة", "أذن النبي ﷺ لأصحابه بالهجرة إلى الحبشة لأن بها ملكًا لا يُظلم عنده أحد، فهاجر جماعة منهم عثمان بن عفان وزوجته رقية بنت النبي ﷺ وجعفر بن أبي طالب. وأرسلت قريش وفدًا إلى النجاشي ليردّ المهاجرين، فقرأ عليه جعفر صدرًا من سورة مريم فبكى النجاشي ورفض تسليمهم."], ["العهد المكي", "حصار شعب أبي طالب", "تعاهدت قريش على مقاطعة بني هاشم وبني المطلب فلا يبيعونهم ولا يشترون منهم ولا يزوّجونهم، وعلّقوا الصحيفة في الكعبة، فحُصر النبي ﷺ ومن معه في شعب أبي طالب نحو ثلاث سنين اشتد فيها الجوع، حتى قام بعض عقلاء قريش بنقض الصحيفة وانتهى الحصار."], ["العهد المكي", "عام الحزن", "في السنة العاشرة من البعثة توفي عمه أبو طالب الذي كان يحميه، ثم توفيت زوجته خديجة رضي الله عنها بعده بقليل، وكانت سندًا له في دعوته. فاشتد أذى قريش عليه، فسُمّي ذلك العام عام الحزن."], ["العهد المكي", "رحلة الطائف", "خرج النبي ﷺ إلى الطائف يلتمس نصرة ثقيف فردّوه ردًّا قبيحًا وأغروا به سفهاءهم فرجموه حتى أُدميت قدماه. فدعا ربه بدعائه المشهور يشكو إليه ضعفه. فأرسل الله إليه جبريل وملك الجبال يعرض عليه أن يطبق على أهل مكة الأخشبين، فأبى ﷺ وقال إنه يرجو أن يخرج الله من أصلابهم من يعبد الله وحده."], ["العهد المكي", "الإسراء والمعراج", "أسرى الله بنبيه ﷺ ليلًا من المسجد الحرام إلى المسجد الأقصى، ثم عُرج به إلى السماوات العلا، وفُرضت عليه في تلك الليلة الصلوات الخمس، وكانت خمسين ثم خُفّفت إلى خمس في العمل وخمسين في الأجر. وقد ذكر الله الإسراء في أول سورة الإسراء، وكان في ذلك تثبيت للنبي ﷺ بعد ما لقي من الأذى."], ["العهد المكي", "بيعتا العقبة", "كان النبي ﷺ يعرض نفسه على القبائل في مواسم الحج، فلقي نفرًا من أهل يثرب فآمنوا، ثم جاء في العام التالي اثنا عشر رجلًا فبايعوه بيعة العقبة الأولى، وأرسل معهم مصعب بن عمير يعلّمهم القرآن والدين. وفي العام الذي بعده جاء نحو ثلاثة وسبعين رجلًا وامرأتان فبايعوه بيعة العقبة الثانية على نصرته وحمايته."], ["العهد المكي", "الهجرة إلى المدينة", "أذن الله لنبيه بالهجرة، فخرج مع أبي بكر الصديق ليلًا ونام علي بن أبي طالب في فراشه. ومكثا ثلاث ليال في غار ثور، ثم سارا بدليل هو عبد الله بن أريقط. ولحق بهما سراقة بن مالك طمعًا في جائزة قريش فساخت قوائم فرسه، فرجع. ووصل النبي ﷺ قباء في ربيع الأول من السنة الأولى للهجرة (622م)، وبنى مسجد قباء، ثم دخل المدينة."], ["العهد المدني", "بناء المجتمع في المدينة", "بنى النبي ﷺ المسجد النبوي، وآخى بين المهاجرين والأنصار، فتقاسموا المال والمسكن وصار الإيمان رابطتهم. وكتب وثيقة المدينة التي نظّمت العلاقة بين المسلمين واليهود وسائر أهل المدينة، وشُرع الأذان للصلاة، وبدأت الدولة الإسلامية تقوم على العدل والتكافل."], ["العهد المدني", "غزوة بدر الكبرى", "وقعت في السابع عشر من رمضان سنة 2هـ. خرج المسلمون وهم نحو ثلاثمائة وثلاثة عشر رجلًا يريدون عير قريش، فتحولت الحال إلى مواجهة مع جيش قريش الذي بلغ نحو ألف مقاتل. فنصر الله المسلمين نصرًا حاسمًا، وقُتل من صناديد قريش جمع منهم أبو جهل، وسُمّي هذا اليوم يوم الفرقان."], ["العهد المدني", "غزوة أحد", "في شوال سنة 3هـ خرجت قريش للثأر لبدر، فجعل النبي ﷺ خمسين من الرماة على الجبل وأمرهم بالثبات في مكانهم. فلما بدا النصر ترك أكثرهم أماكنهم، فالتف خالد بن الوليد وكان يومئذ مع قريش فانقلبت المعركة، واستُشهد حمزة بن عبد المطلب ومصعب بن عمير ونحو سبعين من الصحابة، وجُرح النبي ﷺ. وكانت درسًا عظيمًا في طاعة القيادة."], ["العهد المدني", "غزوة الخندق (الأحزاب)", "في شوال سنة 5هـ تحزّبت قريش وغطفان وحلفاؤهم في نحو عشرة آلاف مقاتل لحصار المدينة. فأشار سلمان الفارسي رضي الله عنه بحفر خندق، فحفره المسلمون في شدة الجوع والبرد وشارك النبي ﷺ في الحفر. ثم أرسل الله على الأحزاب ريحًا باردة وجنودًا لم يروها فانصرفوا خائبين، وبعدها حوصر بنو قريظة لنقضهم العهد."], ["العهد المدني", "صلح الحديبية", "في ذي القعدة سنة 6هـ خرج النبي ﷺ في نحو ألف وأربعمائة من أصحابه معتمرًا، فصدّته قريش عن البيت، فبايعه الصحابة تحت الشجرة (بيعة الرضوان). ثم عُقد صلح لعشر سنين بشروط بدت مجحفة، لكن الله سمّاه فتحًا فقال: ﴿إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا﴾، فقد انتشرت الدعوة في زمن الهدنة ودخل في الإسلام خلق كثير."], ["العهد المدني", "خيبر ورسائل الملوك", "فتح المسلمون خيبر في المحرم سنة 7هـ بعد الحديبية، وأرسل النبي ﷺ رسائل إلى الملوك والأمراء يدعوهم إلى الإسلام، منهم هرقل ملك الروم وكسرى ملك فارس والمقوقس عظيم القبط والنجاشي ملك الحبشة، فأسلم النجاشي وكان لبعضهم ردّ حسن."], ["العهد المدني", "غزوة مؤتة", "في جمادى الأولى سنة 8هـ أرسل النبي ﷺ جيشًا من ثلاثة آلاف إلى الشام وأمّر عليه زيد بن حارثة، ثم جعفر بن أبي طالب، ثم عبد الله بن رواحة، فاستُشهدوا جميعًا. فأخذ الراية خالد بن الوليد وانحاز بالجيش انحيازًا حكيمًا حفظه من الهلاك، وسمّاه النبي ﷺ سيفًا من سيوف الله."], ["العهد المدني", "فتح مكة", "في رمضان سنة 8هـ نقضت قريش صلح الحديبية، فخرج النبي ﷺ في نحو عشرة آلاف من المسلمين ودخل مكة من غير قتال يُذكر، وأمّن الناس، وطهّر الكعبة من الأصنام. وتذكر كتب السيرة أنه قال لأهل مكة: اذهبوا فأنتم الطلقاء، فعفا عمّن آذوه وأخرجوه، وأسلم أكثرهم."], ["العهد المدني", "غزوة حنين والطائف", "في شوال سنة 8هـ لقي المسلمون هوازن وثقيف في وادي حنين، وكانوا اثني عشر ألفًا فأعجبتهم كثرتهم فاضطربوا في أول المعركة، ثم ثبت النبي ﷺ ومعه نفر من الصحابة وناداهم فعادوا ونصرهم الله. ونزل فيها قوله تعالى: ﴿وَيَوْمَ حُنَيْنٍ إِذْ أَعْجَبَتْكُمْ كَثْرَتُكُمْ﴾. ثم حاصر المسلمون الطائف."], ["العهد المدني", "غزوة تبوك", "في رجب سنة 9هـ خرج النبي ﷺ بنحو ثلاثين ألف مقاتل لملاقاة الروم في شدة الحر وقلة الزاد، وسُمّي جيش العسرة، وجهّزه عثمان بن عفان بنفقة عظيمة. وعاد النبي ﷺ دون قتال. وفيها تخلف ثلاثة من الصحابة هم كعب بن مالك ومرارة بن الربيع وهلال بن أمية، ثم تاب الله عليهم بعد خمسين ليلة."], ["العهد المدني", "عام الوفود وحجة الوداع", "دخل الناس في دين الله أفواجًا وتتابعت الوفود على المدينة في السنة التاسعة. وفي السنة العاشرة حج النبي ﷺ حجة الوداع في جمع كبير من المسلمين، وخطب في عرفة خطبته الجامعة، وأوصى بالتقوى وحرمة الدماء والأموال والإحسان إلى النساء والتمسك بكتاب الله. ونزل في ذلك الموقف قوله تعالى: ﴿الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ﴾."], ["العهد المدني", "وفاة النبي ﷺ", "مرض النبي ﷺ في أواخر صفر سنة 11هـ، وأمر أبا بكر أن يصلي بالناس، وتوفي ضحى يوم الاثنين من شهر ربيع الأول وله ثلاث وستون سنة. فاضطرب الصحابة، فقام أبو بكر رضي الله عنه وخطب فيهم وتلا قوله تعالى: ﴿وَمَا مُحَمَّدٌ إِلَّا رَسُولٌ قَدْ خَلَتْ مِن قَبْلِهِ الرُّسُلُ﴾، وقال: من كان يعبد محمدًا فإن محمدًا قد مات، ومن كان يعبد الله فإن الله حي لا يموت."], ["العهد المدني", "أخلاقه وشمائله ﷺ", "كان ﷺ أرحم الناس وأصدقهم وأحلمهم، يخصف نعله ويخيط ثوبه ويخدم أهله، ويعفو عمّن ظلمه، ولم يضرب بيده شيئًا قط إلا أن يجاهد في سبيل الله. وسُئلت عائشة رضي الله عنها عن خلقه فقالت: كان خلقه القرآن. وقد زكّاه ربه فقال: ﴿وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ﴾."]];
const SAHABA = [["الخلفاء الراشدون", "أبو بكر الصديق", "عبد الله بن أبي قحافة التيمي القرشي، صاحب النبي ﷺ في الغار والهجرة، ومن أوائل من أسلم وأول الرجال إسلامًا في أشهر الأقوال. أنفق ماله في تحرير المستضعفين كبلال، وصدّق النبي ﷺ في خبر الإسراء فلُقّب بالصديق. تولى الخلافة بعد وفاة النبي ﷺ نحو سنتين، فثبّت الأمة في فتنة الردة وأمر بجمع القرآن في صحف. توفي سنة 13هـ."], ["الخلفاء الراشدون", "عمر بن الخطاب", "الفاروق، أسلم في العهد المكي فأعزّ الله به الإسلام وكان إسلامه سببًا في جهر المسلمين بالعبادة. تولى الخلافة نحو عشر سنين فُتحت فيها الشام والعراق ومصر وبلاد فارس، واشتهر بعدله وزهده ومحاسبة نفسه وولاته، ووُضع في عهده التقويم الهجري وأُنشئت الدواوين. استُشهد سنة 23هـ على يد أبي لؤلؤة المجوسي وهو يصلي الفجر."], ["الخلفاء الراشدون", "عثمان بن عفان", "ذو النورين لزواجه من ابنتي النبي ﷺ رقية ثم أم كلثوم. اشتُهر بحيائه وكرمه، فجهّز جيش العسرة من ماله واشترى بئر رومة وجعلها للمسلمين. جُمع الناس في خلافته على مصحف واحد هو المصحف العثماني، وتوسعت الفتوحات. استُشهد سنة 35هـ في بيته وهو يقرأ القرآن."], ["الخلفاء الراشدون", "علي بن أبي طالب", "ابن عم النبي ﷺ وزوج ابنته فاطمة رضي الله عنها، أسلم صغيرًا ونام في فراش النبي ﷺ ليلة الهجرة. عُرف بشجاعته وعلمه وقضائه، وحمل الراية في مشاهد كثيرة منها خيبر. تولى الخلافة بعد عثمان رضي الله عنهما، واستُشهد سنة 40هـ على يد عبد الرحمن بن ملجم."], ["بقية العشرة المبشرين بالجنة", "طلحة بن عبيد الله", "من السابقين إلى الإسلام، لُقّب بطلحة الخير لكرمه، ووقى النبي ﷺ بنفسه يوم أحد حتى أصيبت يده فشُلّت. وبشّره النبي ﷺ بالجنة، وكان من أهل الشورى. استُشهد في وقعة الجمل سنة 36هـ."], ["بقية العشرة المبشرين بالجنة", "الزبير بن العوام", "حواري رسول الله ﷺ وابن عمته صفية بنت عبد المطلب، من السابقين إلى الإسلام، وشهد المشاهد كلها مع النبي ﷺ، وكان من أشجع الصحابة وفرسانهم، وشارك في فتح مصر. استُشهد سنة 36هـ."], ["بقية العشرة المبشرين بالجنة", "عبد الرحمن بن عوف", "من السابقين الأولين وأحد أهل الشورى، هاجر الهجرتين. لما آخى النبي ﷺ بينه وبين سعد بن الربيع عرض عليه نصف ماله فرفض وقال: دلّوني على السوق، فصار من كبار التجار، وأنفق ماله في سبيل الله بسخاء. توفي سنة 32هـ."], ["بقية العشرة المبشرين بالجنة", "سعد بن أبي وقاص", "من السابقين إلى الإسلام ومن بني زهرة أخوال النبي ﷺ، وكان مجاب الدعوة، وهو أول من رمى بسهم في سبيل الله. قاد المسلمين في معركة القادسية فكان فتحًا لبلاد فارس، وهو أحد أهل الشورى. توفي في خلافة معاوية رضي الله عنهم."], ["بقية العشرة المبشرين بالجنة", "سعيد بن زيد", "من السابقين إلى الإسلام، وهو ابن عم عمر بن الخطاب وزوج أخته فاطمة، وكان لهما أثر في إسلام عمر. وأبوه زيد بن عمرو بن نفيل من الحنفاء الذين تركوا عبادة الأصنام قبل البعثة. شهد المشاهد كلها غير بدر لأنه كان خارج المدينة بأمر النبي ﷺ، وتوفي سنة 51هـ."], ["بقية العشرة المبشرين بالجنة", "أبو عبيدة عامر بن الجراح", "لقّبه النبي ﷺ بأمين هذه الأمة، وكان من السابقين وشهد بدرًا وأحدًا، ونزع حلقتي المغفر من وجه النبي ﷺ يوم أحد فسقطت ثنيتاه. قاد جيوش المسلمين في الشام وفتح دمشق وغيرها، وتوفي بطاعون عمواس سنة 18هـ."], ["من كبار الصحابة", "بلال بن رباح", "مؤذن النبي ﷺ، حبشي الأصل، عذّبه أمية بن خلف في مكة ليترك الإسلام فكان يردد: أحدٌ أحد. اشتراه أبو بكر فأعتقه. أذّن للمسلمين في المدينة وأذّن يوم فتح مكة فوق الكعبة. وشهد المشاهد مع النبي ﷺ، وتوفي في الشام نحو سنة 20هـ."], ["من كبار الصحابة", "خالد بن الوليد", "سيف الله المسلول، أسلم قبل فتح مكة، وقاد جيوش المسلمين في حروب الردة واليمامة وفتح العراق والشام ومعركتي أجنادين واليرموك، ولم يُعرف أنه هُزم في معركة بعد إسلامه. وسمّاه النبي ﷺ سيفًا من سيوف الله بعد غزوة مؤتة. توفي بحمص سنة 21هـ."], ["من كبار الصحابة", "أبو هريرة", "عبد الرحمن بن صخر الدوسي، أسلم سنة 7هـ ولازم النبي ﷺ ملازمة شديدة وكان من أهل الصفة، فصار أكثر الصحابة روايةً للحديث بنحو خمسة آلاف وثلاثمائة حديث. وولّاه عمر البحرين ثم ولي المدينة. توفي نحو سنة 57هـ."], ["من كبار الصحابة", "عبد الله بن مسعود", "من السابقين الأولين وأول من جهر بتلاوة القرآن عند الكعبة في مكة، وكان من خدم النبي ﷺ ومن أعلم الصحابة بالقرآن. أرسله عمر معلّمًا إلى الكوفة فخرّج فيها جيلًا من العلماء. توفي بالمدينة سنة 32هـ."], ["من كبار الصحابة", "عبد الله بن عباس", "ابن عم النبي ﷺ، حبر الأمة وترجمان القرآن، دعا له النبي ﷺ أن يفقهه في الدين ويعلمه التأويل. اشتهر بعلمه وهو شاب حتى كان كبار الصحابة يستشيرونه. توفي بالطائف سنة 68هـ."], ["من كبار الصحابة", "معاذ بن جبل", "من الأنصار وأعلم الصحابة بالحلال والحرام، أرسله النبي ﷺ إلى اليمن معلّمًا وقاضيًا. شهد المشاهد كلها، وتوفي في طاعون عمواس سنة 18هـ."], ["من كبار الصحابة", "أبو ذر الغفاري", "جندب بن جنادة، من السابقين إلى الإسلام، اشتهر بصدقه وزهده وصراحته في قول الحق. أقام في الربذة في آخر حياته وتوفي بها سنة 32هـ."], ["من كبار الصحابة", "سلمان الفارسي", "رحل من بلاد فارس يبحث عن الحق وتنقل بين الرهبان حتى بلغ المدينة فأسلم، وكان عبدًا فأعانه النبي ﷺ وأصحابه حتى كاتب سيده وتحرر. صاحب فكرة حفر الخندق في غزوة الأحزاب، وكان زاهدًا عالمًا. توفي نحو سنة 36هـ."], ["من كبار الصحابة", "مصعب بن عمير", "أول سفير في الإسلام، كان من أنعم شباب قريش عيشًا فترك الترف لما أسلم. أرسله النبي ﷺ إلى المدينة معلّمًا بعد بيعة العقبة الأولى فأسلم على يديه كثير من الأنصار. حمل لواء المسلمين في بدر وأحد واستُشهد في أحد."], ["من كبار الصحابة", "حمزة بن عبد المطلب", "عم النبي ﷺ وأخوه من الرضاعة، أسد الله وأسد رسوله، أسلم في العهد المكي فأعزّ الله به المسلمين. شهد بدرًا واستُشهد يوم أحد على يد وحشي، وسمّاه النبي ﷺ سيد الشهداء."], ["من كبار الصحابة", "جعفر بن أبي طالب", "ابن عم النبي ﷺ، قاد المهاجرين إلى الحبشة وتحدث أمام النجاشي بكلام بليغ عن الإسلام. وسُمّي ذا الجناحين، واستُشهد في غزوة مؤتة وهو يحمل الراية بعد زيد بن حارثة."], ["من كبار الصحابة", "زيد بن حارثة", "مولى رسول الله ﷺ وحبّه، وهو الصحابي الوحيد الذي ذُكر اسمه في القرآن في قوله تعالى: ﴿فَلَمَّا قَضَىٰ زَيْدٌ مِّنْهَا وَطَرًا﴾. تبنّاه النبي ﷺ قبل الإسلام ثم نُسب إلى أبيه حارثة بعد نزول الحكم، وأمّره النبي ﷺ على عدة سرايا، واستُشهد في مؤتة."], ["من كبار الصحابة", "عمار بن ياسر", "من السابقين إلى الإسلام، عُذّب هو وأبوه ياسر وأمه سمية في مكة فصبروا، وبشّرهم النبي ﷺ بالجنة. هاجر الهجرتين وشهد المشاهد، واستُشهد في وقعة صفين سنة 37هـ."], ["من كبار الصحابة", "أنس بن مالك", "خادم رسول الله ﷺ عشر سنين، وأمه أم سليم. كان من المكثرين من رواية الحديث، وعاش طويلًا حتى توفي بالبصرة نحو سنة 93هـ، وهو آخر من مات بها من الصحابة."], ["من كبار الصحابة", "أبو أيوب الأنصاري", "خالد بن زيد، نزل النبي ﷺ ضيفًا عليه حين وصل المدينة حتى بُني المسجد والحجرات. شهد المشاهد كلها وظل يغزو في سبيل الله حتى كبر، واستُشهد وهو يغزو القسطنطينية سنة 52هـ ودُفن عند أسوارها."], ["من كبار الصحابة", "أبو الدرداء", "عويمر بن مالك الأنصاري، من حكماء الصحابة وعلمائهم، آخى النبي ﷺ بينه وبين سلمان الفارسي، وكان تاجرًا فتفرغ للعبادة والعلم. ولي القضاء بدمشق وتوفي سنة 32هـ."], ["من كبار الصحابة", "زيد بن ثابت", "كاتب الوحي وأعلم الصحابة بالفرائض، تعلّم السريانية بأمر النبي ﷺ. كلّفه أبو بكر بجمع القرآن بعد حروب الردة، وكلّفه عثمان بقيادة لجنة كتابة المصاحف. توفي نحو سنة 45هـ."], ["من كبار الصحابة", "حسان بن ثابت", "شاعر الرسول ﷺ، دافع عن الإسلام بشعره، وقال له النبي ﷺ: اهجهم وجبريل معك. وكان من أنصار النبي ﷺ المقدّمين، وعاش في الجاهلية والإسلام."], ["من كبار الصحابة", "خبيب بن عدي", "من الأنصار، أسره المشركون في بعث الرجيع وباعوه لقريش، فقتلوه بمكة وهو ثابت على دينه، وصلى ركعتين قبل قتله فكان أول من سنّ ركعتي القتل. ضرب مثالًا في الثبات والوفاء."], ["من كبار الصحابة", "عمرو بن العاص", "أسلم قبل فتح مكة وولّاه النبي ﷺ على جيش ذات السلاسل. فتح مصر في خلافة عمر بن الخطاب سنة 20هـ وتولى إمارتها، وبنى فيها مسجد عمرو بالفسطاط. توفي بمصر سنة 43هـ."], ["من كبار الصحابة", "عبد الله بن عمر", "ابن الفاروق، اشتهر بشدة اتباعه للسنة وكثرة روايته للحديث وورعه وعبادته، وكان يتتبع آثار النبي ﷺ في المواضع. توفي بمكة سنة 73هـ."], ["الصحابيات", "خديجة بنت خويلد", "أم المؤمنين الأولى وأول من آمن بالنبي ﷺ، تاجرة شريفة ذات عقل ورجاحة، واست النبي ﷺ بمالها ونفسها وصدّقته حين كذّبه الناس. وهي أم أولاده كلهم إلا إبراهيم. توفيت في عام الحزن قبل الهجرة بنحو ثلاث سنين."], ["الصحابيات", "عائشة بنت أبي بكر", "أم المؤمنين، من أفقه النساء وأعلمهن، روت أكثر من ألفين من الأحاديث، وكان كبار الصحابة يرجعون إليها في المسائل. اشتهرت بعلمها وفصاحتها. توفيت بالمدينة سنة 58هـ تقريبًا."], ["الصحابيات", "فاطمة الزهراء", "بنت النبي ﷺ وزوج علي بن أبي طالب وأم الحسن والحسين رضي الله عنهم، عُرفت بالحياء والزهد والصبر، وبشّرها النبي ﷺ بأنها سيدة نساء أهل الجنة. توفيت بعد النبي ﷺ بنحو ستة أشهر."], ["الصحابيات", "أسماء بنت أبي بكر", "ذات النطاقين، شقّت نطاقها نصفين لتربط به طعام النبي ﷺ وأبي بكر في رحلة الهجرة، وصبرت على أذى المشركين. وهي أم عبد الله بن الزبير. عاشت نحو مائة سنة وتوفيت سنة 73هـ."], ["الصحابيات", "نسيبة بنت كعب (أم عمارة)", "من نساء الأنصار، شهدت بيعة العقبة وقاتلت دفاعًا عن النبي ﷺ يوم أحد بسيفها وقوسها حتى جُرحت جراحًا كثيرة، فكانت من أشجع الصحابيات."], ["الصحابيات", "سمية بنت خياط", "أم عمار بن ياسر، أسلمت في بدايات الدعوة وعُذّبت هي وزوجها ياسر وابنها عمار فصبرت، حتى استُشهدت فكانت أول شهيدة في الإسلام."], ["الصحابيات", "أم سلمة هند بنت أبي أمية", "أم المؤمنين، هاجرت الهجرتين وعُرفت برجاحة عقلها. أشارت على النبي ﷺ يوم الحديبية حين تردد الصحابة في التحلل أن يخرج فيحلق ويذبح هديه دون أن يكلم أحدًا، ففعل فتبعه الصحابة. توفيت نحو سنة 61هـ."]];
const QDUAS = [["دعاء الحسنة في الدنيا والآخرة", 2, [201]], ["دعاء إبراهيم وإسماعيل عليهما السلام: تقبّل منا", 2, [127, 128]], ["من خواتيم سورة البقرة", 2, [286]], ["الثبات على الهداية", 3, [8]], ["طلب المغفرة والثبات", 3, [147]], ["دعاء أولي الألباب", 3, [193, 194]], ["دعاء آدم وحواء عليهما السلام", 7, [23]], ["دعاء نوح عليه السلام", 11, [47]], ["دعاء يوسف عليه السلام", 12, [101]], ["دعاء إبراهيم عليه السلام", 14, [40, 41]], ["الدعاء للوالدين", 17, [24]], ["دعاء الفتية في الكهف", 18, [10]], ["دعاء موسى عليه السلام: شرح الصدر", 20, [25, 26, 27, 28]], ["طلب زيادة العلم", 20, [114]], ["دعاء أيوب عليه السلام", 21, [83]], ["دعاء يونس عليه السلام", 21, [87]], ["الاستعاذة من همزات الشياطين", 23, [97, 98]], ["طلب المغفرة والرحمة", 23, [118]], ["دعاء صلاح الأهل والذرية", 25, [74]], ["دعاء موسى عليه السلام", 28, [24]], ["دعاء بلوغ الأربعين", 46, [15]], ["دعاء الأخوة الإيمانية", 59, [10]], ["دعاء امرأة فرعون", 66, [11]], ["دعاء نوح عليه السلام للمؤمنين", 71, [28]]];

/* ===================== إضافات: الوضع الليلي + صفحات المكتبة الإسلامية ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const tb = document.getElementById('themeBtn'); if (!tb) return;
  const label = () => { tb.textContent = document.documentElement.dataset.theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'; };
  label();
  tb.onclick = () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('mh_theme', t); } catch (e) { /* تجاهل */ }
    label();
  };
});

const QA = 'https://api.alquran.cloud/v1';
async function cfetch(urls, key, pick) {
  const c = Store.get(key, null); if (c) return c;
  let err = new Error('تعذّر الاتصال');
  for (const u of [].concat(urls)) {
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 20000);
      let r; try { r = await fetch(u, { signal: ctl.signal }); } finally { clearTimeout(t); }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = pick(await r.json()); if (d == null) throw new Error('بيانات غير متوقعة');
      try { Store.set(key, d); } catch (e) { /* مساحة التخزين ممتلئة */ }
      return d;
    } catch (e) { err = e; }
  }
  throw err;
}
const qSurah = n => cfetch(QA + '/surah/' + n + '/quran-uthmani', 'mh_q_s' + n, j => j.code === 200 ? j.data : null);
const qList = () => cfetch(QA + '/surah', 'mh_q_list', j => j.code === 200 ? j.data : null);
const nrm = s => (s || '').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[ٱأإآ]/g, 'ا');
const stripBism = (n, a) => (n !== 1 && n !== 9 && a.numberInSurah === 1 && nrm(a.text).startsWith('بسم الله الرحمن الرحيم')) ? a.text.trim().split(/\s+/).slice(4).join(' ') : a.text;
const toArN = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function setReader(title, nodes) {
  document.getElementById('rTitle').textContent = title;
  const b = document.getElementById('rBody'); b.textContent = '';
  [].concat(nodes).forEach(n => b.append(n));
}
function failBox(text, retry) {
  const p = el('p', 'm-info', text); const out = [p];
  if (retry) { const b = el('button', 'btn dark', 'إعادة المحاولة'); b.type = 'button'; b.onclick = retry; out.push(b); }
  return out;
}
// الفهرس: قائمة قابلة للبحث، وتجميع اختياري بعنوان المجموعة g
function buildToc(items, onPick) {
  const ul = document.getElementById('toc'), q = document.getElementById('q'); let cur = -1;
  function draw() {
    const k = nrm(q.value.trim()); ul.textContent = ''; let last = null;
    items.forEach((it, i) => {
      if (k && !nrm(it.t).includes(k)) return;
      if (it.g && it.g !== last && !k) { ul.append(el('li', 'grp', it.g)); last = it.g; }
      const li = el('li', i === cur ? 'on' : '', it.t);
      li.onclick = () => {
        cur = i; draw(); onPick(it, i);
        if (window.innerWidth < 800) document.getElementById('rTitle').scrollIntoView({ behavior: 'smooth' });
      };
      ul.append(li);
    });
    if (!ul.children.length) ul.append(el('li', 'grp', 'لا توجد نتائج'));
  }
  q.addEventListener('input', draw); draw();
}

/* ===== صفحة السيرة وصفحة الصحابة (نصوص مضمّنة) ===== */
function staticPage(page, data) {
  if (document.body.dataset.page !== page) return;
  const items = data.map((d, i) => ({ g: d[0], t: (i + 1) + '. ' + d[1], name: d[1], p: d[2] }));
  buildToc(items, it => setReader(it.name, el('p', null, it.p)));
  setReader(page === 'seerah' ? 'السيرة النبوية' : 'قصص الصحابة', el('p', 'm-info', 'اختر من الفهرس (' + toArN(items.length) + ' عنوانًا).'));
}
staticPage('seerah', SEERAH);
staticPage('sahaba', SAHABA);

/* ===== صفحة الأذكار: حصن المسلم + أدعية قرآنية ===== */
(function () {
  if (document.body.dataset.page !== 'adhkar') return;
  const URLS = ['https://cdn.jsdelivr.net/gh/rn0x/Adhkar-json@main/adhkar.json', 'https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json'];
  async function showQ() {
    setReader('أدعية قرآنية مشهورة', el('p', 'm-info', 'جارٍ التحميل…'));
    try {
      const data = {};
      await Promise.all([...new Set(QDUAS.map(d => d[1]))].map(async n => { data[n] = await qSurah(n); }));
      const nodes = QDUAS.map(d => {
        const s = data[d[1]], box = el('div', 'dhikr');
        const ay = s.ayahs.filter(a => d[2].includes(a.numberInSurah)).map(a => a.text);
        box.append(el('strong', null, d[0]), el('div', 'q', '﴿ ' + ay.join(' ') + ' ﴾'),
          el('div', 'ref', s.name + ' — الآية ' + d[2].map(toArN).join('، ')));
        return box;
      });
      setReader('أدعية قرآنية مشهورة', nodes);
    } catch (e) { setReader('تعذّر التحميل', failBox('تعذّر تحميل الأدعية (' + e.message + ').', showQ)); }
  }
  function showH(c) {
    const nodes = c.array.map(z => {
      const d = el('div', 'dhikr'); d.append(el('div', null, String(z.text || '').trim()));
      if (z.count > 1) d.append(el('span', 'cnt', 'يُقال ' + toArN(z.count) + ' مرات'));
      return d;
    });
    nodes.push(el('p', 'm-info', 'المصدر: حصن المسلم للشيخ سعيد بن علي بن وهف القحطاني.'));
    setReader(c.category, nodes);
  }
  async function init() {
    setReader('الأذكار والأدعية', el('p', 'm-info', 'جارٍ تحميل الفهرس…'));
    let H;
    try { H = await cfetch(URLS, 'mh_adhkar_v1', j => Array.isArray(j) && j.length ? j : null); }
    catch (e) { setReader('تعذّر التحميل', failBox('تعذّر تحميل الأذكار (' + e.message + '). تأكد من الإنترنت.', init)); return; }
    const items = [{ g: 'مختارات', t: 'أدعية قرآنية مشهورة', run: showQ }]
      .concat(H.map(c => ({ g: 'حصن المسلم', t: c.id + '. ' + c.category, run: () => showH(c) })));
    buildToc(items, it => it.run());
    setReader('الأذكار والأدعية', el('p', 'm-info', 'اختر بابًا من الفهرس (' + toArN(H.length) + ' بابًا في حصن المسلم).'));
  }
  init();
})();

/* ===== صفحة التفسير: كل السور بفهرس بأسماء السور ===== */
(function () {
  if (document.body.dataset.page !== 'tafsir') return;
  const BOOKS = [['ar-tafsir-muyassar', 'التفسير الميسّر', 'ar.muyassar'], ['ar-tafseer-al-saddi', 'تفسير السعدي'], ['ar-tafsir-ibn-kathir', 'تفسير ابن كثير'],
    ['ar-tafsir-al-jalalayn', 'تفسير الجلالين', 'ar.jalalayn'], ['ar-tafsir-al-tabari', 'تفسير الطبري'], ['ar-tafseer-al-qurtubi', 'تفسير القرطبي'], ['ar-tafsir-al-baghawi', 'تفسير البغوي']];
  const sel = document.getElementById('book');
  BOOKS.forEach(b => sel.add(new Option(b[1], b[0])));
  const saved = Store.get('mh_tf_book', BOOKS[0][0]); sel.value = BOOKS.some(b => b[0] === saved) ? saved : BOOKS[0][0];
  let curN = 0;
  const tfUrls = (slug, n) => ['https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/' + slug + '/' + n + '.json', 'https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/' + slug + '/' + n + '.json'];
  const parse = j => {
    const arr = Array.isArray(j) ? j : (j.ayahs || j.tafsir || j.data); if (!Array.isArray(arr)) return null;
    return arr.map((x, i) => ({ a: +(x.ayah || x.numberInSurah || x.verse || (i + 1)), t: String(x.text || x.tafsir || '').replace(/<[^>]+>/g, '').trim() }));
  };
  async function loadTf(slug, n) {
    const key = 'mh_tf_' + slug + '_' + n;
    try { return await cfetch(tfUrls(slug, n), key, parse); }
    catch (e) {
      const b = BOOKS.find(x => x[0] === slug);
      if (b && b[2]) return await cfetch(QA + '/surah/' + n + '/' + b[2], key, j => j.code === 200 ? j.data.ayahs.map(x => ({ a: x.numberInSurah, t: x.text })) : null);
      throw e;
    }
  }
  async function show(n, name) {
    curN = n; setReader(name, el('p', 'm-info', 'جارٍ التحميل…'));
    try {
      const [q, t] = await Promise.all([qSurah(n), loadTf(sel.value, n)]);
      if (curN !== n) return;
      const map = {}; t.forEach(x => { map[x.a] = x.t; });
      const nodes = q.ayahs.map(a => {
        const d = el('div', 'tf-ayah'), qq = el('div', 'q');
        qq.append(stripBism(n, a) + ' ', el('span', 'no', toArN(a.numberInSurah)));
        d.append(qq, el('div', 't', map[a.numberInSurah] || 'لا يوجد نص مستقل لهذه الآية في هذا التفسير؛ يُنظر تفسيرها مع الآيات المجاورة.'));
        return d;
      });
      setReader(q.name + ' — ' + sel.options[sel.selectedIndex].text, nodes);
    } catch (e) { setReader(name, failBox('تعذّر تحميل التفسير (' + e.message + '). تأكد من الإنترنت أو جرّب كتابًا آخر.', () => show(n, name))); }
  }
  let last = null;
  sel.onchange = () => { Store.set('mh_tf_book', sel.value); if (last) show(last.n, last.name); };
  (async function init() {
    setReader('التفسير', el('p', 'm-info', 'جارٍ تحميل فهرس السور…'));
    let list; try { list = await qList(); } catch (e) { setReader('تعذّر التحميل', failBox('تعذّر تحميل فهرس السور (' + e.message + ').', init)); return; }
    const items = list.map(s => ({ t: s.number + '. ' + s.name, n: s.number, name: s.name }));
    buildToc(items, it => { last = it; show(it.n, it.name); });
    setReader('التفسير', el('p', 'm-info', 'اختر سورة من الفهرس (' + toArN(items.length) + ' سورة).'));
  })();
})();

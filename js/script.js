(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  /* Loader */
  addEventListener('load', () => setTimeout(() => $('#loader').classList.add('done'), 500));
  $('#yr').textContent = new Date().getFullYear();

  /* Navbar: scrolled state, mobile menu, active indicator */
  const nav = $('#nav'), menu = $('#menu'), burger = $('#burger'), ind = $('#ind');
  const links = $$('a', menu);
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  links.forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); burger.setAttribute('aria-expanded', false);
  }));

  const moveInd = a => { ind.style.left = a.offsetLeft + 'px'; ind.style.width = a.offsetWidth + 'px'; };
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    const a = $('a.active', menu); if (a) moveInd(a);
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));
  addEventListener('resize', () => { const a = $('a.active', menu); if (a) moveInd(a); });

  /* Scroll reveal (staggered within siblings) */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const sibs = $$('.reveal', e.target.parentElement);
    e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 6) * 70 + 'ms';
    e.target.classList.add('in'); io.unobserve(e.target);
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* Animated counters */
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    reduce ? el.textContent = end + suf : requestAnimationFrame(tick);
    co.unobserve(el);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => co.observe(el));

  /* Cursor glow, parallax, magnetic buttons */
  if (fine && !reduce) {
    const glow = $('#glow'), par = $$('[data-parallax]');
    addEventListener('mousemove', e => {
      glow.style.transform = `translate(${e.clientX - 240}px, ${e.clientY - 240}px)`;
      const x = e.clientX - innerWidth / 2, y = e.clientY - innerHeight / 2;
      par.forEach(p => p.style.transform = `translate(${x * p.dataset.parallax}px, ${y * p.dataset.parallax}px)`);
    }, { passive: true });

    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
  } else $('#glow').remove();

  /* Floating particles (pauses when tab hidden) */
  const cv = $('#bg'), ctx = cv.getContext('2d');
  let W, H, pts = [], raf;
  const size = () => {
    const d = Math.min(devicePixelRatio, 2);
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
    const n = Math.min(60, Math.floor(innerWidth / 24));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.4 + .4) * d,
      vx: (Math.random() - .5) * .25 * d, vy: (Math.random() - .5) * .25 * d
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(160,170,255,.55)';
    pts.forEach(p => {
      p.x = (p.x + p.vx + W) % W; p.y = (p.y + p.vy + H) % H;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  };
  size(); addEventListener('resize', size);
  if (reduce) draw(), cancelAnimationFrame(raf); else draw();
  document.addEventListener('visibilitychange', () => {
    if (reduce) return;
    document.hidden ? cancelAnimationFrame(raf) : draw();
  });

  /* Hero typewriter: type, hold, erase, next line, repeat forever */
  const typed = $('#typed');
  const lines = [
    'I am Hamza Khan, Full Stack Developer',
    'I Build Scalable Web Applications That Drive Real Business',
    'I Build High-Performance Mobile Apps That People Love to Use'
  ];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const typeLoop = async () => {
    typed.textContent = '';
    await sleep(900);
    for (let i = 0; ; i = (i + 1) % lines.length) {
      for (let c = 1; c <= lines[i].length; c++) { typed.textContent = lines[i].slice(0, c); await sleep(55); }
      await sleep(1900);
      for (let c = lines[i].length - 1; c >= 0; c--) { typed.textContent = lines[i].slice(0, c); await sleep(24); }
      await sleep(450);
    }
  };
  if (!reduce) typeLoop();

  /* Back to top */
  $('#totop').addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* Contact form: sends to your inbox via FormSubmit (no backend needed) */
  const form = $('#form'), status = $('#status');
  const TO = 'hamzadev124@gmail.com';
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email) || !d.message.trim()) {
      status.textContent = 'Please enter your name, a valid email and a message.';
      return;
    }
    const btn = $('button', form); btn.disabled = true; status.textContent = 'Sending…';
    try {
      const r = await fetch('https://formsubmit.co/ajax/' + TO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...d, _subject: 'Portfolio enquiry: ' + d.type, _template: 'table', _replyto: d.email })
      });
      if (!r.ok) throw new Error();
      form.reset(); status.textContent = 'Thank you! Your message has been sent. I will reply soon.';
    } catch {
      status.textContent = 'Could not send. Opening your email app instead…';
      location.href = `mailto:${TO}?subject=${encodeURIComponent('Project enquiry: ' + d.type)}&body=${encodeURIComponent(d.message + '\n\nFrom: ' + d.name + ' (' + d.email + ')')}`;
    } finally { btn.disabled = false; }
  });
})();

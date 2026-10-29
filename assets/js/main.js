(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function formatRand(n) {
    return 'R ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function countUp(el, from, to, format, duration) {
    format = format || function (n) { return Math.round(n).toString(); };
    if (reduceMotion || from === to) { el.textContent = format(to); return; }
    duration = duration || 700;
    var start = null;
    if (el._countFrame) cancelAnimationFrame(el._countFrame);
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(from + (to - from) * eased);
      if (t < 1) el._countFrame = requestAnimationFrame(step);
    }
    el._countFrame = requestAnimationFrame(step);
  }

  /* ---------- Mobile navigation ---------- */
  (function () {
    var header = document.querySelector('header.site');
    var toggle = document.querySelector('.menu-toggle');
    if (!header || !toggle) return;

    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.querySelectorAll('.mobile-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  })();

  /* ---------- Quick exit: floating button + Esc pressed twice ---------- */
  (function () {
    var EXIT_URL = 'https://www.google.com/search?q=weather';
    function leave() {
      // replace() so the Back button doesn't return to this site
      document.body.style.display = 'none';
      window.location.replace(EXIT_URL);
    }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quick-exit';
    btn.innerHTML = '<span aria-hidden="true">&#x2715;</span> Quick exit';
    btn.setAttribute('aria-label', 'Quick exit: leave this site now');
    btn.title = 'Leave this site now (or press Esc twice)';
    btn.addEventListener('click', leave);
    document.body.appendChild(btn);

    var lastEsc = 0;
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (document.querySelector('dialog[open]')) return; // let Esc close the lightbox first
      var now = Date.now();
      if (now - lastEsc < 900) leave();
      lastEsc = now;
    });

    var disclaimer = document.querySelector('.footer-disclaimer');
    if (disclaimer) {
      var hint = document.createElement('span');
      hint.className = 'exit-hint';
      hint.textContent = ' To leave this site quickly, tap “Quick exit” or press Esc twice.';
      disclaimer.appendChild(hint);
    }
  })();

  /* ---------- Scroll progress, shrinking header, back-to-top ---------- */
  (function () {
    var header = document.querySelector('header.site');
    var toTop = document.querySelector('.back-to-top');
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      if (header) header.classList.toggle('scrolled', y > 40);
      if (toTop) toTop.classList.toggle('show', y > 600);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ---------- Reveal on scroll ---------- */
  (function () {
    var selector = [
      '.section-head', '.about-grid > div', '.support-item', '.involve-card',
      '.tl-step', '.wishlist-group', '.founder-card', '.safety-box',
      '.role-list li', '.chip', '.sign-card', '.reel-grid > *', '.gallery-item',
      '.stat', '.finder', '.diff-wrap', '.consent-card', '.builder', '.page-hero .wrap > *'
    ].join(',');
    var els = document.querySelectorAll(selector);
    if (!('IntersectionObserver' in window) || reduceMotion) return;

    // Stagger siblings so grids cascade in rather than popping at once
    els.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(selector); });
      var i = siblings.indexOf(el);
      el.style.setProperty('--reveal-delay', Math.min(i, 8) * 70 + 'ms');
      el.classList.add('reveal');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Count-up numbers ---------- */
  (function () {
    var nums = document.querySelectorAll('[data-count-to]');
    if (!nums.length) return;
    function run(el) { countUp(el, 0, parseFloat(el.getAttribute('data-count-to')), null, 1200); }
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Hero: word-by-word headline, rising particles, tilting seal ---------- */
  (function () {
    var head = document.querySelector('.hero-head');
    if (head && !reduceMotion) {
      var i = 0;
      function wrapWord(text) {
        var span = document.createElement('span');
        span.className = 'word';
        span.style.setProperty('--i', i++);
        span.textContent = text;
        return span;
      }
      Array.prototype.slice.call(head.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          var frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(part) : wrapWord(part));
          });
          head.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          node.classList.add('word');
          node.style.setProperty('--i', i++);
        }
      });
      head.setAttribute('aria-label', head.textContent.replace(/\s+/g, ' ').trim());
      head.classList.add('animate');
    }

    var stage = document.querySelector('.hero-stage');
    if (!stage || reduceMotion) return;

    var seal = stage.querySelector('.hero-seal');
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      seal.style.transform = 'rotateY(' + (x * 16) + 'deg) rotateX(' + (-y * 16) + 'deg)';
    });
    stage.addEventListener('pointerleave', function () { seal.style.transform = ''; });

    var canvas = stage.querySelector('canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var w, h, dpr, particles = [], running = false, pointer = null;
    var styles = getComputedStyle(root);
    var palette = [styles.getPropertyValue('--ochre').trim(), styles.getPropertyValue('--wine').trim(), styles.getPropertyValue('--ochre-soft').trim()];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(initial) {
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : h + 10,
        r: 1.5 + Math.random() * 3.5,
        vy: 0.25 + Math.random() * 0.6,
        sway: Math.random() * Math.PI * 2,
        a: 0.25 + Math.random() * 0.5,
        c: palette[Math.floor(Math.random() * palette.length)]
      };
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function (p, idx) {
        p.y -= p.vy;
        p.sway += 0.02;
        p.x += Math.sin(p.sway) * 0.3;
        if (pointer) {
          // particles drift gently up and away from the pointer — "lifted"
          var dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90 && d > 0) { p.x += dx / d * 1.2; p.y -= 0.8; }
        }
        if (p.y < -10) particles[idx] = spawn(false);
        ctx.globalAlpha = p.a * Math.min(1, p.y / (h * 0.25));
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) requestAnimationFrame(frame);
    }

    resize();
    for (var n = 0; n < 46; n++) particles.push(spawn(true));
    window.addEventListener('resize', resize);
    stage.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    });
    stage.addEventListener('pointerleave', function () { pointer = null; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        setRunning(entries[0].isIntersecting && !document.hidden);
      }).observe(stage);
    } else {
      setRunning(true);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) setRunning(false);
      else if (stage.getBoundingClientRect().bottom > 0) setRunning(true);
    });
  })();

  /* ---------- Flip cards (Know the signs) ---------- */
  document.querySelectorAll('.sign-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    });
  });

  /* ---------- Healthy vs warning-signs toggle ---------- */
  (function () {
    var tabs = document.querySelectorAll('.diff-tab');
    if (!tabs.length) return;
    var wrap = document.querySelector('.diff-wrap');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
          document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
        wrap.setAttribute('data-mode', tab.getAttribute('data-mode'));
      });
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var list = Array.prototype.slice.call(tabs);
        var next = list[(list.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
        next.focus(); next.click();
      });
    });
  })();

  /* ---------- "Where do I start?" finder (nothing is stored or sent) ---------- */
  (function () {
    var finder = document.querySelector('.finder');
    if (!finder) return;
    var body = finder.querySelector('.finder-body');
    var back = finder.querySelector('.finder-restart');

    var HELP = '<ul class="finder-lines">' +
      '<li><span>GBV Command Centre (24hr, free)</span><a href="tel:0800428428">0800 428 428</a></li>' +
      '<li><span>Or dial from any phone</span><a href="tel:*120*7867%23">*120*7867#</a></li>' +
      '<li><span>Police emergency</span><a href="tel:10111">10111</a></li>' +
      '<li><span>Childline (under 18)</span><a href="tel:116">116</a></li>' +
      '</ul>';
    var LIFELINE = '<ul class="finder-lines"><li><span>Lifeline counselling</span><a href="tel:0861322322">0861 322 322</a></li></ul>';

    var flow = {
      start: {
        q: 'Who are you looking for support for?',
        options: [
          { label: 'Myself', next: 'what', who: 'me' },
          { label: 'Someone I care about', next: 'what', who: 'other' },
          { label: 'A young person who needs something to do', next: 'youth' }
        ]
      },
      what: {
        q: 'What feels closest to what’s going on?',
        options: [
          { label: 'Not safe right now', result: 'danger' },
          { label: 'Someone is hurting, threatening or controlling', result: 'gbv' },
          { label: 'Feeling low, anxious or overwhelmed', result: 'mind' },
          { label: 'Alcohol or drugs', result: 'drugs' },
          { label: 'Questions about sex, health or a relationship', result: 'health' },
          { label: 'Work, a CV or a fresh start', result: 'work' }
        ]
      },
      youth: {
        q: 'What would help most?',
        options: [
          { label: 'Sport and staying active', result: 'sport' },
          { label: 'Skills for work', result: 'work' },
          { label: 'Understanding healthy relationships', result: 'health' }
        ]
      }
    };

    var results = {
      danger: {
        title: 'Please call for help now.',
        urgent: true,
        text: 'If you or they are in immediate danger, these lines are free and answered 24 hours a day. Unako is not yet a crisis line, so please don’t wait for us.',
        extra: HELP,
        services: ['svc-gbv']
      },
      gbv: {
        title: 'GBV response and counselling',
        text: 'It is never your fault. Unako will be a confidential first point of contact with guidance on reporting and next steps. Until the centre opens, the GBV Command Centre can help today.',
        extra: HELP,
        services: ['svc-gbv', 'svc-family']
      },
      mind: {
        title: 'Mental health support',
        text: 'Space to talk through trauma, anxiety and the weight of everyday life, with mentors and, over time, professional counsellors.',
        extra: LIFELINE,
        services: ['svc-mind']
      },
      drugs: {
        title: 'Drug and alcohol support',
        text: 'Honest, non-judgemental support for the person dealing with addiction, and for the family around them.',
        extra: LIFELINE,
        services: ['svc-drugs']
      },
      health: {
        title: 'Healthy relationships and sexual health',
        text: 'Stigma-free information on sexual health, plus workshops on what a safe, respectful relationship looks like. See “Know the difference” below.',
        services: ['svc-health', 'svc-relationships']
      },
      work: {
        title: 'Employment workshops',
        text: 'CV writing, interview practice and links to local opportunities, so a fresh start isn’t blocked by not knowing where to begin.',
        services: ['svc-work']
      },
      sport: {
        title: 'Youth sport and programmes',
        text: 'The centre’s outdoor courts and youth programmes are being built for exactly this. Our community’s young boxers are already showing what discipline builds.',
        link: '<p><a href="index.html#youth">See youth sport in our community →</a></p>',
        services: []
      }
    };

    var who = 'me';

    function clearHighlights() {
      document.querySelectorAll('.support-item.match').forEach(function (el) { el.classList.remove('match'); });
    }

    function render(html, focusSel) {
      body.classList.remove('swap');
      void body.offsetWidth; // restart the swap animation
      body.innerHTML = html;
      body.classList.add('swap');
      var f = body.querySelector(focusSel || 'h3');
      if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
    }

    function showStep(key) {
      clearHighlights();
      var step = flow[key];
      var html = '<h3 class="finder-q">' + step.q + '</h3><div class="finder-options">';
      step.options.forEach(function (o, idx) {
        html += '<button type="button" class="finder-opt" data-idx="' + idx + '">' + o.label + '</button>';
      });
      html += '</div>';
      render(html);
      back.hidden = key === 'start';
      body.querySelectorAll('.finder-opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var o = step.options[+btn.getAttribute('data-idx')];
          if (o.who) who = o.who;
          if (o.next) showStep(o.next); else showResult(o.result);
        });
      });
    }

    function showResult(key) {
      var r = results[key];
      var html = '<div class="finder-result' + (r.urgent ? ' urgent' : '') + '">' +
        '<p class="finder-label">' + (r.urgent ? 'Right now' : 'This could help') + '</p>' +
        '<h3>' + r.title + '</h3><p>' + r.text + '</p>' + (r.extra || '') + (r.link || '');
      if (who === 'other' && key !== 'work') {
        html += '<p class="finder-friend">If someone tells you they’re being hurt: listen, believe them, and help them get help.</p>';
      }
      if (r.services.length) html += '<p><a href="#' + r.services[0] + '" class="finder-jump">Read more about this service ↓</a></p>';
      html += '</div>';
      render(html);
      back.hidden = false;
      clearHighlights();
      r.services.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.add('match');
      });
    }

    back.addEventListener('click', function () { showStep('start'); });
    showStep('start');
    finder.classList.add('ready');
  })();

  /* ---------- Centre builder ---------- */
  (function () {
    var builder = document.querySelector('.builder');
    if (!builder) return;
    var boxes = builder.querySelectorAll('input[type="checkbox"]');
    var totalEl = builder.querySelector('.builder-total');
    var meter = builder.querySelector('.builder-meter span');
    var pledge = builder.querySelector('.builder-pledge');
    var countEl = builder.querySelector('.builder-count');
    var allBtn = builder.querySelector('.builder-all');
    var goal = 0, current = 0;
    boxes.forEach(function (b) { goal += +b.getAttribute('data-cost') || 0; });

    function update() {
      var total = 0, chosen = [];
      boxes.forEach(function (b) {
        var piece = builder.querySelector('.piece[data-piece="' + b.value + '"]');
        if (piece) piece.classList.toggle('on', b.checked);
        b.closest('.build-item').classList.toggle('checked', b.checked);
        if (b.checked) {
          var cost = +b.getAttribute('data-cost') || 0;
          total += cost;
          chosen.push('- ' + b.getAttribute('data-label') + ': ' + (cost ? formatRand(cost) : 'to be quoted'));
        }
      });
      countUp(totalEl, current, total, formatRand);
      current = total;
      meter.style.transform = 'scaleX(' + (goal ? total / goal : 0) + ')';
      countEl.textContent = chosen.length ? chosen.length + ' of ' + boxes.length + ' items chosen' : 'Nothing chosen yet';
      builder.classList.toggle('complete', chosen.length === boxes.length);
      allBtn.textContent = chosen.length === boxes.length ? 'Clear all' : 'Build it all';

      pledge.classList.toggle('disabled', !chosen.length);
      pledge.setAttribute('aria-disabled', chosen.length ? 'false' : 'true');
      var body = 'Hi Lindokuhle,\n\nI’d like to help fund these items for the Unako centre:\n\n' +
        chosen.join('\n') + '\n\nEstimated total: ' + formatRand(total) +
        '\n\nPlease let me know how to contribute.\n';
      pledge.href = 'mailto:lindokentane@gmail.com?subject=' + encodeURIComponent('Pledge toward the Unako centre build') +
        '&body=' + encodeURIComponent(body);
    }

    boxes.forEach(function (b) { b.addEventListener('change', update); });
    allBtn.addEventListener('click', function () {
      var allOn = Array.prototype.every.call(boxes, function (b) { return b.checked; });
      boxes.forEach(function (b) { b.checked = !allOn; });
      update();
    });
    pledge.addEventListener('click', function (e) {
      if (pledge.classList.contains('disabled')) e.preventDefault();
    });
    update();
  })();

  /* ---------- Reel: click-to-play ---------- */
  document.querySelectorAll('.reel').forEach(function (reel) {
    var video = reel.querySelector('video');
    var play = reel.querySelector('.reel-play');
    if (!video || !play) return;
    play.addEventListener('click', function () {
      video.setAttribute('controls', '');
      video.muted = true; // the reel has no audio track; muting keeps every browser's autoplay policy happy
      reel.classList.add('playing');
      var p = video.play();
      if (p && p.catch) p.catch(function () { reel.classList.remove('playing'); });
    });
    video.addEventListener('ended', function () { reel.classList.remove('playing'); video.removeAttribute('controls'); });
  });

  /* ---------- Gallery lightbox ---------- */
  (function () {
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    if (!items.length || typeof HTMLDialogElement !== 'function') return;

    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Image viewer');
    dlg.innerHTML =
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-close" aria-label="Close">&#x2715;</button>' +
      (items.length > 1 ? '<button type="button" class="lb-prev" aria-label="Previous image">&larr;</button>' +
        '<button type="button" class="lb-next" aria-label="Next image">&rarr;</button>' : '');
    document.body.appendChild(dlg);
    var img = dlg.querySelector('img');
    var cap = dlg.querySelector('figcaption');
    var current = 0;

    function show(i) {
      current = (i + items.length) % items.length;
      var it = items[current];
      var thumb = it.querySelector('img');
      img.src = it.getAttribute('data-full') || thumb.src;
      img.alt = thumb.alt;
      cap.textContent = it.getAttribute('data-caption') || '';
    }
    items.forEach(function (it, i) {
      it.addEventListener('click', function () { show(i); dlg.showModal(); });
    });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    if (items.length > 1) {
      dlg.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
      dlg.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    }
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
  })();
})();

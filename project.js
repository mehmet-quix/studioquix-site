(() => {
  const zoomTargets = [
    ...document.querySelectorAll(
      'main .cover img, main .media-full img, main .media-split img, main .media-asymmetric img, main .media-pair img, main .media-narrow img, main .art-grid img, main .board-full img'
    )
  ];

  /* V14 — centered lightbox with keyboard / swipe navigation */
  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.setAttribute('aria-hidden','true');
  lightbox.setAttribute('role','dialog');
  lightbox.setAttribute('aria-modal','true');
  lightbox.innerHTML = `
    <div class="image-lightbox-top">
      <span class="image-lightbox-count"></span>
      <button class="image-lightbox-close" type="button">CLOSE ✕</button>
    </div>
    <button class="image-lightbox-nav prev" type="button" aria-label="Previous image">←</button>
    <figure class="image-lightbox-stage"><img src="" alt=""></figure>
    <button class="image-lightbox-nav next" type="button" aria-label="Next image">→</button>
    <div class="image-lightbox-caption"></div>
  `;
  // Appended to <html>, not <body>, so no transformed ancestor can shift the fixed overlay.
  document.documentElement.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('img');
  const stage = lightbox.querySelector('.image-lightbox-stage');
  const closeBtn = lightbox.querySelector('.image-lightbox-close');
  const prevBtn = lightbox.querySelector('.prev');
  const nextBtn = lightbox.querySelector('.next');
  const countEl = lightbox.querySelector('.image-lightbox-count');
  const captionEl = lightbox.querySelector('.image-lightbox-caption');
  let current = -1;
  let lastFocus = null;

  const pad = n => String(n).padStart(2,'0');

  function captionFor(img){
    const holder = img.closest('div, section');
    const cap = holder && holder.querySelector('.media-caption span');
    return cap ? cap.textContent.trim() : (img.alt || '');
  }

  function show(index){
    const total = zoomTargets.length;
    if(!total) return;
    current = (index + total) % total;
    const img = zoomTargets[current];
    lightboxImg.classList.remove('ready');
    lightboxImg.onload = () => lightboxImg.classList.add('ready');
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || '';
    if(lightboxImg.complete) lightboxImg.classList.add('ready');
    countEl.textContent = `${pad(current + 1)} / ${pad(total)}`;
    captionEl.textContent = captionFor(img);
    const single = total < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
    // preload neighbours so arrow presses feel instant
    [current - 1, current + 1].forEach(i => {
      const n = zoomTargets[(i + total) % total];
      if(n){ const pre = new Image(); pre.src = n.currentSrc || n.src; }
    });
  }

  function openLightbox(index){
    lastFocus = document.activeElement;
    show(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('lightbox-open');
    document.body.classList.add('lightbox-open');
    closeBtn.focus({preventScroll:true});
  }

  function closeLightbox(){
    if(!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('lightbox-open');
    document.body.classList.remove('lightbox-open');
    if(lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
    setTimeout(() => {
      if(!lightbox.classList.contains('open')) lightboxImg.src = '';
    }, 220);
  }

  zoomTargets.forEach((img, i) => {
    img.addEventListener('click', e => {
      e.preventDefault();
      openLightbox(i);
    });
  });

  // click on the dark background (not the image or buttons) closes
  lightbox.addEventListener('click', e => {
    if(e.target === lightbox || e.target === stage) closeLightbox();
  });
  lightboxImg.addEventListener('click', e => { e.stopPropagation(); show(current + 1); });
  prevBtn.addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); show(current + 1); });
  closeBtn.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', e => {
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape'){ e.preventDefault(); closeLightbox(); }
    else if(e.key === 'ArrowRight'){ e.preventDefault(); show(current + 1); }
    else if(e.key === 'ArrowLeft'){ e.preventDefault(); show(current - 1); }
  });

  // touch swipe
  let touchX = null;
  lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, {passive:true});
  lightbox.addEventListener('touchend', e => {
    if(touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if(Math.abs(dx) > 45) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  // the page-enter animation transforms <body>; drop it once finished
  document.body.addEventListener('animationend', e => {
    if(e.target === document.body) document.body.classList.remove('enter');
  }, {once:false});

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });

  document.querySelectorAll('.reveal-module').forEach(el => io.observe(el));
})();
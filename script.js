document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  markCurrentPage();
  initAccordions();
  initExperienceDock();
  initSiteActivity();
});

async function initSiteActivity() {
  const api = 'https://portfolio-analytics-api.yhy20020805.workers.dev';
  const countElement = document.getElementById('visit-count');
  const mapElement = document.getElementById('activity-map');

  try {
    const isLiveSite = location.hostname === 'hennyi-yin.github.io';
    if (isLiveSite && sessionStorage.getItem('portfolioVisitCounted') !== 'true') {
      const visitResponse = await fetch(`${api}/visit`, { method: 'POST' });
      if (visitResponse.ok) sessionStorage.setItem('portfolioVisitCounted', 'true');
    }

    if (!countElement || !mapElement) return;
    const response = await fetch(`${api}/stats`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Statistics unavailable');
    const data = await response.json();
    const visits = Number(data.visits) || 0;
    const countries = Array.isArray(data.countries) ? data.countries.slice(0, 5) : [];
    countElement.textContent = new Intl.NumberFormat('en').format(visits);
    await renderVisitorMap(mapElement, countries);
  } catch (error) {
    if (countElement) countElement.textContent = '--';
    if (mapElement) mapElement.textContent = 'Live statistics are temporarily unavailable.';
  }
}

async function renderVisitorMap(container, countries) {
  const [{ geoNaturalEarth1, geoPath }, topojson, worldModule, isoModule] = await Promise.all([
    import('https://esm.sh/d3-geo@3.1.1'),
    import('https://esm.sh/topojson-client@3.1.0'),
    import('https://esm.sh/@d3-maps/atlas@1.0.0/world/countries/countries-110m'),
    import('https://esm.sh/i18n-iso-countries@7.14.0')
  ]);
  const world = worldModule.default || worldModule;
  const atlasFeatures = topojson.feature(world, world.objects.features).features;
  const iso = isoModule.default || isoModule;
  const width = Math.max(container.clientWidth || 580, 320);
  const height = Math.round(width * .52);
  const projection = geoNaturalEarth1().fitExtent([[5, 5], [width - 5, height - 5]], {
    type: 'FeatureCollection',
    features: atlasFeatures
  });
  const path = geoPath(projection);
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'World map showing visitor locations by country');

  atlasFeatures.forEach(country => {
    const shape = document.createElementNS(svgNS, 'path');
    shape.setAttribute('class', 'map-country');
    shape.setAttribute('d', path(country));
    svg.appendChild(shape);
  });

  const featureById = new Map(atlasFeatures.map(country => [country.properties.id, country]));
  const names = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
  const largest = Math.max(...countries.map(item => Number(item.visits) || 0), 1);
  const tooltip = document.createElement('div');
  tooltip.className = 'map-tooltip';
  tooltip.hidden = true;

  countries.forEach(item => {
    if (!/^[A-Z]{2}$/.test(item.country)) return;
    const iso3 = iso.alpha2ToAlpha3(item.country);
    const country = featureById.get(iso3);
    if (!country) return;
    const [x, y] = path.centroid(country);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const value = Number(item.visits) || 0;
    const radius = 4.5 + Math.sqrt(value / largest) * 4;
    const label = `${names?.of(item.country) || item.country}: ${new Intl.NumberFormat('en').format(value)} visits`;
    const pin = document.createElementNS(svgNS, 'g');
    pin.setAttribute('class', 'map-pin');
    pin.setAttribute('transform', `translate(${x} ${y - radius - 4})`);
    pin.setAttribute('role', 'img');
    pin.setAttribute('aria-label', label);

    const stem = document.createElementNS(svgNS, 'line');
    stem.setAttribute('class', 'map-pin-stem');
    stem.setAttribute('x1', '0'); stem.setAttribute('y1', String(radius * .7));
    stem.setAttribute('x2', '0'); stem.setAttribute('y2', String(radius + 4));
    const head = document.createElementNS(svgNS, 'circle');
    head.setAttribute('class', 'map-pin-head');
    head.setAttribute('r', String(radius));
    const core = document.createElementNS(svgNS, 'circle');
    core.setAttribute('class', 'map-pin-core');
    core.setAttribute('r', String(Math.max(1.8, radius * .28)));
    pin.append(stem, head, core);

    const showTooltip = () => {
      tooltip.textContent = label;
      tooltip.style.left = `${(x / width) * 100}%`;
      tooltip.style.top = `${((y - radius) / height) * 100}%`;
      tooltip.hidden = false;
    };
    pin.addEventListener('pointerenter', showTooltip);
    pin.addEventListener('pointerleave', () => { tooltip.hidden = true; });
    pin.addEventListener('click', () => { tooltip.hidden ? showTooltip() : (tooltip.hidden = true); });
    svg.appendChild(pin);
  });

  container.replaceChildren(svg, tooltip);
}

function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if (saved === 'dark-theme' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-theme');
  }
  const update = () => {
    if (!toggle) return;
    const dark = document.body.classList.contains('dark-theme');
    toggle.textContent = dark ? 'Light mode' : 'Dark mode';
    toggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  };
  update();
  toggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme');
    update();
  });
}

function markCurrentPage() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(link => {
    if (link.getAttribute('href') === page) link.setAttribute('aria-current', 'page');
  });
}

function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.setAttribute('aria-expanded', 'false');
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const content = header.nextElementSibling;
      const opening = !item.classList.contains('active');
      item.classList.toggle('active', opening);
      header.setAttribute('aria-expanded', String(opening));
      content.style.maxHeight = opening ? `${content.scrollHeight}px` : null;
    });
  });
}

function initExperienceDock() {
  const tracks = [
    { title: 'Nocturne in B-flat minor, Op. 9 No. 1', file: 'musics/Nocturne in B flat minor, Op. 9 no. 1.mp3' },
    { title: 'Nocturne in E-flat major, Op. 9 No. 2', file: 'musics/Nocturne in E flat major, Op. 9 no. 2.mp3' },
    { title: 'Nocturne in B major, Op. 9 No. 3', file: 'musics/Nocturne in B major, Op. 9 no. 3.mp3' }
  ];
  const dock = document.createElement('div');
  dock.className = 'experience-dock';
  dock.innerHTML = `
    <div class="music-popover" id="music-popover" hidden>
      <div class="music-heading"><strong>Chopin Nocturnes</strong></div>
      <p class="music-track"><strong id="current-track"></strong><span>Frederic Chopin</span></p>
      <audio id="global-audio" controls preload="metadata" controlslist="nodownload noplaybackrate"></audio>
      <ol class="music-playlist" id="music-playlist"></ol>
      <p class="music-status" id="music-status" aria-live="polite"></p>
    </div>
    <button class="dock-button" id="music-toggle" type="button" aria-controls="music-popover" aria-expanded="false">Music</button>`;
  document.body.appendChild(dock);

  const musicToggle = dock.querySelector('#music-toggle');
  const popover = dock.querySelector('#music-popover');
  const audio = dock.querySelector('#global-audio');
  const status = dock.querySelector('#music-status');
  const currentTrack = dock.querySelector('#current-track');
  const playlist = dock.querySelector('#music-playlist');

  const themeToggle = document.getElementById('theme-toggle');
  const headerControls = document.createElement('div');
  headerControls.className = 'header-controls';
  const sakuraToggle = document.createElement('button');
  sakuraToggle.className = 'sakura-button';
  sakuraToggle.type = 'button';
  sakuraToggle.setAttribute('aria-label', 'Toggle falling cherry blossoms');
  sakuraToggle.setAttribute('title', 'Falling cherry blossoms');
  sakuraToggle.setAttribute('aria-pressed', 'false');
  if (themeToggle) {
    themeToggle.parentNode.insertBefore(headerControls, themeToggle);
    headerControls.append(themeToggle, sakuraToggle);
  }

  musicToggle.addEventListener('click', () => {
    const opening = popover.hidden;
    popover.hidden = !opening;
    musicToggle.setAttribute('aria-expanded', String(opening));
  });

  let trackIndex = Math.min(Number(sessionStorage.getItem('musicTrack')) || 0, tracks.length - 1);
  playlist.innerHTML = tracks.map((track, index) => `<li><button type="button" data-track="${index}">${index + 1}. ${track.title}</button></li>`).join('');
  let resumeTime = Number(sessionStorage.getItem('musicTime'));
  const loadTrack = (index, resume = false) => {
    trackIndex = index;
    const track = tracks[index];
    audio.src = track.file;
    currentTrack.textContent = track.title;
    sessionStorage.setItem('musicTrack', String(index));
    playlist.querySelectorAll('button').forEach((button, buttonIndex) => button.setAttribute('aria-current', String(buttonIndex === index)));
    if (!resume) {
      resumeTime = 0;
      sessionStorage.setItem('musicTime', '0');
    }
    audio.load();
  };
  playlist.addEventListener('click', event => {
    const button = event.target.closest('button[data-track]');
    if (!button) return;
    loadTrack(Number(button.dataset.track));
    audio.play();
  });

  audio.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(resumeTime) && resumeTime < audio.duration) audio.currentTime = resumeTime;
    resumeTime = 0;
  });
  audio.addEventListener('timeupdate', () => sessionStorage.setItem('musicTime', String(audio.currentTime)));
  audio.addEventListener('play', () => {
    sessionStorage.setItem('musicPlaying', 'true');
    status.textContent = '';
  });
  audio.addEventListener('pause', () => sessionStorage.setItem('musicPlaying', 'false'));
  audio.addEventListener('ended', () => { loadTrack((trackIndex + 1) % tracks.length); audio.play(); });
  audio.addEventListener('error', () => { status.textContent = 'This track could not be loaded.'; });
  loadTrack(trackIndex, true);
  if (sessionStorage.getItem('musicPlaying') === 'true') {
    audio.play().catch(() => { status.textContent = 'Press play to continue listening.'; });
  }

  const sakura = createSakuraEffect();
  const setSakura = enabled => {
    sakura.setEnabled(enabled);
    sakuraToggle.setAttribute('aria-pressed', String(enabled));
    sakuraToggle.setAttribute('aria-label', `${enabled ? 'Disable' : 'Enable'} falling cherry blossoms`);
    localStorage.setItem('sakuraEnabled', String(enabled));
  };
  setSakura(localStorage.getItem('sakuraEnabled') === 'true');
  sakuraToggle.addEventListener('click', () => setSakura(sakuraToggle.getAttribute('aria-pressed') !== 'true'));
}

function createSakuraEffect() {
  const canvas = document.createElement('canvas');
  canvas.id = 'sakura-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let enabled = false;
  let animationId = 0;
  let petals = [];
  let particles = [];

  const resize = () => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const makePetal = (randomY = false) => ({
    x: Math.random() * innerWidth,
    y: randomY ? Math.random() * innerHeight : -20,
    size: 4 + Math.random() * 5,
    speed: .45 + Math.random() * .75,
    drift: Math.random() * Math.PI * 2,
    spin: Math.random() * Math.PI
  });
  const drawPetal = petal => {
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.spin);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(petal.size, -petal.size, petal.size * 1.8, 0, 0, petal.size * 1.7);
    ctx.bezierCurveTo(-petal.size * .7, petal.size, -petal.size * .6, petal.size * .2, 0, 0);
    ctx.fillStyle = 'rgba(242, 155, 183, .72)';
    ctx.fill();
    ctx.restore();
  };
  const burstPetal = petal => {
    for (let i = 0; i < 9; i += 1) {
      const angle = (Math.PI * 2 * i) / 9 + Math.random() * .25;
      const force = .65 + Math.random() * 1.15;
      particles.push({
        x: petal.x,
        y: petal.y,
        size: Math.max(2, petal.size * (.3 + Math.random() * .28)),
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force - .35,
        spin: Math.random() * Math.PI,
        alpha: .9
      });
    }
    Object.assign(petal, makePetal());
  };
  const animate = () => {
    if (!enabled) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    petals.forEach(petal => {
      petal.y += petal.speed;
      petal.x += Math.sin(petal.drift + petal.y * .012) * .45;
      petal.spin += .008;
      if (petal.y > innerHeight + 20) Object.assign(petal, makePetal());
      drawPetal(petal);
    });
    particles = particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= .97;
      particle.vy = particle.vy * .97 + .018;
      particle.spin += .025;
      particle.alpha -= .018;
      if (particle.alpha <= 0) return false;
      ctx.globalAlpha = particle.alpha;
      drawPetal(particle);
      ctx.globalAlpha = 1;
      return true;
    });
    animationId = requestAnimationFrame(animate);
  };
  resize();
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('pointerdown', event => {
    if (!enabled) return;
    let closest = null;
    let closestDistance = 24;
    petals.forEach(petal => {
      const distance = Math.hypot(event.clientX - petal.x, event.clientY - petal.y);
      if (distance < closestDistance) {
        closest = petal;
        closestDistance = distance;
      }
    });
    if (closest) burstPetal(closest);
  }, { passive: true });

  return {
    setEnabled(value) {
      enabled = value && !matchMedia('(prefers-reduced-motion: reduce)').matches;
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      particles = [];
      if (enabled) {
        petals = Array.from({ length: Math.min(55, Math.ceil(innerWidth / 22)) }, () => makePetal(true));
        animate();
      }
    }
  };
}

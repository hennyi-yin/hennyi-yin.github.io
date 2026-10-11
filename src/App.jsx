import { useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import profileImage from '../images/profile.jpeg';
import { completedProjects } from './projects';

const resumeUrl = `${import.meta.env.BASE_URL}Hengyi-Yin-Resume.pdf`;
const contactEmail = 'hengyi.yin@columbia.edu';
const researchInterests = ['Multimodal Learning', 'Generative Models', 'Computer Vision', 'Robust Machine Learning', 'Biomedical Imaging'];

function ResumeLink({ className = 'button secondary' }) {
  return <a className={className} href={resumeUrl} download="Hengyi-Yin-Resume.pdf">Download resume (PDF)</a>;
}

const tracks = [
  ['Nocturne in B-flat minor, Op. 9 No. 1', new URL('../musics/Nocturne in B flat minor, Op. 9 no. 1.mp3', import.meta.url).href],
  ['Nocturne in E-flat major, Op. 9 No. 2', new URL('../musics/Nocturne in E flat major, Op. 9 no. 2.mp3', import.meta.url).href],
  ['Nocturne in B major, Op. 9 No. 3', new URL('../musics/Nocturne in B major, Op. 9 no. 3.mp3', import.meta.url).href],
];

function ExternalLink({ children, ...props }) {
  return <a target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
}

function Accordion({ title, children }) {
  return (
    <li className="accordion-item">
      <details>
        <summary className="accordion-header">{title}</summary>
        <div className="accordion-content">{children}</div>
      </details>
    </li>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <img src={profileImage} alt="Hengyi Yin" className="profile-pic" />
      <h2>Hengyi Yin</h2>
      <p><strong>M.S. Electrical Engineering Student</strong></p>
      <p><strong>Columbia University</strong></p>
      <p className="sidebar-background">B.Eng. · McGill University</p>
      <p><strong><a href={`mailto:${contactEmail}`}>{contactEmail}</a></strong></p>
      <div className="social-links"><ExternalLink href="https://github.com/hennyi-yin">GitHub</ExternalLink><ExternalLink href="https://www.linkedin.com/in/hengyi-yin/">LinkedIn</ExternalLink></div>
    </aside>
  );
}

function Header({ sakuraEnabled, onToggleSakura }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark-theme'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', dark);
    localStorage.setItem('theme', dark ? 'dark-theme' : 'light-theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#111714' : '#f5f4ef');
  }, [dark]);
  const links = [['/', 'Home'], ['/cv', 'CV'], ['/publications', 'Publications'], ['/portfolio', 'Portfolio']];
  return (
    <header>
      <nav className="main-nav" aria-label="Main navigation"><ul>{links.map(([to, label]) => <li key={to}><NavLink to={to} end={to === '/'}>{label}</NavLink></li>)}</ul></nav>
      <div className="header-controls">
        <button id="theme-toggle" type="button" onClick={() => setDark(value => !value)} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}>{dark ? 'Light mode' : 'Dark mode'}</button>
        <button className="sakura-button" type="button" aria-pressed={sakuraEnabled} aria-label={`${sakuraEnabled ? 'Disable' : 'Enable'} falling cherry blossoms`} title="Falling cherry blossoms" onClick={onToggleSakura}>Cherry blossoms</button>
      </div>
    </header>
  );
}

function SakuraCanvas({ enabled }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let animationId = 0;
    let particles = [];
    let petals = [];

    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = innerWidth * ratio;
      canvas.height = innerHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      petals = Array.from({ length: Math.min(55, Math.ceil(innerWidth / 22)) }, (_, index) => petals[index] || makePetal(true));
    };
    const makePetal = (randomY = false) => ({
      x: Math.random() * innerWidth,
      y: randomY ? Math.random() * innerHeight : -20,
      size: 4 + Math.random() * 5,
      speed: 0.45 + Math.random() * 0.75,
      drift: Math.random() * Math.PI * 2,
      spin: Math.random() * Math.PI,
    });
    const drawPetal = petal => {
      context.save();
      context.translate(petal.x, petal.y);
      context.rotate(petal.spin);
      context.beginPath();
      context.moveTo(0, 0);
      context.bezierCurveTo(petal.size, -petal.size, petal.size * 1.8, 0, 0, petal.size * 1.7);
      context.bezierCurveTo(-petal.size * 0.7, petal.size, -petal.size * 0.6, petal.size * 0.2, 0, 0);
      context.fillStyle = 'rgba(242, 155, 183, .72)';
      context.fill();
      context.restore();
    };
    const burstPetal = petal => {
      for (let index = 0; index < 9; index += 1) {
        const angle = (Math.PI * 2 * index) / 9 + Math.random() * 0.25;
        const force = 0.65 + Math.random() * 1.15;
        particles.push({ x: petal.x, y: petal.y, size: Math.max(2, petal.size * (0.3 + Math.random() * 0.28)), vx: Math.cos(angle) * force, vy: Math.sin(angle) * force - 0.35, spin: Math.random() * Math.PI, alpha: 0.9 });
      }
      Object.assign(petal, makePetal());
    };
    const onPointerDown = event => {
      let closest = null;
      let closestDistance = 24;
      petals.forEach(petal => {
        const distance = Math.hypot(event.clientX - petal.x, event.clientY - petal.y);
        if (distance < closestDistance) { closest = petal; closestDistance = distance; }
      });
      if (closest) burstPetal(closest);
    };
    const animate = () => {
      context.clearRect(0, 0, innerWidth, innerHeight);
      petals.forEach(petal => {
        petal.y += petal.speed;
        petal.x += Math.sin(petal.drift + petal.y * 0.012) * 0.45;
        petal.spin += 0.008;
        if (petal.y > innerHeight + 20) Object.assign(petal, makePetal());
        drawPetal(petal);
      });
      particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.97;
        particle.vy = particle.vy * 0.97 + 0.018;
        particle.spin += 0.025;
        particle.alpha -= 0.018;
        if (particle.alpha <= 0) return false;
        context.globalAlpha = particle.alpha;
        drawPetal(particle);
        context.globalAlpha = 1;
        return true;
      });
      animationId = requestAnimationFrame(animate);
    };

    resize();
    addEventListener('resize', resize, { passive: true });
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    animate();
    return () => {
      cancelAnimationFrame(animationId);
      removeEventListener('resize', resize);
      document.removeEventListener('pointerdown', onPointerDown);
      context.clearRect(0, 0, innerWidth, innerHeight);
    };
  }, [enabled]);
  return <canvas id="sakura-canvas" ref={canvasRef} aria-hidden="true" />;
}

async function drawVisitorMap(container, countries) {
  const [{ geoNaturalEarth1, geoPath }, topojson, worldModule, isoModule] = await Promise.all([
    import(/* @vite-ignore */ 'https://esm.sh/d3-geo@3.1.1'),
    import(/* @vite-ignore */ 'https://esm.sh/topojson-client@3.1.0'),
    import(/* @vite-ignore */ 'https://esm.sh/@d3-maps/atlas@1.0.0/world/countries/countries-50m'),
    import(/* @vite-ignore */ 'https://esm.sh/i18n-iso-countries@7.14.0'),
  ]);
  const world = worldModule.default || worldModule;
  const atlasFeatures = topojson.feature(world, world.objects.features).features;
  const iso = isoModule.default || isoModule;
  const width = Math.max(container.clientWidth || 580, 320);
  const height = Math.round(width * 0.52);
  const projection = geoNaturalEarth1().fitExtent([[5, 5], [width - 5, height - 5]], { type: 'FeatureCollection', features: atlasFeatures });
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
  const countryAliases = { CHINA: 'CN', SINGAPORE: 'SG', UK: 'GB' };
  const mapIdAliases = { XK: 'KOS' };

  countries.forEach(item => {
    const rawCountry = String(item.country || '').trim().toUpperCase();
    const countryCode = countryAliases[rawCountry] || (/^[A-Z]{3}$/.test(rawCountry) ? iso.alpha3ToAlpha2(rawCountry) : rawCountry);
    if (!/^[A-Z]{2}$/.test(countryCode)) return;
    const iso3 = mapIdAliases[countryCode] || iso.alpha2ToAlpha3(countryCode);
    const country = featureById.get(iso3);
    if (!country) return;
    const [x, y] = path.centroid(country);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const value = Number(item.visits) || 0;
    const radius = 4.5 + Math.sqrt(value / largest) * 4;
    const label = `${names?.of(countryCode) || countryCode}: ${new Intl.NumberFormat('en').format(value)} visits`;
    const pin = document.createElementNS(svgNS, 'g');
    pin.setAttribute('class', 'map-pin');
    pin.setAttribute('transform', `translate(${x} ${y - radius - 4})`);
    pin.setAttribute('role', 'img');
    pin.setAttribute('aria-label', label);

    const stem = document.createElementNS(svgNS, 'line');
    stem.setAttribute('class', 'map-pin-stem');
    stem.setAttribute('x1', '0'); stem.setAttribute('y1', String(radius * 0.7));
    stem.setAttribute('x2', '0'); stem.setAttribute('y2', String(radius + 4));
    const head = document.createElementNS(svgNS, 'circle');
    head.setAttribute('class', 'map-pin-head');
    head.setAttribute('r', String(radius));
    const core = document.createElementNS(svgNS, 'circle');
    core.setAttribute('class', 'map-pin-core');
    core.setAttribute('r', String(Math.max(1.8, radius * 0.28)));
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

function VisitorMap({ countries, unavailable }) {
  const mapRef = useRef(null);
  useEffect(() => {
    if (!mapRef.current || !countries) return undefined;
    let active = true;
    drawVisitorMap(mapRef.current, countries).catch(() => {
      if (active && mapRef.current) mapRef.current.textContent = 'Map is temporarily unavailable.';
    });
    return () => { active = false; };
  }, [countries]);
  return <div className="activity-map" ref={mapRef} aria-live="polite"><p>{unavailable ? 'Live statistics are temporarily unavailable.' : 'Loading map…'}</p></div>;
}

function Home() {
  const [visits, setVisits] = useState('--');
  const [countries, setCountries] = useState(null);
  const [statsUnavailable, setStatsUnavailable] = useState(false);
  useEffect(() => {
    const api = 'https://portfolio-analytics-api.yhy20020805.workers.dev';
    const load = async () => {
      try {
        if (location.hostname === 'hennyi-yin.github.io' && sessionStorage.getItem('portfolioVisitCounted') !== 'true') {
          const response = await fetch(`${api}/visit`, { method: 'POST' });
          if (response.ok) sessionStorage.setItem('portfolioVisitCounted', 'true');
        }
        const response = await fetch(`${api}/stats`, { cache: 'no-store' });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setVisits(new Intl.NumberFormat('en').format(Number(data.visits) || 0));
        setCountries(Array.isArray(data.countries) ? data.countries : []);
      } catch {
        setVisits('--');
        setStatsUnavailable(true);
      }
    };
    load();
  }, []);
  return <>
    <section className="hero">
      <span className="eyebrow">Columbia University · Electrical Engineering</span>
      <h1>Learning from language, images, and scientific data.</h1>
      <p className="lede">I’m Hengyi, an M.S. student in Electrical Engineering at Columbia University and a McGill graduate. My work spans language-model post-training and serving, retrieval, graph learning, and reproducible neuroimaging.</p>
      <div className="hero-actions"><NavLink className="button primary" to="/portfolio">Explore my work</NavLink><ResumeLink /><a className="button secondary" href={`mailto:${contactEmail}`}>Get in touch</a></div>
      <div className="stats" aria-label="Core capabilities">
        <div className="stat"><strong>Neuroimaging</strong><span>QSM preprocessing and deep learning-based brain extraction at The Neuro</span></div>
        <div className="stat"><strong>LLM Retrieval</strong><span>RAG and semantic search · 3rd of 76 teams at McGill CodeJam14</span></div>
        <div className="stat"><strong>Published Research</strong><span>Co-author of a 2024 IEEE Transactions on Power Electronics paper</span></div>
      </div>
    </section>
    <section aria-labelledby="recent-projects-title"><span className="eyebrow">Latest experiments · 2026</span><h2 id="recent-projects-title">Reproducible results, open artifacts.</h2><p className="section-intro">Two completed studies with saved evaluations, transparent comparisons, and downloadable model artifacts.</p><ProjectCards projects={completedProjects} /><p><NavLink className="button secondary" to="/portfolio">All research & projects</NavLink></p></section>
    <section><span className="eyebrow">Focus</span><h2>Research interests</h2><ul className="interest-grid">{researchInterests.map(interest => <li key={interest}>{interest}</li>)}</ul></section>
    <section className="site-activity" aria-labelledby="activity-title"><span className="eyebrow">Live footprint</span><h2 id="activity-title">Seen around the world.</h2><div className="activity-card"><div className="activity-total"><strong>{visits}</strong><span>visits since July 2026</span></div><VisitorMap countries={countries} unavailable={statsUnavailable} /></div><p className="activity-note">Approximate country-level totals. No personal information is stored.</p></section>
  </>;
}

const researchExperience = [
  ['Machine Learning Research Assistant, The Neuro (Montreal Neurological Institute-Hospital) · Montreal, Canada · Jan. 2025 – Dec. 2025', ['Worked on quantitative MRI and quantitative susceptibility mapping (QSM) pipelines, including image preprocessing, brain masking, image registration, and downstream quantitative analysis.', 'Investigated brain-mask generation for QSM and evaluated BEN, a deep learning-based brain extraction method, as an alternative to conventional masking approaches.', 'Developed and evaluated reproducible neuroimaging preprocessing workflows using Python, FSL, ANTs, NiBabel, and SimpleITK.']],
  ['Research Assistant, Central South University, School of Traffic & Transportation Engineering · Hunan, China · Apr. 2023 – Sep. 2023', ['Developed data-driven estimation methods for DC-link capacitor health monitoring using MATLAB and Simulink.', 'Designed optimization and simulation procedures for capacitance estimation under low sampling-frequency measurements, contributing to a peer-reviewed publication in IEEE Transactions on Power Electronics.']],
];

const industryExperience = [
  ['Machine Learning Engineer Intern, Huawei Technologies Co., Ltd. · Shanghai, China · Jun. 2024 – Sep. 2024', ['Developed LLM-based knowledge retrieval and code-assistance workflows using Retrieval-Augmented Generation (RAG), embeddings, and semantic search.', 'Built data-processing, code-understanding, and error-analysis tools in Python, Java, and Go to support software debugging and technical-information retrieval.']],
];

const cvProjects = [
  ['Graph Neural Networks for Spatiotemporal Forecasting — PyTorch · 2025', ['Implemented and evaluated graph neural network architectures for spatiotemporal forecasting on traffic and mobility data.', 'Built training and evaluation pipelines in PyTorch.']],
  ['LLM Retrieval System — Hugging Face, Sentence Transformers · 2024', ['Built a Retrieval-Augmented Generation pipeline using dense embeddings and semantic search.', 'Achieved 3rd place among 76 teams at McGill CodeJam14.']],
];

const additionalProjects = [
  ['Gomoku Bot — Python, TensorFlow/Keras, NumPy, tf.data', ['Trained a ResNet-like CNN policy model for Gomoku move prediction.', 'Built a tf.data pipeline with synchronized board–label augmentation, residual blocks, BatchNorm, regularization, and early stopping.']],
  ['Automated Trading Bot — Python, TensorFlow, PostgreSQL, GCP, Kubernetes', ['Built a stock trend forecasting and trading-signal pipeline during a 24-hour hackathon.', 'Deployed a containerized service on Google Cloud using Kubernetes.']],
  ['CNN-SVM Reproducibility — TensorFlow 1.x, Python, NumPy, Matplotlib', ['Reproduced a CNN-SVM model on MNIST and performed ablation studies in a reproducible TensorFlow 1.x environment.']],
  ['MLP & CNN Image Classification — Python, PyTorch, NumPy', ['Developed an MLP from scratch and compared image classifiers on Fashion-MNIST.', 'Explored initialization, depth, activation functions, and regularization.']],
  ['Emotion Classification with BERT — Hugging Face Transformers, PyTorch', ['Fine-tuned bert-base-uncased for emotion classification using mixed-precision training, warmup, and early stopping.']],
  ['Regression & Optimization Experiments — Python, scikit-learn, NumPy, Matplotlib', ['Studied model generalization using cross-validation and experiments with batch size, learning rate, and Gaussian basis functions.']],
];

function ItemList({ items }) { return <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>; }

function CV() {
  return <section id="cv"><span className="eyebrow">Background</span><h2>Curriculum Vitae</h2>
    <ResumeLink />
    <h3>Education</h3>
    <ul className="education-list">
      <li><strong>Columbia University</strong> · New York, US<br />Master of Science in Electrical Engineering · Aug. 2026 – Dec. 2027 (expected)
        <p><strong>Selected graduate coursework:</strong> Reinforcement Learning; Heterogeneous Computing for Signal and Data Processing; LLM-Based Generative AI; Systems and Networks for Large-Scale LLM Inference.</p>
      </li>
      <li><strong>McGill University</strong> · Montreal, Canada<br />Bachelor of Engineering in Electrical Engineering, Minor in Economics · Sep. 2021 – Jun. 2026</li>
    </ul>
    <h3>Research Experience</h3><ul className="work-experience">{researchExperience.map(([title, items]) => <Accordion key={title} title={title}><ItemList items={items} /></Accordion>)}</ul>
    <h3>Industry Experience</h3><ul className="work-experience">{industryExperience.map(([title, items]) => <Accordion key={title} title={title}><ItemList items={items} /></Accordion>)}</ul>
    <h3>Competitions</h3><ul className="competitions"><Accordion title="McGill CodeJam14 Hackathon — 3rd of 76 teams (Nov. 2024)"><ul><li>Built an LLM retrieval prototype integrating RAG, Sentence Transformers, and semantic search. <ExternalLink href="https://devpost.com/software/maestro-qs6gr1">Project link</ExternalLink></li></ul></Accordion></ul>
    <h3>Publications</h3><ul className="publications"><Accordion title="IEEE TPEL (2024) — DC-Link Capacitor Capacitance Estimation in Railways"><ul><li><strong>Title:</strong> A Capacitance Estimation Method for DC-Link Capacitors in Railways Based on Precharging Model and Low Sampling Frequency</li><li><strong>Authors:</strong> Xun Wu, Kaidi Li, Rui Tian, Hengyi Yin, Tianjia Yu, Shu Cheng, Chunyang Chen</li><li><strong>Venue:</strong> IEEE Transactions on Power Electronics, Vol. 39, No. 1, Jan. 2024, pp. 1527–1537</li></ul></Accordion></ul>
    <h3>Technical Skills</h3><ul><li><strong>Programming:</strong> Python, C, Java, Go, SQL, MATLAB</li><li><strong>Machine Learning:</strong> PyTorch, TensorFlow, Hugging Face, scikit-learn, OpenCV, NumPy, Pandas</li><li><strong>Biomedical Imaging:</strong> FSL, ANTs, NiBabel, SimpleITK, Quantitative MRI, QSM, Brain Extraction, Image Registration</li><li><strong>Tools:</strong> Git, Docker, AWS, Jupyter, VS Code, MATLAB/Simulink</li></ul>
    <h3>Research Interests</h3><p>{researchInterests.join(' · ')}</p>
    <h3>Selected Projects</h3><ul className="projects">{completedProjects.map(project => <Accordion key={project.title} title={`${project.title} · 2026`}><ItemList items={project.features} /><p className="project-links">{project.links.map(([label, href]) => <ExternalLink key={href} href={href}>{label}</ExternalLink>)}</p></Accordion>)}{cvProjects.map(([title, items]) => <Accordion key={title} title={title}><ItemList items={items} /></Accordion>)}</ul>
    <h3>Additional Projects</h3><ul className="projects">{additionalProjects.map(([title, items]) => <Accordion key={title} title={title}><ItemList items={items} /></Accordion>)}</ul>
  </section>;
}

function Publications() {
  return <section id="publications"><span className="eyebrow">Research</span><h2>Publications</h2><ul className="publications-list"><li><strong>Title:</strong> <ExternalLink href="https://ieeexplore.ieee.org/document/10274148">A Capacitance Estimation Method for DC-Link Capacitors in Railways Based on Precharging Model and Low Sampling Frequency</ExternalLink><br /><strong>Journal:</strong> <em>IEEE Transactions on Power Electronics</em>, Jan. 2024, Volume 39, Issue 1, Pages 1527–1537.<br /><strong>Authors:</strong> Xun Wu, Kaidi Li, Rui Tian, <strong>Hengyi Yin</strong>, Tianjia Yu, Shu Cheng, Chunyang Chen</li></ul></section>;
}

const portfolioProjects = [
  {
    title: 'QSM & Brain Extraction', category: 'Research · The Neuro · 2025',
    description: 'Reproducible quantitative MRI workflows, from brain masking and registration to downstream QSM analysis.',
    technologies: ['Python', 'FSL', 'ANTs', 'NiBabel', 'SimpleITK', 'BEN'],
    features: ['Worked on image preprocessing, brain masking, image registration, and quantitative analysis for QSM.', 'Evaluated BEN, a deep learning-based brain extraction method, as an alternative to conventional masking approaches.', 'Developed and evaluated preprocessing workflows with an emphasis on robust, reproducible analysis.'],
    links: [],
  },
  {
    title: 'Graph Neural Networks for Spatiotemporal Forecasting', category: 'Machine Learning · 2025',
    description: 'Graph neural network architectures for forecasting on traffic and mobility data, implemented and evaluated in PyTorch.',
    technologies: ['PyTorch', 'Graph Neural Networks', 'Spatiotemporal Forecasting'],
    features: ['Implemented graph neural network architectures for traffic and mobility forecasting.', 'Built model training and evaluation pipelines in PyTorch.'],
    links: [],
  },
  {
    title: 'Maestro · LLM Retrieval System', category: 'CodeJam14 · 3rd of 76 teams · 2024',
    description: 'A hackathon retrieval system using dense embeddings and semantic search to support LLM-powered workflows.',
    technologies: ['Python', 'Hugging Face', 'Sentence Transformers', 'RAG', 'Semantic Search'],
    features: ['Built a Retrieval-Augmented Generation pipeline using dense embeddings and semantic search.', 'Integrated retrieval into an LLM-powered hackathon prototype.', 'Achieved 3rd place among 76 teams at McGill CodeJam14.'],
    links: [['View on Devpost', 'https://devpost.com/software/maestro-qs6gr1'], ['View on GitHub', 'https://github.com/Blacklotus88888/CodeJam14-CloseAI']],
  },
  {
    title: 'OnlyTrades', category: '24-hour Hackathon',
    description: 'A team-built trading platform combining machine learning forecasts with real-time market analytics.',
    technologies: ['Python', 'TensorFlow', 'PostgreSQL', 'Google Cloud Platform', 'Kubernetes'],
    features: ['Built a stock trend forecasting and trading-signal pipeline.', 'Deployed a containerized service on Google Cloud using Kubernetes.'],
    links: [['View on Devpost', 'https://devpost.com/software/onlytrades-i60wev'], ['View on GitHub', 'https://github.com/OnlyTrades/OnlyTrades']],
  },
];

function ProjectCards({ projects }) {
  return <div className="portfolio-grid">{projects.map(project => <article className="project-card" key={project.title}>
      <p className="project-category">{project.category}</p>
      <h3>{project.title}</h3>
      <p className="project-description">{project.description}</p>
      {project.metrics && <dl className="project-metrics">{project.metrics.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
      {project.resultNote && <p className="project-result-note">{project.resultNote}</p>}
      <ul className="technology-tags" aria-label={`Technologies for ${project.title}`}>{project.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>
      <details className="project-details"><summary>My contributions</summary><ItemList items={project.features} /></details>
      {project.links.length > 0 && <p className="project-links">{project.links.map(([label, href]) => <ExternalLink key={href} href={href}>{label}</ExternalLink>)}</p>}
    </article>)}</div>;
}

function Portfolio() {
  return <section id="portfolio"><span className="eyebrow">Selected work</span><h2>Research & Projects</h2>
    <p className="section-intro">Completed experiments and selected contributions in language-model post-training, efficient serving, biomedical imaging, graph learning, and retrieval.</p>
    <ProjectCards projects={[...completedProjects, ...portfolioProjects]} />
  </section>;
}

function MusicDock() {
  const [open, setOpen] = useState(false);
  const [track, setTrack] = useState(() => Math.min(Number(sessionStorage.getItem('musicTrack')) || 0, tracks.length - 1));
  const audioRef = useRef(null);
  const choose = index => { setTrack(index); sessionStorage.setItem('musicTrack', String(index)); setTimeout(() => audioRef.current?.play().catch(() => {}), 0); };
  return <div className="experience-dock"><div className="music-popover" hidden={!open}><div className="music-heading"><strong>Chopin Nocturnes</strong></div><p className="music-track"><strong>{tracks[track][0]}</strong><span>Frédéric Chopin</span></p><audio ref={audioRef} src={tracks[track][1]} controls preload="metadata" controlsList="nodownload noplaybackrate" /><ol className="music-playlist">{tracks.map(([title], index) => <li key={title}><button type="button" aria-current={index === track} onClick={() => choose(index)}>{index + 1}. {title}</button></li>)}</ol></div><button className="dock-button" type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>Music</button></div>;
}

function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

export default function App() {
  const [sakuraEnabled, setSakuraEnabled] = useState(() => localStorage.getItem('sakuraEnabled') === 'true');
  const toggleSakura = () => setSakuraEnabled(value => {
    const next = !value;
    localStorage.setItem('sakuraEnabled', String(next));
    return next;
  });
  return <><ScrollManager /><SakuraCanvas enabled={sakuraEnabled} /><Sidebar /><Header sakuraEnabled={sakuraEnabled} onToggleSakura={toggleSakura} /><div className="container"><main className="route-view"><Routes><Route path="/" element={<Home />} /><Route path="/cv" element={<CV />} /><Route path="/publications" element={<Publications />} /><Route path="/portfolio" element={<Portfolio />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main></div><footer><p>© 2026 Hengyi Yin. All rights reserved.</p></footer><MusicDock /></>;
}

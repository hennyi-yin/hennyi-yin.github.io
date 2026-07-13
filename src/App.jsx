import { useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import profileImage from '../images/profile.jpeg';

const tracks = [
  ['Nocturne in B-flat minor, Op. 9 No. 1', new URL('../musics/Nocturne in B flat minor, Op. 9 no. 1.mp3', import.meta.url).href],
  ['Nocturne in E-flat major, Op. 9 No. 2', new URL('../musics/Nocturne in E flat major, Op. 9 no. 2.mp3', import.meta.url).href],
  ['Nocturne in B major, Op. 9 No. 3', new URL('../musics/Nocturne in B major, Op. 9 no. 3.mp3', import.meta.url).href],
];

function ExternalLink({ children, ...props }) {
  return <a target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  return (
    <li className={`accordion-item${open ? ' active' : ''}`}>
      <button className="accordion-header" type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>{title}</button>
      <div ref={contentRef} className="accordion-content" style={{ maxHeight: open ? `${contentRef.current?.scrollHeight ?? 0}px` : undefined }}>{children}</div>
    </li>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <img src={profileImage} alt="Hengyi Yin" className="profile-pic" />
      <h2>Hengyi Yin</h2>
      <p><strong>B.Eng. Electrical Engineering</strong></p>
      <p><strong>McGill University</strong></p>
      <p><strong><a href="mailto:hengyi.yin@mail.mcgill.ca">hengyi.yin@mail.mcgill.ca</a></strong></p>
      <div className="social-links"><ExternalLink href="https://github.com/hennyi-yin">GitHub</ExternalLink><ExternalLink href="https://www.linkedin.com/in/hengyi-yin/">LinkedIn</ExternalLink></div>
    </aside>
  );
}

function Header() {
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
      <button id="theme-toggle" type="button" onClick={() => setDark(value => !value)} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}>{dark ? 'Light mode' : 'Dark mode'}</button>
    </header>
  );
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
      <span className="eyebrow">Machine Learning · NLP · Neuroimaging</span>
      <h1>Building intelligent systems with real-world impact.</h1>
      <p className="lede">I’m Hengyi, an electrical engineering graduate from McGill working at the intersection of machine learning research, language models, and reproducible scientific computing.</p>
      <div className="hero-actions"><NavLink className="button primary" to="/portfolio">Explore my work</NavLink><a className="button secondary" href="mailto:hengyi.yin@mail.mcgill.ca">Get in touch</a></div>
      <div className="stats" aria-label="Core capabilities">
        <div className="stat"><strong>Machine Learning</strong><span>End-to-end model development, evaluation, and optimization</span></div>
        <div className="stat"><strong>AI Systems</strong><span>LLMs, RAG, natural language processing, and workflow automation</span></div>
        <div className="stat"><strong>Research Engineering</strong><span>Reproducible pipelines, scientific computing, and deployment</span></div>
      </div>
    </section>
    <section><span className="eyebrow">Focus</span><h2>Research interests</h2><ul className="interest-grid"><li>Machine learning systems</li><li>Natural language processing</li><li>Deep learning for scientific data</li></ul></section>
    <section className="site-activity" aria-labelledby="activity-title"><span className="eyebrow">Live footprint</span><h2 id="activity-title">Seen around the world.</h2><div className="activity-card"><div className="activity-total"><strong>{visits}</strong><span>visits since July 2026</span></div><VisitorMap countries={countries} unavailable={statsUnavailable} /></div><p className="activity-note">Approximate country-level totals. No personal information is stored.</p></section>
  </>;
}

const experience = [
  ['Machine Learning Research Assistant, Montreal Neurological Institute-Hospital (Jan. 2025 – Dec. 2025)', ['Developed a machine learning pipeline for multi-echo MRI image analysis, reducing preprocessing time by 40% (25→15 min per scan) and enabling reproducible QSM experiments on 7T and 3T MRI data.', 'Deployed the pipeline for lab-wide use, supporting ongoing neuroimaging studies and improving data reproducibility across 100+ scans.']],
  ['Machine Learning Engineer Intern, Huawei Technologies Co., Ltd (Jun. 2024 – Sep. 2024)', ['Optimized internal LLMs with RAG and multi-agent frameworks, boosting debugging efficiency by 25% as measured by average resolution time per case.', 'Fine-tuned large-scale models handling 100K+ daily interactions, enabling automated error diagnosis and code review across Python, Java, and Go projects.', 'Integrated LLM-based code analysis with automation scripts to extract error codes, reducing manual debugging labor by 40% and accelerating issue resolution.']],
  ['Machine Learning Research Assistant, Central South University, School of Traffic & Transportation Engineering (Apr. 2023 – Sep. 2023)', ['Applied machine learning–inspired optimization techniques (three-stage RLS–LS–LS framework) in MATLAB/Simulink for capacitance estimation of railway DC-link capacitors, improving accuracy by 15% under low sampling frequencies.', 'Validated algorithm performance on dSPACE platform and metro vehicle tests, showing strong robustness against sensor noise and sparse data, with estimation error reduced to within 2%, outperforming conventional baselines (RLS, RELS).', 'Co-authored an IEEE Transactions on Power Electronics paper (2024), positioning the method as a practical ML-based approach for real-world railway converter condition monitoring.']],
];

const cvProjects = [
  ['Gomoku Bot — Python, TensorFlow/Keras, NumPy, tf.data', ['Trained a ResNet-like CNN policy model on ~7M Gomoku board states, achieving ~40%+ top-1 move accuracy on the validation set (400-way classification) and consistently producing strong moves under randomized test positions.', 'Built a high-throughput tf.data pipeline with synchronized board–label augmentation and improved generalization using residual blocks, BatchNorm, L2 regularization, dropout, and early stopping.']],
  ['Automated Trading Bot (24-hour Hackathon) — Python, TensorFlow, PostgreSQL, GCP, Kubernetes', ['Generated real-time stock trend forecasts and trading signals on live market feeds, reaching ~60%+ directional accuracy in backtests.', 'Implemented an end-to-end ML pipeline and deployed a scalable containerized service on Google Cloud via Kubernetes.']],
  ['CNN-SVM Reproducibility — TensorFlow 1.x, Python, NumPy, Matplotlib', ['Achieved 99.11% MNIST test accuracy, slightly exceeding the reproduced paper’s results.', 'Engineered a reproducible TensorFlow 1.x environment and performed ablation studies to analyze model behavior.']],
  ['MLP & CNN Image Classification — Python (from scratch), PyTorch, NumPy', ['Raised Fashion-MNIST accuracy to ~87% and CNN performance to 91.8%, outperforming baseline MLP results.', 'Developed an MLP from scratch and optimized initialization, depth, activation functions, and regularization.']],
  ['Emotion Classification with BERT — Hugging Face Transformers, PyTorch, GPU (T4)', ['Increased classification accuracy from 80.15% to 91.35%, demonstrating the benefit of deep contextual modeling.', 'Fine-tuned bert-base-uncased with mixed-precision training, warmup, and early stopping.']],
  ['Regression & Optimization Experiments — Python, scikit-learn, NumPy, Matplotlib', ['Reduced test MSE to 0.251 and improved model generalization on Boston Housing and Wine datasets.', 'Used 5-fold cross-validation and tuned batch size, learning rate, and Gaussian basis functions.']],
];

function ItemList({ items }) { return <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>; }

function CV() {
  return <section id="cv"><span className="eyebrow">Background</span><h2>Curriculum Vitae</h2>
    <h3>Education</h3><ul><li><strong>McGill University</strong> — Bachelor of Electrical Engineering, Minor in Economics (Sep. 2021 – Dec. 2025)</li></ul>
    <h3>Experience</h3><ul className="work-experience">{experience.map(([title, items]) => <Accordion key={title} title={title}><ItemList items={items} /></Accordion>)}</ul>
    <h3>Competitions</h3><ul className="competitions"><Accordion title="McGill CodeJam14 Hackathon — 3rd Place (Nov. 2024)"><ul><li><strong>Tech Stack:</strong> Python, Machine Learning, NLP, LLM</li><li>Engineered an LLM-powered prototype integrating RAG, Sentence-Transformers, and semantic search, achieving 95%+ accuracy in contextual query retrieval. <ExternalLink href="https://devpost.com/software/maestro-qs6gr1">Project link</ExternalLink></li><li>Led model integration in a four-member team, contributing to a top-3 finish among 76 teams.</li></ul></Accordion></ul>
    <h3>Publications</h3><ul className="publications"><Accordion title="IEEE TPEL (2024) — DC-Link Capacitor Capacitance Estimation in Railways"><ul><li><strong>Title:</strong> A Capacitance Estimation Method for DC-Link Capacitors in Railways Based on Precharging Model and Low Sampling Frequency</li><li><strong>Authors:</strong> Xun Wu, Kaidi Li, Rui Tian, Hengyi Yin, Tianjia Yu, Shu Cheng, Chunyang Chen</li><li><strong>Venue:</strong> IEEE Transactions on Power Electronics, Vol. 39, No. 1, Jan. 2024, pp. 1527–1537</li></ul></Accordion></ul>
    <h3>Technical Skills</h3><ul><li><strong>Programming:</strong> Python, Java, C, MySQL, HTML/CSS</li><li><strong>Frameworks:</strong> TensorFlow, PyTorch, Keras, Hugging Face, scikit-learn, OpenCV, Pandas, NumPy, CUDA</li><li><strong>DevOps & Cloud:</strong> Docker, Kubernetes, AWS, GCP, Spark, GitHub Actions</li><li><strong>ML Development:</strong> Feature engineering, model selection, hyperparameter tuning, experiment tracking, explainability, and evaluation</li></ul>
    <h3>Projects</h3><ul className="projects">{cvProjects.map(([title, items]) => <Accordion key={title} title={title}><ItemList items={items} /></Accordion>)}</ul>
  </section>;
}

function Publications() {
  return <section id="publications"><span className="eyebrow">Research</span><h2>Publications</h2><ul className="publications-list"><li><strong>Title:</strong> <ExternalLink href="https://ieeexplore.ieee.org/document/10274148">A Capacitance Estimation Method for DC-Link Capacitors in Railways Based on Precharging Model and Low Sampling Frequency</ExternalLink><br /><strong>Journal:</strong> <em>IEEE Transactions on Power Electronics</em>, Jan. 2024, Volume 39, Issue 1, Pages 1527–1537.<br /><strong>Authors:</strong> Xun Wu, Kaidi Li, Rui Tian, <strong>Hengyi Yin</strong>, Tianjia Yu, Shu Cheng, Chunyang Chen</li></ul></section>;
}

const portfolioProjects = [
  { title: 'Maestro', description: 'Finished in a 36-hour hackathon, Maestro is a workflow automation tool that uses advanced machine learning to automate repetitive tasks, integrate APIs, and surface actionable analytics.', technologies: ['Retrieval-Augmented Generation (RAG)', 'LangChain', 'Prompt Engineering', 'Python', 'TensorFlow', 'Node.js', 'Docker', 'AWS (EC2, S3)'], features: ['Intelligent task automation using RAG and LangChain', 'Seamless API integrations', 'Customizable prompt-engineered workflows', 'Real-time analytics dashboard', 'Scalable AWS deployment with Docker'], links: [['View on Devpost', 'https://devpost.com/software/maestro-qs6gr1'], ['View on GitHub', 'https://github.com/Blacklotus88888/CodeJam14-CloseAI']] },
  { title: 'OnlyTrades', description: 'Finished in a 24-hour hackathon, OnlyTrades is a secure trading platform using machine learning for stock price prediction and real-time analytics.', technologies: ['Long Short-Term Memory (LSTM)', 'XGBoost', 'Attention Mechanisms', 'Python', 'TensorFlow', 'PostgreSQL', 'Google Cloud Platform'], features: ['Stock prediction using LSTM, XGBoost, and attention', 'Real-time transaction tracking and notifications', 'OAuth 2.0 authentication', 'Trade and asset dashboard', 'Kubernetes deployment on Google Cloud'], links: [['View on Devpost', 'https://devpost.com/software/onlytrades-i60wev'], ['View on GitHub', 'https://github.com/OnlyTrades/OnlyTrades']] },
];

function Portfolio() {
  return <section id="portfolio"><span className="eyebrow">Selected work</span><h2>My Portfolio</h2><ul className="accordion">{portfolioProjects.map(project => <Accordion key={project.title} title={project.title}><p><strong>Project Description:</strong> {project.description}</p><p><strong>Technologies Used:</strong></p><ItemList items={project.technologies} /><p><strong>Key Features:</strong></p><ItemList items={project.features} /><p className="project-links">{project.links.map(([label, href]) => <ExternalLink key={href} href={href}>{label}</ExternalLink>)}</p></Accordion>)}</ul></section>;
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
  return <><ScrollManager /><Sidebar /><Header /><div className="container"><main className="route-view"><Routes><Route path="/" element={<Home />} /><Route path="/cv" element={<CV />} /><Route path="/publications" element={<Publications />} /><Route path="/portfolio" element={<Portfolio />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main></div><footer><p>© 2026 Hengyi Yin. All rights reserved.</p></footer><MusicDock /></>;
}

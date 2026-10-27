(() => {
  'use strict';
  const content = window.PortfolioContent;
  if (!content) return;
  const filename = decodeURIComponent(location.pathname.split('/').pop()) || 'index.html';
  const home = filename === 'index.html';
  const root = home ? './' : '../';
  const collection = document.body.dataset.collection;
  const project = content.projects.find((item) => item.file === filename);
  const section = collection || project?.categories[0] || 'home';
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const icons = {
    github: '<path d="M9 19c-4 1-4-2-6-2m12 4v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6A4.7 4.7 0 0 0 18.4 6a4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.7 11.7 0 0 0-6.1 0C6.4 2.5 5.4 2.8 5.4 2.8A4.3 4.3 0 0 0 5.3 6 4.7 4.7 0 0 0 4 9.3c0 4.7 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6 9 7 9-7"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  };
  const icon = (name) => `<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
  const navItems = [['home', 'Overview', `${root}index.html`], ...Object.entries(content.categories).map(([key, item]) => [key, item.name, `${root}pages/${item.file}`])];
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `<div class="site-header-inner">
    <a class="site-brand" href="${root}index.html"><span class="site-monogram" aria-hidden="true">lw</span>Leyi Wang</a>
    <nav class="site-navigation" id="site-navigation" aria-label="Main navigation">${navItems.map(([key, label, href]) => `<a href="${href}"${key === section ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
    <div class="site-socials" aria-label="Contact links">
      <a href="https://github.com/Ley1Wang" aria-label="GitHub" target="_blank" rel="noopener noreferrer">${icon('github')}</a>
      <a href="https://www.instagram.com/kuizhiyi?igsh=ZmJ2eWd3MmR3cmM1" aria-label="Instagram" target="_blank" rel="noopener noreferrer">${icon('instagram')}</a>
      <a href="mailto:leyiwang0624@gmail.com" aria-label="Email Leyi Wang">${icon('mail')}</a>
    </div>
    <button type="button" class="site-menu-button" aria-expanded="false" aria-controls="site-navigation" aria-label="Toggle navigation">${icon('menu')}</button>
  </div>`;
  const previousHeader = document.querySelector('body > .topbar, body > .site-header');
  if (previousHeader) previousHeader.replaceWith(header);
  else document.body.prepend(header);
  const menu = header.querySelector('.site-menu-button');
  const closeMenu = () => { header.classList.remove('menu-open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  header.querySelectorAll('nav a').forEach((link) => link.addEventListener('click', closeMenu));
  addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  const main = document.querySelector('body > main, body > .container, body > .wrap');
  if (main) {
    main.id ||= 'main-content';
    if (main.tagName !== 'MAIN') main.setAttribute('role', 'main');
    const skip = document.createElement('a');
    skip.className = 'site-skip';
    skip.href = '#' + main.id;
    skip.textContent = 'Skip to content';
    document.body.prepend(skip);
  }

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `<div><div class="site-footer-brand">Leyi Wang</div>A notebook of experiments, tools, and things I’m learning.</div><nav class="site-footer-links" aria-label="Footer"><a href="${root}index.html#about">About</a><a href="mailto:leyiwang0624@gmail.com">Get in touch ↗</a><a href="https://github.com/Ley1Wang" target="_blank" rel="noopener noreferrer">GitHub ↗</a><span>© ${new Date().getFullYear()}</span></nav>`;
  const oldFooter = document.querySelector('body > .footer, body > .site-footer');
  if (oldFooter) oldFooter.replaceWith(footer);
  else document.body.appendChild(footer);

  if (project && main && !collection) {
    document.body.classList.add('site-tool');
    document.body.dataset.project = project.id;
    document.title = `${project.title} — Leyi Wang`;
    const category = content.categories[section];
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'project-breadcrumb';
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    breadcrumb.innerHTML = `<a href="../index.html">Home</a><span aria-hidden="true">/</span>${section !== 'radar' ? `<a href="${category.file}">${category.name}</a><span aria-hidden="true">/</span>` : ''}<span>${escape(project.title)}</span>`;
    main.prepend(breadcrumb);
    const h1 = main.querySelector('h1');
    if (h1) {
      const oldIntro = h1.nextElementSibling;
      let intro;
      if (oldIntro?.tagName === 'P' && !oldIntro.id) intro = oldIntro;
      else { intro = document.createElement('p'); intro.className = 'project-intro'; h1.after(intro); }
      intro.textContent = project.description;
      const meta = document.createElement('div');
      meta.className = 'project-meta';
      meta.innerHTML = `<span class="site-pill${/local|hardware/i.test(project.mode) ? ' local' : ''}">${escape(project.mode)}</span><span class="project-topic">${escape(project.topic)}</span>`;
      intro.after(meta);
    }
    const guide = document.createElement('section');
    guide.className = 'project-guide';
    const siblings = content.projects.filter((item) => item.categories.includes(section) && !item.external && item.id !== 'portfolio');
    const currentIndex = siblings.findIndex((item) => item.id === project.id);
    const next = siblings[(currentIndex + 1) % siblings.length];
    guide.innerHTML = `<p class="site-eyebrow">A closer look</p><div class="guide-columns"><div><h2><span>01</span>Try this</h2><p>${escape(project.try)}</p></div><div><h2><span>02</span>What to notice</h2><p>${escape(project.notice)}</p></div><div><h2><span>03</span>Model &amp; scope</h2><p>${escape(project.limits)}</p></div></div><div class="project-continue"><a href="${section === 'radar' ? '../index.html#selected-work' : category.file}">← ${section === 'radar' ? 'Back to selected work' : `All ${category.name.toLowerCase()} projects`}</a>${next && next !== project ? `<a href="${next.file}">Next: ${escape(next.title)} <span aria-hidden="true">→</span></a>` : '<span>Keep exploring. Change one variable at a time.</span>'}</div>`;
    main.appendChild(guide);
    if (project.id === 'neural-digit') {
      const local = document.createElement('a');
      local.className = 'button secondary';
      local.href = 'http://127.0.0.1:5000';
      local.textContent = 'Open local model interface ↗';
      main.querySelectorAll('.panel').item(2)?.append(local);
      document.getElementById('status')?.setAttribute('role', 'status');
      document.getElementById('status')?.setAttribute('aria-live', 'polite');
    }
  }

  if (collection) {
    const cards = [...document.querySelectorAll('.catalog-card')];
    const search = document.getElementById('project-search');
    const buttons = [...document.querySelectorAll('[data-filter]')];
    let filter = 'all';
    const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const update = () => {
      const query = normalize(search.value.trim());
      let visible = 0;
      cards.forEach((card) => {
        card.hidden = (filter !== 'all' && card.dataset.topic !== filter) || !normalize(card.textContent).includes(query);
        if (!card.hidden) visible++;
      });
      document.getElementById('catalog-count').textContent = `${visible} of ${cards.length} projects`;
      document.getElementById('catalog-empty').hidden = visible !== 0;
    };
    buttons.forEach((button) => button.addEventListener('click', () => {
      filter = button.dataset.filter;
      buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      update();
    }));
    search.addEventListener('input', update);
    document.getElementById('reset-search').addEventListener('click', () => {
      search.value = ''; filter = 'all';
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
      update(); search.focus();
    });
    update();
  }
  document.querySelectorAll('a[target="_blank"]').forEach((link) => { link.rel = 'noopener noreferrer'; });
  document.querySelectorAll('canvas').forEach((canvas) => {
    if (!canvas.hasAttribute('aria-label')) canvas.setAttribute('aria-label', `${project?.title || 'Project'} visualization`);
  });
  // Source files with very small form demos still receive accessible field names.
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach((field) => {
    if (field.labels?.length || field.hasAttribute('aria-label')) return;
    const previous = field.previousElementSibling;
    const text = previous?.tagName === 'LABEL' ? previous.textContent : field.placeholder || field.id.replace(/([a-z])([A-Z])/g, '$1 $2');
    field.setAttribute('aria-label', text.trim());
  });
})();

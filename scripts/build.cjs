// Regenerate the complete English page after editing profile or paper data.
// The generated website itself requires no build step or dependencies.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const site = path.resolve(__dirname, '..');
const context = { window: {} };
for (const file of ['profile.js', 'content.js']) vm.runInNewContext(fs.readFileSync(path.join(site, file), 'utf8'), context);
const profile = context.window.HOMEPAGE_PROFILE;
const content = context.window.HOMEPAGE_CONTENT;
const copy = {};
for (const [key, value] of Object.entries(content.ui)) copy['ui.' + key] = value;
for (const [key, value] of Object.entries(profile)) copy['profile.' + key] = value;
for (const paper of content.papers) for (const [key, value] of Object.entries(paper)) {
  if (typeof value === 'string') copy['paper.' + paper.key + '.' + key] = value;
}
function escape(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function tx(key, tag = 'span', attributes = '') {
  if (typeof copy[key] !== 'string') throw new Error('Missing translation: ' + key);
  return `<${tag} data-content="${key}"${attributes ? ' ' + attributes : ''}>${escape(copy[key])}</${tag}>`;
}
function asset(file) {
  const hash = createHash('sha256').update(fs.readFileSync(path.join(site, file))).digest('hex').slice(0, 10);
  return `./${file}?v=${hash}`;
}
const MONTHS = { January: '01', February: '02', March: '03', April: '04', May: '05', June: '06', July: '07', August: '08', September: '09', October: '10', November: '11', December: '12' };
function bibtex(paper) {
  const year = paper.date.split(' ')[1];
  return `@misc{${paper.bibKey},\n  title = {${paper.bibTitle}},\n  author = {${paper.authors.join(' and ')}},\n  year = {${year}},\n  eprint = {${paper.id}},\n  archivePrefix = {arXiv},\n  primaryClass = {${paper.primaryClass || 'cs.CV'}},${paper.accepted ? '\n  note = {Accepted to ' + paper.venue + '},' : ''}\n  url = {https://arxiv.org/abs/${paper.id}}\n}`;
}
function publication(paper) {
  const base = 'paper.' + paper.key + '.';
  const abs = 'https://arxiv.org/abs/' + paper.id;
  const [month, year] = paper.date.split(' ');
  if (!MONTHS[month]) throw new Error('Unknown month in date: ' + paper.date);
  if (paper.accepted && !paper.venue) throw new Error('Accepted paper needs a venue: ' + paper.key);
  const venue = paper.accepted
    ? `<span class="venue accepted" data-content-title="ui.acceptedNote" title="${escape(content.ui.acceptedNote)}">${escape(paper.venue)}</span>`
    : tx('ui.preprint', 'span', 'class="venue"');
  return `<article class="publication" id="${paper.key}" aria-labelledby="paper-${paper.key}">
    <p class="publication-meta">${venue}<span class="meta-sep" aria-hidden="true">·</span>${tx(base + 'date', 'time', `datetime="${year}-${MONTHS[month]}"`)}</p>
    <h3 id="paper-${paper.key}"><a href="${abs}">${tx(base + 'title')}</a></h3>
    <p class="authors">${paper.authors.map(author => author === 'Haifa Zhang' ? '<strong>' + escape(author) + '</strong>' : escape(author)).join(', ')}</p>
    ${tx(base + 'takeaway', 'p', 'class="paper-takeaway"')}
    <figure class="paper-figure">
      <a class="figure-link" href="${paper.figure}" data-figure="${paper.key}" aria-label="${escape(paper.alt)}" data-content-aria-label="${base}alt">
        <img src="${paper.figure}" width="${paper.width}" height="${paper.height}" loading="lazy" decoding="async" alt="${escape(paper.alt)}" data-content-alt="${base}alt">
      </a>
      <figcaption>${tx(base + 'caption')} <a href="${paper.figureSource}" target="_blank" rel="noopener noreferrer">${tx('ui.originalFigure')}</a></figcaption>
    </figure>
    <aside class="result-box" aria-label="Key result"><div class="result-metric">${tx(base + 'metric', 'strong')}${tx(base + 'metricLabel', 'span', 'class="metric-context"')}</div><div class="result-text">${tx(base + 'resultHighlight', 'p', 'class="result-highlight"')}${tx(base + 'resultCondition', 'p', 'class="result-condition"')}</div></aside>
    <ul class="paper-keywords" aria-label="Research keywords">${paper.keywords.map(keyword => `<li>${escape(keyword)}</li>`).join('')}</ul>
    <div class="paper-links"><a href="${abs}" aria-label="arXiv: ${escape(paper.title)}">arXiv</a><a href="https://arxiv.org/pdf/${paper.id}" aria-label="PDF: ${escape(paper.title)}">PDF</a><details class="citation">${tx('ui.citation', 'summary')}<pre><code>${escape(bibtex(paper))}</code></pre></details><details class="paper-details"><summary>${tx('ui.paperDetails')}</summary><dl class="paper-explanation"><div>${tx('ui.problem', 'dt')}${tx(base + 'problem', 'dd')}</div><div>${tx('ui.method', 'dt')}${tx(base + 'method', 'dd')}</div><div>${tx('ui.result', 'dt')}<dd>${tx(base + 'result')} <a href="${paper.resultSource}" target="_blank" rel="noopener noreferrer">${tx('ui.evidence')}</a></dd></div></dl></details></div>
  </article>`;
}
// Papers are grouped under their year, in the order they appear in content.js (newest first).
const years = [...new Set(content.papers.map(paper => paper.date.split(' ')[1]))];
const updated = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
// Every "researchN" key in content.js becomes one row of the research interests list.
const interests = Object.keys(content.ui).filter(key => /^research\d+$/.test(key));
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(profile.bio + ' ' + profile.researchIntro)}">
  <meta name="theme-color" content="#fbfaf7">
  <title>Haifa Zhang · Tianjin University</title>
  <link rel="canonical" href="https://zhanghaifa.github.io/">
  <link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${asset('styles.css')}">
  <script src="${asset('profile.js')}" defer></script><script src="${asset('content.js')}" defer></script><script src="${asset('site.js')}" defer></script>
</head>
<body>
  ${tx('ui.skip', 'a', 'class="skip-link" href="#main"')}
  <header class="site-header"><div class="header-inner">
    <a class="brand" href="#about" aria-label="Haifa Zhang, home">${tx('profile.name')}</a>
    <nav aria-label="Main navigation" data-content-aria-label="ui.navLabel">${tx('ui.navAbout', 'a', 'href="#about"')}${tx('ui.navResearch', 'a', 'href="#research"')}${tx('ui.navPapers', 'a', 'href="#publications"')}${tx('ui.navContact', 'a', 'href="#contact"')}</nav>
  </div></header>
  <div class="page-layout">
    <aside class="profile-rail" aria-label="Haifa Zhang">
      <figure class="portrait-frame"><img class="portrait" src="./portrait.jpg" alt="Portrait of Haifa Zhang" width="1280" height="1600" fetchpriority="high">${tx('profile.photoCaption', 'figcaption')}</figure>
      <div class="rail-info">${tx('profile.role', 'p', 'class="role"')}${tx('profile.university', 'p', 'class="university"')}${tx('profile.school', 'p', 'class="school"')}${tx('profile.location', 'p', 'class="location"')}
      <p class="advisors">${tx('ui.advisorsLabel', 'span', 'class="rail-label"')}${tx('profile.advisor1', 'span', 'class="advisor"')}${tx('profile.advisor2', 'span', 'class="advisor"')}</p>
      <div class="profile-links"><a href="mailto:${escape(profile.email)}" data-link="email">${tx('ui.email')}</a><a href="${escape(profile.githubUrl)}" data-link="github">GitHub</a></div></div>
    </aside>
    <main id="main">
      <section class="about" id="about" aria-labelledby="name-heading">
        <h1 id="name-heading">${tx('profile.name')}</h1>
        <div class="bio-lines">${tx('profile.bio', 'p', 'class="bio"')}${tx('profile.researchIntro', 'p', 'class="research-intro"')}${tx('profile.researchExtension', 'p', 'class="research-extension"')}</div>
      </section>
      <section class="research-section" id="research" aria-labelledby="research-heading"><div class="section-heading">${tx('ui.researchTitle', 'h2', 'id="research-heading"')}</div><dl class="research-list">
      ${interests.map(key => `<div class="research-area">${tx('ui.' + key, 'dt')}${tx('ui.' + key + 'Text', 'dd')}</div>`).join('\n      ')}
      </dl></section>
      <section id="publications" class="publications-section" aria-labelledby="publications-heading"><div class="section-heading">${tx('ui.papersTitle', 'h2', 'id="publications-heading"')}${tx('ui.papersCount', 'span', 'class="section-note"')}</div>
        ${years.map(year => `<div class="publication-year"><span>${year}</span></div>
        ${content.papers.filter(paper => paper.date.endsWith(year)).map(publication).join('\n')}`).join('\n')}
      </section>
      <section id="contact" class="contact-section" aria-labelledby="contact-heading"><div class="section-heading">${tx('ui.contactTitle', 'h2', 'id="contact-heading"')}</div><a class="contact-email" href="mailto:${escape(profile.email)}" data-link="email">${tx('profile.email')}</a><p>${tx('ui.contactNote')}</p><p class="contact-address">${tx('profile.school')}<br>${tx('profile.university')}, ${tx('profile.location')}</p></section>
    </main>
  </div>
  <footer class="site-footer"><span>© <span id="year">${years[0]}</span> ${tx('profile.name')} · ${tx('ui.updated')} ${updated}</span><a href="#about">${tx('ui.backTop')}</a></footer>
  <dialog id="figure-dialog" aria-labelledby="figure-dialog-title"><div class="dialog-toolbar">${tx('ui.figureDialog', 'h2', 'id="figure-dialog-title"')}<button type="button" id="close-figure">${tx('ui.close')} <span aria-hidden="true">×</span></button></div><img id="expanded-figure" alt=""><p id="expanded-caption"></p></dialog>
</body>
</html>
`;
fs.writeFileSync(path.join(site, 'index.html'), html, 'utf8');
console.log(`Built index.html: ${content.papers.length} illustrated papers, English only.`);

// Apply the English profile and paper text, and support figure enlargement.
(() => {
  'use strict';
  const profile = window.HOMEPAGE_PROFILE;
  const content = window.HOMEPAGE_CONTENT;
  if (!profile || !content) return;
  const copy = {};
  Object.entries(content.ui).forEach(([key, value]) => { copy['ui.' + key] = value; });
  Object.entries(profile).forEach(([key, value]) => { copy['profile.' + key] = value; });
  content.papers.forEach(paper => Object.entries(paper).forEach(([key, value]) => {
    if (typeof value === 'string') copy['paper.' + paper.key + '.' + key] = value;
  }));
  document.querySelectorAll('[data-content]').forEach(element => {
    const value = copy[element.dataset.content];
    if (typeof value === 'string') element.textContent = value;
  });
  for (const attribute of ['alt', 'title', 'aria-label']) {
    document.querySelectorAll('[data-content-' + attribute + ']').forEach(element => {
      const value = copy[element.getAttribute('data-content-' + attribute)];
      if (typeof value === 'string') element.setAttribute(attribute, value);
    });
  }
  document.documentElement.lang = 'en';
  document.title = profile.name + ' · ' + profile.university;
  document.querySelector('meta[name="description"]').content = profile.bio + ' ' + profile.researchIntro;
  document.querySelector('.portrait').alt = 'Portrait of ' + profile.name;
  document.querySelector('.brand').setAttribute('aria-label', profile.name + ', home');
  document.querySelectorAll('[data-link="email"]').forEach(element => {
    element.hidden = !profile.email;
    if (profile.email) element.href = 'mailto:' + profile.email;
  });
  document.querySelectorAll('[data-link="github"]').forEach(element => {
    let url;
    try { url = new URL(profile.githubUrl); } catch { /* Invalid link: hide. */ }
    const valid = url && url.protocol === 'https:' && url.hostname === 'github.com';
    element.hidden = !valid;
    if (valid) element.href = url.href;
  });
  document.getElementById('year').textContent = new Date().getFullYear();

  const dialog = document.getElementById('figure-dialog');
  const expandedImage = document.getElementById('expanded-figure');
  const expandedCaption = document.getElementById('expanded-caption');
  let returnFocus = null;
  document.querySelectorAll('[data-figure]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
    const paper = content.papers.find(item => item.key === link.dataset.figure);
    if (!paper) return;
    event.preventDefault();
    returnFocus = link;
    expandedImage.src = link.href;
    expandedImage.alt = paper.alt;
    expandedCaption.textContent = paper.caption;
    dialog.showModal();
  }));
  document.getElementById('close-figure').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (returnFocus) returnFocus.focus({ preventScroll: true });
  });
})();
# Haifa Zhang — Academic Homepage

English academic homepage: https://zhanghaifa.github.io/

## Update

- Edit `profile.js` for the biography, advisors, photo caption, and contact information.
- Edit `content.js` for publications, figure captions, and experimental results. Papers are listed newest first; each needs a `date` such as `November 2026`, and may set `primaryClass` (default `cs.CV`) and, when `accepted` is true, a `venue`.
- Add a `researchN` / `researchNText` pair in `content.js` to add a row to the research interests list.
- Edit `styles.css` for the visual design.
- Run `node scripts/build.cjs` after changing any of these files or `site.js`.
- Commit the source files and the generated `index.html`, then push to `main`.

GitHub Pages serves the files at the repository root. No dependency installation or runtime server is needed. Keep this repository name and the homepage address unchanged so the printed QR code continues to work.

The page contains complete English text without JavaScript. JavaScript updates editable text and enables the figure viewer; the figure links and expandable paper explanations also have native HTML fallbacks. The generated page uses content-based asset versions to pick up updated styles and text.

## Paper figures and results

Figures come from the linked papers, and each result links to its source table. Keep the dataset, baseline, and evaluation conditions with the corresponding values. The original travel portrait is included as `portrait.jpg`.

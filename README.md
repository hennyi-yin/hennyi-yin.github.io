# Hengyi Yin — Portfolio

A React single-page portfolio hosted on GitHub Pages. The site uses hash routing so every section works reliably on static hosting without page reloads.

## Local development

```bash
pnpm install
pnpm run dev
```

Production builds are created with `pnpm run build`. Pushing to `main` deploys the `dist` build through GitHub Actions.

## Content and resume

The homepage, CV, research interests, and project summaries live in `src/App.jsx`. The downloadable resume is `public/Hengyi-Yin-Resume.pdf`; replace that file when updating the resume so both download links remain current.

The October 2026 profile update follows the supplied master resume for Columbia enrollment, education dates, contact information, and research experience. Older projects remain under Additional Projects.

The completed LLM post-training/serving and MONAI brain-extraction projects are shared across Home, Portfolio, and the web CV through `src/projects.js`. Their measured claims are sourced from the linked public repositories and Releases. The LLM card retains the negative main result and the descriptive boxed-format breakdown; the MONAI card labels its supplementary cropped BET baseline post hoc.

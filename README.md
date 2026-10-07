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

The October 2026 content update follows the supplied master resume for Columbia enrollment, education dates, contact information, research experience, and selected projects. Older projects remain under Additional Projects. Quantitative claims absent from the supplied resume have been removed from the website.

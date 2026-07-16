
# dariusf.github.io

Uses a minimal static site generator built on Vite.

- Dev server with hot reloading
- Actual LaTeX
- Nunjucks templates
- Markdown (via markdown-it)
- sitemap.xml and RSS feed (/feed/feed.xml)

```sh
make        # dev server
make build  # render site to _build/dist
```

```
.
├── drafts          → /drafts/* (unlisted)
├── pages           → /*
├── posts           → /blog/*
├── static          → /* (static files0
├── templates       Nunjucks search path
├── plugin          Plugin sources
├── site.yaml       Metadata
└── vite.config.js
```

Site metadata is available to every page under the `data` variable:
`data.site`,
`data.posts`,
`data.drafts`,
`data.pages`,
`data.all` (posts, drafts, and pages).

Page-level metadata is available directly.

## LaTeX

Math is compiled by _actual LaTeX_ at build time and uses content-based caching.

Requirements:

- `latex` and `dvisvgm` on `PATH` (MacTeX)
- `brew install ghostscript` for `/opt/homebrew/lib/libgs.dylib`

`mathDefs` in per-page frontmatter allows defining macros.

Display math is always wrapped in `$$`, so use a nestable environment (`aligned`, `gathered`, `split`, `array`, `cases`, `matrix`), and never a top-level display environment (`align`, `gather`, `alignat`, `flalign`, `multline`, `eqnarray`).

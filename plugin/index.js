// A minimal static site generator on Vite.
//
// Vite provides the dev server, watcher, and full-reload websocket; pages are
// rendered by plain functions in this file. There is no bundling and no module
// graph: markdown-it renders markdown (with LaTeX math compiled to SVGs, see
// latex-math.js), nunjucks renders templates, and the whole site is re-rendered
// on any change (rendering is cheap; math is content-hash cached).
//
// Layout: posts/ -> /blog/*, drafts/ -> /drafts/* (unlisted), pages/ -> /*,
// static/ -> copied to the site root, templates/ -> nunjucks search path.
// Everything is available to templates under a single `data` object:
// data.site (site.yaml), data.posts, data.drafts, data.pages, data.all.

import fs from "node:fs";
import path from "node:path";
import { load as yamlLoad } from "js-yaml";
import nunjucks from "nunjucks";
import { createMarkdown, slugify } from "./markdown.js";

const OUT = "_build/dist";
const MATH_CACHE = "_build/math-cache";

// ---------------------------------------------------------------- scanning

function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: {}, body: src };
  return { fm: yamlLoad(m[1]) ?? {}, body: src.slice(m[0].length) };
}

function pageDate(fm, file) {
  if (fm.date instanceof Date) return fm.date;
  if (fm.date) return new Date(fm.date);
  return fs.statSync(file).mtime;
}

// url '/blog/foo/' -> output file 'blog/foo/index.html'
function outFileFor(url) {
  return url.endsWith("/") ? url.slice(1) + "index.html" : url.slice(1);
}

function readPage(file, url, kind, layout) {
  const { fm, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  if (fm.permalink) url = fm.permalink;
  return {
    kind,
    inputPath: file,
    engine: file.endsWith(".njk") ? "njk" : "md",
    url,
    outFile: outFileFor(url),
    layout: "layout" in fm ? fm.layout : layout,
    title: fm.title,
    date: pageDate(fm, file),
    fm,
    body,
    assets: [],
  };
}

// A posts-style directory: foo.md -> <prefix>/foo/, or foo/index.md ->
// <prefix>/foo/ with all other files in foo/ copied alongside as assets.
function scanPostsDir(dir, prefix, kind) {
  if (!fs.existsSync(dir)) return [];
  const pages = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isFile() && entry.name.endsWith(".md")) {
      const slug = entry.name.replace(/\.md$/, "");
      pages.push(readPage(full, `${prefix}/${slug}/`, kind, "post.njk"));
    } else if (entry.isDirectory()) {
      // index.md, or a file named after the directory (e.g. stack-heap/stack-heap.md)
      let index = path.join(full, "index.md");
      if (!fs.existsSync(index)) index = path.join(full, `${entry.name}.md`);
      if (!fs.existsSync(index)) continue;
      const page = readPage(index, `${prefix}/${entry.name}/`, kind, "post.njk");
      for (const f of fs.readdirSync(full, { recursive: true })) {
        const src = path.join(full, f);
        if (src === index || !fs.statSync(src).isFile()) continue;
        page.assets.push({ src, dest: path.posix.join(prefix.slice(1), entry.name, f) });
      }
      pages.push(page);
    }
  }
  return pages;
}

function scanPagesDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const pages = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (name.startsWith(".") || !fs.statSync(full).isFile()) continue;
    if (name.endsWith(".md")) {
      const slug = name.replace(/\.md$/, "");
      const url = slug === "index" ? "/" : `/${slug}/`;
      pages.push(readPage(full, url, "page", "base.njk"));
    } else if (name.endsWith(".njk")) {
      // pure nunjucks pages (feed, sitemap, listings); no layout by default
      const slug = name.replace(/\.njk$/, "");
      const url = slug.includes(".") ? `/${slug}` : `/${slug}/`;
      pages.push(readPage(full, url, "page", null));
    }
  }
  return pages;
}

// --------------------------------------------------------------- rendering

function nunjucksEnv(root) {
  const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader([path.join(root, "templates"), root], { noCache: true }),
    { autoescape: true },
  );
  // "7 Mar 2025", like luxon's "d LLL yyyy" (Intl en-GB says "Sept", not "Sep")
  const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
  env.addFilter("readableDate", (d) => {
    d = new Date(d);
    return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  });
  env.addFilter("htmlDateString", (d) => new Date(d).toISOString().slice(0, 10));
  env.addFilter("dateToRfc3339", (d) =>
    new Date(d).toISOString().replace(/\.\d{3}Z$/, "Z"),
  );
  env.addFilter("absoluteUrl", (url, base) => new URL(url, base).href);
  env.addFilter("htmlBaseUrl", (url, base) => new URL(url, base).href);
  env.addFilter("head", (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : []));
  // the filter drops apostrophes ("Z3's" -> "z3s"); heading ids dash them
  // instead, because typographer has turned them into ’ by then
  env.addFilter("slugify", (s) => slugify(String(s).replace(/'/g, "")));
  return env;
}

export function createSite(root) {
  const md = createMarkdown({ cacheDir: path.join(root, MATH_CACHE) });
  const env = nunjucksEnv(root);

  function listing(pages) {
    return pages
      .filter((p) => !p.fm.eleventyExcludeFromCollections)
      .map((p) => {
        const entry = { ...p.fm, url: p.url, title: p.title, date: p.date };
        if (p.engine === "md") {
          // rendered body, computed on demand (the feed includes full content)
          let html;
          Object.defineProperty(entry, "content", {
            get: () => (html ??= md.render(p.body, { mathDefs: p.fm.mathDefs, page: p.url })),
          });
        }
        return entry;
      })
      .sort((a, b) => a.date - b.date);
  }

  const posts = scanPostsDir(path.join(root, "posts"), "/blog", "post");
  const drafts = scanPostsDir(path.join(root, "drafts"), "/drafts", "draft");
  const pages = scanPagesDir(path.join(root, "pages"));
  const all = [...posts, ...drafts, ...pages];

  const data = {
    site: yamlLoad(fs.readFileSync(path.join(root, "site.yaml"), "utf8")),
    posts: listing(posts),
    drafts: listing(drafts),
    pages: listing(pages),
    // for the sitemap; drafts are reachable but unadvertised
    all: listing([...posts, ...pages]),
  };

  function renderPage(page) {
    const ctx = { ...page.fm, page: { url: page.url, date: page.date }, data };
    let content;
    if (page.engine === "md") {
      content = md.render(page.body, { mathDefs: page.fm.mathDefs, page: page.url });
    } else {
      content = env.renderString(page.body, ctx);
    }
    if (!page.layout) return content;
    return env.render(page.layout, { ...ctx, content });
  }

  return { pages: all, data, renderPage };
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

export function renderSite(root) {
  const out = path.join(root, OUT);
  const site = createSite(root);
  for (const page of site.pages) {
    const dest = path.join(out, page.outFile);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, renderPageSafe(site, page));
    for (const asset of page.assets) copyFile(asset.src, path.join(out, asset.dest));
  }
  // math SVGs accumulate in the cache; publish them all under /math/
  const cache = path.join(root, MATH_CACHE);
  if (fs.existsSync(cache)) {
    for (const f of fs.readdirSync(cache)) {
      copyFile(path.join(cache, f), path.join(out, "math", f));
    }
  }
  return site;
}

function renderPageSafe(site, page) {
  try {
    return site.renderPage(page);
  } catch (e) {
    console.error(`[ssg] failed to render ${page.inputPath}:`, e.message);
    return `<pre>Failed to render ${page.inputPath}\n\n${e.stack ?? e}</pre>`;
  }
}

export function buildSite(root) {
  const out = path.join(root, OUT);
  fs.rmSync(out, { recursive: true, force: true });
  const site = renderSite(root);
  const staticDir = path.join(root, "static");
  if (fs.existsSync(staticDir)) fs.cpSync(staticDir, out, { recursive: true });
  console.log(`[ssg] built ${site.pages.length} pages -> ${OUT}`);
}

// -------------------------------------------------------------- dev server

const MIME = {
  ".html": "text/html",
  ".xml": "text/xml",
  ".xsl": "text/xsl",
  ".svg": "image/svg+xml",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
};

export default function ssg() {
  let root;
  return {
    name: "ssg",

    configResolved(config) {
      root = config.root;
    },

    configureServer(server) {
      renderSite(root);

      const watched = ["posts", "drafts", "pages", "templates", "site.yaml"].map((d) =>
        path.join(root, d),
      );
      server.watcher.add(watched);
      const onChange = (file) => {
        if (!watched.some((w) => file.startsWith(w))) return;
        console.log(`[ssg] ${path.relative(root, file)} changed, rebuilding`);
        renderSite(root);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", onChange);
      server.watcher.on("change", onChange);
      server.watcher.on("unlink", onChange);

      // serve _build/dist, with clean urls; fall through to Vite for
      // /@vite/client and static/ (publicDir)
      const out = path.join(root, OUT);
      server.middlewares.use((req, res, next) => {
        const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
        let file = path.join(out, urlPath);
        if (urlPath.endsWith("/")) file = path.join(file, "index.html");
        else if (fs.existsSync(file) && fs.statSync(file).isDirectory())
          file = path.join(file, "index.html");
        if (!fs.existsSync(file)) return next();

        const ext = path.extname(file);
        res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
        let content = fs.readFileSync(file);
        if (ext === ".html") {
          // inject the vite client for full-reload on rebuild
          content = content
            .toString()
            .replace("</head>", '<script type="module" src="/@vite/client"></script></head>');
        }
        res.end(content);
      });
    },
  };
}

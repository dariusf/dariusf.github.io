// markdown-it setup: prism syntax highlighting, graphviz fences, footnotes,
// heading anchor ids, latex math.

import { execSync } from "node:child_process";
import MarkdownIt from "markdown-it";
import footnote from "markdown-it-footnote";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import latexMath from "./latex-math.js";

// non-alphanumeric runs become dashes, like eleventy's slugify
// ("Z3's proofs" -> "z3-s-proofs")
export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const missingLanguages = new Set();

function highlight(code, lang) {
  if (!lang || missingLanguages.has(lang)) return "";
  try {
    if (!Prism.languages[lang]) {
      loadLanguages.silent = true;
      loadLanguages([lang]);
    }
    if (!Prism.languages[lang]) {
      missingLanguages.add(lang);
      return "";
    }
    return Prism.highlight(code, Prism.languages[lang], lang);
  } catch {
    missingLanguages.add(lang);
    return "";
  }
}

export function createMarkdown({ cacheDir }) {
  const md = new MarkdownIt({
    html: true,
    typographer: true,
    highlight,
  });

  md.use(footnote);
  md.use(latexMath, { cacheDir });

  // hide brackets around footnote references
  md.renderer.rules.footnote_caption = (tokens, idx) =>
    Number(tokens[idx].meta.id + 1).toString();

  // graphviz fences render to inline svg via dot; other fences with a
  // language get eleventy-syntaxhighlight-style markup (pre carries the
  // language class and tabindex even when prism has no grammar for it)
  const fence = md.renderer.rules.fence.bind(md.renderer.rules);
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const { content, info } = tokens[idx];
    const lang = info.trim();
    if (lang === "graphviz") {
      try {
        // drop dot's xml prolog, which is invalid mid-document
        const svg = execSync("dot -Tsvg", { input: content }).toString();
        return svg.replace(/<\?xml[^>]*\?>\s*/g, "");
      } catch (error) {
        return `<p style="border: 2px dashed red">Failed to render graphviz<span>${md.utils.escapeHtml(
          error.toString(),
        )}</span></p>`;
      }
    }
    if (lang) {
      // without a grammar, escape only & and < (not >), like prism; either
      // way exactly one trailing newline is dropped, as eleventy did
      const code = (
        highlight(content, lang) ||
        content.replace(/&/g, "&amp;").replace(/</g, "&lt;")
      ).replace(/\n$/, "");
      return `<pre class="language-${lang}" tabindex="0"><code class="language-${lang}">${code}</code></pre>\n`;
    }
    return fence(tokens, idx, options, env, slf);
  };

  // slugified ids on headings, so they are linkable
  md.core.ruler.push("heading_ids", (state) => {
    const seen = new Set();
    state.tokens.forEach((token, i) => {
      if (token.type !== "heading_open") return;
      let id = slugify(state.tokens[i + 1].content);
      let n = 1;
      while (seen.has(id)) id = `${id}-${++n}`;
      seen.add(id);
      token.attrSet("id", id);
    });
  });

  return md;
}

// LaTeX math for markdown-it: $...$ and $$...$$ are compiled with real LaTeX
// (latex + dvisvgm) into SVGs, emitted as <img> tags with baseline-correct
// vertical alignment. JS reimplementation of pandoc-latex-math's lua filter.
//
// SVGs are cached by content hash in _build/math-cache/ and copied to /math/
// in the output site.

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PREAMBLE = `
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage[T2A,T1]{fontenc}
\\usepackage[active,tightpage]{preview}
\\usepackage[charter,cal=cmcal]{mathdesign}
% \\class{name}{content} tagged DOM nodes under mathjax; reproduce that by
% wrapping the glyphs in an SVG <g class="name"> via dvisvgm raw specials, so
% per-subterm hover highlighting still works (see staged-logic)
\\providecommand{\\class}[2]{%
  \\special{dvisvgm:raw <g class="#1">}#2\\special{dvisvgm:raw </g>}}
`;

const FONT_SIZE = 12;

// dvisvgm needs ghostscript; mactex doesn't ship libgs, homebrew does
const LIBGS = "/opt/homebrew/lib/libgs.dylib";

function wrapFormula(formula, defs) {
  return `\\documentclass[${FONT_SIZE}pt]{article}
\\usepackage[utf8]{inputenc}
${PREAMBLE}
${defs ?? ""}
\\begin{document}
\\begin{preview}
${formula}
\\end{preview}
\\end{document}
`;
}

function getDepth(svgText) {
  const m = svgText.match(/depth=(\d*\.?\d*)/);
  return m ? Number(m[1]) : null;
}

function run(cmd, args, opts) {
  const res = spawnSync(cmd, args, { encoding: "utf8", ...opts });
  if (res.error) throw res.error;
  return res;
}

function getHeight(svgText) {
  const m = svgText.match(/<svg[^>]*height='([\d.]+)pt'/);
  return m ? Number(m[1]) : null;
}

// Compile a wrapped formula to an SVG in cacheDir, returning { file, depth,
// height } (both in pt). The dvisvgm-reported depth (distance the box extends
// below the baseline) is stored inside the SVG as a comment so cache hits
// don't need to recompile.
function renderLatex(formula, cacheDir, defs) {
  const doc = wrapFormula(formula, defs);
  const hash = createHash("sha1").update(doc).digest("hex");
  const file = `${hash}.svg`;
  const cached = path.join(cacheDir, file);

  if (fs.existsSync(cached)) {
    const svg = fs.readFileSync(cached, "utf8");
    return { file, svg, depth: getDepth(svg), height: getHeight(svg), compiled: false };
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "latexmath-"));
  try {
    fs.writeFileSync(path.join(tmp, "m.tex"), doc);
    const latex = run("latex", ["-interaction=nonstopmode", "m.tex"], { cwd: tmp });
    if (!fs.existsSync(path.join(tmp, "m.dvi")) || /^!/m.test(latex.stdout)) {
      throw new Error(`latex failed:\n${latex.stdout}`);
    }
    const dvisvgm = run("dvisvgm", ["--no-fonts", "-o", "m.svg", "m.dvi"], {
      cwd: tmp,
      env: { ...process.env, LIBGS },
    });
    if (!fs.existsSync(path.join(tmp, "m.svg"))) {
      throw new Error(`dvisvgm failed:\n${dvisvgm.stderr}`);
    }
    const depth = getDepth(dvisvgm.stderr + dvisvgm.stdout);
    let svg = fs.readFileSync(path.join(tmp, "m.svg"), "utf8");
    if (depth != null) svg += `<!-- depth=${depth}pt -->\n`;
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cached, svg);
    return { file, svg, depth, height: getHeight(svg), compiled: true };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Inline an SVG into the page so its <g class="..."> groups are reachable by
// CSS/JS. Drops the trailing depth comment, adds the theme class, and swaps the
// fixed pt width/height on the root <svg> for a CSS height in ex (the viewBox
// keeps the aspect ratio) so it scales like the <img> variant.
function inlineSvg(svg, heightEx) {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<svg\b([^>]*?)\s+width='[^']*'\s+height='[^']*'/,
      `<svg$1 class="theme-affected"${heightEx ? ` style="height:${heightEx}"` : ""}`,
    );
}

function renderToImg(formula, display, cacheDir, defs, page) {
  // The delimiter picks the wrapper: $...$ -> \(...\), $$...$$ -> \[...\]. Both
  // put you in math mode, so multi-line content inside $$ must use a *nestable*
  // environment (aligned, gathered, array, cases, ...), never a top-level
  // display environment (align, gather, ...) which refuses to nest. See README.
  const wrapped = display ? `\\[${formula}\\]` : `\\(${formula}\\)`;
  const where = page ? ` [${page}]` : "";
  let result;
  try {
    result = renderLatex(wrapped, cacheDir, defs);
  } catch (e) {
    console.error(`[latex-math] failed${where}: ${formula.slice(0, 60)}`);
    return `<span style="border: 2px dashed red">Failed to render math: ${escapeHtml(
      String(e),
    )}</span>`;
  }
  const { file, svg, depth, height, compiled } = result;
  // only a cache miss actually shells out to latex; log it so slow rebuilds are
  // explained (a warm cache prints nothing)
  if (compiled) console.log(`[latex-math] rendered${where}: ${formula.slice(0, 60)}`);
  // The SVG's pt dimensions are at LaTeX's 12pt font size, whose x-height is
  // ~5.45pt. Sizing in ex units ties the rendered size to the surrounding
  // font's x-height — the same scheme MathJax uses, so sizes match the old
  // site for both inline and display math.
  const PT_PER_EX = 5.45;
  const heightEx = height != null ? `${(height / PT_PER_EX).toFixed(3)}ex` : null;
  let style = "";
  if (heightEx) {
    style = `height:${heightEx};`;
    if (depth) style += ` vertical-align:${(-depth / PT_PER_EX).toFixed(3)}ex;`;
  }
  if (display) {
    // \class-tagged formulas (see PREAMBLE) carry <g class="..."> groups for
    // hover highlighting, which a page can only reach if the SVG is inlined —
    // an <img> is opaque. Everything else stays a cacheable <img>.
    const inner = /<g class=/.test(svg)
      ? inlineSvg(svg, heightEx)
      : `<img class="theme-affected" style="margin: auto;${
          heightEx ? ` height:${heightEx};` : ""
        }" src="/math/${file}" alt="${escapeHtml(formula)}">`;
    return `<div style="display: flex; align-items: center;">${inner}</div>`;
  }
  return `<img class="theme-affected" src="/math/${file}" alt="${escapeHtml(formula)}"${
    style ? ` style="${style}"` : ""
  }>`;
}

// Tokenizer rules adapted from markdown-it-simplemath / markdown-it-math.

function mathInline(state, silent) {
  if (state.src[state.pos] !== "$") return false;

  let start = state.pos + 1;
  // opening $ can't be followed by whitespace or a digit-adjacent closing
  const prev = state.src[state.pos - 1];
  if (prev === "\\" || prev === "$") return false;
  if (/\s/.test(state.src[start])) return false;

  let pos = start;
  let found = -1;
  while (pos < state.posMax) {
    if (state.src[pos] === "$" && state.src[pos - 1] !== "\\") {
      found = pos;
      break;
    }
    pos++;
  }
  if (found === -1 || found === start) return false;
  if (/\s/.test(state.src[found - 1])) return false;

  if (!silent) {
    const token = state.push("math_inline", "math", 0);
    token.content = state.src.slice(start, found);
    token.markup = "$";
  }
  state.pos = found + 1;
  return true;
}

function mathBlock(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.src.slice(pos, pos + 2) !== "$$") return false;
  if (silent) return true;

  pos += 2;
  let firstLine = state.src.slice(pos, max);
  let lastLine = "";
  let haveEndMarker = false;
  let nextLine = startLine;

  if (firstLine.trim().endsWith("$$")) {
    // single-line $$...$$
    firstLine = firstLine.trim().slice(0, -2);
    haveEndMarker = true;
  }

  while (!haveEndMarker) {
    nextLine++;
    if (nextLine >= endLine) break;
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    const line = state.src.slice(pos, max);
    if (line.trim().endsWith("$$")) {
      lastLine = line.trim().slice(0, -2);
      haveEndMarker = true;
    }
  }
  if (!haveEndMarker) return false;

  const token = state.push("math_block", "math", 0);
  token.block = true;
  token.content =
    (firstLine.trim() ? firstLine + "\n" : "") +
    state.getLines(startLine + 1, nextLine, state.tShift[startLine], true) +
    (lastLine.trim() ? lastLine : "");
  token.map = [startLine, nextLine + 1];
  token.markup = "$$";
  state.line = nextLine + 1;
  return true;
}

export default function latexMathPlugin(md, { cacheDir }) {
  md.inline.ruler.after("escape", "math_inline", mathInline);
  md.block.ruler.after("blockquote", "math_block", mathBlock, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });
  // per-page macros come from the page's mathDefs frontmatter, passed via
  // markdown-it's env
  md.renderer.rules.math_inline = (tokens, idx, options, env) =>
    renderToImg(tokens[idx].content, false, cacheDir, env?.mathDefs, env?.page);
  md.renderer.rules.math_block = (tokens, idx, options, env) =>
    renderToImg(tokens[idx].content, true, cacheDir, env?.mathDefs, env?.page);
}

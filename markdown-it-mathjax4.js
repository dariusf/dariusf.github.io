/* Process inline math */
/*
Like markdown-it-simplemath, this is a stripped down, simplified version of:
https://github.com/runarberg/markdown-it-math

It differs in that it takes (a subset of) LaTeX as input and relies on MathJax
for rendering output.
*/
// import type MarkdownIt from "markdown-it";

// import type Token from "markdown-it/lib/token";
// import type StateInline from "markdown-it/lib/rules_inline/state_inline";
// import type StateBlock from "markdown-it/lib/rules_block/state_block";

import { randomUUID } from "node:crypto";
// import { typeset } from "./mathjax4-sync.js";
import { typesetAsync } from "./mathjax4-async.js";

// import { mathjax } from "mathjax-full/js/mathjax.js";
// import { TeX } from "mathjax-full/js/input/tex.js";
// import { SVG } from "mathjax-full/js/output/svg.js";
// import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
// import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
// import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
// import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml.js"
// import juice from "juice/client";

// interface DocumentOptions {
//   InputJax: TeX<unknown, unknown, unknown>;
//   OutputJax: SVG<unknown, unknown, unknown>;
// }

// interface ConvertOptions {
//   display: boolean
// }

// function renderMath(content /*: string */, documentOptions /*: DocumentOptions */, convertOptions /*: ConvertOptions*/ ) /*: string*/ {
//   const adaptor = liteAdaptor();
//   const handler = RegisterHTMLHandler(adaptor);
//   AssistiveMmlHandler(handler);
//   const mathDocument = mathjax.document(content, documentOptions);
//   const html = adaptor.outerHTML(
//     mathDocument.convert(content, convertOptions)
//   );
//   const stylesheet = adaptor.outerHTML(documentOptions.OutputJax.styleSheet(mathDocument) as any)
//   return juice(html+stylesheet)
// }

// Test if potential opening or closing delimieter
// Assumes that there is a "$" at state.src[pos]
function isValidDelim(state /*: StateInline */, pos /*: number */) {
	let max = state.posMax,
		can_open = true,
		can_close = true;

	const prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1,
		nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1;

	// Check non-whitespace conditions for opening and closing, and
	// check that closing delimeter isn't followed by a number
	if (
		prevChar === 0x20 /* " " */ ||
		prevChar === 0x09 /* \t */ ||
		(nextChar >= 0x30 /* "0" */ && nextChar <= 0x39) /* "9" */
	) {
		can_close = false;
	}
	if (nextChar === 0x20 /* " " */ || nextChar === 0x09 /* \t */) {
		can_open = false;
	}

	return {
		can_open: can_open,
		can_close: can_close,
	};
}

function math_inline(on_parse) {
	return function (state /*: StateInline */, silent /*: boolean*/) {
		if (state.src[state.pos] !== "$") {
			return false;
		}

		let res = isValidDelim(state, state.pos);
		if (!res.can_open) {
			if (!silent) {
				state.pending += "$";
			}
			state.pos += 1;
			return true;
		}

		// First check for and bypass all properly escaped delimieters
		// This loop will assume that the first leading backtick can not
		// be the first character in state.src, which is known since
		// we have found an opening delimieter already.
		const start = state.pos + 1;
		let match = start;
		while ((match = state.src.indexOf("$", match)) !== -1) {
			// Found potential $, look for escapes, pos will point to
			// first non escape when complete
			let pos = match - 1;
			while (state.src[pos] === "\\") {
				pos -= 1;
			}

			// Even number of escapes, potential closing delimiter found
			if ((match - pos) % 2 == 1) {
				break;
			}
			match += 1;
		}

		// No closing delimter found.  Consume $ and continue.
		if (match === -1) {
			if (!silent) {
				state.pending += "$";
			}
			state.pos = start;
			return true;
		}

		// Check if we have empty content, ie: $$.  Do not parse.
		if (match - start === 0) {
			if (!silent) {
				state.pending += "$$";
			}
			state.pos = start + 1;
			return true;
		}

		// Check for valid closing delimiter
		res = isValidDelim(state, match);
		if (!res.can_close) {
			if (!silent) {
				state.pending += "$";
			}
			state.pos = start;
			return true;
		}

		if (!silent) {
			const token = state.push("math_inline", "math", 0);
			token.markup = "$";
			const content = state.src.slice(start, match);
			token.content = on_parse(content, false);
		}

		state.pos = match + 1;
		return true;
	};
}

function math_block(on_parse) {
	return function (
		state /* : StateBlock */,
		start /* : number */,
		end /* : number */,
		silent /* : boolean */
	) {
		let next /*: number */, lastPos /*: number */;
		let found = false,
			pos = state.bMarks[start] + state.tShift[start],
			max = state.eMarks[start],
			lastLine = "";

		if (pos + 2 > max) {
			return false;
		}
		if (state.src.slice(pos, pos + 2) !== "$$") {
			return false;
		}

		pos += 2;
		let firstLine = state.src.slice(pos, max);

		if (silent) {
			return true;
		}
		if (firstLine.trim().slice(-2) === "$$") {
			// Single line expression
			firstLine = firstLine.trim().slice(0, -2);
			found = true;
		}

		for (next = start; !found; ) {
			next++;

			if (next >= end) {
				break;
			}

			pos = state.bMarks[next] + state.tShift[next];
			max = state.eMarks[next];

			if (pos < max && state.tShift[next] < state.blkIndent) {
				// non-empty line with negative indent should stop the list:
				break;
			}

			if (state.src.slice(pos, max).trim().slice(-2) === "$$") {
				lastPos = state.src.slice(0, max).lastIndexOf("$$");
				lastLine = state.src.slice(pos, lastPos);
				found = true;
			}
		}

		state.line = next + 1;

		const token = state.push("math_block", "math", 0);
		token.block = true;

		const content =
			(firstLine && firstLine.trim() ? firstLine + "\n" : "") +
			state.getLines(start + 1, next, state.tShift[start], true) +
			(lastLine && lastLine.trim() ? lastLine : "");

		token.content = on_parse(content, true);
		token.map = [start, state.line];
		token.markup = "$$";
		return true;
	};
}

const mathjaxRendered = new Map();

async function awaitAll() {
	for (const k of mathjaxRendered.keys()) {
		mathjaxRendered.set(k, await mathjaxRendered.get(k));
	}
}

function startRenderingDocument() {
	mathjaxRendered.clear();
}

function plugin(md /*: MarkdownIt */, options /*: any */) {
	// Default options

	// const documentOptions = {
	//   InputJax: new TeX({ packages: AllPackages,  ...options?.tex }),
	//   OutputJax: new SVG({ fontCache: 'none',  ...options?.svg })
	// }
	// const convertOptions = {
	//   display: false
	// }

	function on_parse(txt, display) {
		// could a symbol be used here? wouldn't be well-typed but possible
		const key = "mathjaxrender" + randomUUID();
		mathjaxRendered.set(key, typesetAsync(txt, display));
		return key;
	}

	// parse rules
	md.inline.ruler.after("escape", "math_inline", math_inline(on_parse));
	md.block.ruler.after("blockquote", "math_block", math_block(on_parse), {
		alt: ["paragraph", "reference", "blockquote", "list"],
	});

	// renderer rules
	md.renderer.rules.math_inline = function (
		tokens /*: Token[] */,
		idx /*: number */
	) {
		const uuid = tokens[idx].content;
		return mathjaxRendered.get(uuid);
	};
	md.renderer.rules.math_block = function (
		tokens /*: Token[] */,
		idx /*: number */
	) {
		const uuid = tokens[idx].content;
		return mathjaxRendered.get(uuid);
	};
}

async function renderEffectOnly(defs) {
	await typesetAsync(defs);
}

export default { plugin, awaitAll, startRenderingDocument, renderEffectOnly };

// https://github.com/mathjax/MathJax-demos-node/blob/master/direct/tex2svg-page
// https://github.com/mathjax/MathJax/issues/3303

import { readFileSync } from "node:fs";

import { AssistiveMmlHandler } from "mathjax-full/js/a11y/assistive-mml.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
// import { CHTML } from "mathjax-full/js/output/chtml.js";
import { SVG } from "mathjax-full/js/output/svg.js";
// import { MathJaxScholaFont } from "mathjax-schola-font/mjs/chtml.js";

import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
// console.log(AllPackages);
// require("mathjax-full/js/util/entities/all.js");

function renderMathJax(htmlPageText) {
	const adaptor = liteAdaptor();
	const handler = RegisterHTMLHandler(adaptor);
	const tex = new TeX({ packages: AllPackages, inlineMath: [["$", "$"]] });
	// const chtml = new CHTML({
	//   fontData: MathJaxScholaFont,
	//   //fontPath: './node_modules/%%FONT%%-font/es5/output/fonts/%%FONT%%',
	//   fontPath: "./fonts/mathjax-schola",
	//   exFactor: 0.5,
	// });
	// const html = mathjax.document(INPUT, { InputJax: tex, OutputJax: chtml });
	const svg = new SVG({ fontCache: "global" });
	// const INPUT = readFileSync("a.html", "utf8");
	const INPUT = htmlPageText;
	const html = mathjax.document(INPUT, { InputJax: tex, OutputJax: svg });

	html.render();

	// remove svg if no css
	if (Array.from(html.math).length === 0) {
		adaptor.remove(html.outputJax.svgStyles);
		const cache = adaptor.elementById(
			adaptor.body(html.document),
			"MJX-SVG-global-cache"
		);
		if (cache) adaptor.remove(cache);
	}

	const a = adaptor.doctype(html.document);
	const b = adaptor.outerHTML(adaptor.root(html.document));
	// console.log(a);
	// console.log(b);
	return a + "\n" + b;
}

export default function mathjaxPlugin(eleventyConfig, options = {}) {
	eleventyConfig.addTransform("mathjax", function (content, outputPath) {
		const isBlogPost =
			outputPath &&
			outputPath.endsWith(".html") &&
			(outputPath.includes("/blog/") || outputPath.includes("/drafts/"));

		if (!isBlogPost) {
			return content;
		}
		// console.log(outputPath);

		// const html = mathjax.document(content, { InputJax, OutputJax });
		// html.render();

		// cleanOutput(html, adaptor, options);

		// return (
		//   adaptor.doctype(html.document) +
		//   "\n" +
		//   adaptor.outerHTML(adaptor.root(html.document)) +
		//   "\n"
		// );
		return renderMathJax(content);
	});
}

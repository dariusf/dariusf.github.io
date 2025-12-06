// https://docs.mathjax.org/en/latest/server/components.html

import { adjustOutput } from "./mathjax4-sync.js";

global.MathJax = {
	loader: {
		paths: { mathjax: "@mathjax/src/bundle" },
		load: ["input/tex", "output/svg", "adaptors/liteDOM"],
		require: (file) => import(file),
		tex: {
			packages: { "[+]": ["ams", "newcommand", "color", "html"] },
		},
	},
	output: { font: "mathjax-stix2" },
};
await import("@mathjax/src/bundle/startup.js");
await MathJax.startup.promise;

const EM = 16; // size of an em in pixels
const EX = 8; // size of an ex in pixels
const WIDTH = 80 * EM; // width of container for linebreaking

function typeset(math, display = true) {
	return MathJax.tex2svgPromise(math, {
		display: display,
		em: EM,
		ex: EX,
		containerWidth: WIDTH,
	})
		.then((node) => {
			const adaptor = MathJax.startup.adaptor;
			const rendered = adaptor.outerHTML(node);
			return adjustOutput(rendered, display);
		})
		.catch((err) => console.error(err));
}

// there doesn't seem to be a good time to call this with eleventy
function done() {
	// shut down worker threads
	// https://docs.mathjax.org/en/latest/upgrading/whats-new-4.0/explorer.html#technical-details
	// https://docs.mathjax.org/en/latest/server/components.html#configuring-mathjax-for-use-with-import
	MathJax.done();
}

export { typeset };

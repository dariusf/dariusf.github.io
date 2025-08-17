// import MathJax from "@mathjax/src";
// await MathJax.init({
// 	loader: { load: ["input/tex"] },
// 	output: {
// 		font: "mathjax-stix2",
// 	},
// });
// const mml = await MathJax.tex2svgPromise("x+y");
// console.log(mml);

// https://docs.mathjax.org/en/latest/server/components.html

global.MathJax = {
	loader: {
		paths: { mathjax: "@mathjax/src/bundle" },
		load: ["input/tex", "output/svg", "adaptors/liteDOM"],
		require: (file) => import(file),
	},
	output: { font: "mathjax-newcm" },
};
await import("@mathjax/src/bundle/startup.js");
await MathJax.startup.promise;

// const mml = await MathJax.tex2svgPromise("x+y");
// console.log(mml);

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
			return adaptor.serializeXML(adaptor.tags(node, "svg")[0]);
		})
		.catch((err) => console.error(err));
}

// const mml = await typeset("x+y");
// console.log(mml);

// import { MathJaxStix2Font } from "@mathjax/mathjax-stix2-font/js/chtml.js";
// import { CHTML } from "@mathjax/src/js/output/chtml.js";

// const chtml = new CHTML({ fontData: MathJaxStix2Font });

export { typeset };

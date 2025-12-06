// https://docs.mathjax.org/en/latest/server/preload.html
import { MathJax } from "@mathjax/src/js/components/global.js";
import { insert } from "@mathjax/src/js/util/Options.js";
import "@mathjax/src/js/components/startup.js";
import "@mathjax/src/components/js/core/core.js";
import "@mathjax/src/components/js/adaptors/liteDOM/liteDOM.js";

import "@mathjax/src/components/js/input/tex-base/tex-base.js";
import "@mathjax/src/components/js/input/tex/extensions/ams/ams.js";
import "@mathjax/src/components/js/input/tex/extensions/newcommand/newcommand.js";
import "@mathjax/src/components/js/input/tex/extensions/color/color.js";
import "@mathjax/src/components/js/input/tex/extensions/html/html.js";

// Load the font to use, and any dynamic font files

// import { MathJaxNewcmFont } from "@mathjax/mathjax-newcm-font/js/svg.js";
// import "@mathjax/mathjax-newcm-font/js/svg/dynamic/calligraphic.js";
// const fontData = MathJaxNewcmFont;

// import { MathJaxAsanaFont } from "@mathjax/mathjax-asana-font/js/svg.js";
// import "@mathjax/mathjax-asana-font/js/svg/dynamic/calligraphic.js";
// const fontData = MathJaxAsanaFont;

// import { MathJaxModernFont } from "@mathjax/mathjax-modern-font/js/svg.js";
// import "@mathjax/mathjax-modern-font/js/svg/dynamic/calligraphic.js";
// const fontData = MathJaxModernFont;

import { MathJaxStix2Font } from "@mathjax/mathjax-stix2-font/js/svg.js";
import "@mathjax/mathjax-stix2-font/js/svg/dynamic/calligraphic.js";
const fontData = MathJaxStix2Font;

// import { MathJaxFiraFont } from "@mathjax/mathjax-fira-font/js/svg.js";
// import "@mathjax/mathjax-fira-font/js/svg/dynamic/calligraphic.js";
// const fontData = MathJaxFiraFont;

// ... load any additional ones here, and add them to the array below.
const fontPreloads = ["calligraphic"];

// import "@mathjax/src/components/js/output/chtml/chtml.js";
import "@mathjax/src/components/js/output/svg/svg.js";
insert(
	MathJax.config,
	{
		tex: {
			packages: { "[+]": ["ams", "newcommand", "color", "html"] },
		},
		// chtml: {
		svg: {
			fontData,
		},
	},
	false
);

MathJax.config.startup.ready();

//
// Activate the dynamic font files
//
const font = MathJax.startup.document.outputJax.font;
const dynamic = fontData.dynamicFiles;
fontPreloads.forEach((name) => dynamic[name].setup(font));

function adjustOutput(rendered, display) {
	// console.log(adjustOutput, rendered, display);
	try {
		if (rendered.includes("data-mjx-error=")) {
			throw rendered;
		}
		if (display) {
			return `<div style="display: flex; align-items: center;">${rendered}</div>`;
		} else {
			return rendered;
		}
		// return adaptor.outerHTML(MathJax.tex2chtml(math));
	} catch (e) {
		// if (display) {
		// 	return `<div style="color: red; border: solid red 1px;">Rendering error due to ${e.toString()}</div>`;
		// } else {
		return `<span style="color: red; border: solid red 1px;">Rendering error due to ${e.toString()}</span>`;
		// }
	}
}

function typeset(math, display) {
	const adaptor = MathJax.startup.adaptor;
	const rendered = adaptor.outerHTML(MathJax.tex2svg(math, { display }));
	return adjustOutput(rendered, display);
}

// console.log(typeset(`a\\ b`));
export { typeset, adjustOutput };

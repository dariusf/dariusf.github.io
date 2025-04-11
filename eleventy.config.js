import {
	IdAttributePlugin,
	InputPathToUrlTransformPlugin,
	HtmlBasePlugin,
} from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

import pluginFilters from "./_config/filters.js";
// import mathjaxPlugin from "./mathjax.js";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMathjax from "markdown-it-mathjax3";
// import markdownIt from "markdown-it";
import { execSync } from "child_process";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Drafts, see also _data/eleventyDataSchema.js
	eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
		if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
			return false;
		}
	});

	// Copy the contents of the `static` folder to the output folder
	// For example, `./static/css/` ends up in `_build/css/`
	eleventyConfig
		.addPassthroughCopy({
			"./static/": "/",
		})
		.addPassthroughCopy("./content/feed/pretty-atom-feed.xsl")
		.addPassthroughCopy("./content/blog/**/*.js")
		.addPassthroughCopy("./content/blog/**/*.css")
		.addPassthroughCopy("./content/drafts/**/*.js")
		.addPassthroughCopy("./content/drafts/**/*.css");

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Adds the {% css %} paired shortcode
	eleventyConfig.addBundle("css", {
		toFileDirectory: "dist",
	});
	// Adds the {% js %} paired shortcode
	eleventyConfig.addBundle("js", {
		toFileDirectory: "dist",
	});

	// eleventyConfig.addPlugin(mathjaxPlugin);

	// Official plugins
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		// templateData: {
		// 	eleventyNavigation: {
		// 		key: "Feed",
		// 		order: 4,
		// 	},
		// },
		collection: {
			name: "posts",
			limit: 10,
		},
		metadata: {
			language: "en",
			title: "Darius Foo",
			subtitle: "PhD student, programming languages and formal verification",
			base: "https://dariusf.github.io/",
			author: {
				name: "Darius Foo",
			},
		},
	});

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// Output formats for each image.
		formats: ["avif", "webp", "auto"],

		// widths: ["auto"],

		failOnError: false,
		htmlOptions: {
			imgAttributes: {
				// e.g. <img loading decoding> assigned on the HTML tag will override these values.
				loading: "lazy",
				decoding: "async",
			},
		},

		sharpOptions: {
			animated: true,
		},
	});

	// Filters
	eleventyConfig.addPlugin(pluginFilters);

	eleventyConfig.addPlugin(IdAttributePlugin, {
		// by default we use Eleventy’s built-in `slugify` filter:
		// slugify: eleventyConfig.getFilter("slugify"),
		// selector: "h1,h2,h3,h4,h5,h6", // default
	});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return new Date().toISOString();
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	// add markdown footnotes
	// https://github.com/11ty/eleventy-base-blog/issues/167
	eleventyConfig.amendLibrary("md", (mdLib) => {
		// const md = markdownIt({
		// 	html: true,
		// 	linkify: true,
		// });
		mdLib.use(markdownItFootnote);
		mdLib.use(markdownItMathjax);

		// console.log(mdLib.renderer.rules);
		renderGraphviz(mdLib);

		function renderGraphviz(md) {
			const temp = md.renderer.rules.fence.bind(md.renderer.rules);
			// https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
			// https://github.com/aiyoudiao/markdown-it-graphviz/blob/master/index.js
			md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
				try {
					const { content, info } = tokens[idx];
					if (info === "graphviz") {
						return execSync(`dot -Tsvg`, { input: content }).toString();
					}
				} catch (error) {
					return `<p style="border: 2px dashed red">Failed to render graphviz<span>${md.utils.escapeHtml(
						error.toString()
					)}</span></p>`;
				}
				return temp(tokens, idx, options, env, slf);
			};
		}

		// hides brackets for footnotes
		mdLib.renderer.rules.footnote_caption = (tokens, idx) => {
			let n = Number(tokens[idx].meta.id + 1).toString();

			if (tokens[idx].meta.subId > 0) {
				n += ":" + tokens[idx].meta.subId;
			}
			return n;
		};
	});
}

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "content", // default: "."
		includes: "../_includes", // default: "_includes" (`input` relative)
		data: "../_data", // default: "_data" (`input` relative)
		output: "_build",
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	// pathPrefix: "/",
};

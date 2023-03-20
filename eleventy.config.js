const { DateTime, Duration } = require("luxon");
const { URL } = require("url");

const metadata = require("./_data/metadata.json");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { PurgeCSS } = require("purgecss");
const purgeCssFromHtml = require("purgecss-from-html");
const htmlmin = require("html-minifier");
const { minify } = require("terser");
const readingTime = require('eleventy-plugin-reading-time');
const embedEverything = require("eleventy-plugin-embed-everything");

const { srcset, src } = require("./_11ty/images");
const pluginPostCSS = require("./_11ty/postcssPlugin.js");

const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
	eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
	eleventyConfig.addWatchTarget("assets/**/*.css");

	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.setDataDeepMerge(true);
	// eleventyConfig.setQuietMode(true);

	/* Template Formats */
	eleventyConfig.addTemplateFormats("css");

	/* Plugins */
	eleventyConfig.addPlugin(pluginPostCSS);
	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	eleventyConfig.addPlugin(readingTime);
	eleventyConfig.addPlugin(embedEverything);
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	/* Shortcodes */
	eleventyConfig.addShortcode("src", src); // Cloudinary src
	eleventyConfig.addShortcode("srcset", srcset); // Cloudinary srcset
	eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`); // Simple Year
	eleventyConfig.addShortcode("youtube", (videoURL, title) => {
		const url = new URL(videoURL);
		const id = url.searchParams.get("v");
		return `<iframe class="yt-embed" src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video player${
			title ? ` for ${title}` : ""
		}" frameborder="0" allowfullscreen></iframe>`;
	}); // YouTube Embed

	/*  These */
	// Don't process files and folders with static assets e.g. images
	eleventyConfig
		.addPassthroughCopy("control")
		.addPassthroughCopy("assets/appendix-b")
		.addPassthroughCopy("assets/css/bravery.css")
		.addPassthroughCopy("assets/css/cc.css")
		.addPassthroughCopy("assets/css/critical.css")
		.addPassthroughCopy("assets/icons")
		.addPassthroughCopy("assets/img")
		.addPassthroughCopy("assets/uploads")
		.addPassthroughCopy("manifest.json")
		.addPassthroughCopy("site.webmanifest")
		.addPassthroughCopy("browserconfig.xml")
		.addPassthroughCopy("robots.txt");

	/* Layouts */
	eleventyConfig.addLayoutAlias("article", "layouts/article.njk");
	eleventyConfig.addLayoutAlias("episode", "layouts/episode.njk");

	/* Filters */
	eleventyConfig.addFilter("absoluteUrl", (url, base) => {
		if (!base) {
			base = siteData.url;
		}
		try {
			return new URL(url, base).toString();
		} catch (e) {
			console.log(
				`Trying to convert ${url} to be an absolute url with base ${base} and failed.`
			);
			return url;
		}
	});
	// Date formatting (human readable)
	eleventyConfig.addFilter("readableDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj, { zone: "local" }).toFormat(
			"LLL dd, yyyy"
		);
	});

	// Date formatting (machine readable)
	eleventyConfig.addFilter("machineDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
	});

	// Date formatting (RSS)
	eleventyConfig.addFilter("podPublishDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj).toFormat("ccc, d LLL yyyy TTT");
	});

	// Copyright announcement
	eleventyConfig.addFilter("copyright", (dateObj) => {
		return DateTime.fromJSDate(dateObj).toFormat("yyyy");
	});

	// Cloudinary presets
	eleventyConfig.addFilter("coverTall", (cover) => {
		const cloudinaryRoot =
			"https://res.cloudinary.com/bravery/image/upload/t_cover_tall_new/";
		return cloudinaryRoot + cover;
	});

	eleventyConfig.addFilter("cover", (cover) => {
		const cloudinaryRoot =
			"https://res.cloudinary.com/bravery/image/upload/ar_68:45,f_auto,q_80,w_340,h_225,dpr_2.0/";
		return cloudinaryRoot + cover;
	});

	eleventyConfig.addFilter("coverSquare", (cover) => {
		const cloudinaryRoot =
			"https://res.cloudinary.com/bravery/image/upload/ar_1:1,f_auto,q_80,w_500,h_500,dpr_2.0/";
		return cloudinaryRoot + cover;
	});

	eleventyConfig.addFilter("toMinutes", (epDuration) => {
		return Duration.fromObject({ seconds: epDuration }).toFormat("mm:ss");
	});

	eleventyConfig.addFilter("typography", (content) => {
		content = content.replace(/"(?=\w|$)/g, "&#8220;");
		content = content.replace(/(?<=\w|^)"/g, "&#8221;");
		content = content.replace(/'(?=\w|$)/g, "&#8217;");
		content = content.replace(/(?<=\w|^)'/g, "&#8216;");

		return content;
	}); // smart quotes outside of markdown

	// Set Podcast URL for tracking
	eleventyConfig.addFilter("chartable", (audioURL) => {
		let chartable = "https://chrt.fm/track/" + metadata.podcast.chartable + "/";

		return chartable + audioURL;
	});

	// Minify JS
	eleventyConfig.addNunjucksAsyncFilter(
		"jsmin",
		async function (code, callback) {
			try {
				const minified = await minify(code);
				callback(null, minified.code);
			} catch (err) {
				console.error("Terser error: ", err);
				// Fail gracefully.
				callback(null, code);
			}
		}
	);

	eleventyConfig.addNunjucksAsyncFilter("postcss", function (content, done) {
		postcss([
			atImport,
			postcssNesting(),
			postcssNestedCalc(),
			autoprefixer,
			cssnano,
		])
			.process(content)
			.then(
				(r) => done(null, r.css),
				(e) => done(e, null)
			);
	});

	/* Collections */
	// only content in the `articles/` directory
	eleventyConfig.addCollection("articles", function (collection) {
		return collection.getAllSorted().filter(function (item) {
			return item.inputPath.match(/^\.\/articles\//) !== null;
		});
	});

	// only content in the `articles/` directory
	eleventyConfig.addCollection("episodes", function (collection) {
		return collection.getAllSorted().filter(function (item) {
			return item.inputPath.match(/^\.\/episodes\//) !== null;
		});
	});

	// only content in the `jobs/` directory
	eleventyConfig.addCollection("jobs", function (collection) {
		return collection.getAllSorted().filter(function (item) {
			return item.inputPath.match(/^\.\/jobs\//) !== null;
		});
	});

	/* Markdown Plugins */
	let markdownIt = require("markdown-it");
	let markdownItContainer = require("markdown-it-container");

	let options = {
		html: true,
		breaks: true,
		linkify: true,
		typographer: true,
	};

	let md = markdownIt(options).use(markdownItContainer, "callout");

	eleventyConfig.setLibrary("md", md);

	eleventyConfig.addFilter("markdown", (content) => {
		return md.render(content);
	});

	let opts = {
		permalink: true,
		permalinkClass: "direct-link",
		permalinkSymbol: "#",
	};

	/**
	 * Remove any CSS not used on the page and inline the remaining CSS in the
	 * <head>.
	 *
	 * @see {@link https://github.com/FullHuman/purgecss}
	 */
	eleventyConfig.addTransform("purge-and-inline-css", async function (content) {
		if (!this.outputPath.endsWith(".html")) {
			return content;
		}
		// this is HTML!
		const purgeCssResult = await new PurgeCSS().purge({
			content: [{ raw: content, extension: "html" }],
			css: ["_site/assets/css/bravery.css"],
			extractors: [
				{
					extractor: purgeCssFromHtml,
					extensions: ["html"],
				},
			],
			dynamicAttributes: ["aria-selected", "value"],
			keyframes: true,
		});
		console.log(purgeCssResult[0].css);
		return content.replace(
			"<!-- STYLES -->",
			`<style>${purgeCssResult[0].css}</style>`
		);
	});

	// eleventyConfig.addTransform("htmlmin", function (content) {
	// 	if (this.outputPath.endsWith(".html")) {
	// 		let minified = htmlmin.minify(content, {
	// 			useShortDoctype: true,
	// 			removeComments: true,
	// 			collapseWhitespace: true,
	// 		});
	// 		return minified;
	// 	}

	// 	return content;
	// });

	return {
		templateFormats: ["md", "njk", "html"],
		pathPrefix: "/",
		markdownTemplateEngine: "liquid",
		htmlTemplateEngine: "njk",
		dataTemplateEngine: "njk",
		passthroughFileCopy: true,
		dir: {
			input: ".",
			includes: "_includes",
			data: "_data",
			output: "_site",
		},
	};
};
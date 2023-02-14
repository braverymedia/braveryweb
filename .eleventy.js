const { DateTime } = require("luxon");
const { minify } = require("terser");
const { PurgeCSS } = require('purgecss');
const { srcset, src } = require("./_11ty/images");
const CleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const readingTime = require('eleventy-plugin-reading-time');
const embedEverything = require("eleventy-plugin-embed-everything");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
	eleventyConfig.addLayoutAlias("article", "layouts/article.njk");
	eleventyConfig.addLayoutAlias("episode", "layouts/episode.njk");
	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	eleventyConfig.addPlugin(readingTime);
	eleventyConfig.addPlugin(embedEverything);
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	eleventyConfig.addShortcode("src", src);
	eleventyConfig.addShortcode("srcset", srcset);

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

	// Simple year shortcode
	eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

	eleventyConfig.addShortcode("youtube", (videoURL, title) => {
		const url = new URL(videoURL);
		const id = url.searchParams.get("v");
		return `<iframe class="yt-embed" src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video player${
			title ? ` for ${title}` : ""
		}" frameborder="0" allowfullscreen></iframe>`;
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

	eleventyConfig.addFilter("duration", (epDuration) => {
		let duration = epDuration.replace(":", "m ");
		return duration + "s";
	});

	eleventyConfig.addFilter("typography", (content) => {
		content = content.replace(/"(?=\w|$)/g, "&#8220;");
		content = content.replace(/(?<=\w|^)"/g, "&#8221;");
		content = content.replace(/'(?=\w|$)/g, "&#8217;");
		content = content.replace(/(?<=\w|^)'/g, "&#8216;");

		return content;
	});

	// Set Podcast URL for tracking
	eleventyConfig.addFilter("chartableURL", (audioURL) => {
		let chartable = "https://chtbl.com/track/" + metadata.chartable + "/";

		return audioURL.replace("https://", chartable);
	});

	// Minify CSS
	eleventyConfig.addFilter("cssmin", (code) => {
		return new CleanCSS({}).minify(code).styles;
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

	/**
	 * Remove any CSS not used on the page and inline the remaining CSS in the
	 * <head>.
	 *
	 * @see {@link https://github.com/FullHuman/purgecss}
	 */
	eleventyConfig.addTransform("purge-and-inline-css", async function (content) {
		if (
			process.env.ELEVENTY_ENV !== "production" ||
			!this.outputPath.endsWith(".html")
		) {
			return content;
		}

		const purgeCSSResults = await new PurgeCSS().purge({
			content: [{ raw: content }],
			css: ["_includes/assets/css/bravery.css"],
			keyframes: true,
		});

		return content.replace(
			"<!-- INLINE CSS-->",
			"<style>" + purgeCSSResults[0].css + "</style>"
		);
	});

	eleventyConfig.addTransform("htmlmin", function (content) {
		if (this.outputPath.endsWith(".html")) {
			let minified = htmlmin.minify(content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: true,
			});
			return minified;
		}

		return content;
	});

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

	eleventyConfig.setServerOptions({
		// Default values are shown:

		// Whether the live reload snippet is used
		liveReload: true,

		// Whether DOM diffing updates are applied where possible instead of page reloads
		domDiff: true,

		// The starting port number
		// Will increment up to (configurable) 10 times if a port is already in use.
		port: 8080,

		// Additional files to watch that will trigger server updates
		// Accepts an Array of file paths or globs (passed to `chokidar.watch`).
		// Works great with a separate bundler writing files to your output folder.
		// e.g. `watch: ["_site/**/*.css"]`
		watch: ["_site/**/*.css"],

		// Show local network IP addresses for device testing
		showAllHosts: false,

		// Use a local key/certificate to opt-in to local HTTP/2 with https
		https: {
			// key: "./localhost.key",
			// cert: "./localhost.cert",
		},

		// Change the default file encoding for reading/serving files
		encoding: "utf-8",
	});

	// Sass
	eleventyConfig.addWatchTarget("_includes/assets/scss");

	// Don't process files and folders with static assets e.g. images
	eleventyConfig.addPassthroughCopy("control");
	eleventyConfig.addPassthroughCopy({
		"_includes/assets/uploads": "assets/uploads",
	});
	eleventyConfig.addPassthroughCopy({
		"_includes/assets/appendix-b": "assets/appendix-b",
	});
	eleventyConfig.addPassthroughCopy({ "_includes/assets/css": "assets/css" });
	eleventyConfig.addPassthroughCopy({
		"_includes/assets/icons": "assets/icons",
	});
	eleventyConfig.addPassthroughCopy({ "_includes/assets/img": "assets/img" });
	eleventyConfig.addPassthroughCopy({ "_includes/assets/js": "assets/js" });
	eleventyConfig.addPassthroughCopy("manifest.json");
	eleventyConfig.addPassthroughCopy("site.webmanifest");
	eleventyConfig.addPassthroughCopy("browserconfig.xml");
	eleventyConfig.addPassthroughCopy("robots.txt");
	eleventyConfig.addPassthroughCopy("sw.js");

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
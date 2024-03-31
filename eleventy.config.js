const fs = require("node:fs");
const path = require("node:path");
const { DateTime, Duration } = require("luxon");
const { URL } = require("url");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItFigures = require("markdown-it-image-figures");
const markdownItContainer = require("markdown-it-container");
const { encode } = require("html-entities");
const htmlmin = require("html-minifier");
const { PurgeCSS } = require("purgecss");

const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const readingTime = require("eleventy-plugin-reading-time");
const embedEverything = require("eleventy-plugin-embed-everything");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pkg = require("./package.json");
const metadata = require("./src/_data/metadata.json");

const { srcset, src } = require("./_11ty/images");
const processSass = require("./_11ty/sass.js");
const processJs = require("./_11ty/process-js.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.setDataDeepMerge(true);
	eleventyConfig.setQuietMode(true);

	eleventyConfig.setServerOptions({
		domdiff: false,
		showVersion: false,
	});
	eleventyConfig.addWatchTarget("./assets/js/");

	/* Plugins */
	eleventyConfig.addPlugin(processSass);
	eleventyConfig.addPlugin(processJs);
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	eleventyConfig.addPlugin(readingTime);
	eleventyConfig.addPlugin(embedEverything);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	// Copy these
	eleventyConfig
		.addPassthroughCopy({
			"src/assets/uploads": "assets/uploads",
			"src/assets/appendix-b": "assets/appendix-b",
			"src/assets/scss/bravery.css": "assets/css",
			"src/assets/js/bravery.js": "assets/js/bravery.js",
			"src/assets/icons": "assets/icons",
			"src/assets/img": "assets/img",
		})
		.addPassthroughCopy("manifest.json")
		.addPassthroughCopy("site.webmanifest")
		.addPassthroughCopy("browserconfig.xml")
		.addPassthroughCopy("robots.txt");

	eleventyConfig.addLayoutAlias("article", "layouts/article.njk");
	eleventyConfig.addLayoutAlias("episode", "layouts/episode.njk");
	eleventyConfig.addLayoutAlias("issue", "layouts/issue.njk");
	eleventyConfig.addLayoutAlias("case-study", "layouts/case-study.njk");

	eleventyConfig.addShortcode("src", src);
	eleventyConfig.addShortcode("srcset", srcset);

	// Absolute URL
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
	eleventyConfig.addFilter("format", (str) => {
		return new Function("with (this) { return `" + str + "` }").call(context);
	});

	// Time and Date
	eleventyConfig.addLiquidFilter(
		"timePosted",
		(startDate, endDate = Date.now()) => {
			if (typeof startDate === "string") {
				startDate = Date.parse(startDate);
			}
			if (typeof endDate === "string") {
				endDate = Date.parse(endDate);
			}
			let numDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
			let prefix = "";
			if (numDays < 0) {
				prefix = "in ";
				numDays = Math.abs(numDays);
			}

			let daysPosted = Math.round(parseFloat(numDays));
			let yearsPosted = parseFloat((numDays / 365).toFixed(1));

			if (daysPosted < 365) {
				return prefix + daysPosted + " day" + (daysPosted !== 1 ? "s" : "");
			} else {
				return prefix + yearsPosted + " year" + (yearsPosted !== 1 ? "s" : "");
			}
		}
	);

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

	eleventyConfig.addFilter( "noFeatures",
		function (collection = [], frontMatterItem = "") {
			if (!frontMatterItem) {
				return collection;
			}
			return collection.filter((item) => !item.data[frontMatterItem]);
		}
	);

	// Simple year shortcode
	eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

	eleventyConfig.addFilter("toMinutes", (epDuration) => {
		return Duration.fromObject({ seconds: epDuration }).toFormat("mm:ss");
	});

	// Strip https
	eleventyConfig.addFilter("noProtocol", (url) => {
		if (url.startsWith("https://")) {
			return url.substring("https://".length);
		}
		return url;
	});

	// Typography
	eleventyConfig.addFilter("typography", (content) => {
		content = content.replace(/"(?=\w|$)/g, "&#8220;");
		content = content.replace(/(?<=\w|^)"/g, "&#8221;");
		content = content.replace(/'(?=\w|$)/g, "&#8217;");
		content = content.replace(/(?<=\w|^)'/g, "&#8216;");

		return content;
	});

	// Set Podcast URL for tracking
	eleventyConfig.addFilter("chartable", (audioURL) => {
		let chartable = "https://chrt.fm/track/" + metadata.podcast.chartable + "/";

		return chartable + audioURL;
	});

	/* End Filters */

	/* Shortcodes */
	eleventyConfig.addShortcode("youtube", (videoURL, title) => {
		const url = new URL(videoURL);
		const id = url.searchParams.get("v");
		return `<iframe class="yt-embed" src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video player${
			title ? ` for ${title}` : ""
		}" frameborder="0" allowfullscreen></iframe>`;
	});

	/* Collections */
	function getPosts(collectionApi) {
		return collectionApi.getFilteredByGlob("./src/articles/*").reverse().filter(function(item) {
			return !!item.data.permalink;
		});
	}
	// only content in the `articles/` directory
	eleventyConfig.addCollection("articles", function (collection) {
		return getPosts(collection);
	});


	// only content in the `episodes/` directory
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

	eleventyConfig.addCollection("issues", function (collection) {
		return collection.getAllSorted().filter(function (item) {
			return item.inputPath.match(/^\.\/newsletter\//) !== null;
		});
	});

	eleventyConfig.addCollection("caseStudies", function (collection) {
		return collection.getAllSorted().filter(function (item) {
			return item.inputPath.match(/^\.\/case-studies\//) !== null;
		});
	});

	eleventyConfig.addCollection("pinnedPosts", function (collection) {
		return getPosts(collection).filter(({ data }) => data.pinned === true);
	});

	eleventyConfig.addCollection("featuredArticle", function (collection) {
		return getPosts(collection).filter(({ data }) => data.pinned === true).slice(0,1);
	});

	/* Markdown Config */

	let options = {
		html: true,
		breaks: true,
		linkify: true,
		typographer: true,
	};

	let md = markdownIt(options)
		.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "direct-link",
				symbol: "#",
				level: [1, 2, 3, 4],
			}),
			slugify: eleventyConfig.getFilter("slug"),
		})
		.use(markdownItContainer, "callout")
		.use(markdownItFigures, {
			lazy: true,
			removeSrc: true,
			async: true,
			classes: "lazy",
			dataType: true,
		});

	eleventyConfig.setLibrary("md", md);

	eleventyConfig.addPairedShortcode(
		"markdown",
		function (content, inline = false) {
			if (inline) {
				return md.renderInline(content);
			}
			return md.render(content);
		}
	);

	eleventyConfig.addFilter("md", (content) => {
		return md.render(content);
	});

	/* Transforms */
	/**
	 * Remove any CSS not used on the page and inline the remaining CSS in the
	 * <head>.
	 *
	 * @see {@link https://github.com/FullHuman/purgecss}
	 */
	eleventyConfig.addTransform(
		"purge-and-inline-css",
		async (content, outputPath) => {
			if (
				process.env.ELEVENTY_ENV !== "production" ||
				!outputPath.endsWith(".html")
			) {
				return content;
			}
			const purgeCSSResults = await new PurgeCSS().purge({
				content: [{ raw: content }],
				css: ["assets/styles/bravery.css"],
				keyframes: true,
			});
			return content.replace(
				"<!-- INLINE CSS -->",
				"<style>" + purgeCSSResults[0].css + "</style>"
			);
		}
	);

	eleventyConfig.addTransform("html-minify", (content, path) => {
		if (path && path.endsWith(".html")) {
			return htmlmin.minify(content, {
				collapseBooleanAttributes: true,
				collapseWhitespace: true,
				decodeEntities: true,
				includeAutoGeneratedTags: false,
				removeComments: true,
			});
		}

		return content;
	});

	return {
		templateFormats: ["liquid", "md", "njk", "html", "11ty.js"],
		markdownTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
		dataTemplateEngine: "njk",
		dir: {
			input: "src",
			includes: "_includes",
			data: "_data",
			output: "_site",
		},
	};
};

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

const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const readingTime = require("eleventy-plugin-reading-time");
const embedEverything = require("eleventy-plugin-embed-everything");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pkg = require("./package.json");
const metadata = require("./_data/metadata.json");

const { srcset, src } = require("./_11ty/images");
const pluginSass = require("./_11ty/sass.js");
const processJs = require("./_11ty/process-js.js");

module.exports = function (eleventyConfig) {
	eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.setDataDeepMerge(true);
	eleventyConfig.setQuietMode(true);

	eleventyConfig.setServerOptions({
		domdiff: false,
		showVersion: false,
	});

	/* Plugins */
	eleventyConfig.addPlugin(pluginSass);
	eleventyConfig.addPlugin(processJs);
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	eleventyConfig.addPlugin(readingTime);
	eleventyConfig.addPlugin(embedEverything);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

	// Copy these
	eleventyConfig.addPassthroughCopy({
		"_includes/assets/uploads": "assets/uploads",
		"_includes/assets/appendix-b": "assets/appendix-b",
		"_includes/assets/**/*.css": "assets/css",
		"_includes/assets/**/*.js": "assets/js",
		"_includes/assets/icons": "assets/icons",
		"_includes/svg": "assets/svg",
		"_includes/assets/img": "assets/img"
	})
	.addPassthroughCopy("manifest.json")
	.addPassthroughCopy("site.webmanifest")
	.addPassthroughCopy("browserconfig.xml")
	.addPassthroughCopy("robots.txt")
	.addPassthroughCopy("sw.js");

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

	// Simple year shortcode
	eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

	eleventyConfig.addFilter("toMinutes", (epDuration) => {
		return Duration.fromObject({ seconds: epDuration }).toFormat("mm:ss");
	});

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

	eleventyConfig.addCollection("issues", function (collection) {
		return collection.getAllSorted().filter(function (item) {
			return item.inputPath.match(/^\.\/newsletter\//) !== null;
		});
	});

	eleventyConfig.addCollection("case-studies", function (collection) {
		return collection.getAllSorted().filter(function (item) {
			return item.inputPath.match(/^\.\/case-studies\//) !== null;
		});
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

	/* Transforms */
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

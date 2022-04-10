const { DateTime } = require("luxon");
const { minify } = require("terser");
const { PurgeCSS } = require('purgecss');
const CleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const readingTime = require('eleventy-plugin-reading-time');
const pluginEmbedTweet = require("eleventy-plugin-embed-twitter");
const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
    eleventyConfig.addLayoutAlias("article", "layouts/article.njk");
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.addPlugin(readingTime);
    eleventyConfig.addPlugin(pluginEmbedTweet);
    eleventyConfig.addPlugin(pluginRss);

    // Date formatting (human readable)
    eleventyConfig.addFilter("readableDate", dateObj => {
        return DateTime.fromJSDate(dateObj, { zone: 'local' }).toFormat("LLL dd, yyyy");
    });

    // Date formatting (machine readable)
    eleventyConfig.addFilter("machineDate", dateObj => {
        return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
    });

    // Simple year shortcode
    eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

    // Cloudinary presets
    eleventyConfig.addFilter("coverTall", cover => {
        const cloudinaryRoot = 'https://res.cloudinary.com/bravery/image/upload/t_cover_tall_new/';
        return cloudinaryRoot + cover;
    });

    eleventyConfig.addFilter("cover", cover => {
        const cloudinaryRoot = 'https://res.cloudinary.com/bravery/image/upload/f_auto,q_80,w_auto,dpr_auto/';
        return cloudinaryRoot + cover;
    });

    /* Minification filters */
    eleventyConfig.addFilter("cssmin", function(code) {
        return new CleanCSS({}).minify(code).styles;
    });

    eleventyConfig.addNunjucksAsyncFilter("jsmin", async function (
        code,
        callback
    ) {
        try {
        const minified = await minify(code);
        callback(null, minified.code);
        } catch (err) {
        console.error("Terser error: ", err);
        // Fail gracefully.
        callback(null, code);
        }
    });

    /**
     * Remove any CSS not used on the page and inline the remaining CSS in the
     * <head>.
     *
     * @see {@link https://github.com/FullHuman/purgecss}
     */
    eleventyConfig.addTransform('purge-and-inline-css', async function(content) {
        if (process.env.ELEVENTY_ENV !== 'production' || !this.outputPath.endsWith('.html')) {
            return content;
        }

        const purgeCSSResults = await new PurgeCSS().purge({
            content: [{ raw: content }],
            css: ['_includes/assets/css/bravery.css'],
            keyframes: true
        });

        return content.replace('<style INLINE_CSS>', '<style>' + purgeCSSResults[0].css + '</style>');
    });

    eleventyConfig.addTransform("htmlmin", function(content) {
    if( this.outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
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

    // only content in the `jobs/` directory
    eleventyConfig.addCollection("jobs", function (collection) {
        return collection.getAllSorted().filter(function (item) {
            return item.inputPath.match(/^\.\/jobs\//) !== null;
        });
    });

    // Sass
    eleventyConfig.addWatchTarget("_includes/assets/scss");

    // Don't process files and folders with static assets e.g. images
    eleventyConfig.addPassthroughCopy({ "_includes/assets/css": "assets/css" });
    eleventyConfig.addPassthroughCopy({"_includes/assets/icons":"assets/icons"});
    eleventyConfig.addPassthroughCopy({"_includes/assets/img":"assets/img"});
    eleventyConfig.addPassthroughCopy({"_includes/assets/js":"assets/js"});
    eleventyConfig.addPassthroughCopy(".well-known/");
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
        typographer: true
    };

    let markdownLib = markdownIt(options).use(markdownItContainer, 'callout');

    eleventyConfig.setLibrary("md", markdownLib);

    eleventyConfig.addFilter("markdown", (content) => {
        return md.render(content);
    });

    let opts = {
        permalink: true,
        permalinkClass: "direct-link",
        permalinkSymbol: "#"
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
            output: "_site"
        }
    };
};
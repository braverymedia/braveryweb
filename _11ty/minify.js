const minify = require("html-minifier").minify;
const PurgeCSS = require("purgecss").PurgeCSS;
const csso = require("csso");

/**
 * Inlines the CSS.
 * Makes font display display-optional
 * Minifies and optimizes the JS
 * Optimizes HTML
 */

const purifyCss = async (rawContent, outputPath) => {
  let content = rawContent;
  if (
    outputPath &&
    outputPath.endsWith(".html")
  ) {
    let before = require("fs").readFileSync("_includes/assets/css/bravery.css", {
      encoding: "utf-8",
    });

    const purged = await new PurgeCSS().purge({
      content: [
        {
          raw: rawContent,
          extension: "html",
        },
      ],
      css: [
        {
          raw: before,
        },
      ],
      fontFace: true,
      variables: true,
    });

    const after = csso.minify(purged[0].css).css;

    content = content.replace("</head>", `<style>${after}</style></head>`);
  }
  return content;
};

const minifyHtml = (rawContent, outputPath) => {
  let content = rawContent;
  if (outputPath && outputPath.endsWith(".html")) {
    content = minify(content, {
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      removeComments: true,
      sortClassName: true,
      sortAttributes: true,
      html5: true,
      decodeEntities: true,
      removeOptionalTags: true,
    });
  }
  return content;
};

module.exports = {
  initArguments: {},
  configFunction: async (eleventyConfig, pluginOptions = {}) => {
    eleventyConfig.addTransform("purifyCss", purifyCss);
    eleventyConfig.addTransform("minifyHtml", minifyHtml);
  },
};
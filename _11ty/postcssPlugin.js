const postcss = require("postcss");
const path = require("node:path");
const autoprefixer = require("autoprefixer");
const atImport = require("postcss-import");
const parser = require("postcss-comment");
const postcssNesting = require("postcss-nesting");
const postcssNestedCalc = require("@csstools/postcss-nested-calc");
const cssnano = require("cssnano");

module.exports = function (eleventyConfig) {
	// Creates the extension for use
	eleventyConfig.addExtension("css", {
		outputFileExtension: "css", // optional, default: "html"
		compile: async function (inputContent, inputPath) {
			let parsed = path.parse(inputPath);
			if (parsed.name.startsWith("_")) {
				return;
			}
			let output = await postcss([
				atImport,
				postcssNesting(),
				postcssNestedCalc(),
				autoprefixer,
				cssnano,
			]).process(inputContent, { from: inputPath, parser: parser });

			return async () => {
				return output.css;
			};
		},
	});
};

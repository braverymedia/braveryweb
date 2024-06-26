const path = require("node:path");
const sass = require("sass");
const browserslist = require("browserslist");
const { transform, browserslistToTargets, Features } = require("lightningcss");

module.exports = function (eleventyConfig) {
	eleventyConfig.addTemplateFormats("scss");

	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",

		compile: async function (inputContent, inputPath) {
			// Skip files like _fileName.scss
			let parsed = path.parse(inputPath);
			if (parsed.name.startsWith("_")) {
				return;
			}

			// Run file content through Sass
			let result = sass.compileString(inputContent, {
				loadPaths: [parsed.dir || ".", this.config.dir.includes],
				sourceMap: false,
			});

			// Allow included files from @use or @import to
			// trigger rebuilds when using --incremental
			this.addDependencies(inputPath, result.loadedUrls);

			let targets = browserslistToTargets(browserslist("> 2% and not dead"));

			return async () => {
				let { code } = await transform({
					code: Buffer.from(result.css),
					minify: true,
					sourcemap: false,
					targets,
				});
				return code;
			};
		},
	});
};

const path = require("node:path");
const esbuild = require("esbuild");

module.exports = function (eleventyConfig) {
    eleventyConfig.addTemplateFormats("js");

    eleventyConfig.addExtension("js", {
        outputFileExtension: "js",
        compile: async (inputContent, inputPath) => {

            let parsed = path.parse(inputPath);
            if (parsed.name.startsWith("_")) {
                return;
            }

            return async () => {
                let output = await esbuild.build({
                    target: "es2020",
                    entryPoints: [inputPath],
                    minify: true,
                    bundle: true,
                    write: false,
                });

                return output.outputFiles[0].text;
            };
        },
    });
}

const esbuild = require("esbuild");

module.exports = function (eleventyConfig) {
    eleventyConfig.addTemplateFormats("js");
    eleventyConfig.addExtension("js", {
        outputFileExtension: "js",
        compile: async (content, path) => {
            if (path !== "./_includes/assets/js/**/*.js") {
                return;
            }

            return async () => {
                let output = await esbuild.build({
                    entryPoints: [path],
                    minify: true,
                    bundle: true,
                    write: false,
                });

                return output.outputFiles[0].text;
            };
        },
    });
}

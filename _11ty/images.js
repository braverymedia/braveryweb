const CLOUDNAME = "bravery";
const FOLDER = "";
const BASE_URL = `https://res.cloudinary.com/${CLOUDNAME}/image/upload`;
const TRANSFORMS = `f_auto,q_80,dpr_2.0`;
const ASPECT_RATIO= `3:2`;
const FALLBACK_WIDTHS = [320, 768, 1024, 1360, 1600, 1980, 2400];
const FALLBACK_WIDTH = 680;

function getSrcset(file, ar, widths, preset) {
	const widthSet = widths ? widths : FALLBACK_WIDTHS;
	const aspect = `${ar ? ar : ASPECT_RATIO}`;
	return widthSet
		.map((width) => {
			return `${getSrc(file, aspect, width, preset)} ${width}w`;
		})
		.join(", ");
}

// Generate the src attribute using the fallback width or a width supplied
// by the shortcode params
function getSrc(file, ar, width, preset) {
	return `${BASE_URL}/${preset ? preset + "/" : ""}${TRANSFORMS},ar_${
		ar ? ar : ASPECT_RATIO
	},w_${width ? width : FALLBACK_WIDTH},c_fill/${FOLDER}${file}`;
}

// Export the two shortcodes to be able to access them in our Eleventy config
module.exports = {
	srcset: (file, ar, widths, preset) => getSrcset(file, ar, widths, preset),
	src: (file, ar, width, preset) => getSrc(file, ar, width, preset),
};
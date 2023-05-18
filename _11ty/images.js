const CLOUDNAME = "bravery";
const FOLDER = "";
const BASE_URL = `https://res.cloudinary.com/${CLOUDNAME}/image/upload`;
const TRANSFORMS = `f_auto,q_80,dpr_2.0`;
const FALLBACK_WIDTHS = [320, 768, 1024, 1360, 1600, 1980];
const FALLBACK_WIDTH = 680;

function getSrcset(file, preset, widths) {
	const widthSet = widths ? widths : FALLBACK_WIDTHS;
	return widthSet
		.map((width) => {
			return `${getSrc(file, preset, width)} ${width}w`;
		})
		.join(", ");
}

// Generate the src attribute using the fallback width or a width supplied
// by the shortcode params
function getSrc(file, preset, width) {
	console.log(preset);
  return `${BASE_URL}/${preset ? preset + '/' : ''}${TRANSFORMS},w_${width ? width : FALLBACK_WIDTH}/${FOLDER}${file}`
}

// Export the two shortcodes to be able to access them in our Eleventy config
module.exports = {
  srcset: (file, preset, widths) => getSrcset(file, preset, widths),
  src: (file, preset, width) => getSrc(file, preset, width),
}
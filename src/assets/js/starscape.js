// Night Sky element

const canvas = document.querySelector("#starscape");

// Generate a random number between min and max values

const genRandomNumber = (min, max) => {
	return Math.random() * (max - min) + min;
};

// Generate a star <div>

const genStar = () => {
	const star = document.createElement("div");
	star.classList.add("star");
    const precision = 100;

	// Gen star coordinates relative to $el size
	let x = genRandomNumber(1, canvas.offsetWidth);
	let y = genRandomNumber(1, canvas.offsetHeight);

	const { style } = star;

	style.left = Math.floor(x) + "px";
	style.top = Math.floor(y) + "px";

	style.setProperty(
		"--star-size",
		`${Math.floor(
            Math.random() * (3 * precision - 1 * precision) + 1 * precision
        ) /
        (1 * precision)}px`
	);

	style.setProperty(
		"--twinkle-duration",
		Math.ceil(genRandomNumber(1, 5)) + "s"
	);

	style.setProperty("--twinkle-delay", Math.ceil(genRandomNumber(1, 5)) + "s");

	return star;
};

for (let index = 0; index < 500; index++) {
	canvas.append(genStar());
}

const audioElement = document.querySelector("audio");
const audioContext = new AudioContext();
const track = audioContext.createMediaElementSource(audioElement);

// Select our play button
const playPause = document.querySelector("#play-pause");
const progress = document.querySelector("progress");
const elapsed = document.querySelector(".audio-current-time");
const trackDuration = document.querySelector(".audio-duration");
const totalTime = playPause.dataset.duration;

window.addEventListener("DOMContentLoaded", () => {
	track.connect(audioContext.destination);
	console.log(audioElement);

	const setTimes = () => {
		let currentMin = Math.floor(audioElement.currentTime / 60);
		let currentSec = Math.floor(audioElement.currentTime % 60);
		if ( currentSec < 10 ) {
			currentSec = `0${currentSec}`;
		}
		elapsed.textContent = `${currentMin}:${currentSec}`;
	}
	playPause.addEventListener(
		"click",
		() => {
			// Check if context is in suspended state (autoplay policy)
			if (audioContext.state === "suspended") {
				audioContext.resume();
			}

			// Play or pause track depending on state
			if (playPause.dataset.playing === "false") {
				audioElement.play();
				playPause.dataset.playing = "true";
			} else if (playPause.dataset.playing === "true") {
				audioElement.pause();
				playPause.dataset.playing = "false";
			}
		},
		false
	);
	const progressUpdate = (e) => {
		const percent = (audioElement.currentTime / totalTime) * 100;
		progress.value = percent;
	};
	// Update progress bar and time values as audio plays
	audioElement.addEventListener("timeupdate", () => {
		progressUpdate();
		setTimes();
	});
    audioElement.addEventListener("ended", () => {
        playPause.dataset.playing = "false";
        progress.value = 0;
        audioElement.currentTime = 0;
        audioElement.duration = totalTime;
    });
	audioElement.addEventListener("timeupdate", progressUpdate);
});
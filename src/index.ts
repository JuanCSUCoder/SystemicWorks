import Loopy from "./ts/Loopy";

declare global {
	interface Window {
		loopy: Loopy
	}
};

window.onload = function () {
	window.loopy = new Loopy();
};
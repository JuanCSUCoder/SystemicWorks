import Loopy from "./ts/Loopy";
import { publish, subscribe } from "./js/minpubsub";
import { toggleStylesheet } from "./ts/Helpers";

declare global {
	interface Window {
		loopy: Loopy,
		publish: Function,
		subscribe: Function,
	}
};

window.subscribe = subscribe;
window.publish = publish;

window.onload = function () {
	window.loopy = new Loopy();

	var goto_element: HTMLElement = document.getElementById("goto");
	goto_element.addEventListener("click", () => {
		toggleStylesheet("assets/fs.css");
	})
};
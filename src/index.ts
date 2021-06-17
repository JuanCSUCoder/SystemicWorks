import Loopy from "./ts/Loopy";
import { publish, subscribe } from "./js/minpubsub";
import { toggleStylesheet } from "./ts/Helpers";
import Key from './ts/tools/Key';
import { KeysStatus } from './ts/tools/Key';

declare global {
	interface Window {
    loopy: Loopy;
    publish: Function;
    subscribe: Function;
    Key: KeysStatus;
		HIGHLIGHT_COLOR: string;
  }
};

window.subscribe = subscribe;
window.publish = publish;

window.onload = function () {
	window.loopy = new Loopy();

	let goto_element: HTMLElement = document.getElementById("goto");
	goto_element.addEventListener("click", () => {
		toggleStylesheet("assets/fs.css");
	});

	let sidebar: HTMLElement = document.getElementById("sidebar");
	let canvas_cont: HTMLElement = document.getElementById("canvasses");

	let hide_button: HTMLElement = document.getElementById("hide-button");
	let unhide_button: HTMLElement = document.getElementById("unhide-button");

	hide_button.addEventListener("click", () => {
		sidebar.style.display = "none";
		canvas_cont.style.height = "100%";
		publish("resize");
		unhide_button.style.display = "flex";
	});

	unhide_button.addEventListener("click", () => {
		sidebar.style.display = "block";
		canvas_cont.style.removeProperty("height");
    publish("resize");
    unhide_button.style.display = "none";
	});

	let KeysController = new Key(window, window.loopy);
};
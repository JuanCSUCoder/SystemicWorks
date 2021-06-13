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

	var goto_element: HTMLElement = document.getElementById("goto");
	goto_element.addEventListener("click", () => {
		toggleStylesheet("assets/fs.css");
	});

	var KeysController = new Key(window, window.loopy);
};
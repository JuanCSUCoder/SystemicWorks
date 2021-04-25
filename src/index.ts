import Loopy from "./ts/Loopy";
import { publish, subscribe } from "./js/minpubsub";

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
};
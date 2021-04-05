import { Dictionary } from "../Helpers";
import Loopy from "../Loopy";

type ButtonConfig = {
	id: string,
	icon: string,
	tooltip: string,
	callback: Function,
}

class Button {
	callback: Function;

	constructor(toolbar: Toolbar, config: ButtonConfig) {
		this.callback = config.callback;
	}
}

export default class Toolbar {
	buttonsByID: Dictionary<Button> = {};

	constructor(loopy: Loopy) {

	}
}
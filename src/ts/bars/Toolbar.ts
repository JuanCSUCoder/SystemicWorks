import { Dictionary } from "../Helpers";
import Loopy, { LoopyTool } from "../Loopy";

// NOT IMPLEMENTED

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
	currentTool: LoopyTool = LoopyTool.Drag;

	constructor(loopy: Loopy) {

	}
}
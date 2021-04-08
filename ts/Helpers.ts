import { subscribe } from "../js/minpubsub";
import { LoopyTool } from "./Loopy";

export function _getParameterByName(param_name: string): string | null {
	return "";
}

export interface Dictionary<Type> {
	[key: string]: Type,
}

export function _tool2String(toolEnum: LoopyTool): string | null {
	switch (toolEnum) {
		case LoopyTool.Drag:
			return "drag";
			break;

		case LoopyTool.Erase:
			return "erase";
			break;

		case LoopyTool.Ink:
			return "ink";
			break;

		case LoopyTool.Label:
			return "label";
			break;

		case LoopyTool.Loop:
			return "loop";
			break;

		case LoopyTool.Pan:
			return "pan";
			break;

		default:
			return null;
			break;
	}
}

export function _createCanvas() {
	var canvasses: HTMLDivElement = document.getElementById("canvasses") as HTMLDivElement;
	var canvas: HTMLCanvasElement = document.createElement("canvas");

	_onResize(canvasses, canvas);

	canvasses.appendChild(canvas);

	subscribe("resize", () => {
		_onResize(canvasses, canvas);
	});

	return canvas;
}

function _onResize(canvasses: HTMLDivElement, canvas: HTMLCanvasElement) {
	let width = canvasses.clientWidth;
	let height = canvasses.clientHeight;

	canvas.width = width * 2;
	canvas.height = height * 2;

	canvas.style.width = width + "px";
	canvas.style.height = height + "px";
}
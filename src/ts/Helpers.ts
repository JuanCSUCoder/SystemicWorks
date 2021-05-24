import { subscribe } from "../js/minpubsub";
import { LoopyTool } from "./Loopy";

export function _getParameterByName(param_name: string): string | null {
	let url = window.location.href;
	param_name = param_name.replace(/[\[\]]/g, "\\$&");

	let regex = new RegExp("[?&]" + param_name + "(=([^&#]*)|&|#|$)");
	let results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';

	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export interface Dictionary<Type> {
	[key: string]: Type,
	[key: number]: Type,
}

export interface Bounds {
	left: number,
	top: number,
	right: number,
	bottom: number,
}

export let _PADDING = 25;
export let _PADDING_BOTTOM = 110;

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

export function _onResize(canvasses: HTMLDivElement, canvas: HTMLCanvasElement) {
	let width = canvasses.clientWidth;
	let height = canvasses.clientHeight;

	canvas.width = width * 2;
	canvas.height = height * 2;

	canvas.style.width = width + "px";
	canvas.style.height = height + "px";
}

export let HueColors = [
	"#EA3E3E", // red
	"#EA9D51", // orange
	"#FEEE43", // yellow
	"#BFEE3F", // green
	"#7FD4FF", // blue
	"#A97FFF" // purple
];
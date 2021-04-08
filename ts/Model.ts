import Node from "./elements/Node";
import { _createCanvas } from "./Helpers";
import Loopy from "./Loopy";

export default class Model {
	loopy: Loopy;
	speed: number = 0.05;

	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	nodes: Node[] = [];

	constructor(loopy: Loopy) {
		this.loopy = loopy;

		this.canvas = _createCanvas();
		this.ctx = this.canvas.getContext("2d")!;
	}

	update() {

	}

	draw() {
		
	}

	serialize(): string {
		return "";
	}

	deserialize(raw_data: string) {
		
	}
}
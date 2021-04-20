import Model from "../Model";
import { SimpleElement } from "./ElemType";

export interface LoopMarkConfig {
	x: number;
	y: number;
	clockwise: number;
	reinforcement: number;
	color: string;
}

export default class LoopMark implements SimpleElement {
	x: number;
	y: number;
	clockwise: number;
	reinforcement: number;
	color: string;

	constructor(model: Model, config: LoopMarkConfig) {
		this.x = config.x;
		this.y = config.y;
		this.clockwise = config.clockwise;
		this.reinforcement = config.reinforcement;
		this.color = config.color;
	}

	// Draw
	draw(ctx: CanvasRenderingContext2D) {

	}

	kill() {
		
	}

	// Helpers

	isPointInLoopMark(x: number, y: number) {
		return false;
	}
	
	getBoundingBox() {
		return {
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
		};
	}
}
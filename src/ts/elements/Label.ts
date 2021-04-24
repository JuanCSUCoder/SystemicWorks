import Model from "../Model";
import { SimpleElement } from "./ElemType";

// NOT IMPLEMENTED

export interface LabelConfig {
	x: number;
	y: number;
	text: string;
	color: string;
}

export default class Label implements SimpleElement {
	x: number;
	y: number;
	text: string;
	color: string;

	constructor(model: Model, config: LabelConfig) {
		this.x = config.x;
		this.y = config.y;
		this.text = config.text;
		this.color = config.color;
	}

	// Draw
	draw(ctx: CanvasRenderingContext2D) {
		
	}

	kill() {
		
	}

	// Helpers
	
	isPointInLabel(x: number, y: number) {
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
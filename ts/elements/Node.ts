import Model from "../Model";
import { SimpleElement } from "./ElemType";

export type BasicNodeConfig = {
	x: number,
	y: number,
	init: number,
	label: string,
	color: string,
	radius: number,
}

export interface NodeConfig extends BasicNodeConfig {
	id: number;
}

export default class Node implements SimpleElement{
	defaultValue: number = 0.5;
	defaultColor: string = "#00EE00";

	id: number;
	x: number;
	y: number;
	init: number;
	label: string;
	color: string;
	radius: number;

	constructor(model: Model, config: NodeConfig) {
		this.id = config.id;

		// Apply Configuration
		this.x = config.x;
		this.y = config.y;
		this.init = config.init;
		this.label = config.label;
		this.color = config.color;
		this.radius = config.radius;
	}

	// Update & Draw

	update(speed: number) {

	}

	draw(ctx: CanvasRenderingContext2D) {

	}

	kill() {

	}

	// Helpers

	isPointInNode(x: number, y: number, buffer: number) {
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
import Model from "../Model";

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

export default class Node {
	defaultValue: number = 0.5;
	defaultColor: string = "#00EE00";

	id: number;

	constructor(model: Model, config: NodeConfig) {
		this.id = config.id;
	}

	// Update & Draw

	update(speed: number) {

	}

	draw(ctx: CanvasRenderingContext2D) {

	}
}
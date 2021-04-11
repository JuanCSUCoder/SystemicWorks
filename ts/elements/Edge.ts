import Model from "../Model";
import Node from "./Node";

export interface EdgeConfig {
	from: Node;
	to: Node;
}

export type Signal = {

}

export default class Edge {
	from: Node;
	to: Node;
	signals: Signal[] = [];

	constructor(model: Model, config: EdgeConfig) {
		this.from = config.from;
		this.to = config.to;
	}

	kill() {

	}

	// Update & Draw

	update(speed: number) {
		
	}

	draw(ctx: CanvasRenderingContext2D) {

	}
}
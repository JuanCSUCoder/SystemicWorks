import { publish, subscribe, unsubscribe } from "../../js/minpubsub";
import Model from "../Model";
import Node from "./Node";

export interface EdgeConfig {
	from: Node;
	to: Node;
	arc: number;
	strength: number;
	rotation: number;
	thickness: number;
	color: string;
	delay: number;
}

export type Signal = {

}

export default class Edge {
	model: Model;

	// Properties
	from: Node;
	to: Node;
	arc: number = 100;
	strength: number;
	rotation: number = 0;
	thickness: number;
	color: string;
	delay: number;

	// Signals
	signals: Signal[] = [];

	constructor(model: Model, config: EdgeConfig) {
		this.model = model;

		// Configure
		this.from = config.from;
		this.to = config.to;
		this.arc = config.arc;
		this.strength = config.strength;
		this.thickness = config.thickness;
		this.color = config.color;
		this.delay = config.delay;
	}

	kill() {
		
	}

	// Update & Draw

	update(speed: number) {
		
	}

	draw(ctx: CanvasRenderingContext2D) {

	}
}
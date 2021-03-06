import { publish, subscribe, unsubscribe } from "../../js/minpubsub";
import Model from "../Model";
import { EdgeElement } from "./ElemType";
import Node from "./Node";

// NOT IMPLEMENTED

export interface EdgeConfig {
	from: number;
	to: number;
	arc: number;
	strength: number;
	rotation: number;
	thickness: number;
	color: string;
	delay: number;
}

export type Signal = {

}

export default class Edge implements EdgeElement {
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
		this.from = model.nodeByID[config.from];
		this.to = model.nodeByID[config.to];
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

	// Helpers
	
	isPointOnLabel(x: number, y: number) {
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
import Model from "../Model";

export interface LoopMarkConfig {
	x: number;
	y: number;
	clockwise: number;
	reinforcement: number;
	color: string;
}

export default class LoopMark {
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
}
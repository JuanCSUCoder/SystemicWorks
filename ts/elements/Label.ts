import Model from "../Model";

export interface LabelConfig {
	x: number;
	y: number;
	text: string;
	color: string;
}

export default class Label {
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
}
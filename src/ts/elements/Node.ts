import { subscribe } from "../../js/minpubsub";
import { LoopyMode } from "../Loopy";
import Model from "../Model";
import { SimpleElement } from "./ElemType";

// NOT IMPLEMENTED

export type BasicNodeConfig = {
	x: number,
	y: number,
	init: number,
	label: string,
	color: string,
	w: number,
	h: number,
}

export interface NodeConfig extends BasicNodeConfig {
	id: number;
}

export default class Node implements SimpleElement{
	id: number;
	x: number;
	y: number;
	init: number;
	label: string;
	color: string;
	radius: number;
	w: number;
	h: number;
	rx: number;
	ry: number;

	_CLASS_: string = "Node";

	value: number;

	controls_visible: boolean;
	controls_alpha: number;
	controls_direction: number;
	controls_selected: boolean;
	controls_pressed: boolean;

	constructor(model: Model, config: NodeConfig) {
		this.id = config.id;

		// Apply Configuration
		this.x = config.x;
		this.y = config.y;
		this.init = config.init;
		this.label = config.label;
		this.color = config.color;
		this.w = config.w;
		this.h = config.h;
		
		// Pre calculations
		this.rx = Math.sqrt(this.w * (this.w + this.h));
		this.ry = this.rx * Math.sqrt(this.h / this.w);
		
		this.radius = (this.w + this.h) / 2;

		this.value = this.init;

		// Setup Controls Variables
		this.controls_visible = false;
    this.controls_alpha = 0;
    this.controls_direction = 0;
    this.controls_selected = false;
    this.controls_pressed = false;

		// Make Element Interactive
		subscribe("mousemove", () => {
			if (model.loopy.mode == LoopyMode.Play) {
				this.controls_selected = this.isPointInNode(window.Mouse.x, window.Mouse.y, 0);

				if (this.controls_selected) {
					this.controls_visible = true;
					this.controls_direction = (window.Mouse.y < this.y) ? 1 : -1;
				} else {
					this.controls_visible = false;
					this.controls_direction = 0;
				}
			}
		});

		subscribe("mousedown", () => {
			if (model.loopy.mode == LoopyMode.Play) {
				if (this.controls_selected) this.controls_pressed = true;

				if (this.controls_pressed) {
					let delta = this.controls_direction * 0.33;

					this.value += delta;

					// TODO: Propagate Delta
				}
			}
		});

		// TODO: Add the other listeners and complete signals logic
	}

	// Update & Draw

	update(speed: number) {
		this.rx = Math.sqrt(this.w * (this.w + this.h));
    this.ry = this.rx * Math.sqrt(this.h / this.w);

    this.radius = (this.w + this.h) / 2;

    this.value = this.init;
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.translate(this.x*2, this.y*2);

		// Draw Ellipse
		ctx.beginPath();
		ctx.lineWidth = 6;
		ctx.strokeStyle = this.color;
		ctx.fillStyle = "#fff";
		ctx.ellipse(0, 0, this.rx*2, this.ry*2, 0, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.stroke();

		// Draw Value
		ctx.beginPath();
		ctx.fillStyle = this.color;
    ctx.ellipse(0, 0, this.rx * 2 * this.value, this.ry * 2 * this.value, 0, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();

		// Debugging
		// ctx.beginPath();
		// ctx.rect(-ax, -by, ax * 2, by * 2);
		// ctx.stroke();

		// Draw Text
		ctx.fillStyle = "#000";
		ctx.font = "35px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.shadowColor = "white";
    ctx.shadowBlur = 7;
		ctx.fillText(this.label, 0, 0, this.w * 4);

		// Draw Handle
		ctx.beginPath();
		ctx.strokeStyle = "#000";
		ctx.fillStyle = "#fff";
		ctx.arc(this.w * 2, this.h * 2, 15, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		ctx.restore();
	}

	kill() {

	}

	// Helpers

	isPointInNode(x: number, y: number, buffer: number) {
		return ((Math.pow(x - this.x, 2)
				/ Math.pow(this.rx, 2)) +
			(Math.pow(y - this.y, 2)
				/ Math.pow(this.ry, 2)))
			<= 1;
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
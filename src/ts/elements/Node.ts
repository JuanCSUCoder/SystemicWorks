import { _isPointInCircle } from "../../js/helpers";
import { publish, subscribe, unsubscribe } from "../../js/minpubsub";
import { _fixTextInBox, _writeParagraph } from "../Helpers";
import { LoopyMode } from "../Loopy";
import Model from "../Model";
import { SimpleElement } from "./ElemType";

// NOT IMPLEMENTED

export type BasicNodeConfig = {
  x: number;
  y: number;
  init: number;
  label: string;
  color: string;
  w: number;
  h: number;
};

export interface NodeConfig extends BasicNodeConfig {
  id: number;
}

export default class Node implements SimpleElement {
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

  model: Model;

  _CLASS_: string = "Node";

  value: number;

  // Play Controls State Variables
  controls_visible: boolean;
  controls_alpha: number;
  controls_direction: number;
  controls_selected: boolean;
  controls_pressed: boolean;
  handler_hovered: boolean;

  // Listeners
  _listenerMouseMove: any;
  _listenerMouseDown: any;
  _listenerMouseUp: any;
  _listenerReset: any;

  constructor(model: Model, config: NodeConfig) {
    this.id = config.id;
    this.model = model;

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

    this.radius = Math.max(this.rx, this.ry);

    this.value = this.init;

    // Setup Controls Variables
    this.controls_visible = false;
    this.controls_alpha = 0;
    this.controls_direction = 0;
    this.controls_selected = false;
    this.controls_pressed = false;
    this.handler_hovered = false;

    // Make Element Interactive
    this._listenerMouseMove = subscribe("mousemove", () => {
      if (model.loopy.mode == LoopyMode.Play) {
        this.controls_selected = this.isPointInNode(
          window.Mouse.x,
          window.Mouse.y,
          0
        );

        if (this.controls_selected) {
          this.controls_visible = true;
          this.controls_direction = window.Mouse.y < this.y ? 1 : -1;
        } else {
          this.controls_visible = false;
          this.controls_direction = 0;
        }
      } else {
        let cx = this.x + this.w;
        let cy = this.y + this.h;

        if (_isPointInCircle(Mouse.x, Mouse.y, cx, cy, 6)) {
          this.handler_hovered = true;
        } else {
          this.handler_hovered = false;
        }
      }
    });

    this._listenerMouseDown = subscribe("mousedown", () => {
      if (model.loopy.mode == LoopyMode.Play) {
        if (this.controls_selected) this.controls_pressed = true;

        if (this.controls_pressed) {
          let delta = this.controls_direction * 0.33;

          this.value += delta;

          // TODO: Propagate Delta
        }
      }
    });

    this._listenerMouseUp = subscribe("mouseup", () => {
      if (model.loopy.mode == LoopyMode.Play) {
        this.controls_pressed = false;
      }
    });

    this._listenerReset = subscribe("model/reset", () => {
      this.value = this.init;
    });
  }

  // Update & Draw

  update(speed: number) {
    this.rx = Math.sqrt(this.w * (this.w + this.h));
    this.ry = this.rx * Math.sqrt(this.h / this.w);

    this.radius = Math.max(this.rx, this.ry);

    this.value = this.init;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
		ctx.translate(this.x * 2, this.y * 2);
		
		// Draw Highlight
		if (this.model.loopy.sidebar.currentPage.target == this) {
			ctx.beginPath();
			ctx.ellipse(0, 0, (this.rx + 10) * 2, (this.ry + 10) * 2, 0, 0, Math.PI * 2, false);
      ctx.fillStyle = window.HIGHLIGHT_COLOR;
      ctx.fill();
    }

    // Draw Ellipse
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = this.color;
    ctx.fillStyle = "#fff";
    ctx.ellipse(0, 0, this.rx * 2, this.ry * 2, 0, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();

    // Draw Value
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.ellipse(
      0,
      0,
      this.rx * 2 * this.value,
      this.ry * 2 * this.value,
      0,
      0,
      Math.PI * 2,
      false
    );
    ctx.fill();

    // Debugging
    // ctx.beginPath();
		// ctx.rect(-this.w * 2, -this.h * 2, this.w * 4, this.h * 4);
    // ctx.stroke();

    // Draw Text
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "white";
    ctx.shadowBlur = 7;
		_fixTextInBox(this.label, ctx, { width: this.w * 4.2, height: this.h * 4.2 });

    // Draw Handle
		ctx.beginPath();
		ctx.shadowColor = "black";
		ctx.shadowBlur = 0;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = this.handler_hovered ? "#fff" : "#999";
    ctx.arc(this.w * 2, this.h * 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  kill() {
    unsubscribe("mousemove", this._listenerMouseMove);
    unsubscribe("mousedown", this._listenerMouseDown);
    unsubscribe("mouseup", this._listenerMouseUp);
    unsubscribe("model/reset", this._listenerReset);

    this.model.removeNode(this);

    publish("kill", [this]);
  }

  // Helpers

  isPointInNode(x: number, y: number, buffer: number) {
    return (
      Math.pow(x - this.x, 2) / Math.pow(this.rx, 2) +
        Math.pow(y - this.y, 2) / Math.pow(this.ry, 2) <=
      1
    );
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

import { _isPointInCircle, _shiftArray } from "../../js/helpers";
import { publish, subscribe, unsubscribe } from "../../js/minpubsub";
import { Bounds, _fixTextInBox, _writeParagraph } from "../Helpers";
import { LoopyMode } from "../Loopy";
import Model from "../Model";
import { SimpleElement } from "./ElemType";

export type BasicNodeConfig = {
  x: number;
  y: number;
  init: number;
  label: string;
  color: string;
  w: number;
  h: number;
};

export type Signal = {
	delta: number;
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

  offset: number;
  offset_goto: number;
  offset_velocity: number;
  offset_acceleration: number;
  offset_damping: number;
  offset_hookes: number;

	shift_index: number;

	// Colored Bubble Values
	cb_rx: number;
	cb_ry: number;

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
		
		this.cb_rx = this.rx * this.init;
		this.cb_ry = this.ry * this.init;

    this.radius = Math.max(this.rx, this.ry);

    this.value = this.init;

    // Setup Controls & State Variables
    this.controls_visible = false;
    this.controls_alpha = 0;
    this.controls_direction = 0;
    this.controls_selected = false;
    this.controls_pressed = false;
    this.handler_hovered = false;

    this.offset = 0;
    this.offset_goto = 0;
    this.offset_velocity = 0;
    this.offset_acceleration = 0;
    this.offset_damping = 0.3;
    this.offset_hookes = 0.8;

    this.shift_index = 0;

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

          // Propagate Delta
					this.sendSignal({
            delta: delta,
          });
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

    let _isPlaying = this.model.loopy.mode == LoopyMode.Play;

    if (this.model.loopy.mode == LoopyMode.Edit) this.value = this.init;

    if (this.controls_selected) Mouse.showCursor("pointer");

    let gotoAlpha = this.controls_visible ? 1 : 0;
    this.controls_alpha = this.controls_alpha * 0.5 + gotoAlpha * 0.5;

    if (_isPlaying && this.controls_pressed) {
      this.offset_goto = -this.controls_direction * 20; // by 20 pixels
      // _offsetGoto = _controlsDirection*0.2; // by scale +/- 0.1
    } else {
      this.offset_goto = 0;
    }

    this.offset += this.offset_velocity;
    this.offset = this.offset > 40 ? 40 : this.offset;
    this.offset = this.offset < -40 ? -40 : this.offset;

    this.offset_velocity += this.offset_acceleration;
    this.offset_velocity *= this.offset_damping;
    this.offset_acceleration =
      (this.offset_goto - this.offset) * this.offset_hookes;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x * 2, this.y * 2);

    // Draw Highlight
    if (this.model.loopy.sidebar.currentPage.target == this) {
      ctx.beginPath();
      if (!this.model.loopy.onlyText) {
        ctx.ellipse(
          0,
          0,
          (this.rx + 10) * 2,
          (this.ry + 10) * 2,
          0,
          0,
          Math.PI * 2,
          false
        );
      } else {
        ctx.rect(-this.w * 2, -this.h * 2, this.w * 4, this.h * 4);
      }
      ctx.fillStyle = window.HIGHLIGHT_COLOR;
      ctx.fill();
    }

		if (!this.model.loopy.onlyText) {
			// Draw Ellipse
			ctx.beginPath();
			ctx.lineWidth = 6;
			ctx.strokeStyle = this.color;
			ctx.fillStyle = "#fff";
			ctx.ellipse(0, 0, this.rx * 2, this.ry * 2, 0, 0, Math.PI * 2, false);
			ctx.fill();
			ctx.stroke();
			
			// Calculate Value radius
			let cb_rx_goto = this.rx * 0.9 * Math.abs(this.value);
			this.cb_rx = this.cb_rx * 0.8 + cb_rx_goto * 0.2;

			let cb_ry_goto = this.ry * 0.9 * Math.abs(this.value);
			this.cb_ry = this.cb_ry * 0.8 + cb_ry_goto * 0.2;

			// Draw Value
			ctx.beginPath();
			ctx.fillStyle = this.color;
			ctx.ellipse(
				0,
				0,
				this.cb_rx * 2,
        this.cb_ry * 2,
        0,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
    } else {
      // Draw Background Box
      ctx.beginPath();
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 7;
      ctx.rect(-this.w * 2, -this.h * 2, this.w * 4, this.h * 4);
      ctx.fill();
    }

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
    _fixTextInBox(this.label, ctx, { width: this.w * 4, height: this.h * 4 });

    // Draw Handle
    ctx.beginPath();
    ctx.shadowColor = "black";
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#000";
    ctx.fillStyle = this.handler_hovered ? "#fff" : "#999";
    ctx.arc(this.w * 2, this.h * 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    var cl = 40;
    var cy = 0;

    // Draw Controls
    ctx.globalAlpha = this.controls_alpha;
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    // Top-arrow
    ctx.beginPath();
    ctx.moveTo(-cl, -cy - cl);
    ctx.lineTo(0, -cy - cl * 2);
    ctx.lineTo(cl, -cy - cl);
    ctx.lineWidth = this.controls_direction > 0 ? 10 : 3;
    ctx.stroke();
    // Bottom-arrow
    ctx.beginPath();
    ctx.moveTo(-cl, cy + cl);
    ctx.lineTo(0, cy + cl * 2);
    ctx.lineTo(cl, cy + cl);
    ctx.lineWidth = this.controls_direction < 0 ? 10 : 3;
    ctx.stroke();

    ctx.restore();
  }

  // Signals
  sendSignal(signal: Signal) {
		var myEdges = this.model.getEdgesByStartNode(this);
		myEdges = _shiftArray(myEdges, this.shift_index);

		this.shift_index = (this.shift_index + 1) % myEdges.length;

		myEdges.forEach(edge => {
			edge.addSignal(signal);
		});
	}
	
	takeSignal(signal: Signal) {
		// Change node value
		this.value += signal.delta;

		// Propagate signal
		this.sendSignal(signal);

		// Animation
		this.offset_velocity -= 6 * (signal.delta / Math.abs(signal.delta));
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
		if (!this.model.loopy.onlyText) {
			return (
        Math.pow(x - this.x, 2) / Math.pow(this.rx, 2) +
          Math.pow(y - this.y, 2) / Math.pow(this.ry, 2) <=
        1
      );
		} else {
			let bounds = this.getBoundingBox();

			let p_in_x = bounds.left < x && x < bounds.right;
			let p_in_y = bounds.top < y && y < bounds.bottom;

			return p_in_x && p_in_y;
		}
  }

  getBoundingBox(): Bounds {
    return {
      left: this.x - this.w,
      top: this.y - this.h,
      right: this.x + this.w,
      bottom: this.y + this.h,
    };
  }
}

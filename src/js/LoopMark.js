/**************************************

LoopMark!

 *************************************/

import { subscribe, publish } from './minpubsub';
import { _configureProperties, Loopy } from './helpers';

LoopMark.defaultOrientation = 1;
LoopMark.defaultType = 1;
LoopMark.defaultColor = "#666666";

export default function LoopMark(model, config) {
	var self = this;
	self._CLASS_ = "LoopMark";

	// Mah Parents!
	self.loopy = model.loopy;
	self.model = model;
	self.config = config;

	_configureProperties(self, config);

	var head = 3;
	var r = 20;

	self.kill = function () {
    // Remove from parent!
    model.removeLoopMark(self);

    // Killed!
    publish("kill", [self]);
  }

	self.draw = function (ctx) {
		// Retina
		var x = self.x * 2;
		var y = self.y * 2;

		ctx.save();
		ctx.translate(x, y);

		if (self.loopy.sidebar.currentPage.target == self) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 40, 0, Math.TAU, false);
      ctx.fillStyle = HIGHLIGHT_COLOR;
      ctx.fill();
    }

		ctx.beginPath();

		ctx.strokeStyle = self.color;
		ctx.lineWidth = 3 * 2;
		
		var headAngle;

		if (self.clockwise) {
			ctx.arc(0, 0, r * 2, -Math.PI * 5 / 4, Math.PI * 2 / 5, !self.clockwise);
			headAngle = Math.PI * 2 / 5;
		} else {
			ctx.arc(0, 0, r * 2, Math.PI * 1 / 4, -Math.PI * 7 / 5, !self.clockwise);
			headAngle = -Math.PI * 7 / 5;
		}
		

		ctx.stroke();

		ctx.font = "100 40px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = self.color;

		if (self.reinforcement) {
			ctx.fillText("R", 0, 0);
		} else {
			ctx.fillText("B", 0, 0);
		}

		ctx.translate(Math.cos(headAngle) * r * 2, Math.sin(headAngle) * r * 2);
		
		if (self.clockwise) {
			ctx.rotate(headAngle + Math.PI);
		} else {
			ctx.rotate(headAngle);
		}

		ctx.moveTo(head * 2, head * 2);
		ctx.lineTo(0, 0);
		ctx.lineTo(-head * 2, head * 2);

		ctx.stroke();

		ctx.restore();
	}

	////////////////////
	// HELPER METHODS //
	////////////////////

	self.isPointInLoopMark = function (x, y) {
		var dx = self.x - x;
		var dy = self.y - y;

		var d = Math.sqrt(dx * dx + dy * dy);

		return d <= 20;
	}
}
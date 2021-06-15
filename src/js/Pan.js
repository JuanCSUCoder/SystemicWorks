import { subscribe, publish } from './minpubsub';
import { Loopy } from './helpers';

function Pan(loopy) {
	var self = {};
	self.loopy = loopy;

	self.active = false;
	self.referenced = false;

	self.mouseXRef = 0;
	self.mouseYRef = 0;

	subscribe("mousedown", function () {
		if (window.loopy.tool == Loopy.TOOL_PAN) {
			self.active = true;
			self.referenced = false;

			loopy.initialCanvasX = loopy.offsetX;
			loopy.initialCanvasY = loopy.offsetY;
		}
	})

	subscribe("mouseup", function () {
		if (window.loopy.tool == Loopy.TOOL_PAN) {
			self.active = false;

			loopy.initialCanvasX = loopy.offsetX;
			loopy.initialCanvasY = loopy.offsetY;
		}
	})

	subscribe("mousemove", function () {
		if (!self.referenced) {
			self.mouseXRef = Mouse.x - loopy.offsetX;
			self.mouseYRef = Mouse.y - loopy.offsetY;

			self.referenced = true;
		}

		if(window.loopy.tool == Loopy.TOOL_PAN && self.active) {
			loopy.offsetX = Mouse.x - self.mouseXRef;
			loopy.offsetY = Mouse.y - self.mouseYRef;

			publish("canvas/moved");
		}
	})

	return self;
}

export default Pan;
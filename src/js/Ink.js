/**********************************

LOOPY!
- with edit & play mode

TODO: smoother bezier curve?
TODO: when switch away tool, clear the Ink canvas

**********************************/

import { _createCanvas, _translatePoints, _rotatePoints } from './helpers';
import { subscribe, publish } from './minpubsub';
import { Loopy, _getBounds } from './helpers';
import { _PADDING, _PADDING_BOTTOM } from '../ts/Helpers';

Ink.MINIMUM_RADIUS = Node.DEFAULT_RADIUS;
Ink.SNAP_TO_RADIUS = 25;

function Ink(loopy) {

	var self = {};
	self.loopy = loopy;

	// Create canvas & context
	var canvas = _createCanvas();
	var ctx = canvas.getContext("2d");
	self.canvas = canvas;
	self.context = ctx;

	// Stroke data!
	self.strokeData = [];

	// Drawing!
	self.drawInk = function () {

		if (!Mouse.pressed) return;

		// Last point
		var lastPoint = self.strokeData[self.strokeData.length - 1];

		// Style
		ctx.strokeStyle = "#ccc";
		ctx.lineWidth = 5;
		ctx.lineCap = "round";

		// Translate to center, (translate, scale, translate) to expand to size
		var canvasses = document.getElementById("canvasses");
		var CW = canvasses.clientWidth - _PADDING - _PADDING;
		var CH = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;
		var tx = loopy.offsetX * 2;
		var ty = loopy.offsetY * 2;
		tx -= CW + _PADDING;
		ty -= CH + _PADDING;
		var s = loopy.offsetScale; // TODO: Zooming
		tx = s * tx;
		ty = s * ty;
		tx += CW + _PADDING;
		ty += CH + _PADDING;
		if (loopy.embedded) {
			tx += _PADDING; // dunno why but this is needed
			ty += _PADDING; // dunno why but this is needed
		}

		ctx.setTransform(s, 0, 0, s, tx, ty);

		// Draw line from last to current
		ctx.beginPath();
		ctx.moveTo(lastPoint[0] * 2, lastPoint[1] * 2);
		ctx.lineTo(Mouse.x * 2, Mouse.y * 2);
		ctx.stroke();

		// Update last point
		self.strokeData.push([Mouse.x, Mouse.y]);

	};
	self.reset = function () {
		let s = loopy.offsetScale;
		let tx = loopy.offsetX * 2 * s;
		let ty = loopy.offsetY * 2 * s;
		let tw = canvas.width / s;
		let th = canvas.height / s;

		let ax = - loopy.offsetX * 2;
		let ay = - loopy.offsetY * 2;

		ctx.setTransform(s, 0, 0, s, tx, ty);

		if (window.debug_mode) {
			console.log("Ink Debug --------");
			console.log("AX: " + ax);
			console.log("AY: " + ay);

			console.log("TX: " + tx);
			console.log("TY: " + ty);

			console.log("TW: " + tw);
			console.log("TH: " + th);
			console.log("------------------");

			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fillRect(ax, ay, tw, th);
			setTimeout(() => { ctx.clearRect(ax, ay, tw, th) }, 1000);
		} else {
			ctx.clearRect(ax, ay, tw, th);
		}

		self.strokeData = []; // Reset stroke data
	};
	subscribe("mousedown", function () {

		// ONLY WHEN EDITING w INK
		if (self.loopy.mode != Loopy.MODE_EDIT) return;
		if (self.loopy.tool != Loopy.TOOL_INK) return;

		// New stroke data
		self.strokeData = [];
		self.strokeData.push([Mouse.x, Mouse.y]);

		// Draw to canvas!
		self.drawInk();

	});
	subscribe("mousemove", function () {

		// ONLY WHEN EDITING w INK
		if (self.loopy.mode != Loopy.MODE_EDIT) return;
		if (self.loopy.tool != Loopy.TOOL_INK) return;

		// Draw ink!
		self.drawInk();

	});
	subscribe("mouseup", function () {

		// ONLY WHEN EDITING w INK
		if (self.loopy.mode != Loopy.MODE_EDIT) return;
		if (self.loopy.tool != Loopy.TOOL_INK) return;

		if (self.strokeData.length < 2) return;
		

		/*************************
		
		Detect what you drew!
		1. Started in a node?
		1a. If ended near/in a node, it's an EDGE.
		2. If not, it's a NODE. // TODO: actual circle detection?

		*************************/

		// Started in a node?
		var startPoint = self.strokeData[0];
		var startNode = loopy.model.getNodeByPoint(startPoint[0], startPoint[1]);
		if (!startNode) startNode = loopy.model.getNodeByPoint(startPoint[0], startPoint[1], 20); // try again with buffer
		if (!Mouse.moved && startNode) return;

		// Ended in a node?
		var endPoint = self.strokeData[self.strokeData.length - 1];
		var endNode = loopy.model.getNodeByPoint(endPoint[0], endPoint[1]);
		if (!endNode) endNode = loopy.model.getNodeByPoint(endPoint[0], endPoint[1], 40); // try again with buffer

		// Clicked an edge?
		let clickedEdge = loopy.model.getEdgeByPoint(startPoint[0], startPoint[1]);

		// Clicked a label?
		let clickedLabel = loopy.model.getLabelByPoint(startPoint[0], startPoint[1]);

		// Clicked a Loopmark?
		let clickedLoopMark = loopy.model.getLoopMarkByPoint(startPoint[0], startPoint[1]);

		// Should create a node
		let createNode = Mouse.moved && !(clickedEdge || clickedLabel || clickedLoopMark) && !startNode;

		// EDGE: started AND ended in nodes
		if (startNode && endNode) {

			// Config!
			var edgeConfig = {
				from: startNode.id,
				to: endNode.id
			};

			// If it's the same node...
			if (startNode == endNode) {

				// TODO: clockwise or counterclockwise???
				// TODO: if the arc DOES NOT go beyond radius, don't make self-connecting edge. also min distance.

				// Find rotation first by getting average point
				var bounds = _getBounds(self.strokeData);
				var x = (bounds.left + bounds.right) / 2;
				var y = (bounds.top + bounds.bottom) / 2;
				var dx = x - startNode.x;
				var dy = y - startNode.y;
				var angle = Math.atan2(dy, dx);

				// Then, find arc height.
				var translated = _translatePoints(self.strokeData, -startNode.x, -startNode.y);
				var rotated = _rotatePoints(translated, -angle);
				bounds = _getBounds(rotated);

				// Arc & Rotation!
				edgeConfig.rotation = angle * (360 / Math.TAU) + 90;
				edgeConfig.arc = bounds.right;

				// ACTUALLY, IF THE ARC IS *NOT* GREATER THAN THE RADIUS, DON'T DO IT.
				// (and otherwise, make sure minimum distance of radius+25)
				if (edgeConfig.arc < startNode.radius) {
					edgeConfig = null;
					loopy.sidebar.edit(startNode); // you were probably trying to edit the node
				} else {
					var minimum = startNode.radius + 25;
					if (edgeConfig.arc < minimum) edgeConfig.arc = minimum;
				}

			} else {

				// Otherwise, find the arc by translating & rotating
				var dx = endNode.x - startNode.x;
				var dy = endNode.y - startNode.y;
				var angle = Math.atan2(dy, dx);
				var translated = _translatePoints(self.strokeData, -startNode.x, -startNode.y);
				var rotated = _rotatePoints(translated, -angle);
				var bounds = _getBounds(rotated);

				// Arc!
				if (Math.abs(bounds.top) > Math.abs(bounds.bottom)) edgeConfig.arc = -bounds.top;
				else edgeConfig.arc = -bounds.bottom;

			}

			// Add the edge!
			if (edgeConfig) {
				var newEdge = loopy.model.addEdge(edgeConfig);
				loopy.sidebar.edit(newEdge);
			}

		}

		// NODE: did NOT start in a node.
		if (createNode) {

			// Just roughly make a circle the size of the bounds of the circle
			var bounds = _getBounds(self.strokeData);
			var x = (bounds.left + bounds.right) / 2;
			var y = (bounds.top + bounds.bottom) / 2;
			var w = bounds.width / 2;
			var h = bounds.height / 2;

			// Circle can't be TOO smol
			if (w > 20 && h > 20) {

				// Snap to radius
				/*r = Math.round(r/Ink.SNAP_TO_RADIUS)*Ink.SNAP_TO_RADIUS;
				if(r<Ink.MINIMUM_RADIUS) r=Ink.MINIMUM_RADIUS;*/

				// LOCK TO JUST SMALLEST CIRCLE.
				// r = Ink.MINIMUM_RADIUS;

				// Make that node!
				var newNode = loopy.model.addNode({
					x: x,
					y: y,
					w: w,
					h: h,
				});

				// Edit it immediately
				!window.debug_mode ? loopy.sidebar.edit(newNode): '';

			} else {
				var newNode = loopy.model.addNode({
					x: x,
					y: y,
					w: 40,
					h: 20,
				});

				// Edit it immediately
				!window.debug_mode ? loopy.sidebar.edit(newNode): '';
			}

		}

		// Reset.
		self.reset();

	});
	subscribe("mouseclick", function () {

		// ONLY WHEN EDITING w INK
		if (self.loopy.mode != Loopy.MODE_EDIT) return;
		if (self.loopy.tool != Loopy.TOOL_INK) return;

		// Reset
		self.reset();

	});

	return self;
}

export default Ink;
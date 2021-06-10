/**********************************

DRAGGER

**********************************/

import { subscribe, publish } from './minpubsub';
import { Loopy, _translatePoints, _rotatePoints } from './helpers';

function Dragger(loopy){

	var self = {};
	self.loopy = loopy;

	// Dragging anything?
	self.dragging = null;
	self.offsetX = 0;
	self.offsetY = 0;

	self.handling = null;

	subscribe("mousedown",function(){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if (self.loopy.tool != Loopy.TOOL_DRAG) return;
		
		var handler = loopy.model.getHandlerByPoint(Mouse.x, Mouse.y);
		if (handler) {
			self.handling = handler;
			self.offsetX = Mouse.x - handler.w;
			self.offsetY = Mouse.y - handler.h;
			loopy.sidebar.edit(handler);
			return;
		}

		// Any node under here? If so, start dragging!
		var dragNode = loopy.model.getNodeByPoint(Mouse.x, Mouse.y);
		if(dragNode){
			self.dragging = dragNode;
			self.offsetX = Mouse.x - dragNode.x;
			self.offsetY = Mouse.y - dragNode.y;
			loopy.sidebar.edit(dragNode); // and edit!
			return;
		}

		// Any label under here? If so, start dragging!
		var dragLabel = loopy.model.getLabelByPoint(Mouse.x, Mouse.y);
		if(dragLabel){
			self.dragging = dragLabel;
			self.offsetX = Mouse.x - dragLabel.x;
			self.offsetY = Mouse.y - dragLabel.y;
			loopy.sidebar.edit(dragLabel); // and edit!
			return;
		}

		// Any edge under here? If so, start dragging!
		var dragEdge = loopy.model.getEdgeByPoint(Mouse.x, Mouse.y);
		if(dragEdge){
			self.dragging = dragEdge;
			self.offsetX = Mouse.x - dragEdge.labelX;
			self.offsetY = Mouse.y - dragEdge.labelY;
			loopy.sidebar.edit(dragEdge); // and edit!
			return;
		}

		// Any LoopMark under here? If so, start dragging!
		var dragLoopMark = loopy.model.getLoopMarkByPoint(Mouse.x, Mouse.y);
		if (dragLoopMark) {
			self.dragging = dragLoopMark;
			self.offsetX = Mouse.x - dragLoopMark.x;
			self.offsetY = Mouse.y - dragLoopMark.y;
			loopy.sidebar.edit(dragLoopMark);
			return;
		}

	});
	subscribe("mousemove",function(){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if (self.loopy.tool != Loopy.TOOL_DRAG) return;
		
		// If you are moving a node size handler
		if (self.handling) {
			// Model has changed
			publish("model/changed");

			var n = self.handling;

			n.w = Math.abs(Mouse.x - self.offsetX);
			n.h = Math.abs(Mouse.y - self.offsetY);

			if (n.w < 20) n.w = 20;
			if (n.h < 20) n.h = 20;

			loopy.model.update();
		}

		// If you're dragging a NODE, move it around!
		if(self.dragging && self.dragging._CLASS_=="Node"){

			// Model's been changed!
			publish("model/changed");
			
			var node = self.dragging;
			node.x = Mouse.x - self.offsetX;
			node.y = Mouse.y - self.offsetY;

			// update coz visual glitches
			loopy.model.update();
			
		}

		// If you're dragging an EDGE, move it around!
		if(self.dragging && self.dragging._CLASS_=="Edge"){

			// Model's been changed!
			publish("model/changed");

			var edge = self.dragging;
			var labelX = Mouse.x - self.offsetX;
			var labelY = Mouse.y - self.offsetY;

			if(edge.from!=edge.to){

				// The Arc: whatever label *Y* is, relative to angle & first node's pos
				var fx=edge.from.x, fy=edge.from.y, tx=edge.to.x, ty=edge.to.y;
				var dx=tx-fx, dy=ty-fy;
				var a = Math.atan2(dy,dx);

				// Calculate arc
				var points = [[labelX,labelY]];
				var translated = _translatePoints(points, -fx, -fy);
				var rotated = _rotatePoints(translated, -a);
				var newLabelPoint = rotated[0];

				// ooookay.
				edge.arc = -newLabelPoint[1]; // WHY NEGATIVE? I DON'T KNOW.

			}else{

				// For SELF-ARROWS: just get angle & mag for label.
				var dx = labelX - edge.from.x,
					dy = labelY - edge.from.y;
				var a = Math.atan2(dy,dx);
				var mag = Math.sqrt(dx*dx + dy*dy);

				// Minimum mag
				var minimum = edge.from.radius+25;
				if(mag<minimum) mag=minimum;

				// Update edge
				edge.arc = mag;
				edge.rotation = a*(360/Math.TAU)+90;

			}

			// update coz visual glitches
			loopy.model.update();

		}

		// If you're dragging a LABEL, move it around!
		if(self.dragging && self.dragging._CLASS_=="Label"){

			// Model's been changed!
			publish("model/changed");
			
			var label = self.dragging;
			label.x = Mouse.x - self.offsetX;
			label.y = Mouse.y - self.offsetY;

			// update coz visual glitches
			loopy.model.update();
			
		}

		// If dragging a LoopMark, move it
		if (self.dragging && self.dragging._CLASS_=="LoopMark") {
			// Model Changed
			publish("model/changed");

			var loop_mark = self.dragging;
			loop_mark.x = Mouse.x - self.offsetX;
			loop_mark.y = Mouse.y - self.offsetY;

			loopy.model.update();
		}

	});
	subscribe("mouseup",function(){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_DRAG) return;

		// Let go!
		self.dragging = null;
		self.handling = null;
		self.offsetX = 0;
		self.offsetY = 0;

	});

	return self;
}

export default Dragger;
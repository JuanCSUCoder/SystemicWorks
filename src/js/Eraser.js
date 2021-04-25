/**********************************

ERASER

**********************************/

import { subscribe, publish } from './minpubsub';

function Eraser(loopy){

	var self = {};
	self.loopy = loopy;

	self.erase = function(clicked){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_ERASE) return;

		// Erase any nodes under here
		if(Mouse.pressed || clicked){
			var eraseNode = loopy.model.getNodeByPoint(Mouse.x, Mouse.y);
			if(eraseNode) eraseNode.kill();
		}

		// Erase any edges under here
		if(Mouse.pressed || clicked){
			var eraseEdge = loopy.model.getEdgeByPoint(Mouse.x, Mouse.y, true);
			if(eraseEdge) eraseEdge.kill();
		}

		// Erase any labels under here
		if(Mouse.pressed || clicked){
			var eraseLabel = loopy.model.getLabelByPoint(Mouse.x, Mouse.y);
			if(eraseLabel) eraseLabel.kill();
		}

		// Erase any loop marks under here
		if (Mouse.pressed || clicked) {
			var eraseLoopMark = loopy.model.getLoopMarkByPoint(Mouse.x, Mouse.y);
			if (eraseLoopMark) eraseLoopMark.kill();
		}

	};

	subscribe("mousemove",function(){
		self.erase();
	});
	subscribe("mouseclick",function(){
		self.erase(true);
	});

	return self;
}

export default Eraser;
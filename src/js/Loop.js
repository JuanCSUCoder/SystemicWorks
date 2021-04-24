function Loop(loopy) {
	var self = this;
	
	subscribe("mouseup", function () {
		if (loopy.mode != Loopy.MODE_EDIT) return;
		if (loopy.tool != Loopy.TOOL_LOOP) return;
		
		loopy.model.addLoopMark({
			x: Mouse.x,
			y: Mouse.y
		});
	});

	return self;
}

module.exports = Loop;
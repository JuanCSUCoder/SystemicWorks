function Pan(loopy) {
	var self = this;
	self.loopy = loopy;

	self.active = false;

	self.mouseXRef = 0;
	self.mouseYRef = 0;

	var canvas = _createCanvas();
	var ctx = canvas.getContext("2d");

	subscribe("mousedown", function () {
		self.active = true;
		
		self.mouseXRef = Mouse.x - loopy.offsetX;
		self.mouseYRef = Mouse.y - loopy.offsetY;

		loopy.initialCanvasX = loopy.offsetX;
		loopy.initialCanvasY = loopy.offsetY;
	})

	subscribe("mouseup", function () {
		self.active = false;

		loopy.initialCanvasX = loopy.offsetX;
		loopy.initialCanvasY = loopy.offsetY;
	})

	subscribe("mousemove", function () {
		if(window.loopy.tool == Loopy.TOOL_PAN && self.active) {
			loopy.offsetX = Mouse.x - self.mouseXRef;
			loopy.offsetY = Mouse.y - self.mouseYRef;

			publish("canvas/moved");
		}
	})
}
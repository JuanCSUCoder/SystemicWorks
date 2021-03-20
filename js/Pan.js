function Pan(loopy) {
	var self = this;
	self.loopy = loopy;

	self.active = false;

	self.mouseXRef = 0;
	self.mouseYRef = 0;

	self.canvasX = 0;
	self.canvasY = 0;

	var canvas = _createCanvas();
	var ctx = canvas.getContext("2d");

	subscribe("mousedown", function () {
		self.active = true;
		
		self.mouseXRef = Mouse.x - self.canvasX;
		self.mouseYRef = Mouse.y - self.canvasY;

		loopy.initialCanvasX = self.canvasX;
		loopy.initialCanvasY = self.canvasY;
	})

	subscribe("mouseup", function () {
		self.active = false;

		loopy.initialCanvasX = self.canvasX;
		loopy.initialCanvasY = self.canvasY;
	})

	subscribe("mousemove", function () {
		if(window.loopy.tool == Loopy.TOOL_PAN && self.active) {
			self.canvasX = Mouse.x - self.mouseXRef;
			self.canvasY = Mouse.y - self.mouseYRef;

			loopy.canvasX = self.canvasX;
			loopy.canvasY = self.canvasY;

			publish("canvas/moved");
		}
	})
}
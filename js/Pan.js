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
		
		self.mouseXRef = Mouse.x;
		self.mouseYRef = Mouse.y;
	})

	subscribe("mouseup", function () {
		self.active = false
	})

	subscribe("mousemove", function () {
		if(window.loopy.tool == Loopy.TOOL_PAN && self.active) {
			self.canvasX += Mouse.x - self.mouseXRef;
			self.canvasY += Mouse.y - self.mouseYRef;

			loopy.canvasX = self.canvasX;
			loopy.canvasY = self.canvasY;

			self.mouseXRef = Mouse.x;
			self.mouseYRef = Mouse.y;

			publish("canvas/moved");
		}
	})
}
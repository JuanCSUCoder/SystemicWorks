function Pan(loopy) {
	var self = this;
	self.loopy = loopy;

	self.active = false;

	self.mouseXRef = 0;
	self.mouseYRef = 0;

	self.canvasX = 0;
	self.canvasY = 0;

	var canvasses = document.getElementById("canvasses");
	var tx = 0;
	var ty = 0;
	var s = 1/loopy.offsetScale;
	var CW = canvasses.clientWidth - _PADDING - _PADDING;
	var CH = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;

	if(loopy.embedded){
		tx -= _PADDING/2; // dunno why but this is needed
		ty -= _PADDING/2; // dunno why but this is needed
	}
	
	tx -= (CW+_PADDING)/2;
	ty -= (CH+_PADDING)/2;
	
	tx = s*tx;
	ty = s*ty;

	tx += (CW+_PADDING)/2;
	ty += (CH+_PADDING)/2;

	tx -= loopy.offsetX;
	ty -= loopy.offsetY;

		// Mutliply by Mouse vector
		// var mx = event.x*s + tx;
		// var my = event.y*s + ty;

	var canvas = _createCanvas();
	var ctx = canvas.getContext("2d");

	subscribe("mousedown", function () {
		self.active = true;
		
		self.mouseXRef = (Mouse.x - tx)/s;
		self.mouseYRef = (Mouse.y - ty)/s;
	})

	subscribe("mouseup", function () {
		self.active = false
	})

	subscribe("mousemove", function () {
		if(window.loopy.tool == Loopy.TOOL_PAN && self.active) {
			var rmx = (Mouse.x - tx)/s;
			var rmy = (Mouse.y - ty)/s;

			self.canvasX += rmx - self.mouseXRef;
			self.canvasY += rmy - self.mouseYRef;

			loopy.canvasX = self.canvasX;
			loopy.canvasY = self.canvasY;

			self.mouseXRef = (Mouse.x - tx)/s;
			self.mouseYRef = (Mouse.y - ty)/s;

			publish("canvas/moved");
		}
	})
}
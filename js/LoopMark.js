/**************************************

LoopMark!

 *************************************/

LoopMark.defaultOrientation = true;
LoopMark.defaultType = true;
LoopMark.defaultColor = "#666";

function LoopMark(model, config) {
	var self = this;
	self._CLASS_ = "LoopMark";

	// Mah Parents!
	self.loopy = model.loopy;
	self.model = model;
	self.config = config;

	_configureProperties(self, config, {
		x: 0,
		y: 0,
		clockwise: LoopMark.defaultOrientation,
		reinforcement: LoopMark.defaultType,
		color: LoopMark.defaultColor,
	});

	self.draw = function (ctx) {
		// Retina
		var x = self.x * 2;
		var y = self.y * 2;

		ctx.save();
		ctx.translate(x, y);

		ctx.beginPath();

		ctx.strokeStyle = self.color;
		ctx.lineWidth = 4*2;

		ctx.arc(0, 0, 20 * 2, -Math.PI*5/4, Math.PI*2/5, !self.clockwise);

		ctx.stroke();

		ctx.font = "100 " + Label.FONTSIZE + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = self.color;

		if (self.reinforcement) {
			ctx.fillText("R", 0, 0);
		} else {
			ctx.fillText("B", 0, 0);
		}

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
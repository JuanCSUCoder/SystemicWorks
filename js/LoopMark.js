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

		ctx.arc(0, 0, 20 * 2, -Math.PI*5/4, Math.PI*2/5, !self.clockwise);

		ctx.stroke();

		ctx.restore();
	}
}
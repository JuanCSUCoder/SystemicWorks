/**************************************

LoopMark!

 *************************************/

LoopMark.defaultOrientation = 1;
LoopMark.defaultType = 1;

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
		reinforcement: LoopMark.defaultType
	});

	self.draw = function (ctx) {
		
	}
}
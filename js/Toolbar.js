/**********************************

TOOLBAR CODE

**********************************/

function Toolbar(loopy){

	var self = this;

	// Tools & Buttons
	var buttons = [];
	self.buttonsByID = {};
	self.dom = document.getElementById("toolbar");
	self.addButton = function(options){

		var id = options.id;
		var tooltip = options.tooltip;
		var callback = options.callback;

		// Add the button
		var button = new ToolbarButton(self,{
			id: id,
			icon: "css/icons/"+id+".png",
			tooltip: tooltip,
			callback: callback
		});
		self.dom.appendChild(button.dom);
		buttons.push(button);
		self.buttonsByID[id] = button;

		// Keyboard shortcut!
		(function(id){
			subscribe("key/"+id,function(){
				loopy.ink.reset(); // also CLEAR INK CANVAS
				self.buttonsByID[id].callback();
			});
		})(id);

	};

	self.addSeparator = function() {
    var separator = document.createElement("div");
    separator.setAttribute("class", "toolbar_separator");
    separator.style.backgroundImage = "url('css/icons/separator.png')";

    self.dom.appendChild(separator);
  }

	// Select button
	self.selectButton = function(button){
		for(var i=0;i<buttons.length;i++){
			buttons[i].deselect();
		}

		if (loopy.locked) {
			buttons[buttons.length-1].select();
		}

		button.select();
	};

	// Set Tool
	self.currentTool = "drag";
	self.setTool = function(tool){
		self.currentTool = tool;
		var name = "TOOL_"+tool.toUpperCase();
		loopy.tool = Loopy[name];
		document.getElementById("canvasses").setAttribute("cursor",tool);
	};

	// Populate those buttons!
	self.addButton({
		id: "drag",
		tooltip: "MO(V)E",
		callback: function(){
			self.setTool("drag");
		}
	});
	self.addButton({
		id:"pan",
		tooltip: "(P)AN",
		callback: function() {
			self.setTool('pan');
		}
	});
	self.addSeparator();
	self.addButton({
		id: "ink",
		tooltip: "LI(N)KER",
		callback: function(){
			self.setTool("ink");
		}
	});
	self.addButton({
		id: "loop",
		tooltip: "LOOP",
		callback: function () {
			self.setTool("loop");
		}
	})
	self.addButton({
		id: "label",
		tooltip: "(T)EXT",
		callback: function(){
			self.setTool("label");
		}
	});
	self.addButton({
		id: "erase",
		tooltip: "(E)RASE",
		callback: function(){
			self.setTool("erase");
		}
	});
	self.addSeparator();
	self.addButton({
		id: "lock",
		tooltip: "Press to Lock Edit Tools",
		callback: function () {
			if (loopy.locked) {
				loopy.locked = false;
			} else {
				loopy.locked = true;
			}
		}
	})

	// Select button
	self.buttonsByID.drag.callback();

	// Return to default
	subscribe("model/changed", function() {
		if (!loopy.locked) {
			self.buttonsByID.drag.callback();
		}
	});

	// Hide & Show

}

function ToolbarButton(toolbar, config){

	var self = this;
	self.id = config.id;

	// Icon
	self.dom = document.createElement("div");
	self.dom.setAttribute("class", "toolbar_button");
	self.dom.style.backgroundImage = "url('"+config.icon+"')";

	// Tooltip!
	self.dom.setAttribute("aria-label", config.tooltip);
	self.dom.setAttribute("data-balloon-pos", "down-left");

	// Selected?
	self.select = function(){
		self.dom.setAttribute("selected", "yes");
	};
	self.deselect = function(){
		self.dom.setAttribute("selected", "no");
	};

	// On Click
	if (config.id=='lock') {
		self.callback = function() {
			config.callback();
			if (loopy.locked) {
				self.select();
			} else {
				self.deselect();
			}
		}
	} else {
		self.callback = function(){
			config.callback();
			toolbar.selectButton(self);
		};
	}
	
	self.dom.onclick = self.callback;

}
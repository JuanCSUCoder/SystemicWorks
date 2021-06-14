/**********************************

TOOLBAR CODE

**********************************/

import { publish, subscribe } from "../js/minpubsub";
import { Loopy } from "../js/helpers";
import { toggleStylesheet } from "../ts/Helpers";

function Toolbar(loopy){

	var self = {};

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
			icon: "assets/nicons/"+id+".svg",
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
    separator.style.backgroundImage = "url('assets/icons/separator.png')";

    self.dom.appendChild(separator);
  }

	// Select button
	self.selectButton = function(button){
		for(var i=0;i<buttons.length;i++){
			buttons[i].deselect();
		}

		if (loopy.locked) {
			this.buttonsByID['lock'].select();
		}

		if (loopy.clonning) {
			this.buttonsByID['clone'].select();
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
		tooltip: "PE(N)CIL",
		callback: function(){
			self.setTool("ink");
		}
	});
	self.addButton({
		id: "loop",
		tooltip: "(L)OOP",
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
		id: "clone",
		tooltip: "Press to Clone Previous Element",
		callback: function () {
			if (loopy.clonning) {
				loopy.clonning = false;
			} else {
				loopy.clonning = true;
			}
		}
	});
	self.addButton({
		id: "mode",
		tooltip: "Press to enable/disable Only Text mode",
		callback: function () {
			if (loopy.onlyText) {
				loopy.onlyText = false;
			} else {
				loopy.onlyText = true;
			}
			publish("model/changed");
		}
	})
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
	});
	self.addSeparator();
	self.addButton({
		id: "fs",
		tooltip: "Return to the Landing Page",
		callback: function () {
			toggleStylesheet("assets/fs.css")
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

	return self;
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
	if (config.id == 'lock') {
		self.callback = function () {
			config.callback();
			if (loopy.locked) {
				self.select();
			} else {
				self.deselect();
			}
		}
	} else if (config.id == 'fs') {
		self.callback = function () {
			config.callback();
		}
	} else if (config.id == 'clone') {
		self.callback = function () {
			config.callback();
			if (loopy.clonning) {
				self.select();
			} else {
				self.deselect();
			}
		}
	} else if (config.id == 'mode') {
		self.callback = function () {
			config.callback();
			if (loopy.onlyText) {
				self.select();
			} else {
				self.deselect();
			}
		}
	} else {
		self.callback = function () {
			config.callback();
			toolbar.selectButton(self);
		};
	}
	
	self.dom.onclick = self.callback;

}

export default Toolbar;
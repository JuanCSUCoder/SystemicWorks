/**********************************

SIDEBAR CODE

**********************************/

import PageUI from './PageUI';
import { publish, subscribe } from "../js/minpubsub";
import { _createButton, _createLabel, _createInput, _createPicker, _addMouseEvents } from "./helpers";
import LoopMark from './LoopMark';
import Edge from './Edge';

function Sidebar(loopy){

	var self = PageUI(document.getElementById("sidebar"));

	// Edit
	self.edit = function(object){
		self.showPage(object._CLASS_);
		self.currentPage.edit(object);
	};

	// Go back to main when the thing you're editing is killed
	subscribe("kill",function(object){
		if(self.currentPage.target==object){
			self.showPage("Edit");
		}
	});

	////////////////////////////////////////////////////////////////////////////////////////////
	// ACTUAL PAGES ////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////

	// Node!
	(function(){
		var page = new SidebarPage(self);
		page.addComponent("label", new ComponentInput({
			label: "Name:"
			//label: "Name:"
		}));
		page.addComponent("hue", new ComponentColorPicker({
			label: "Color:",
		}));
		page.addComponent("init", new ComponentSlider({
			bg: "initial",
			label: "Start Amount:",
			options: [0, 0.16, 0.33, 0.50, 0.66, 0.83, 1],
			//options: [0, 1/6, 2/6, 3/6, 4/6, 5/6, 1],
			oninput: function(value){
				Node.defaultValue = value;
			}
		}));
		page.onedit = function(){

			// Set color of Slider
			var node = page.target;
			var color = node.hue;
			page.getComponent("init").setBGColor(color);

			// Focus on the name field IF IT'S "" or "?"
			var name = node.label;
			if(name=="" || name=="?") page.getComponent("label").select();

		};
		page.addComponent(new ComponentButton({
			label: "delete node",
			//label: "delete circle",
			onclick: function(node){
				node.kill();
				self.showPage("Edit");
			}
		}));
		self.addPage("Node", page);
	})();

	// Edge!
	(function(){
		var page = new SidebarPage(self);
		page.addComponent("strength", new ComponentSlider({
			bg: "strength",
			label: "Relationship:",
			//label: "Relationship:",
			options: [1, -1],
			oninput: function(value){
				Edge.defaultStrength = value;
			}
		}));
		page.addComponent("delay", new ComponentSlider({
			bg: "delay",
			label: "Delay: ",
			options: [0, 1],
			oninput: function (value) {
				Edge.defaultDelay = value;
			}
		}))
		page.addComponent("color", new ComponentColorPicker({
			label: "Color: "
		}))
		page.addComponent(
      "thickness",
      new ComponentSlider({
        bg: "initial",
        label: "Thickness:",
        options: [3, 4, 5, 6, 7, 8, 9],
        oninput: function (value) {
          Node.defaultValue = value;
        },
      })
		);
		page.onedit = function () {
      // Set color of Slider
      var edge = page.target;
      var color = edge.color;
      page.getComponent("thickness").setBGColor(color);
    };
		page.addComponent(new ComponentButton({
			//label: "delete edge",
			label: "delete arrow",
			//label: "delete relationship",
			onclick: function(edge){
				edge.kill();
				self.showPage("Edit");
			}
		}));
		self.addPage("Edge", page);
	})();

	// Label!
	(function(){
		var page = new SidebarPage(self);
		page.addComponent("text", new ComponentInput({
			label: "Label:",
			//label: "Label:",
			textarea: true
		}));
		page.addComponent("color", new ComponentColorPicker({
			label: "Color:",
		}));
		page.onshow = function(){
			// Focus on the text field
			page.getComponent("text").select();
		};
		page.onhide = function(){
			
			// If you'd just edited it...
			var label = page.target;
			if(!page.target) return;

			// If text is "" or all spaces, DELETE.
			var text = label.text;
			if(/^\s*$/.test(text)){
				// that was all whitespace, KILL.
				page.target = null;
				label.kill();
			}

		};
		page.addComponent(new ComponentButton({
			label: "delete label",
			onclick: function(label){
				label.kill();
				self.showPage("Edit");
			}
		}));
		self.addPage("Label", page);
	})();

	// LoopMark
	(function () {
		var page = new SidebarPage(self);

		page.addComponent("clockwise", new ComponentSlider({
			bg: "delay",
			label: "Clockwise: ",
			options: [0, 1],
			oninput: function (value) {
				LoopMark.defaultOrientation = value;
			}
		}));

		page.addComponent(
      "reinforcement",
      new ComponentSlider({
        bg: "delay",
        label: "Reinforcement: ",
        options: [0, 1],
        oninput: function (value) {
          LoopMark.defaultOrientation = value;
        },
      })
		);
		
		page.addComponent("color", new ComponentColorPicker({
			label: "Color: ",
		}))

		self.addPage("LoopMark", page);
	})();

	// Edit
	(function(){
		var page = new SidebarPage();
		page.addComponent(new ComponentHTML({
			html: ""+
			
			"<b style='font-size:1.4em'>About ...</b> <br>"+
			"Build: v1.3.1 - <strong>Alpha</strong><br>" +
			"an advanced and free tool for thinking in systems<br><br>" +
			"<font size='3'><strong>License:</strong> GPLv3</font>"+

			"<hr/><br>"+

			"<span class='mini_button' onclick='window.publish(\"modal\",[\"save_link\"])'>Save as Link</span> <br><br>"+
			"<span class='mini_button' onclick='window.publish(\"export/file\")'>Save as File</span> <br><br>"+
			"<span class='mini_button' onclick='window.publish(\"import/file\")'>Load from File</span> <br><br>" +
			"<a class='mini_button' href='./report'>Report a Bug</a> <br><br>" +
			"<a class='mini_button' href='https://github.com/JCSUCoder/SystemicWorks'>Source Code</a> <br><br>" +
			"<a class='mini_button' href='https://github.com/JCSUCoder/SystemicWorks/blob/main/LICENSE'>License</a> <br><br>" +

			"<hr/><br>"+
				
			"<span>SystemicWorks</span> is "+
			"made by <a target='_blank' href='https://github.com/JCSUCoder'>JCSUCoder</a> based on the <a target='_blank' href='https://ncase.me/loopy/'>LOOPY(v1.1)</a> project of <a target='_blank' href='http://ncase.me'>nicky case</a> "

		}));
		self.addPage("Edit", page);
	})();

	// Ctrl-S to SAVE
	subscribe("key/save",function(){
		if(Key.control){ // Ctrl-S or ⌘-S
			publish("modal",["save_link"]);
		}
	});

	return self;
}

function SidebarPage(pageui){

	// TODO: be able to focus on next component with an "Enter".
	var self = this;
	self.target = null;

	// DOM
	self.dom = document.createElement("div");
	self.show = function(){ self.dom.style.display="block"; self.onshow(); };
	self.hide = function () { self.dom.style.display = "none"; self.onhide(); };
	var append_to = self.dom;

	// Components
	self.components = [];
	self.componentsByID = {};
	self.addComponent = function(propName, component){

		// One or two args
		if(!component){
			component = propName;
			propName = "";
		}

		component.page = self; // tie to self
		component.propName = propName; // tie to propName
		append_to.appendChild(component.dom); // add to DOM

		// remember component
		self.components.push(component);
		self.componentsByID[propName] = component;

		// return!
		return component;

	};
	self.getComponent = function(propName){
		return self.componentsByID[propName];
	};

	// Edit
	self.edit = function(object){

		// New target to edit!
		self.target = object;

		// Show each property with its component
		for(var i=0;i<self.components.length;i++){
			self.components[i].show();
		}

		// Callback!
		self.onedit();
	};

	if (pageui) {
		// Return Button
		self.addComponent(new ComponentButton({
			header: true,
			label: "Go Back",
			onclick: function () {
				pageui.showPage("Edit");
			}
		}));
	}

	// Create Form Container
	append_to = document.createElement("div");
	append_to.classList.add("form_container");
	self.dom.appendChild(append_to);

	// TO IMPLEMENT: callbacks
	self.onedit = function(){};
	self.onshow = function(){};
	self.onhide = function(){};

	// Start hiding!
	self.hide();

}



/////////////////////////////////////////////////////////////////////////////////////////////
// COMPONENTS ///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function Component(){
	var self = this;
	self.dom = null;
	self.page = null;
	self.propName = null;
	self.show = function(){
		// TO IMPLEMENT
	};
	self.getValue = function(){
		return self.page.target[self.propName];
	};
	self.setValue = function(value){
		
		// Model's been changed!
		publish("model/changed");

		// Edit the value!
		self.page.target[self.propName] = value;
		self.page.onedit(); // callback!
		
	};
}

export function ComponentInput(config){

	// Inherit
	var self = this;
	Component.apply(self);

	// DOM: label + text input
	self.dom = document.createElement("div");
	var label = _createLabel(config.label);
	var className = config.textarea ? "component_textarea" : "component_input";
	var input = _createInput(className, config.textarea);
	input.oninput = function(event){
		self.setValue(input.value);
	};
	self.dom.appendChild(label);
	self.dom.appendChild(input);

	// Show
	self.show = function(){
		input.value = self.getValue();
	};

	// Select
	self.select = function(){
		setTimeout(function(){ input.select(); },10);
	};

}

export function ComponentColorPicker(config) {

	// Inherit
	var self = this;
	Component.apply(self);

	self.dom = document.createElement("div");
	var label = _createLabel(config.label);
	var className = "component_input";
	var input = _createPicker(className);
	input.oninput = function(event){
		self.setValue(input.value);
	};
	self.dom.appendChild(label);
	self.dom.appendChild(input);

	// Show
	self.show = function(){
		input.value = self.getValue();
	};

	// Select
	self.select = function(){
		setTimeout(function(){ input.select(); },10);
	};
}

export function ComponentSlider(config){

	// Inherit
	var self = this;
	Component.apply(self);

	// TODO: control with + / -, alt keys??

	// DOM: label + slider
	self.dom = document.createElement("div");
	var label = _createLabel(config.label);
	self.dom.appendChild(label);
	var sliderDOM = document.createElement("div");
	sliderDOM.setAttribute("class","component_slider");
	self.dom.appendChild(sliderDOM);

	// Slider DOM: graphic + pointer
	var slider = new Image();
	slider.draggable = false;
	slider.src = "assets/sliders/"+config.bg+".png";
	slider.setAttribute("class","component_slider_graphic");
	var pointer = new Image();
	pointer.draggable = false;
	pointer.src = "assets/sliders/slider_pointer.png";
	pointer.setAttribute("class","component_slider_pointer");
	sliderDOM.appendChild(slider);
	sliderDOM.appendChild(pointer);
	var movePointer = function(){
		var value = self.getValue();
		var optionIndex = config.options.indexOf(value);
		var x = (optionIndex+0.5) * (250/config.options.length);
		pointer.style.left = (x-7.5)+"px";
	};

	// On click... (or on drag)
	var isDragging = false;
	var onmousedown = function(event){
		isDragging = true;
		sliderInput(event);
	};
	var onmouseup = function(){
		isDragging = false;
	};
	var onmousemove = function(event){
		if(isDragging) sliderInput(event);
	};
	var sliderInput = function(event){

		// What's the option?
		var index = event.x/250;
		var optionIndex = Math.floor(index*config.options.length);
		var option = config.options[optionIndex];
		if(option===undefined) return;
		self.setValue(option);

		// Callback! (if any)
		if(config.oninput){
			config.oninput(option);
		}

		// Move pointer there.
		movePointer();

	};
	_addMouseEvents(slider, onmousedown, onmousemove, onmouseup);

	// Show
	self.show = function(){
		movePointer();
	};

	// BG Color!
	self.setBGColor = function(color){
		slider.style.background = color;
	};

}

export function ComponentButton(config){

	// Inherit
	var self = this;
	Component.apply(self);

	// DOM: just a button
	self.dom = document.createElement("div");
	var button = _createButton(config.label, function(){
		config.onclick(self.page.target);
	});
	self.dom.appendChild(button);

	// Unless it's a HEADER button!
	if(config.header){
		button.setAttribute("header","yes");
	}

}

export function ComponentHTML(config){

	// Inherit
	var self = this;
	Component.apply(self);

	// just a div
	self.dom = document.createElement("div");
	self.dom.innerHTML = config.html;

}

export function ComponentOutput(config){

	// Inherit
	var self = this;
	Component.apply(self);

	// DOM: just a readonly input that selects all when clicked
	self.dom = _createInput("component_output");
	self.dom.setAttribute("readonly", "true");
	self.dom.onclick = function(){
		self.dom.select();
	};

	// Output the string!
	self.output = function(string){
		self.dom.value = string;
	};

}

export default Sidebar;
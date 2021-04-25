/**********************************

LOOPY!
- with edit & play mode

**********************************/

// DEPRECATED

Loopy.MODE_EDIT = 0;
Loopy.MODE_PLAY = 1;

Loopy.TOOL_INK = 0;
Loopy.TOOL_DRAG = 1;
Loopy.TOOL_ERASE = 2;
Loopy.TOOL_LABEL = 3;
Loopy.TOOL_PAN = 4;
Loopy.TOOL_LOOP = 5;

function Loopy(config){

	var self = this;
	self.config = config;

	// Loopy: EMBED???
	self.embedded = _getParameterByName("embed");
	self.embedded = !!parseInt(self.embedded); // force to Boolean

	// Offset & Scale?!?!
	self.offsetX = 0;
	self.offsetY = 0;
	self.offsetScale = 1;

	// Panning
	self.initialCanvasX = 0;
	self.initialCanvasY = 0;

	// Mouse
	Mouse.init(document.getElementById("canvasses")); // TODO: ugly fix, ew
	
	// Model
	self.model = new Model(self);

	// Loopy: SPEED!
	self.signalSpeed = 3;

	// Sidebar
	self.sidebar = new Sidebar(self);
	self.sidebar.showPage("Edit"); // start here

	// Play/Edit mode
	self.mode = Loopy.MODE_EDIT;

	// Tools
	self.toolbar = new Toolbar(self);
	self.tool = Loopy.TOOL_DRAG;
	self.ink = new Ink(self);
	self.drag = new Dragger(self);
	self.erase = new Eraser(self);
	self.label = new Labeller(self);
	self.pan = new Pan(self);
	self.loop = new Loop(self);

	// Tools Lock
	self.locked = false;

	// Play Controls
	self.playbar = new PlayControls(self);
	self.playbar.showPage("Editor"); // start here

	// Modal
	self.modal = new Modal(self);

	//////////
	// INIT //
	//////////

	self.init = function(){
		self.loadFromURL(); // try it.
	};

	///////////////////
	// UPDATE & DRAW //
	///////////////////

	// Update
	self.update = function(){
		Mouse.update();
		if(self.wobbleControls>=0) self.wobbleControls--; // wobble
		if(!self.modal.isShowing){ // modAl
			self.model.update(); // modEl
		}
	};
	setInterval(self.update, 1000/30); // 30 FPS, why not.

	// Draw
	self.draw = function(){
		if(!self.modal.isShowing){ // modAl
			self.model.draw(); // modEl
		}
		requestAnimationFrame(self.draw);
	};

	// TODO: Smarter drawing of Ink, Edges, and Nodes
	// (only Nodes need redrawing often. And only in PLAY mode.)

	//////////////////////
	// PLAY & EDIT MODE //
	//////////////////////

	self.showPlayTutorial = false;
	self.wobbleControls = -1;
	self.setMode = function(mode){

		self.mode = mode;
		publish("loopy/mode");

		// Play mode!
		if(mode==Loopy.MODE_PLAY){
			self.toolbar.buttonsByID["drag"].callback();
			self.showPlayTutorial = true; // show once!
			if(!self.embedded) self.wobbleControls=45; // only if NOT embedded
			self.sidebar.showPage("Edit");
			self.playbar.showPage("Player");
			self.sidebar.dom.setAttribute("mode","play");
			self.toolbar.dom.setAttribute("mode","play");
			document.getElementById("canvasses").removeAttribute("cursor"); // TODO: EVENT BASED
		}else{
			publish("model/reset");
		}

		// Edit mode!
		if(mode==Loopy.MODE_EDIT){
			self.showPlayTutorial = false; // donezo
			self.wobbleControls = -1; // donezo
			self.sidebar.showPage("Edit");
			self.playbar.showPage("Editor");
			self.sidebar.dom.setAttribute("mode","edit");
			self.toolbar.dom.setAttribute("mode","edit");
			document.getElementById("canvasses").setAttribute("cursor", self.toolbar.currentTool); // TODO: EVENT BASED
		}

	};

	/////////////////
	// SAVE & LOAD //
	/////////////////

	self.dirty = false;

	// YOU'RE A DIRTY BOY
	subscribe("model/changed", function(){
		if(!self.embedded) self.dirty = true;
	});

	subscribe("export/file", function(){
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + self.model.serialize());
		element.setAttribute('download', "system_model.loopy");

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	});

	subscribe("import/file", function(){
		let input = document.createElement('input');
		input.type = 'file';
		input.onchange = e => {
			var file = e.target.files[0];
			var reader = new FileReader();
			reader.readAsText(file,'UTF-8');
			reader.onload = readerEvent => {
				var content = readerEvent.target.result;
				self.model.deserialize(content);
			}
		};
		input.click();
	});

	self.saveToURL = function(embed){

		// Create link
		var dataString = self.model.serialize();
		var uri = dataString; // encodeURIComponent(dataString);
		var base = window.location.origin + window.location.pathname;
		var historyLink = base+"?data="+uri;
		var link;
		if(embed){
			link = base+"?embed=1&data="+uri;
		}else{
			link = historyLink;
		}

		// NO LONGER DIRTY!
		self.dirty = false;

		// PUSH TO HISTORY
		window.history.replaceState(null, null, historyLink);

		return link;
	};
	
	// "BLANK START" DATA:
	var _blankData =
    "[[[4,243,337,0.33,%22Actions%22,%22%25230b72e0%22,46],[7,525,329,0.5,%22Results%22,%22%2523c507df%22,55],[9,819,325,0,%22Slowing%2520Action%22,%22%2523d51010%22,48]],[[7,9,141,1,0,7,%22%2523c72323%22,0],[7,4,-155,1,0,7,%22%25233450b7%22,0],[9,7,152,-1,0,3,%22%2523c72323%22,1],[4,7,-149,1,0,5,%22%25233450b7%22,0]],[[531,165,%22Limits%2520to%2520Growth%22,%22%2523000000%22]],9,[[679,330,1,0,%22%2523c72323%22],[382,332,0,1,%22%25233450b7%22]]%5D";

	self.loadFromURL = function(){
		var data = _getParameterByName("data");
		if(!data) data=decodeURIComponent(_blankData);
		self.model.deserialize(data);
	}; 


	///////////////////////////
	//////// EMBEDDED? ////////
	///////////////////////////

	self.init();

	// NOT DIRTY, THANKS
	self.dirty = false;

	// SHOW ME, THANKS
	document.body.style.opacity = "";

	// GO.
	requestAnimationFrame(self.draw);


}
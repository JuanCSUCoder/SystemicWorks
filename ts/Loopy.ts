import Mouse from "./Mouse";
import Model from "./Model";
import Sidebar from "./bars/Sidebar";
import Toolbar from "./bars/Toolbar";
import Ink from "./tools/Ink";
import Drag from "./tools/Drag";
import Erase from "./tools/Erase";
import Labeller from "./tools/Labeller";
import Pan from "./tools/Pan";
import Loop from "./tools/Loop";
import Playbar from "./bars/Playbar";
import Modal from "./bars/Modal";
import { _getParameterByName } from "./Helpers";
import * as MinPubSub from "./../js/minpubsub";

enum LoopyMode {
	Edit = 0,
	Play = 1,
}

enum LoopyTool {
	Ink = 0,
	Drag = 1,
	Erase = 2,
	Label = 3,
	Pan = 4,
	Loop = 5,
}

export default class Loopy {
	offsetX = 0;
	offsetY = 0;
	offsetScale = 1;

	initialCanvasX = 0;
	initialCanvasY = 0;

	signalSpeed = 3;
	mode = LoopyMode.Edit;
	tool = LoopyTool.Drag;
	tools_locked = false;
	dirty = false;
	wobbleControls = -1;

	mouseControl: Mouse;
	model: Model;

	sidebar: Sidebar;
	toolbar: Toolbar;
	playbar: Playbar;
	modal: Modal;

	ink: Ink;
	drag: Drag;
	erase: Erase;
	labeller: Labeller;
	pan: Pan;
	loop: Loop;

	_blankData =
		"[[[4,243,337,0.33,%22Actions%22,%22%25230b72e0%22,46],[7,525,329,0.5,%22Results%22,%22%2523c507df%22,55],[9,819,325,0,%22Slowing%2520Action%22,%22%2523d51010%22,48]],[[7,9,141,1,0,7,%22%2523c72323%22,0],[7,4,-155,1,0,7,%22%25233450b7%22,0],[9,7,152,-1,0,3,%22%2523c72323%22,1],[4,7,-149,1,0,5,%22%25233450b7%22,0]],[[531,165,%22Limits%2520to%2520Growth%22,%22%2523000000%22]],9,[[679,330,1,0,%22%2523c72323%22],[382,332,0,1,%22%25233450b7%22]]%5D";

	constructor() {
		this.mouseControl = new Mouse(document.getElementById("canvasses"));
		this.model = new Model(this);

		this.sidebar = new Sidebar(this);
		this.toolbar = new Toolbar(this);
		this.playbar = new Playbar(this);
		this.modal = new Modal(this);

		this.ink = new Ink(this);
		this.drag = new Drag(this);
		this.erase = new Erase(this);
		this.labeller = new Labeller(this);
		this.pan = new Pan(this);
		this.loop = new Loop(this);

		this.playbar.showPage("Editor");
		setInterval(this.update, 1000 / 30);
	}

	init() {
		var data = _getParameterByName("data");
		if (!data) {
			data = decodeURIComponent(this._blankData);
		}

		this.model.deserialize(data);
	}

	update() {
		this.mouseControl.update();

		if (this.wobbleControls>=0) {
			this.wobbleControls--;
		}

		if (!this.modal.isShowing) {
			this.model.update();
		}
	}

	draw() {
		if (!this.modal.isShowing) {
			this.model.draw();
		}

		requestAnimationFrame(this.draw);
	}

	setMode(mode: LoopyMode) {
		this.mode = mode;
		MinPubSub.publish("loopy/mode");

		// Play Mode
		if (mode == LoopyMode.Play) {
			this.toolbar.buttonsByID["drag"].callback();

			this.wobbleControls = 45;
			
			this.sidebar.showPage("Edit");
			this.playbar.showPage("Player");
			
			this.sidebar.dom?.setAttribute("mode", "play");
			this.playbar.dom?.setAttribute("mode", "play");
		}
	}
}
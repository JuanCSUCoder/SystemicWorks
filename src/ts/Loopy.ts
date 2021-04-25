import Mouse from "../js/Mouse";
import Sidebar from "../js/Sidebar";
import Toolbar from "../js/Toolbar";
import Ink from "../js/Ink";
import Drag from "../js/Dragger";
import Erase from "../js/Eraser";
import Labeller from "../js/Labeller";
import Pan from "../js/Pan";
import Loop from "../js/Loop";
import Playbar from "../js/PlayControls";
import Modal from "../js/Modal";

import Model from "./Model";
import { _getParameterByName, _tool2String } from "./Helpers";
import * as MinPubSub from "../js/minpubsub";
import { publish, subscribe } from "../js/minpubsub";

export enum LoopyMode {
	Edit = 0,
	Play = 1,
}

export enum LoopyTool {
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

	mouseControl: any;
	model: Model;

	sidebar: any;
	toolbar: any;
	playbar: any;
	modal: Modal;

	ink: Ink;
	drag: Drag;
	erase: Erase;
	labeller: Labeller;
	pan: Pan;
	loop: any;

	_blankData =
		"[[[4,243,337,0.33,%22Actions%22,%22%25230b72e0%22,46],[7,525,329,0.5,%22Results%22,%22%2523c507df%22,55],[9,819,325,0,%22Slowing%2520Action%22,%22%2523d51010%22,48]],[[7,9,141,1,0,7,%22%2523c72323%22,0],[7,4,-155,1,0,7,%22%25233450b7%22,0],[9,7,152,-1,0,3,%22%2523c72323%22,1],[4,7,-149,1,0,5,%22%25233450b7%22,0]],[[531,165,%22Limits%2520to%2520Growth%22,%22%2523000000%22]],9,[[679,330,1,0,%22%2523c72323%22],[382,332,0,1,%22%25233450b7%22]]%5D";

	constructor() {
		this.mouseControl = Mouse.init(this, document.getElementById("canvasses"));
		this.model = new Model(this);

		this.sidebar = Sidebar(this);
		this.toolbar = Toolbar(this);
		this.playbar = Playbar(this);
		this.modal = Modal(this);

		this.ink = Ink(this);
		this.drag = Drag(this);
		this.erase = Erase(this);
		this.labeller = Labeller(this);
		this.pan = Pan(this);
		this.loop = Loop(this);

		this.playbar.showPage("Editor");
		setInterval(this.update, 1000 / 30);

		subscribe("model/changed", () => {
			this.dirty = true;
		});

		subscribe("export/file", () => {
			let element = document.createElement("a");

			element.setAttribute("href", "data:text/plain;charset=utf-8," + this.model.serialize());
			element.setAttribute("download", "system_model.smwks");

			element.style.display = "none";
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		});

		subscribe("import/file", () => {
			let input: HTMLInputElement = document.createElement("input");

			input.type = "file";
			input.onchange = (e: Event) => {
				let file = (e.target as HTMLInputElement).files![0];

				let reader = new FileReader();
				reader.readAsText(file, "UTF-8");
				reader.onload = readerEvent => {
					var content = readerEvent.target?.result;
					this.model.deserialize(content as string);
				};
			};

			input.click();
		});

		this.init();
		this.dirty = false;

		document.body.style.opacity = "";

		requestAnimationFrame(this.draw);
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

		if (this.wobbleControls >= 0) {
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

			document.getElementById("canvasses")?.removeAttribute("cursor");
		} else {
			MinPubSub.publish("model/reset");
		}

		if (mode == LoopyMode.Edit) {
			this.wobbleControls = -1;

			this.sidebar.showPage("Edit");
			this.playbar.showPage("Editor");

			this.sidebar.dom?.setAttribute("mode", "edit");
			this.playbar.dom?.setAttribute("mode", "edit");

			document.getElementById("canvasses")?.setAttribute("cursor", _tool2String(this.toolbar.currentTool) as string);
		}
	}

	saveToURL(): string {
		let dataString = this.model.serialize();
		let uri = dataString;

		let base = window.location.origin + window.location.pathname;
		let link = base + "?data=" + uri;

		this.dirty = false;

		window.history.replaceState(null, "", link);

		return link;
	}
}
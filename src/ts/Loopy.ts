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
  version = [2, 0, 0];

  offsetX = 0;
  offsetY = 0;
  offsetScale = 1;

  initialCanvasX = 0;
  initialCanvasY = 0;

  signalSpeed = 3;
  mode = LoopyMode.Edit;
  tool = LoopyTool.Drag;
  tools_locked = false;
  clonning = false;
  dirty = false;
	wobbleControls = -1;
	onlyText = false;
	temp_onlyText = false;

  mouseControl: any;
  model: Model;

  sidebar: any;
  toolbar: any;
  playbar: any;
  modal: any;

  ink: any;
  drag: any;
  erase: any;
  labeller: any;
  pan: any;
  loop: any;

  _blankData =
    "[2,0,0]'[[[4,73,250,0.33,%22Actions%22,%22%25230b72e0%22,31,20],[7,315,250,0.5,%22Results%22,%22%2523c507df%22,59,20],[9,554,250,0,%22Slowing%2520Action%22,%22%2523d51010%22,31,20]],[[7,9,120,1,0,7,%22%2523c72323%22,0],[7,4,130,1,0,7,%22%25233450b7%22,0],[9,7,114,-1,0,3,%22%2523c72323%22,1],[4,7,117,1,0,5,%22%25233450b7%22,0]],[[302,93,%22Limits%2520to%2520Growth%22,%22%2523000000%22]],9,[[433,250,1,0,%22%2523c72323%22],[172,250,0,1,%22%25233450b7%22]]%5D";

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

    this.sidebar.showPage("Edit");
    this.playbar.showPage("Editor");

    subscribe("model/changed", () => {
      this.dirty = true;
    });

    subscribe("export/file", () => {
      let element = document.createElement("a");

      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + this.model.serialize()
      );
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
        let target = e.target as HTMLInputElement;
        let file = target.files![0];

        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (readerEvent) => {
          var content = readerEvent.target?.result;
          this.model.deserialize(content as string, target.value);
        };
      };

      input.click();
		});
		
		subscribe("file/loaded", (data: string) => {
      this.model.deserialize(data, "default.smwks");
		});
		
		subscribe("wheel", (delta: number) => {
			let weight = 40;

			if (window.Key.alt || window.Key.shift || window.Key.control) {
				if (window.Key.alt) {
					this.offsetY += delta * weight;
					publish("canvas/moved");
				} else {
					this.offsetX += delta * weight;
          publish("canvas/moved");
				}
			} else {
				if (delta > 0) {
          for (let i = 0; i < delta; i++) {
            this.offsetScale *= 1.1;
            publish("canvas/moved");
          }
        } else {
          for (let i = 0; i < Math.abs(delta); i++) {
            this.offsetScale *= 0.9;
            publish("canvas/moved");
          }
        }
			}
		});

    // Bind this to functions
    this.init = this.init.bind(this);
    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);
    this.setMode = this.setMode.bind(this);
    this.saveToURL = this.saveToURL.bind(this);

    // Start Application Modules
    setInterval(this.update, 1000 / 30);

    this.init();
    this.dirty = false;

    document.body.style.opacity = "";

    requestAnimationFrame(this.draw);
  }

	init() {
		let data = _getParameterByName("data");
    if (!data) {
      data = decodeURIComponent(this._blankData);
		}
		
		this.model.deserialize(data, "default.smwks");

		// File Handling API (unstable):
		// if ('launchQueue' in window) {
		// 	console.log("The File Handling API is supported!!");

		// 	window.launchQueue.setConsumer((launchParams: any) => {

    //     // Nothing to do when the queue is empty.
    //     if (!launchParams.files.length) {
    //       return;
		// 		}

		// 		const myFile = launchParams.files[0];
		// 		var getmeta = myFile.getMetadata();

    //     getmeta.onsuccess = function () {
    //       var size = this.result.size;

    //       // The reading operation will start with the byte at index 0 in the file
    //       myFile.location = 0;

    //       // Start a reading operation for the whole file content
    //       var reading = myFile.readAsText(size);

		// 			reading.onsuccess = function () {
		// 				publish("file/loaded", [this.result]);
    //       };

    //       reading.onerror = function () {
    //         console.log(
    //           "Something went wrong in the reading process: " + this.error
    //         );
    //       };
    //     };
    //   });
    // }
  }

  update() {
    this.mouseControl.update();

    if (this.wobbleControls >= 0) {
      this.wobbleControls--;
    }

    if (!this.modal.isShowing) {
      this.model.update();
		}
		
		this.offsetScale = Math.min(Math.max(0.125, this.offsetScale), 4);
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
			this.temp_onlyText = this.onlyText;
			if (this.temp_onlyText) this.toolbar.buttonsByID["mode"].callback();
      this.toolbar.buttonsByID["pan"].callback();

      this.wobbleControls = 45;

      this.sidebar.showPage("Edit");
      this.playbar.showPage("Player");

      this.sidebar.dom?.setAttribute("mode", "play");
      this.toolbar.dom?.setAttribute("mode", "play");
      this.playbar.dom?.setAttribute("mode", "play");

      document.getElementById("canvasses")?.removeAttribute("cursor");
    } else {
      MinPubSub.publish("model/reset");
    }

    if (mode == LoopyMode.Edit) {
			this.wobbleControls = -1;
			if (this.onlyText != this.temp_onlyText) this.toolbar.buttonsByID["mode"].callback();

      this.sidebar.showPage("Edit");
      this.playbar.showPage("Editor");

      this.sidebar.dom?.setAttribute("mode", "edit");
      this.toolbar.dom?.setAttribute("mode", "edit");
      this.playbar.dom?.setAttribute("mode", "edit");

      document
        .getElementById("canvasses")
        ?.setAttribute(
          "cursor",
          _tool2String(this.toolbar.currentTool) as string
        );
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

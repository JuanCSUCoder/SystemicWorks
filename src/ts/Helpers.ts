import { subscribe } from "../js/minpubsub";
import { LoopyTool } from "./Loopy";

export function _getParameterByName(param_name: string): string | null {
	const query = window.location.search;
	const params = new URLSearchParams(query);
	const final_result = params.get(param_name);

  return final_result;
}

export interface Dictionary<Type> {
  [key: string]: Type;
  [key: number]: Type;
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export let _PADDING = 25;
export let _PADDING_BOTTOM = 110;

export function _tool2String(toolEnum: LoopyTool): string | null {
  switch (toolEnum) {
    case LoopyTool.Drag:
      return "drag";
      break;

    case LoopyTool.Erase:
      return "erase";
      break;

    case LoopyTool.Ink:
      return "ink";
      break;

    case LoopyTool.Label:
      return "label";
      break;

    case LoopyTool.Loop:
      return "loop";
      break;

    case LoopyTool.Pan:
      return "pan";
      break;

    default:
      return null;
      break;
  }
}

export function _createCanvas() {
  var canvasses: HTMLDivElement = document.getElementById(
    "canvasses"
  ) as HTMLDivElement;
  var canvas: HTMLCanvasElement = document.createElement("canvas");

  _onResize(canvasses, canvas);

  canvasses.appendChild(canvas);

  subscribe("resize", () => {
    _onResize(canvasses, canvas);
  });

  return canvas;
}

export function _onResize(
  canvasses: HTMLDivElement,
  canvas: HTMLCanvasElement
) {
  let width = canvasses.clientWidth;
  let height = canvasses.clientHeight;

  canvas.width = width * 2;
  canvas.height = height * 2;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
}

export let HueColors = [
  "#EA3E3E", // red
  "#EA9D51", // orange
  "#FEEE43", // yellow
  "#BFEE3F", // green
  "#7FD4FF", // blue
  "#A97FFF", // purple
];

export function toggleStylesheet(href: string, onoff?: boolean | undefined) {
	var existingNode; //get existing stylesheet node if it already exists
	
  for (var i = 0; i < document.styleSheets.length; i++) {
    if (
      document.styleSheets[i].href &&
      document.styleSheets[i].href.indexOf(href) > -1
    )
      existingNode = document.styleSheets[i].ownerNode;
	}
	
	if (onoff == undefined) onoff = !existingNode; //toggle on or off if undefined
	
  if (onoff) {
    //TURN ON:
    if (existingNode) return onoff; //already exists so cancel now
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    document.getElementsByTagName("head")[0].appendChild(link);
  } else {
    //TURN OFF:
    if (existingNode) existingNode.parentNode.removeChild(existingNode);
	}
	
  return onoff;
}

type RectSize = {
	width: number;
	height: number;
}

export function _fixTextInBox(text: string, ctx: CanvasRenderingContext2D, box_size: RectSize) {
	let parag = [text];
	let font_size: number = 60;
	ctx.font = font_size + "px sans-serif";	

	while (_measureWidth(parag, font_size, ctx) > box_size.width || _measureHeight(parag.length, font_size) > box_size.height) {
		if (_measureHeight(parag.length, font_size) <= box_size.height) {
			let separation: SeparationResult = _separateText(parag);

			if (!separation.success) {
				font_size--;
        ctx.font = font_size + "px sans-serif";
			} else {
				parag = separation.paragraph;
			}
		} else {
			font_size--;
      ctx.font = font_size + "px sans-serif";
		}
	}
	_writeParagraph(parag, font_size, ctx);
}

type SeparationResult = {
	paragraph: string[];
	success: boolean;
};

function _separateText(paragraph: string[]): SeparationResult {
	let new_parag: string[] = [];
	let success: boolean = false;

	paragraph.forEach(line => {
		if (_isTextSeparable(line)) {
			let separated: string[] = _separateLine(line);

			new_parag.push(separated[0]);
			new_parag.push(separated[1]);

			success = true;
		} else {
			new_parag.push(line);
		}
	});

	return {
		paragraph: new_parag,
		success: success,
	};
}

function _separateLine(text_line: string): string[] {
	let splited = text_line.split(" ");

	let result: string[] = ["", ""];

	for (let i = 0; i < Math.round(splited.length / 2); i++) {
		const part = splited[i];
		result[0] += part + " ";
	}
	
	for (let i = Math.round(splited.length / 2); i < splited.length; i++) {
		const part = splited[i];
		result[1] += part + " ";
	}

	result[0] = result[0].slice(0, -1);
	result[1] = result[1].slice(0, -1);

	return result;
}

function _measureWidth(paragraph: string[], font_size: number, ctx: CanvasRenderingContext2D): number {
	let max_width = 0;

	ctx.save();
	ctx.font = font_size + "px sans-serif";

	paragraph.forEach(line => {
		let w = ctx.measureText(line).width;

		if (w > max_width) {
			max_width = w;
		}
	});

	ctx.restore();

	return max_width;
}

function _measureHeight(rows: number, font_size: number): number {
	return rows * font_size;
}

export function _writeParagraph(paragraph: string[], font_size: number, ctx: CanvasRenderingContext2D) {
	let vert_offset = 0;
	let height = paragraph.length * font_size;

	ctx.save();

	ctx.textBaseline = "top";
	ctx.translate(0, - height / 2);

	ctx.font = font_size + "px sans-serif";

	paragraph.forEach(line => {
		ctx.fillText(line, 0, vert_offset);
		vert_offset += font_size;
	});

	ctx.restore();
}

function _isTextSeparable(text: string): boolean {
	return text.includes(" ");
}

export function _crop(canvas: HTMLCanvasElement, offsetX: number, offsetY: number, width: number, height: number, margin: number, callback?: Function) {
	// Debug
	if (window.debug_mode) {
		console.log("Canvas Image Crop -------");
		console.log("OffsetX: " + offsetX);
		console.log("OffsetY: " + offsetY);
		console.log("Width: " + width);
		console.log("Height: " + height);
		console.log("-------------------------")
	}

  // create an in-memory canvas
  var buffer = document.createElement('canvas');
  var b_ctx = buffer.getContext('2d');
  // set its width/height to the required ones
	buffer.width = width * 2 + (margin * 2);
	buffer.height = height * 2 + (margin * 2);
  // draw the main canvas on our buffer one
  // drawImage(source, source_X, source_Y, source_Width, source_Height, 
  //  dest_X, dest_Y, dest_Width, dest_Height)
	b_ctx.drawImage(
    canvas,
    offsetX * 2 - margin,
    offsetY * 2 - margin,
    width * 2 + margin * 2,
    height * 2 + margin * 2,
    0,
    0,
    width * 2 + margin * 2,
    height * 2 + margin * 2
  );
	
	let result = buffer.toDataURL();
	
  if (callback) {
    // now call the callback with the dataURL of our buffer canvas
    callback(result);
	}

	return result;
};
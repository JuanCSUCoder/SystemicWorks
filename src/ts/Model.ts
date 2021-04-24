import { publish, subscribe } from "../js/minpubsub";
import Edge, { EdgeConfig } from "./elements/Edge";
import { EdgeElement, SimpleElement } from "./elements/ElemType";
import Grid from "./elements/Grid";
import Label, { LabelConfig } from "./elements/Label";
import LoopMark, { LoopMarkConfig } from "./elements/LoopMark";
import Node, { BasicNodeConfig, NodeConfig } from "./elements/Node";
import { Bounds, Dictionary, _createCanvas, _PADDING, _PADDING_BOTTOM } from "./Helpers";
import Loopy, { LoopyMode, LoopyTool } from "./Loopy";
import Mouse from "./Mouse";
import ProjectLoader from "./ProjectLoader";



export default class Model {
	loopy: Loopy;
	speed: number = 0.05;
	project: ProjectLoader;

	// Canvas
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	canvas_dirty: boolean = false;

	// Draw Helpers
	drawCountdownFull: number = 60; // Two Seconds
	drawCountdown: number = this.drawCountdownFull;

	// Nodes
	nodes: Node[] = [];
	nodeByID: Dictionary<Node> = {};
	nodeUID: number = 0;

	// Edges
	edges: Edge[] = [];

	// Labels
	labels: Label[] = [];

	// LoopMarks
	loop_marks: LoopMark[] = [];

	// Grid
	grid: Grid;
	grid_img: HTMLImageElement;

	constructor(loopy: Loopy) {
		this.loopy = loopy;
		this.project = new ProjectLoader("[[],[],[],0,[]]");

		// Canvas
		this.canvas = _createCanvas();
		this.ctx = this.canvas.getContext("2d")!;

		// Grid
		this.grid = new Grid(50, 50, 4, 5, 2);
		this.grid_img = this.grid.getImg();

		// Render Triggers
		// Mouse Events
		subscribe("mousemove", () => {
			this.drawCountdown = this.drawCountdownFull;
		});

		subscribe("mousedown", () => {
			this.drawCountdown = this.drawCountdownFull;
		});

		// Info Changed
		subscribe("model/changed", () => {
			if (this.loopy.mode == LoopyMode.Edit) {
				this.drawCountdown = this.drawCountdownFull;
			}
		});

		// Canvas Moved
		subscribe("canvas/moved", () => {
			this.drawCountdown = this.drawCountdownFull;
		});

		// Resize or Reset
		subscribe("resize", () => {
			this.drawCountdown = this.drawCountdownFull;
		});

		subscribe("model/reset", () => {
			this.drawCountdown = this.drawCountdownFull;
		});

		subscribe("loopy/mode", () => {
			if (this.loopy.mode == LoopyMode.Play) {
				this.drawCountdown = this.drawCountdownFull * 2; // 4 seconds
			} else {
				this.drawCountdown = this.drawCountdownFull;
			}
		});

		subscribe("mouseclick", () => {
			if (this.loopy.mode == LoopyMode.Edit && this.loopy.tool != LoopyTool.Erase) {
				// Check what was clicked and open edit page
				let clickedNode = this.getNodeByPoint(this.loopy.mouseControl.x, this.loopy.mouseControl.y, 2);

				if (clickedNode) {
					this.loopy.sidebar.edit(clickedNode);
					return;
				}

				let clickedLabel = this.getLabelByPoint(this.loopy.mouseControl.x, this.loopy.mouseControl.y);

				if (clickedLabel) {
					this.loopy.sidebar.edit(clickedLabel);
					return;
				}

				let clickedEdge = this.getEdgeByPoint(this.loopy.mouseControl.x, this.loopy.mouseControl.y);

				if (clickedEdge) {
					this.loopy.sidebar.edit(clickedEdge);
					return;
				}

				let clickedLoopMark = this.getLoopMarkByPoint(this.loopy.mouseControl.x, this.loopy.mouseControl.y);

				if (clickedLoopMark) {
					this.loopy.sidebar.edit(clickedLoopMark);
					return;
				}

				// Add a Label if nothing was clicked and Label Tool is Selected
				if (this.loopy.tool == LoopyTool.Label) {
					this.loopy.labeller.tryMakingLabel();
					return;
				}

				// If nothing of above is TRUE then go to main Edit Page
				this.loopy.sidebar.showPage("Edit");
			}
		})
	}

	// Nodes

	getNode(id: number): Node {
		return this.nodeByID[id];
	}

	addNode(config: NodeConfig): Node {
		// Event that says that the model has changed
		publish("model/changed");

		// Add ID
		let completeConfig: unknown = config;
		(completeConfig as NodeConfig).id = this.getUID();

		// Add Node
		let node: Node = new Node(this, config as NodeConfig);
		this.nodeByID[node.id] = node;
		this.nodes.push(node);

		this.update();

		return node;
	}

	removeNode(node: Node) {
		// Event that says that model has changed
		publish("model/changed");

		// Remove from the array
		this.nodes.splice(this.nodes.indexOf(node), 1);

		// Remove Object
		delete this.nodeByID[node.id];

		// Remove linked edges
		for (let i = 0; i < this.edges.length; i++) {
			const edge: Edge = this.edges[i];

			if (edge.to == node || edge.from == node) {
				edge.kill();
				i--;
			}
		}
	}

	getUID() {
		this.nodeUID++;
		return this.nodeUID;
	}

	// Edges

	addEdge(config: EdgeConfig) {
		// Event that says that model has changed
		publish("model/changed");

		// Add Edge
		let edge = new Edge(this, config);
		this.edges.push(edge);

		this.update();

		return edge;
	}

	removeEdge(edge: Edge) {
		// Event that says that model has changed
		publish("model/changed");

		// Remove Edge
		this.edges.splice(this.edges.indexOf(edge), 1);
	}

	// Get all edges that have an specific edge.from Node
	getEdgesByStartNode(startNode: Node) {
		return this.edges.filter((edge) => {
			return edge.from == startNode;
		})
	}

	// Labels

	addLabel(config: LabelConfig) {
		// Event that says that the model has changed
		publish("model/changed");

		// Add Label
		let label = new Label(this, config);

		this.labels.push(label);

		this.update();

		return label;
	}

	removeLabel(label: Label) {
		// Event that says that the model has changed
		publish("model/changed");

		// Remove Label
		this.labels.splice(this.labels.indexOf(label), 1);
	}

	// LoopMarks

	addLoopMark(config: LoopMarkConfig) {
		// Event of model changed
		publish("model/changed");

		// Add LoopMark
		let loop_mark = new LoopMark(this, config);
		this.loop_marks.push(loop_mark);

		this.update();

		return loop_mark;
	}

	removeLoopMark(loop_mark: LoopMark) {
		// Event of model changed
		publish("model/changed");

		// Remove LoopMark
		this.loop_marks.splice(this.loop_marks.indexOf(loop_mark), 1);
	}

	// Update & Draw

	update() {
		// Update Edges
		this.edges.forEach(edge => {
			edge.update(this.speed);
		});

		// Update Nodes
		this.nodes.forEach(node => {
			node.update(this.speed);
		});

		this.canvas_dirty = true;
	}

	draw() {
		// Should we draw
		this.edges.forEach(edge => {
			if (edge.signals.length > 0) {
				this.drawCountdown = this.drawCountdownFull;
			}
		});

		// Substract a frame from counter
		this.drawCountdown--;

		if (this.drawCountdown > 0 && this.canvas_dirty) {
			this.canvas_dirty = false;

			let loopy: Loopy = this.loopy;
			let ctx: CanvasRenderingContext2D = this.ctx;

			// Clear
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			ctx.save();

			// Translate to center, (translate, scale, translate) to expand to size
			let canvasses = document.getElementById("canvasses")!;
			let CW = canvasses.clientWidth - _PADDING - _PADDING;
			let CH = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;
			let tx = loopy.offsetX * 2;
			let ty = loopy.offsetY * 2;
			tx -= CW + _PADDING;
			ty -= CH + _PADDING;
			var s = loopy.offsetScale; // TODO: Zooming
			tx = s * tx;
			ty = s * ty;
			tx += CW + _PADDING;
			ty += CH + _PADDING;

			ctx.setTransform(s, 0, 0, s, tx, ty);

			// Draw Grid
			ctx.drawImage(this.grid_img, 0, 0);

			// Draw Elements (Labels -> Edges -> Nodes -> LoopMarks)
			this.labels.forEach(label => label.draw(ctx));
			this.edges.forEach(edge => edge.draw(ctx));
			this.nodes.forEach(node => node.draw(ctx));
			this.loop_marks.forEach(loop_mark => loop_mark.draw(ctx));

			// Restore
			ctx.restore();
		}
	}

	// Serialize & Deserialize

	serialize(): string {
		return this.project.serializeV1(this);
	}

	deserialize(raw_data: string) {
		this.project.deserializeAny(this, raw_data);
	}

	clear() {
		// Kill Nodes
		while (this.nodes.length > 0) {
			this.nodes[0].kill();
		}

		// Kill Labels
		while (this.labels.length > 0) {
			this.labels[0].kill();
		}

		// Kill LoopMarks
		while (this.loop_marks.length > 0) {
			this.loop_marks[0].kill();
		}
	}

	// Helpers
	getNodeByPoint(x: number, y: number, buffer: number) {
		for (let i = this.nodes.length - 1; i >= 0; i--) {
			const node = this.nodes[i];

			if (node.isPointInNode(x, y, buffer)) {
				return node;
			}
		}

		return null;
	}

	getEdgeByPoint(x: number, y: number) {
		for (let i = this.edges.length - 1; i >= 0; i--) { // top-down
			let edge = this.edges[i];
			if (edge.isPointOnLabel(x, y)) return edge;
		}
		return null;
	}

	getLabelByPoint(x: number, y: number) {
		for (let i = this.labels.length - 1; i >= 0; i--) { // top-down
			let label = this.labels[i];
			if (label.isPointInLabel(x, y)) return label;
		}
		return null;
	}

	getLoopMarkByPoint(x: number, y: number) {
		for (let i = this.loop_marks.length - 1; i >= 0; i--) {
			let loop_mark = this.loop_marks[i];
			if (loop_mark.isPointInLoopMark(x, y)) return loop_mark;
		}
		return null;
	}

	getBounds(): Bounds {
		if (this.nodes.length > 0 || this.labels.length > 0 || this.loop_marks.length > 0) {
			// Get bounds of ALL objects...
			let left = Infinity;
			let top = Infinity;
			let right = -Infinity;
			let bottom = -Infinity;
			let _testObjects = function (objects: SimpleElement[] | EdgeElement[]) {
				for (let i = 0; i < objects.length; i++) {
					let obj = objects[i];
					let bounds = obj.getBoundingBox();
					if (left > bounds.left) left = bounds.left;
					if (top > bounds.top) top = bounds.top;
					if (right < bounds.right) right = bounds.right;
					if (bottom < bounds.bottom) bottom = bounds.bottom;
				}
			};
			_testObjects(this.nodes);
			_testObjects(this.edges);
			_testObjects(this.labels);
			_testObjects(this.loop_marks);

			// Return
			return {
				left: left,
				top: top,
				right: right,
				bottom: bottom
			};
		} else {
			let canvasses = document.getElementById("canvasses") as HTMLCanvasElement;
			let fitWidth = canvasses.clientWidth - _PADDING - _PADDING;
			let fitHeight = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;

			return {
				left: 0,
				top: 0,
				right: fitWidth,
				bottom: fitHeight,
			};
		}
	}

	center(scale: boolean) {
		// TODO: LoopMarks Implementation
		if (this.nodes.length > 0 || this.labels.length > 0) {
			// Get Bounds
			let bounds = this.getBounds();

			// Re-Center
			let canvasses: HTMLCanvasElement = document.getElementById("canvasses") as HTMLCanvasElement;
			let fitWidth = canvasses.clientWidth - _PADDING - _PADDING;
			let fitHeight = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;
			let cx = (bounds.left + bounds.right) / 2;
			let cy = (bounds.top + bounds.bottom) / 2;
			this.loopy.offsetX = (_PADDING + fitWidth) / 2 - cx;
			this.loopy.offsetY = (_PADDING + fitHeight) / 2 - cy;

			// Scale
			if (scale) {
				let w = bounds.right - bounds.left;
				let h = bounds.bottom - bounds.top;

				// Calculate Ratios
				let modelRatio = w / h;
				let screenRatio = fitWidth / fitHeight;

				let scaleRatio;
				
				// Wider or Taller than Screen?
				if (modelRatio > screenRatio) {
					// Wider
					scaleRatio = fitWidth / w;
				} else {
					scaleRatio = fitHeight / h;
				}

				// Scale then
				this.loopy.offsetScale = scaleRatio;
			}
		}
	}
}
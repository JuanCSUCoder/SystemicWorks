import Model from "./Model";

// Version 1.0 Types

type ProjectV1 = [
	NodeV1[],
	EdgeV1[],
	LabelV1[],
	number,
	LoopMarkV1[],
];

type DraftProjectV1 = [
	NodeV1[]?,
	EdgeV1[]?,
	LabelV1[]?,
	number?,
	LoopMarkV1[]?,
];

type NodeV1 = [
	number, // ID
	number, // X
	number, // Y
	number, // Init Value
	string, // Label
	string, // Color
	number, // Radius
];

type EdgeV1 = [
	number, // From ID
	number, // To ID
	number, // Arc
	number, // Strength
	number, // Rotation??
	number, // Thickness
	string, // Color
	number, // Delay
];

type LabelV1 = [
	number, // X
	number, // Y
	string, // Label Text
	string, // Color
];

type LoopMarkV1 = [
	number, // X
	number, // Y
	number, // Orientation (1 = Clockwise)
	number, // Type (1 = Reinforcement)
	string, // Color
];


export default class ProjectLoader {
	raw_data: string;

	constructor(raw_data: string) {
		this.raw_data = raw_data;
	}

	// Deserializing Starting Function
	deserializeAny(model: Model, raw_data: string) {
		// Update Raw Data
		this.raw_data = raw_data;

		// TODO: Detect version and redirect process
		this.deserializeV1(model, raw_data);
	}

	// Helper for All Versions

	stringify(project: ProjectV1) {
		let dataString = JSON.stringify(project);
		dataString = dataString.replace(/"/gi, "%22"); // and ONLY URIENCODE THE QUOTES
		dataString = dataString.substr(0, dataString.length - 1) + "%5D";// also replace THE LAST CHARACTER
		return dataString;
	}

	// Version 1

	serializeV1(model: Model): string {
		let data: DraftProjectV1 = [];

		// Nodes
		let nodes: NodeV1[] = [];
		model.nodes.forEach(node => {
			nodes.push([
				node.id,
				Math.round(node.x),
				Math.round(node.y),
				node.init,
				encodeURIComponent(encodeURIComponent(node.label)),
				encodeURIComponent(encodeURIComponent(node.hue)),
				Math.round(node.radius),
			]);
		});
		data.push(nodes);

		// Edges
		let edges: EdgeV1[] = [];
		model.edges.forEach(edge => {
			edges.push([
				edge.from.id,
				edge.to.id,
				Math.round(edge.arc),
				edge.strength,
				Math.round(edge.rotation),
				edge.thickness,
				encodeURIComponent(encodeURIComponent(edge.color)),
				edge.delay,
			]);
		});
		data.push(edges);

		// Labels
		let labels: LabelV1[] = [];
		model.labels.forEach(label => {
			labels.push([
				Math.round(label.x),
				Math.round(label.y),
				encodeURIComponent(encodeURIComponent(label.text)),
				encodeURIComponent(encodeURIComponent(label.color)),
			]);
		});
		data.push(labels);

		data.push(model.nodeUID);

		// LoopMarks
		let loop_marks: LoopMarkV1[] = [];
		model.loop_marks.forEach(loop_mark => {
			loop_marks.push([
				Math.round(loop_mark.x),
				Math.round(loop_mark.y),
				loop_mark.clockwise,
				loop_mark.reinforcement,
				encodeURIComponent(encodeURIComponent(loop_mark.color)),
			]);
		});
		data.push(loop_marks);

		return this.stringify(data as ProjectV1);
	}

	deserializeV1(model: Model, raw_data: string) {
		model.clear();

		let data = JSON.parse(raw_data);

		// Get from array
		let nodes: NodeV1[] = data[0];
		let edges: EdgeV1[] = data[1];
		let labels: LabelV1[] = data[2];
		let UID: number = data[3];
		let loop_marks: LoopMarkV1[] = data[4];

		// Nodes
		nodes.forEach(node => {
			model.addNode({
				id: node[0],
				x: node[1],
				y: node[2],
				init: node[3],
				label: decodeURIComponent(node[4]),
				color: decodeURIComponent(node[5]),
				radius: node[6],
			});
		});

		// Edges
		edges.forEach(edge => {
			model.addEdge({
				from: edge[0],
				to: edge[1],
				arc: edge[2],
				strength: edge[3],
				rotation: 0,
				thickness: edge[5],
				color: decodeURIComponent(edge[6]),
				delay: edge[7],
			});
		});

		// Labels
		labels.forEach(label => {
			model.addLabel({
				x: label[0],
				y: label[1],
				text: decodeURIComponent(label[2]),
				color: decodeURIComponent(label[3]),
			});
		});

		// LoopMarks
		loop_marks.forEach(loop_mark => {
			model.addLoopMark({
				x: loop_mark[0],
				y: loop_mark[1],
				clockwise: loop_mark[2],
				reinforcement: loop_mark[3],
				color: decodeURIComponent(loop_mark[4]),
			});
		});

		// META
		model.nodeUID = UID;
	}
}
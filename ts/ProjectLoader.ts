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
	deserializeAny(raw_data: string) {
		// Update Raw Data
		this.raw_data = raw_data;

		// TODO: Detect version and redirect process
	}

	stringify(project: ProjectV1) {
		let dataString = JSON.stringify(project);
		dataString = dataString.replace(/"/gi, "%22"); // and ONLY URIENCODE THE QUOTES
		dataString = dataString.substr(0, dataString.length - 1) + "%5D";// also replace THE LAST CHARACTER
		return dataString;
	}

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
				encodeURIComponent(encodeURIComponent(node.color)),
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

		// HEAD

		return this.stringify(data as ProjectV1);
	}
}
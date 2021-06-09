import { HueColors } from "./Helpers";
import Model from "./Model";

// Version 1.0 Types

type ProjectV1 = [NodeV1[], EdgeV1[], LabelV1[], number, LoopMarkV1[]];

type DraftProjectV1 = [
  NodeV1[]?,
  EdgeV1[]?,
  LabelV1[]?,
  number?,
  LoopMarkV1[]?
];

type NodeV1 = [
  number, // ID
  number, // X
  number, // Y
  number, // Init Value
  string, // Label
  string, // Color
  number // Radius
];

type EdgeV1 = [
  number, // From ID
  number, // To ID
  number, // Arc
  number, // Strength
  number, // Rotation??
  number, // Thickness
  string, // Color
  number // Delay
];

type LabelV1 = [
  number, // X
  number, // Y
  string, // Label Text
  string // Color
];

type LoopMarkV1 = [
  number, // X
  number, // Y
  number, // Orientation (1 = Clockwise)
  number, // Type (1 = Reinforcement)
  string // Color
];

export default class ProjectLoader {
  raw_data: string;

  constructor(raw_data: string) {
    this.raw_data = raw_data;
  }

  // Deserializing Starting Function
  deserializeAny(model: Model, raw_data: string, filename: string) {
    // Update Raw Data
    this.raw_data = raw_data;

    // Detect version and redirect process
    let file_ext = filename.split(".").pop();

    switch (file_ext) {
      case "smwks":
        this.deserializeV1(model, raw_data);
        break;
      case "loopy":
        this.deserializeVL(model, raw_data);
        break;
      case "mdl":
        this.deserializeVV(model, raw_data);
        break;
      default:
        break;
    }
  }

  // Helper for All Versions

  stringify(project: ProjectV1) {
    let dataString = JSON.stringify(project);
    dataString = dataString.replace(/"/gi, "%22"); // and ONLY URIENCODE THE QUOTES
    dataString = dataString.substr(0, dataString.length - 1) + "%5D"; // also replace THE LAST CHARACTER
    return dataString;
  }

  // Version 1

  serializeV1(model: Model): string {
    let data: DraftProjectV1 = [];

    // Nodes
    let nodes: NodeV1[] = [];
    model.nodes.forEach((node) => {
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
    model.edges.forEach((edge) => {
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
    model.labels.forEach((label) => {
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
    model.loop_marks.forEach((loop_mark) => {
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
    nodes.forEach((node) => {
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
    edges.forEach((edge) => {
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
    labels.forEach((label) => {
      model.addLabel({
        x: label[0],
        y: label[1],
        text: decodeURIComponent(label[2]),
        color: decodeURIComponent(label[3]),
      });
    });

    // LoopMarks
    loop_marks.forEach((loop_mark) => {
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

  deserializeVL(model: Model, raw_string: string) {
    model.clear();

    alert("Auto importing loopy file");

    var data = JSON.parse(raw_string);

    // Get from array!
    let nodes = data[0];
    let edges = data[1];
    let labels = data[2];
    let UID = data[3];

    // Nodes
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      model.addNode({
        id: node[0],
        x: node[1],
        y: node[2],
        init: node[3],
        label: decodeURIComponent(node[4]),
        hue: HueColors[node[5]],
      });
    }

    // Edges
    for (let i = 0; i < edges.length; i++) {
      let edge = edges[i];
      let edgeConfig = {
        from: edge[0],
        to: edge[1],
        arc: edge[2],
        strength: edge[3],
      };
      // if(edge[4]) edgeConfig.rotation=edge[4];
      model.addEdge(edgeConfig);
    }

    // Labels
    for (let i = 0; i < labels.length; i++) {
      let label = labels[i];
      model.addLabel({
        x: label[0],
        y: label[1],
        text: decodeURIComponent(label[2]),
      });
    }

    // META.
    model.nodeUID = UID;
  }

  deserializeVV(model: Model, raw_string: string) {
    model.clear();

    alert(
      "Auto importing a Vensim model, some features are uncompatible and it is not officially suported. All views from the file will be collapsed."
    );

    let lines = raw_string.split("\n");
    let loading_view: boolean = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (loading_view && line.charAt(0) != "$") {
        let element = line.split(",");

        if (element[0] == "10") {
          // It is a node

          model.addNode({
            id: Number(element[1]),
            x: Number(element[3]),
            y: Number(element[4]),
            init: 0.5,
            label: element[2],
            color: "#666",
            radius: 60,
          });
        } else if (element[0] == "1") {
          // It is an edge

          model.addEdge({
            from: Number(element[2]),
            to: Number(element[3]),
            arc: 100,
            strength: 1,
            rotation: 0,
            thickness: 3,
            color: "#666",
            delay: 0,
          });
        }
      }

      if (line.charAt(0) == "*" && line.charAt(1) != "*") {
        alert("Loading " + line.split("*")[1]);
        loading_view = true;
      }
    }
  }
}

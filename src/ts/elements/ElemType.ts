import Node from "./Node";

type Bounds = {
	left: number,
	top: number,
	right: number,
	bottom: number,
};

export interface SimpleElement {
  x: number;
  y: number;
  getBoundingBox(): Bounds;
  _CLASS_: string;
}

export interface EdgeElement {
	from: Node;
	to: Node;
	getBoundingBox(): Bounds;
}
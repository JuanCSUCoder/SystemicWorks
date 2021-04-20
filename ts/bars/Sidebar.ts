import { EdgeElement, SimpleElement } from "../elements/ElemType";
import Node from "../elements/Node";
import Loopy from "../Loopy";

export default class Sidebar {
	dom: HTMLElement | null;

	constructor(loopy: Loopy) {
		this.dom = document.getElementById("sidebar");
	}

	edit(element: SimpleElement | EdgeElement) {

	}

	showPage(page_name: string) {

	}
}
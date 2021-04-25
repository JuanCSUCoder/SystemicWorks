export default class Grid {
	g_w: number;
	g_h: number;
	square: number;
	tile: number;
	stroke: number;

	constructor(g_w: number, g_h: number, square: number, tile: number, stroke: number) {
		this.g_w = g_w;
		this.g_h = g_h;

		this.square = square;
		this.tile = tile;
		this.stroke = stroke;
	}

	getSvg(): string {
		return '<svg width="' + (this.g_w * this.square * this.tile) + 1 + '" height="' + (this.g_h * this.square * this.tile) + 1 + '" xmlns="http://www.w3.org/2000/svg"> \
				<defs> \
						<pattern id="smallGrid" width="'+ this.g_w + '" height="' + this.g_h + '" patternUnits="userSpaceOnUse"> \
								<path d="M '+ this.g_w + ' 0 L 0 0 0 ' + this.g_h + '" fill="none" stroke="gray" stroke-width="' + this.stroke + '" /> \
						</pattern> \
						<pattern id="grid" width="'+ this.g_w * this.square + '" height="' + this.g_h * this.square + '" patternUnits="userSpaceOnUse"> \
								<rect width="'+ this.g_w * this.square + '" height="' + this.g_h * this.square + '" fill="url(#smallGrid)" /> \
								<path d="M '+ this.g_w * this.square + ' 0 L 0 0 0 ' + this.g_h * this.square + '" fill="none" stroke="grey" stroke-width="' + this.stroke * 2 + '" /> \
						</pattern> \
				</defs> \
				<rect width="100%" height="100%" fill="url(#grid)" /> \
		</svg>';
	}

	getImg(): HTMLImageElement {
		let DOMURL = window.URL || window.webkitURL;

		let grid_img = new Image();
		let grid_svg = new Blob([this.getSvg()], { type: 'image/svg+xml;charset=utf-8' });
		let grid_url = DOMURL.createObjectURL(grid_svg);

		grid_img.src = grid_url;

		return grid_img;
	}
}
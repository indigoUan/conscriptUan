class GlyphPart {
	constructor(name) {
		this.classe = "part";
		this.curves = new Array();
		this.name = name;

		const parsed = new CsuParser(sessionStorage.getItem("loadedFile"));
		for (const glyph of parsed.glyphs) {
			if (glyph.name === name) {
				this.curves = glyph.curves;
				this.grid = glyph.grid;
				break;
			}
		}
	}

	draw() {
		const canvas = document.getElementById("myCanvas");
		const ctx = canvas.getContext("2d");
		const rect = canvas.getBoundingClientRect();
		const stepX = rect.width / (window.gridResolution - 1);
		const stepY = rect.height / (window.gridResolution - 1);

		for (const curve of this.curves) {
			ctx.beginPath();
			ctx.lineWidth = curve.thickness * ((rect.width + rect.height) * 0.5);

			ctx.moveTo(curve.origin[0] * stepX, curve.origin[1] * stepY);

			ctx.bezierCurveTo(
				curve.controlPoint1[0] * stepX, curve.controlPoint1[1] * stepY,
				curve.controlPoint2[0] * stepX, curve.controlPoint2[1] * stepY,
				curve.end[0] * stepX, curve.end[1] * stepY
			);

			ctx.stroke();
			ctx.closePath();
		}
	}

	activate() {
	}

	deactivate() {
	}
}

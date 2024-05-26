// document.writeln(`<script src="https://raw.githubusercontent.com/indigoUan/JavaScriptUanUtilities/main/QlJson.js"></script>`);

class CsuParser {
	constructor(csu) {
		this.glyphs = new Array();
		this.name = "Unnamed Script";

		const json = JSON.parse(csu);

		switch (json.version) {
			case 0: {
				this.glyphs = new Array();
				if (json.name) {
					this.name = json.name;
				}

				for (let glyph of json.glyphs) {
					const newGlyph = {
						name: glyph.name,
						grid: glyph.grid,
						curves: new Array(),
						parts: new Array()
					}
					if (glyph.parts) {
						for (let i = 0; i < glyph.parts.length; i += 3) {
							newGlyph.parts.push({
								name: glyph.parts[i],
								x: glyph.parts[i + 1],
								y: glyph.parts[i + 2]
							});
						}
					}
					if (glyph.curves) {
						if (glyph.curves) {
							for (let i = 0; i < glyph.curves.length; i += 9) {
								newGlyph.curves.push({
									thickness: glyph.curves[i],
									origin: [ glyph.curves[i + 1], glyph.curves[i + 2] ],
									controlPoint1: [ glyph.curves[i + 3], glyph.curves[i + 4] ],
									controlPoint2: [ glyph.curves[i + 5], glyph.curves[i + 6] ],
									end: [ glyph.curves[i + 7], glyph.curves[i + 8] ]
								});
							}
						}
					}

					this.glyphs.push(newGlyph);
				}

				break;
			}
		}
	}

	toString(beautiful = false) {
		let json = {
			name: this.name,
			version: currentCsuVersion,
			glyphs: new Array()
		}

		for (let glyph of this.glyphs) {
			const newGlyph = {
				name: glyph.name,
				grid: glyph.grid,
				curves: new Array(),
				parts: new Array()
			}
			if (glyph.parts) {
				for (let part of glyph.parts) {
					newGlyph.parts.push(part.name);
					newGlyph.parts.push(part.x);
					newGlyph.parts.push(part.y);
				}
			}
			if (glyph.curves) {
				if (glyph.curves) {
					for (let curve of glyph.curves) {
						newGlyph.curves.push(curve.thickness);
						newGlyph.curves.push(curve.origin[0]);
						newGlyph.curves.push(curve.origin[1]);
						newGlyph.curves.push(curve.controlPoint1[0]);
						newGlyph.curves.push(curve.controlPoint1[1]);
						newGlyph.curves.push(curve.controlPoint2[0]);
						newGlyph.curves.push(curve.controlPoint2[1]);
						newGlyph.curves.push(curve.end[0]);
						newGlyph.curves.push(curve.end[1]);
					}
				}
			}
			json.glyphs.push(newGlyph);
		}

		console.log(json);
		if (beautiful) {
			return JSON.stringify(json, null, "\t");
		}
		return JSON.stringify(json);
		// return JSON.stringify(json, null, "\t");
		// return QlJson.build(json);
	}


	static glyphToCurves(glyphName, canvasWidth = 1, canvasHeight = 1) {
		const parsed = new CsuParser(sessionStorage.getItem("loadedFile"));
		const curves = new Array();
		let glyph = undefined;

		for (const gl of parsed.glyphs) {
			if (gl.name === glyphName) {
				glyph = gl;
				break;
			}
		}

		if (glyph) {
			const stepX = canvasWidth / (glyph.grid - 1);
			const stepY = canvasHeight / (glyph.grid - 1);
			const avg = (canvasWidth + canvasHeight) * 0.5;

			if (glyph.parts) {
				for (let i = 0; i < glyph.parts.length; i++) {
					if (glyph.parts[i]) {
						let gliph = undefined;
						let offsetX = 0;
						let offsetY = 0;
						for (const gl of parsed.glyphs) {
							if (gl.name === glyph.parts[i].name) {
								gliph = gl;
								if (glyph.parts[i].x) offsetX = glyph.parts[i].x;
								if (glyph.parts[i].y) offsetY = glyph.parts[i].y;
								break;
							}
						}
						if (gliph) {
							for (let j = 0; j < gliph.curves.length; j++) {
								const glyf = gliph.curves[j];
								const rect = CsuParser.glyphRect(gliph);
								curves.push({
									thickness: glyf.thickness * avg,
									origin: [ (glyf.origin[0] - rect.x + offsetX) * stepX, (glyf.origin[1] - rect.y + offsetY) * stepY ],
									controlPoint1: [ (glyf.controlPoint1[0] - rect.x + offsetX) * stepX, (glyf.controlPoint1[1] - rect.y + offsetY) * stepY ],
									controlPoint2: [ (glyf.controlPoint2[0] - rect.x + offsetX) * stepX, (glyf.controlPoint2[1] - rect.y + offsetY) * stepY ],
									end: [ (glyf.end[0] - rect.x + offsetX) * stepX, (glyf.end[1] - rect.y + offsetY) * stepY ]
								});
							}
						}
					}
				}
			}
			if (glyph.curves) {
				for (let i = 0; i < glyph.curves.length; i++) {
					const glyf = glyph.curves[i];
					curves.push({
						thickness: glyf.thickness * avg,
						origin: [ glyf.origin[0] * stepX, glyf.origin[1] * stepY ],
						controlPoint1: [ glyf.controlPoint1[0] * stepX, glyf.controlPoint1[1] * stepY ],
						controlPoint2: [ glyf.controlPoint2[0] * stepX, glyf.controlPoint2[1] * stepY ],
						end: [ glyf.end[0] * stepX, glyf.end[1] * stepY ]
					});
				}
			}
		}

		return curves;
	}

	static glyphRect(glyph) {
		if (glyph.rect) {
			return glyph.rect;
		}

		const rect = {
			x: glyph.grid - 1,
			y: glyph.grid - 1,
			width: 0,
			height: 0
		}

		const allLines = new Array();
		for (const curve of glyph.curves) {
			allLines.push(curve);
		}
		for (const part of glyph.parts) {
			for (const curve of part.curves) {
				allLines.push(curve);
			}
		}

		for (const curve of allLines) {
			const points = [curve.origin, curve.controlPoint1, curve.controlPoint2, curve.end];
			for (const point of points) {
				if (point[0] < rect.x) {
					rect.x = point[0];
				}
				if (point[1] < rect.y) {
					rect.y = point[1];
				}
			}
		}
		for (const curve of glyph.curves) {
			const points = [curve.origin, curve.controlPoint1, curve.controlPoint2, curve.end];
			for (const point of points) {
				if (point[0] - rect.x > rect.width) {
					rect.width = point[0] - rect.x;
				}
				if (point[1] - rect.y > rect.height) {
					rect.height = point[1] - rect.y;
				}
			}
		}

		return {
			x: Math.max(rect.x, 0),
			y: Math.max(rect.y, 0),
			width: Math.min(rect.width, glyph.grid),
			height: Math.min(rect.height, glyph.grid)
		};
	}
}


/* this is a glyph (in json) made up of ✨parts✨
{
	"name": "á",
	"grid": 5,
	"parts": [
		"a", 2, 1,
		"´", 2, 3
	]
}
*/

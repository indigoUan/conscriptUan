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
						for (const gl of parsed.glyphs) {
							if (gl.name === glyph.parts[i].name) {
								gliph = gl;
								break;
							}
						}
						if (gliph) {
							for (let j = 0; j < gliph.curves.length; j++) {
								const glyf = gliph.curves[j];
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

// document.writeln(`<script src="https://raw.githubusercontent.com/indigoUan/JavaScriptUanUtilities/main/QlJson.js"></script>`);

class CsuParser {
	constructor(csu) {
		this.glyphs = [];
		this.name = "Unnamed Script";

		const json = JSON.parse(csu);

		switch (json.version) {
			case "α.0.0": {
				this.glyphs = new Array();
				if (json.name) {
					this.name = json.name;
				}

				for (let glyph of json.glyphs) {
					const newGlyph = {
						name: glyph.name,
						grid: glyph.grid,
						curves: undefined,
						parts: undefined
					}
					if (glyph.parts) {
						newGlyph.parts = new Array();
						for (let i = 0; i < glyph.parts.length; i += 3) {
							newGlyph.parts.push({
								name: glyph.parts[i],
								x: glyph.parts[i + 1],
								y: glyph.parts[i + 2]
							});
						}
					} else {
						newGlyph.curves = new Array();
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

	toString() {
		let json = {
			name: this.name,
			version: currentToolVersion,
			glyphs: new Array()
		}

		for (let glyph of this.glyphs) {
			const newGlyph = {
				name: glyph.name,
				grid: glyph.grid,
				curves: undefined,
				parts: undefined
			}
			if (glyph.parts) {
				newGlyph.parts = new Array();
				for (let part of glyph.parts) {
					newGlyph.parts.push(part.name);
					newGlyph.parts.push(part.x);
					newGlyph.parts.push(part.y);
				}
			} else {
				newGlyph.curves = new Array();
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
		return JSON.stringify(json);
		// return JSON.stringify(json, null, "\t");
		// return QlJson.build(json);
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

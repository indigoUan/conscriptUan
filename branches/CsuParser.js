const currentCsuVersion = "α.0.0";

class CsuParser {
	constructor(csu) {
		this.glyphs = [];

		const json = JSON.parse(csu);

		switch (json.version) {
			case "α.0.0": {
				this.glyphs = new Array();

				for (let glyph of json.glyphs) {
					const newGlyph = {
						name: glyph.name,
						grid: glyph.grid,
						curves: new Array()
					}
					for (let i = 0; i < glyph.curves.length; i += 9) {
						newGlyph.curves.push({
							thickness: glyph.curves[i],
							origin: [ glyph.curves[i + 1], glyph.curves[i + 2] ],
							controlPoint1: [ glyph.curves[i + 3], glyph.curves[i + 4] ],
							controlPoint2: [ glyph.curves[i + 5], glyph.curves[i + 6] ],
							end: [ glyph.curves[i + 7], glyph.curves[i + 8] ]
						});
					}

					this.glyphs.push(newGlyph);
				}

				break;
			}
		}
	}

	toString() {
		let json = {
			version: currentCsuVersion,
			glyphs: new Array()
		}

		for (let glyph of this.glyphs) {
			const newGlyph = {
				name: glyph.name,
				grid: glyph.grid,
				curves: new Array()
			}
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
			json.glyphs.push(newGlyph);
		}

		return JSON.stringify(json);
	}
}

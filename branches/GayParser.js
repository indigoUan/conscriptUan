class GayParser {
	constructor(gay) {
		this.glyphs = [];

		function parseCoord(c) {
			let parts = c.split(',');
			return [ parseInt(parts[0]), parseInt(parts[1]) ];
		}

		const allGlyphs = gay.split('#\n');
		for (let glyph of allGlyphs) {
			if (glyph.trim() === '') continue;

			let lines = glyph.trim().split('\n');

			let glyphData = new ParsedGlyph(
				lines[0],
				parseInt(lines[1]),
				new Array()
			);

			for (let i = 2; i < lines.length - 1; i += 5) {
				let curves = {
					thickness: parseFloat(lines[i]),
					origin: parseCoord(lines[i + 1]),
					controlPoint1: parseCoord(lines[i + 2]),
					controlPoint2: parseCoord(lines[i + 3]),
					end: parseCoord(lines[i + 4])
				};

				glyphData.curves.push(curves);
			}

			this.glyphs.push(glyphData);
		}
	}

	toString() {
		let result = "";
		for (let glyph of this.glyphs) {
			result += "\n" + glyph.toString();
		}
		return result;
	}
}

class ParsedGlyph {
	constructor(name, gridSize, curves) {
		this.name = name;
		this.gridSize = gridSize;
		this.curves = curves;
	}

	toString() {
		let result = "#\n" + this.name + "\n" + this.gridSize;

		for (let curve of this.curves) {
			result += "\n" + curve.thickness +
			"\n" + curve.origin[0] + "," + curve.origin[1] +
			"\n" + curve.controlPoint1[0] + "," + curve.controlPoint1[1] +
			"\n" + curve.controlPoint2[0] + "," + curve.controlPoint2[1] +
			"\n" + curve.end[0] + "," + curve.end[1];
		}

		return result;
	}
}

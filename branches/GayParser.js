class GayParser {
	constructor(gay) {
		let glyphs = [];

		function parseCoord(c) {
			let parts = c.split(',');
			return [ parseInt(parts[0]), parseInt(parts[1]) ];
		}

		for (let glyph of gay.split('#\n')) {
			if (glyph.trim() === '') continue;

			let lines = glyph.split('\n');

			let glyphData = {
				name: lines[0],
				gridSize: parseInt(lines[1]),
				curves: []
			};

			for (let i = 2; i < lines.length; i += 5) {
				let curves = {
					thickness: parseFloat(lines[i]),
					origin: parseCoord(lines[i + 1]),
					controlPoint1: parseCoord(lines[i + 2]),
					controlPoint2: parseCoord(lines[i + 3]),
					end: parseCoord(lines[i + 4])
				};

				glyphData.curves.push(curves);
			}

			glyphs.push(glyphData);
		}

		return glyphs;
	}
}

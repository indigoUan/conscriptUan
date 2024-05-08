const currentCsuVersion = "α.0.0";

class CsuParser {
	constructor(csu) {
		this.glyphs = [];

		const json = JSON.parse(csu);
		console.log(json);

		switch (json.version) {
			case "α.0.0": {
				this.glyphs = json.glyphs;
				break;
			}
		}
	}

	toString() {
		let json = {
			version: currentCsuVersion,
			glyphs: this.glyphs
		}

		return JSON.stringify(json);
	}
}

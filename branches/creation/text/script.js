const parsed = new CsuParser(sessionStorage.getItem("loadedFile"));

function seek(name) {
	for (const glyph of parsed.glyphs) {
		const allNames = glyph.name.split("/");
		for (const possible of allNames) {
			if (possible === name) {
				return glyph;
			}
		}
	}
	return undefined;
}

let whiteBg = false;
let oldText = "";
function render() {
	const text = oldText;
	const charSize = document.getElementById("charSize").value;

	const canvas = document.getElementById("myCanvas");
	const ctx = canvas.getContext("2d");

	if (whiteBg) {
		canvas.style.backgroundColor = "white";
	} else {
		canvas.style.backgroundColor = "transparent";
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (text.length > 0) {
		let maxLine = 0;
		const lineArray = new Array();

		const lines = text.split("\n");
		for (const line of lines) {
			const thisLine = new Array();

			let remaining = "";
			let name = line;
			while (name.length > 0) {
				const found = seek(name) !== undefined;
				if (found) {
					thisLine.push(name);
					name = remaining;
					remaining = "";
				} else {
					remaining = name.charAt(name.length - 1) + remaining;
					name = name.substring(0, name.length - 1);
				}
			}
			maxLine = Math.max(maxLine, thisLine.length);
			lineArray.push(thisLine);
		}

		const order = document.getElementById("writingOrder").value;

		if (order === "lrtd" || order === "rltd") {
			canvas.width = charSize * maxLine;
			canvas.height = charSize * lineArray.length;
		}
		if (order === "tdlr") {
			canvas.width = charSize * lineArray.length;
			canvas.height = charSize * maxLine;
		}

		if (document.getElementById("monospace") && document.getElementById("monospace").value === "on") {
			function char(line, row, x, y) {
				if (lineArray[line]) {
					console.log(lineArray[line], lineArray[line][row]);
					const glyph = seek(lineArray[line][row]);
					if (glyph) {
						for (let curve of glyph.curves) {
							const stepX = charSize / (glyph.grid - 1);
							const stepY = charSize / (glyph.grid - 1);
	
							ctx.lineCap = "round";
							ctx.beginPath();
							ctx.lineWidth = curve.thickness * charSize;
	
							ctx.moveTo(curve.origin[0] * stepX + x * charSize, curve.origin[1] * stepY + y * charSize);
	
							ctx.bezierCurveTo(
								curve.controlPoint1[0] * stepX + x * charSize, curve.controlPoint1[1] * stepY + y * charSize,
								curve.controlPoint2[0] * stepX + x * charSize, curve.controlPoint2[1] * stepY + y * charSize,
								curve.end[0] * stepX + x * charSize, curve.end[1] * stepY + y * charSize
							);
	
							ctx.stroke();
							ctx.closePath();
						}
					}
				}
			}

			if (order === "lrtd") {
				for (let y = 0; y < lineArray.length; y++) {
					for (let x = 0; x < maxLine; x++) {
						char(y, x, x, y);
					}
				}
			}
			if (order === "rltd") {
				for (let y = 0; y < lineArray.length; y++) {
					for (let x = 0; x < maxLine; x++) {
						char(y, x, maxLine - 1 - x, y);
					}
				}
			}
			if (order === "tdlr") {
				for (let y = 0; y < lineArray.length; y++) {
					for (let x = 0; x < maxLine; x++) {
						char(y, x, y, x);
					}
				}
			}
		} else {
			let X = order === "rltd"? canvas.width - (charSize / 50 * 5) : (charSize / 50 * 5);
			let Y = (charSize / 50 * 5);

			function drawChar(name, xOffset, yOffset) {
				const glyph = seek(name);
				if (glyph) {
					const gridPart = charSize / (glyph.grid - 1);
					for (let curve of glyph.curves) {
						ctx.lineCap = "round";
						ctx.beginPath();
						ctx.lineWidth = curve.thickness * charSize;

						ctx.moveTo(curve.origin[0] / (glyph.grid - 1) * charSize + X - (xOffset * gridPart), curve.origin[1] / (glyph.grid - 1) * charSize + Y - (yOffset * gridPart));

						ctx.bezierCurveTo(
							curve.controlPoint1[0] / (glyph.grid - 1) * charSize + X - (xOffset * gridPart), curve.controlPoint1[1] / (glyph.grid - 1) * charSize + Y - (yOffset * gridPart),
							curve.controlPoint2[0] / (glyph.grid - 1) * charSize + X - (xOffset * gridPart), curve.controlPoint2[1] / (glyph.grid - 1) * charSize + Y - (yOffset * gridPart),
							curve.end[0] / (glyph.grid - 1) * charSize + X - (xOffset * gridPart), curve.end[1] / (glyph.grid - 1) * charSize + Y - (yOffset * gridPart)
						);

						ctx.stroke();
						ctx.closePath();
					}
				}
			}

			function glyphRect(glyph) {
				if (glyph.rect) {
					return glyph.rect;
				}

				const rect = {
					x: glyph.grid - 1,
					y: glyph.grid - 1,
					width: 0,
					height: 0
				}

				for (const curve of glyph.curves) {
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

			if (order === "lrtd" || order === "rltd") {
				const ogX = X;
				for (const line of lineArray) {
					let yAdd = 0;
					for (const char of line) {
						const glyph = seek(char);
						const rect = glyphRect(glyph);
						const gridPart = charSize / (glyph.grid - 1);

						if (order === "lrtd") {
							drawChar(char, rect.x, rect.y);
							X += rect.x + (rect.width) * gridPart + (charSize / 15);
							yAdd = Math.max(yAdd, rect.height * gridPart);
						}
						if (order === "rltd") {
							X -= (rect.width) * gridPart + (charSize / 15);
							drawChar(char, rect.x, rect.y);
							yAdd = Math.max(yAdd, rect.height * gridPart);
						}
					}
					X = ogX;
					Y += yAdd;
				}
			} else {
				const ogY = Y;
				for (const line of lineArray) {
					let xAdd = 0;
					for (const char of line) {
						const glyph = seek(char);
						const rect = glyphRect(glyph);
						const gridPart = charSize / (glyph.grid - 1);

						drawChar(char, rect.x, rect.y);
						Y += rect.y + (rect.height) * gridPart + (charSize / 15);
						xAdd = Math.max(xAdd, rect.height * gridPart);
					}
					Y = ogY;
					X += xAdd;
				}
			}
		}
	}
}

function loop(timestamp) {
	const text = document.getElementById("inputText").value.trim();
	const white = document.getElementById("whiteBg").checked;
	if (text !== oldText || white !== whiteBg) {
		oldText = text;
		whiteBg = white;
		render();
	}

	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

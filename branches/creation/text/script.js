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

		// horizontal - vertical 
		// canvas.width = charSize * maxLine;
		// canvas.height = charSize * lineArray.length;

		// vertical - horizontal 
		canvas.width = charSize * lineArray.length;
		canvas.height = charSize * maxLine;

		console.log(lineArray);

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

		// lr td 
		for (let y = 0; y < lineArray.length; y++) {
			for (let x = 0; x < maxLine; x++) {
				char(y, x, x, y);
			}
		}

		// td lr 
		for (let y = 0; y < lineArray.length; y++) {
			for (let x = 0; x < maxLine; x++) {
				char(y, x, y, x);
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

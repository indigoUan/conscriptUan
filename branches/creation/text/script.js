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

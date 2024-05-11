let hoveringId = -1;

let parsed = new CsuParser(sessionStorage.getItem("loadedFile"));

const nameDiv = document.getElementById("scriptName");
nameDiv.value = parsed.name;
nameDiv.addEventListener("change", (event) => {
	console.log(event.target.value);
	parsed.name = event.target.value;
	updateStored();
});

document.getElementById("deleteGlyph").addEventListener("click", function(e) {
	if (hoveringId >= 0) {
		parsed.glyphs.splice(hoveringId, 1);
		console.log("subcanvas" + hoveringId);
		hoveringId = -1;
		updateStored();
		reload();
	}
});

let lastLength = 0;

function reload() {
	for (let i = 0; i < lastLength; i++) {
		if (document.getElementById("subcanvas" + i)) {
			document.body.removeChild(document.getElementById("subcanvas" + i));
		}
	}
	if (document.getElementById("subcanvasAdd")) {
		document.body.removeChild(document.getElementById("subcanvasAdd"));
	}

	lastLength = parsed.glyphs.length;
	for (let i = 0; i < parsed.glyphs.length; i++) {
		const glyph = parsed.glyphs[i];

		console.log(glyph.name);

		let newCanv = document.createElement("canvas");
		newCanv.id = "subcanvas" + i;
		newCanv.width = newCanv.height = "100";
		newCanv.style = "margin-left: 20px; margin-top: 20px; margin-bottom: 20px; cursor: pointer;";
		newCanv.style.backgroundColor = "white";
		document.body.appendChild(newCanv);

		const ctx = newCanv.getContext("2d");
		ctx.lineCap = "round";
		for (let curve of glyph.curves) {
			const rect = newCanv.getBoundingClientRect();
			const stepX = rect.width / (glyph.grid - 1);
			const stepY = rect.height / (glyph.grid - 1);

			ctx.beginPath();
			ctx.lineWidth = curve.thickness * 100;

			ctx.moveTo(curve.origin[0] * stepX, curve.origin[1] * stepY);

			ctx.bezierCurveTo(
				curve.controlPoint1[0] * stepX, curve.controlPoint1[1] * stepY,
				curve.controlPoint2[0] * stepX, curve.controlPoint2[1] * stepY,
				curve.end[0] * stepX, curve.end[1] * stepY
			);

			ctx.stroke();
			ctx.closePath();
		}

		newCanv.addEventListener("click", function(e) {
			Redirect.open("branches/creation/glyph", "?loaded=" + i);
		});

		newCanv.addEventListener("contextmenu", function(e) {
			e.preventDefault();
			parsed.glyphs.push({
				name: glyph.name,
				grid: glyph.grid,
				curves: glyph.curves
			});
			updateStored();
			reload();
		});
	}

	// adding the New Glyph canvas 
	{
		let addNewGlyph = document.createElement("canvas");
		addNewGlyph.id = "subcanvasAdd";
		addNewGlyph.width = addNewGlyph.height = "100";
		addNewGlyph.style = "margin-left: 20px; margin-top: 20px; margin-bottom: 20px; cursor: pointer;";
		document.body.appendChild(addNewGlyph);

		addNewGlyph.addEventListener("click", function(e) {
			parsed.glyphs.push({
				name: "Unnamed Glyph",
				grid: 15,
				curves: new Array()
			});
			updateStored();

			Redirect.open("branches/creation/glyph", "?loaded=" + (parsed.glyphs.length - 1));
		});

		const ctx = addNewGlyph.getContext("2d");
		{
			ctx.beginPath();
			ctx.lineWidth = 24;
			ctx.strokeStyle = "white";			

			ctx.moveTo(50, 3);
			ctx.lineTo(50, 97);
			ctx.stroke();

			ctx.moveTo(3, 50);
			ctx.lineTo(97, 50);
			ctx.stroke();

			ctx.closePath();
		}
		{
			ctx.beginPath();
			ctx.lineWidth = 20;
			ctx.strokeStyle = "black";			

			ctx.moveTo(50, 5);
			ctx.lineTo(50, 95);
			ctx.stroke();

			ctx.moveTo(5, 50);
			ctx.lineTo(95, 50);
			ctx.stroke();

			ctx.closePath();
		}
	}
}

function downloadScript() {
	var blob = new Blob([parsed.toString()], {type: "text/plain"});

	var url = URL.createObjectURL(blob);

	var a = document.createElement("a");
	a.href = url;
	a.download = document.getElementById("scriptName").value.toLowerCase().replace(" ", "_") + ".json";
	a.style.display = "none";

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function updateStored() {
	sessionStorage.setItem("loadedFile", parsed.toString());
}

let mouse = { x: 0, y: 0 }

document.addEventListener('mousemove', function(e) {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});

function loop(timestamp) {
	hoveringId = -1;

	for (let i = 0; i < parsed.glyphs.length; i++) {
		const canv = document.getElementById("subcanvas" + i);
		if (canv) {
			const rect = canv.getBoundingClientRect();
			if (rect) {
				if (mouse.x >= rect.left && mouse.x <= rect.left + rect.width && mouse.y >= rect.top && mouse.y <= rect.top + rect.height) {
					hoveringId = i;
					break;
				}
			}
		}
	}

	const deleteGlyph = document.getElementById("deleteGlyph");

	if (hoveringId >= 0) {
		const canv = document.getElementById("subcanvas" + hoveringId);

		deleteGlyph.style.display = "block";

		deleteGlyph.style.left = (canv.getBoundingClientRect().right - deleteGlyph.getBoundingClientRect().width) + "px";
		deleteGlyph.style.top = (canv.getBoundingClientRect().bottom - deleteGlyph.getBoundingClientRect().height) + "px";
	} else {
		deleteGlyph.style.display = "none";
	}

	requestAnimationFrame(loop);
}

reload();
requestAnimationFrame(loop);

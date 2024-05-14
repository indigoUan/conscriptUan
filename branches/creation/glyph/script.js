window.dirty = false;
window.sortables = new Array();

window.gridResolution = 15;
let showGrid = true;

let curves = [];

function drawGrid(canvas, ctx) {
	if (!showGrid) return;

	// settings for the snapping grid 
	ctx.lineWidth = 1;
	ctx.strokeStyle = "white";

	// drawing the grid 
	for (i = 0; i < window.gridResolution - 2; i++) {
		ctx.beginPath();

		ctx.moveTo(canvas.width * (1 / (window.gridResolution - 1)) * (i + 1), 0);
		ctx.lineTo(canvas.width * (1 / (window.gridResolution - 1)) * (i + 1), canvas.height);

		ctx.stroke();
		ctx.closePath();

		ctx.beginPath();

		ctx.moveTo(0, canvas.height * (1 / (window.gridResolution - 1)) * (i + 1), 0);
		ctx.lineTo(canvas.width, canvas.height * (1 / (window.gridResolution - 1)) * (i + 1));

		ctx.stroke();
		ctx.closePath();
	}
}

function drawCurves(ctx) {
	// setting bezier curve default settings 
	ctx.lineWidth = 1;
	ctx.strokeStyle = "black";

	// drawing the curves 
	for (let i = 0; i < curves.length; i++) {
		curves[i].draw();
	}
}

function render() {
	let canvas = document.getElementById("myCanvas");
	let ctx = canvas.getContext("2d");

	// clearing the canvas 
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawGrid(canvas, ctx);
	drawCurves(ctx);
}

{
	const canvas = document.getElementById("myCanvas");
	const ctx = canvas.getContext("2d");
	ctx.lineCap = "round";
}

let editingParsedIndex = undefined;
let parsed = undefined;

{
	const params = new URLSearchParams(window.location.search);

	if (params.has("loaded")) {
		parsed = new CsuParser(sessionStorage.getItem("loadedFile"));
		editingParsedIndex = parseInt(params.get("loaded"));
		console.log(editingParsedIndex, parsed.glyphs[editingParsedIndex]);

		{
			let newCanv = document.createElement("canvas");
			newCanv.id = "sortableCanvas-1";
			newCanv.width = newCanv.height = "100";
			newCanv.style = "margin-left: 20px; margin-top: 18px; margin-bottom: 20px; cursor: pointer;";
			newCanv.addEventListener("click", function(e) {
				if (selectedLine > -1 && curves[selectedLine]) {
					curves[selectedLine].deactivate();
				}
				selectedLine = -1;
			});
			document.getElementById("sortableCanvases").appendChild(newCanv);

			const ctx = newCanv.getContext("2d");
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

		window.gridResolution = parsed.glyphs[editingParsedIndex].grid;
		for (let curve of parsed.glyphs[editingParsedIndex].curves) {
			let cur = new BezierCurve();
			cur.thickness = curve.thickness;
			cur.setGriddedPoints(curve.origin, curve.controlPoint1, curve.controlPoint2, curve.end);
			curves.push(cur);
		}

	// adding the New Glyph canvas 
	{
		let addNewGlyph = document.createElement("canvas");
		addNewGlyph.id = "subcanvasAdd";
		addNewGlyph.width = addNewGlyph.height = "100";
		addNewGlyph.style = "margin-left: 20px; margin-top: 20px; margin-bottom: 20px; cursor: pointer;";
		document.getElementById("sortableCanvases").appendChild(addNewGlyph);

		addNewGlyph.addEventListener("click", function(e) {
			document.getElementById("sortableCanvases").removeChild(addNewGlyph);

			var curve = new BezierCurve();
			if (curves[selectedLine]) {
				curves[selectedLine].deactivate();
			}
			curves.push(curve);
			selectedLine = curves.length - 1;
			curves[selectedLine].activate();
			window.dirty = true;

			document.getElementById("sortableCanvases").appendChild(addNewGlyph);
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

		const nameDiv = document.getElementById("glyphName");
		nameDiv.value = parsed.glyphs[editingParsedIndex].name;
		nameDiv.addEventListener("change", (event) => {
			console.log(event.target.value);
			parsed.glyphs[editingParsedIndex].name = event.target.value;
		});
	}
}

document.getElementById("gridCheckbox").addEventListener("change", function() {
	showGrid = this.checked;
	console.log("showGrid:", showGrid);
});

let selectedLine = -1;

document.addEventListener("keydown", function(event) {
	if (event.key === "Backspace") {
		if (selectedLine >= 0) {
			if (curves[selectedLine]) {
				curves[selectedLine].deactivate();
			}
			curves.splice(selectedLine, 1);
			selectedLine = -1;
			window.dirty = true;
		}
	}

	if (curves[selectedLine] && (event.key === "-" || event.key === "+")) {
		if (event.key === "-") {
			curves[selectedLine].thickness = Math.max(curves[selectedLine].thickness - 0.01, 0.01);
		}
		if (event.key === "+") {
			curves[selectedLine].thickness = Math.min(curves[selectedLine].thickness + 0.01, 1);
		}
	}

	if (event.key === "Enter") {
		saveAndReturn();
	}

	if (event.key === "Escape") {
		cancelAndReturn();
	}
});

function saveAndReturn() {
	if (parsed !== null && editingParsedIndex !== null) {
		window.dirty = false;

		parsed.glyphs[editingParsedIndex].curves = new Array();
		for (let curve of curves) {
			parsed.glyphs[editingParsedIndex].curves.push({
				thickness: curve.thickness,
				origin: [ curve.originPoint.x, curve.originPoint.y ],
				controlPoint1: [ curve.controlPoint1.x, curve.controlPoint1.y ],
				controlPoint2: [ curve.controlPoint2.x, curve.controlPoint2.y ],
				end: [ curve.endPoint.x, curve.endPoint.y ]
			});
		}
		if (parsed.glyphs[editingParsedIndex].curves.length === 0) {
			parsed.glyphs.splice(editingParsedIndex, 1);
		} else {
			console.log(parsed.glyphs[editingParsedIndex].curves);
		}

		sessionStorage.setItem("loadedFile", parsed.toString());
		Redirect.open("branches/creation/whole");
	} else {
		alert("You loaded this page without a glyph.");
	}
}

function cancelAndReturn() {
	if (parsed !== null && editingParsedIndex !== null) {
		window.dirty = false;

		console.log(parsed.glyphs[editingParsedIndex].curves);
		if (parsed.glyphs[editingParsedIndex].curves.length === 0) {
			parsed.glyphs.splice(editingParsedIndex, 1);
			sessionStorage.setItem("loadedFile", parsed.toString());
		} else {
			console.log(parsed.glyphs[editingParsedIndex].curves);
		}

		Redirect.open("branches/creation/whole");
	} else {
		alert("You loaded this page without a glyph.");
	}
}

window.addEventListener("beforeunload", function(e) {
	if (window.dirty) {
		var confirmationMessage = 'You should save before leaving.';

		e.preventDefault();
		return confirmationMessage;
	}
});

function flipXorY(axis) {
	if (selectedLine > -1) {
		if (curves[selectedLine]) {
			curves[selectedLine].deactivate();
		}
	}

	for (let curve of curves) {
		if (axis === 0) {
			curve.originPoint.x = window.gridResolution - curve.originPoint.x - 1;
			curve.controlPoint1.x = window.gridResolution - curve.controlPoint1.x - 1;
			curve.controlPoint2.x = window.gridResolution - curve.controlPoint2.x - 1;
			curve.endPoint.x = window.gridResolution - curve.endPoint.x - 1;
		} else {
			curve.originPoint.y = window.gridResolution - curve.originPoint.y - 1;
			curve.controlPoint1.y = window.gridResolution - curve.controlPoint1.y - 1;
			curve.controlPoint2.y = window.gridResolution - curve.controlPoint2.y - 1;
			curve.endPoint.y = window.gridResolution - curve.endPoint.y - 1;
		}
	}

	if (selectedLine > -1) {
		if (curves[selectedLine]) {
			curves[selectedLine].activate();
		}
	}
}

function moveAll(axis, value) {
	if (selectedLine > -1) {
		if (curves[selectedLine]) {
			curves[selectedLine].deactivate();
		}
	}

	for (let curve of curves) {
		if (axis === 0) {
			curve.originPoint.x += value;
			curve.controlPoint1.x += value;
			curve.controlPoint2.x += value;
			curve.endPoint.x += value;
		} else {
			curve.originPoint.y += value;
			curve.controlPoint1.y += value;
			curve.controlPoint2.y += value;
			curve.endPoint.y += value;
		}
	}

	if (selectedLine > -1) {
		if (curves[selectedLine]) {
			curves[selectedLine].activate();
		}
	}
}

function loop(timestamp) {
	render();
	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

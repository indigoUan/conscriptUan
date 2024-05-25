window.dirty = false;
window.scheduledRedraw = false;
window.sortables = new Array();

window.gridResolution = 15;
let showGrid = true;

let cruveCanvases = [];
let curves = [];

let hoveringId = -1;
document.getElementById("deleteGlyph").addEventListener("click", function(e) {
	if (hoveringId > -1) {
		if (curves[selectedLine]) {
			curves[selectedLine].deactivate();
		}
		selectedLine = -1;

		curves.splice(hoveringId, 1);
		hoveringId = -1;
		dirtify();
	}
});

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

function redraw() {
	document.getElementById("sortableCanvases").innerHTML = "";

	const deselect = document.createElement("canvas");
	deselect.id = "sortableCanvas-1";
	deselect.width = deselect.height = "100";
	deselect.style = "margin-left: 20px; margin-top: 18px; margin-bottom: 20px; cursor: pointer;";
	deselect.addEventListener("click", function(e) {
		if (selectedLine > -1 && curves[selectedLine]) {
			curves[selectedLine].deactivate();
		}
		selectedLine = -1;
	});
	document.getElementById("sortableCanvases").appendChild(deselect);

	var ctx = deselect.getContext("2d");
	{
		ctx.beginPath();
		ctx.lineWidth = 24;
		ctx.strokeStyle = "white";

		ctx.moveTo(15, 15);
		ctx.lineTo(85, 85);
		ctx.stroke();

		ctx.moveTo(85, 15);
		ctx.lineTo(15, 85);
		ctx.stroke();

		ctx.closePath();
	}
	{
		const margin = 1.4142135623730951; // Math.sqrt(2);

		ctx.beginPath();
		ctx.lineWidth = 20;
		ctx.strokeStyle = "black";

		ctx.moveTo(15 + margin, 15 + margin);
		ctx.lineTo(85 - margin, 85 - margin);
		ctx.stroke();

		ctx.moveTo(85 - margin, 15 + margin);
		ctx.lineTo(15 + margin, 85 - margin);
		ctx.stroke();

		ctx.closePath();
	}

	const newCurve = document.createElement("canvas");
	newCurve.id = "subcanvasAdd";
	newCurve.width = newCurve.height = "100";
	newCurve.style = "margin-left: 20px; margin-top: 20px; margin-bottom: 20px; cursor: pointer;";
	document.getElementById("sortableCanvases").appendChild(newCurve);

	newCurve.addEventListener("click", function(e) {
		var curve = new BezierCurve();
		if (curves[selectedLine]) {
			curves[selectedLine].deactivate();
		}
		curves.push(curve);
		selectedLine = curves.length - 1;
		curves[selectedLine].activate();
		dirtify();

		document.getElementById("sortableCanvases").appendChild(newCurve);
	});

	var ctx = newCurve.getContext("2d");
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

	document.getElementById("sortableCanvases").appendChild(deselect);

	for (let i = 0; i < curves.length; i++) {
		const id = i;
		const selectable = document.createElement("canvas");
		selectable.id = "sortableCanvas" + i;
		selectable.width = selectable.height = "100";
		selectable.style = "background-color: white; margin-left: 20px; margin-top: 18px; margin-bottom: 20px; cursor: pointer;";
		selectable.addEventListener("click", function(e) {
			if (selectedLine > -1 && curves[selectedLine]) {
				curves[selectedLine].deactivate();
			}
			selectedLine = id;
			if (selectedLine > -1 && curves[selectedLine]) {
				curves[selectedLine].activate();
			}
		});

		var ctx = selectable.getContext("2d");
		ctx.lineCap = "round";
		ctx.lineWidth = 100 * curves[i].thickness;

		const stepX = 100 / (window.gridResolution - 1);
		const stepY = 100 / (window.gridResolution - 1);

		ctx.beginPath();

		ctx.moveTo(curves[i].originPoint.x * stepX, curves[i].originPoint.y * stepY);
		ctx.bezierCurveTo(curves[i].controlPoint1.x * stepX, curves[i].controlPoint1.y * stepY,
			curves[i].controlPoint2.x * stepX, curves[i].controlPoint2.y * stepY,
			curves[i].endPoint.x * stepX, curves[i].endPoint.y * stepY);

		ctx.stroke();
		ctx.closePath();

		document.getElementById("sortableCanvases").appendChild(selectable);
	}

	document.getElementById("sortableCanvases").appendChild(newCurve);
}

function render() {
	const canvas = document.getElementById("myCanvas");
	const ctx = canvas.getContext("2d");

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

		window.gridResolution = parsed.glyphs[editingParsedIndex].grid;
		for (let curve of parsed.glyphs[editingParsedIndex].curves) {
			let cur = new BezierCurve();
			cur.thickness = curve.thickness;
			cur.setGriddedPoints(curve.origin, curve.controlPoint1, curve.controlPoint2, curve.end);
			curves.push(cur);
		}

		const nameDiv = document.getElementById("glyphName");
		nameDiv.value = parsed.glyphs[editingParsedIndex].name;
		nameDiv.addEventListener("change", (event) => {
			console.log(event.target.value);
			parsed.glyphs[editingParsedIndex].name = event.target.value;
		});

		const sizeDiv = document.getElementById("gridResolution");
		sizeDiv.value = parsed.glyphs[editingParsedIndex].grid;
		sizeDiv.addEventListener("change", (event) => {
			event.target.value = event.target.value < 3? 3 : (event.target.value > 21? 21 : event.target.value);
			window.gridResolution = event.target.value;
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
			dirtify();
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
});

function saveAndReturn() {
	if (parsed !== null && editingParsedIndex !== null) {
		window.dirty = false;

		parsed.glyphs[editingParsedIndex].grid = window.gridResolution;
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

	dirtify();
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

	dirtify();
}

function dirtify() {
	window.dirty = true;
	window.scheduledRedraw = true;
}

document.addEventListener("visibilitychange", (event) => {
	if (document.visibilityState == "visible") {
		window.scheduledRedraw = true;
	}
});

let mouse = { x: 0, y: 0 }

document.addEventListener('mousemove', function(e) {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});

function loop(timestamp) {
	render();
	if (window.scheduledRedraw) {
		window.scheduledRedraw = false;
		redraw();
	}

	hoveringId = -1;

	for (let i = 0; i < parsed.glyphs.length; i++) {
		const canv = document.getElementById("sortableCanvas" + i);
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
		const canv = document.getElementById("sortableCanvas" + hoveringId);

		deleteGlyph.style.display = "block";

		deleteGlyph.style.left = (canv.getBoundingClientRect().right - deleteGlyph.getBoundingClientRect().width) + "px";
		deleteGlyph.style.top = (canv.getBoundingClientRect().bottom - deleteGlyph.getBoundingClientRect().height) + "px";
	} else {
		deleteGlyph.style.display = "none";
	}

	requestAnimationFrame(loop);
}

redraw();
requestAnimationFrame(loop);

window.dirty = false;

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

		window.gridResolution = parsed.glyphs[editingParsedIndex].grid;
		for (let curve of parsed.glyphs[editingParsedIndex].curves) {
			let cur = new BezierCurve();
			cur.thickness = curve.thickness;
			cur.setGriddedPoints(curve.origin, curve.controlPoint1, curve.controlPoint2, curve.end);
			curves.push(cur);
		}
	} else if (params.has("lines")) {
		let parsed = parseInt(decodeURIComponent(params.get("lines")));

		for (let i = 0; i < parsed; i++) {
			var curve = new BezierCurve();
			curves.push(curve);
		}

		console.log("genned " + (parsed) + " default lines");
	}
}

document.getElementById("gridCheckbox").addEventListener("change", function() {
	showGrid = this.checked;
	console.log("showGrid:", showGrid);
});

let selectedLine = -1;

document.addEventListener("keydown", function(event) {
	if (event.key === "ArrowLeft") {
		selectedLine--;
		if (selectedLine < -1) {
			selectedLine = curves.length - 1;
		}
	}

	if (event.key === "ArrowRight") {
		selectedLine++;
		if (selectedLine > curves.length - 1) {
			selectedLine = -1;
		}
	}

	if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
		for (let c of curves) {
			if (c) {
				c.deactivate();
			}
		}
		if (selectedLine > -1) {
			if (curves[selectedLine]) {
				curves[selectedLine].activate();
			}
		}
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
		console.log(parsed.glyphs[editingParsedIndex].curves);

		sessionStorage.setItem("loadedFile", parsed.toString());
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


function loop(timestamp) {
	render();
	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

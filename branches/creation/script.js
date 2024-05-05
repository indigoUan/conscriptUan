window.gridResolution = 11;
let showGrid = true;

let curves = [];

curves.push(new BezierCurve(6, "white"));
// curves.push(new BezierCurve(0, "red"));
// curves.push(new BezierCurve(1, "yellow"));
// curves.push(new BezierCurve(2, "lime"));
// curves.push(new BezierCurve(3, "cyan"));
// curves.push(new BezierCurve(4, "blue"));
// curves.push(new BezierCurve(5, "magenta"));

for (let i = 0; i < curves.length; i++) {
	curves[i].activate();
}

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

function drawCurves(canvas, ctx) {
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
	drawCurves(canvas, ctx);
}

{
	const canvas = document.getElementById("myCanvas");
	const ctx = canvas.getContext("2d");
	ctx.lineCap = "round";
}

document.getElementById("gridCheckbox").addEventListener("change", function() {
    showGrid = this.checked;
    console.log("showGrid:", showGrid);
});

document.addEventListener("keydown", function(event) {
	if(event.key === " ") {
		for (let i = 0; i < curves.length; i++) {
			curves[i].deactivate();
		}
	}
	if(event.key.toLowerCase() === "s") {
		let curve = new Array();

		for (let i = 0; i < curves.length; i++) {
			console.log(curves[i].getGriddedPoints());
			curve.push(curves[i].getGriddedPoints());
		}

		let lett = new Map();
		lett.set("gridSize", window.gridResolution);
		lett.set("curves", curve);

		let script = new Map();
		script.set("1$ítsa", Object.fromEntries(lett));

		let json = JSON.stringify(Object.fromEntries(script));
		console.log(json);
	}
});

function loop(timestamp) {
	render();
	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

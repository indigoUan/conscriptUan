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

{
	let params = new URLSearchParams(window.location.search);

	if (params.has("loaded")) {
		let parsed = new GayParser(decodeURIComponent(params.get("loaded")))[0];
		console.log("Parsed: ", parsed);

		window.gridResolution = parsed.gridSize;
		for (let curve of parsed.curves) {
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

	if (curves[0]) {
		curves[0].activate();
	}
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
		let result = "#\n";
		result += "1$ítsa\n";
		result += (window.gridResolution) + "\n";

		for (let i = 0; i < curves.length; i++) {
			result += (curves[i].thickness) + "\n";
			for (let j of curves[i].getGriddedPoints()) {
				result += (j[0]) + "," + (j[1]) + "\n";
			}
		}

		result = result.trim();
		console.log(result);
		downloadStringAsFile(result, "biruscript.gay");
	}
	if (event.key.toLowerCase() === "l") {
		let input = document.createElement("input");
		input.type = "file";
		input.accept = ".gay";
		input.onchange = function() {
			let file = this.files[0];
			let reader = new FileReader();
			reader.onload = function() {
				let url = new URL(window.location.href);
				let params = new URLSearchParams(url.search);
				params.delete("lines");
				params.set("loaded", encodeURIComponent(reader.result));
				url.search = params.toString();
				window.location.href = url.toString();
			};
			reader.readAsText(file);
		};
		input.click();
	}
});

function downloadStringAsFile(string, filename) {
	var blob = new Blob([string], {type: "text/plain"});

	var url = URL.createObjectURL(blob);

	var a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.style.display = "none";

	document.body.appendChild(a);

	a.click();

	document.body.removeChild(a);
}


function loop(timestamp) {
	render();
	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

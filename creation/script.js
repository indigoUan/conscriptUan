let curves = [];

curves.push(new BezierCurve("0", "red"));
curves.push(new BezierCurve("1", "blue"));
curves.push(new BezierCurve("2", "lime"));
curves.push(new BezierCurve("3", "white"));

for (let i = 0; i < curves.length; i++) {
	curves[i].activate();
}

function update() {
	let canvas = document.getElementById("myCanvas");
	let ctx = canvas.getContext("2d");

	ctx.lineWidth = 1;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();

	for (let i = 0; i < curves.length; i++) {
		curves[i].update();
	}
}


function loop(timestamp) {
	update();
	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

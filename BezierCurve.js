class BezierCurve {
	constructor(dotsId, activeColor) {
		this.thickness = 12;
		this.dotsId = dotsId;
		this.activeColor = activeColor;

		let style = document.createElement('style');
		style.innerHTML = `
		.dot${dotsId} {
			height: 16px;
			width: 16px;
			background-color: #909090;
			border-radius: 50%;
			position: absolute;
			cursor: move;

			-webkit-user-select: none;  /* Chrome, Safari, Opera */
			-khtml-user-select: none;   /* Konqueror */
			-moz-user-select: none;     /* Firefox */
			-ms-user-select: none;      /* Internet Explorer/Edge */
			user-select: none;          /* Non-prefixed version, currently supported by Chrome, Opera and Firefox */
		}
		`;
		document.head.appendChild(style);
		this.deactivate();

		for (let i = 0; i < 4; i++) {
			let dot = document.createElement('div');
			dot.id = `dot${i}_${dotsId}`;
			dot.className = `dot${dotsId}`;

			document.body.appendChild(dot);
		}

		let dots = document.getElementsByClassName(`dot${dotsId}`);

		for (let i = 0; i < dots.length; i++) {
			let canvas = document.getElementById("myCanvas");
			let rect = canvas.getBoundingClientRect();

			let initialX = 0;
			let initialY = 0;

			if (i == 0) {
			} else if (i == 1) {
				initialY = canvas.height;
			} else if (i == 2) {
				initialX = canvas.width;
			} else if (i == 3) {
				initialX = canvas.width;
				initialY = canvas.height;
			}

			dots[i].style.top = `${initialX}px`;
			dots[i].style.left = `${initialY}px`;
		}
	}

	makeMouseDownHandler(dot) {
		return function(e) {
			let offsetX = e.clientX - parseInt(window.getComputedStyle(this).left);
			let offsetY = e.clientY - parseInt(window.getComputedStyle(this).top);

			function mouseMoveHandler(e) {
				dot.style.top = `${e.clientY - offsetY}px`;
				dot.style.left = `${e.clientX - offsetX}px`;
			}

			function reset() {
				document.removeEventListener("mousemove", mouseMoveHandler);
				document.removeEventListener("mouseup", reset);
			}

			document.addEventListener("mousemove", mouseMoveHandler);
			document.addEventListener("mouseup", reset);
		}
	}

	toggle() {
		if (this.active) {
			this.deactivate();
		} else {
			this.activate();
		}
	}
	activate() {
		this.active = true;

		let dots = document.getElementsByClassName(`dot${this.dotsId}`);
		for(let i = 0; i < dots.length; i++) {
			dots[i].style.backgroundColor = this.activeColor? this.activeColor : "white";
			dots[i].style.display = "block";

			dots[i].addEventListener("mousedown", this.makeMouseDownHandler(dots[i]));
		}
	}
	deactivate() {
		this.active = false;

		let dots = document.getElementsByClassName(`dot${this.dotsId}`);
		for(let i = 0; i < dots.length; i++) {
			dots[i].style.backgroundColor = "#909090";
			dots[i].style.display = "none";

			dots[i].removeEventListener("mousedown", this.makeMouseDownHandler(dots[i]));
		}
	}

	draw() {
		const gridRes = window.gridResolution;

		let canvas = document.getElementById("myCanvas");
		let ctx = canvas.getContext("2d");
		let rect = canvas.getBoundingClientRect();

		let offset = { x: parseFloat(rect.left) * 0.5, y: parseFloat(rect.top) * 0.5 }

		let origin = document.getElementsByClassName(`dot${this.dotsId}`)[0];
		let bPoint1 = document.getElementsByClassName(`dot${this.dotsId}`)[1];
		let bPoint2 = document.getElementsByClassName(`dot${this.dotsId}`)[2];
		let end = document.getElementsByClassName(`dot${this.dotsId}`)[3];

		ctx.beginPath();
		ctx.lineWidth = this.thickness;

		ctx.moveTo(parseFloat(origin.style.left) - offset.x, parseFloat(origin.style.top) - offset.y);

		ctx.bezierCurveTo(
			parseFloat(bPoint1.style.left) - offset.x, parseFloat(bPoint1.style.top) - offset.y,
			parseFloat(bPoint2.style.left) - offset.x, parseFloat(bPoint2.style.top) - offset.y,
			parseFloat(end.style.left) - offset.x, parseFloat(end.style.top) - offset.y
		);

		ctx.stroke();
		ctx.closePath();
	}
}

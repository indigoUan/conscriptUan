class BezierCurve {
	constructor(dotsId) {
		this.thickness = 0.035;
		this.dotsId = dotsId;

		const style = document.createElement("style");
		style.innerHTML = `.dot${dotsId} {
			height: 16px;
			width: 16px;
			background-color: white;
			border-radius: 50%;
			position: absolute;
			cursor: move;
			transform: scale(200%);

			-webkit-user-select: none;  /* Chrome, Safari, Opera */
			-khtml-user-select: none;   /* Konqueror */
			-moz-user-select: none;     /* Firefox */
			-ms-user-select: none;      /* Internet Explorer/Edge */
			user-select: none;          /* Non-prefixed version, currently supported by Chrome, Opera and Firefox */
		}

		@media (max-width: 768px) {
			.dot${dotsId} {
				transform: scale(400%);
			}
		}`;
		document.head.appendChild(style);
		this.deactivate();

		for (let i = 0; i < 4; i++) {
			let dot = document.createElement("div");
			dot.id = `dot${i}_${dotsId}`;
			dot.className = `dot${dotsId}`;
			switch (i) {
				case 0: {
					dot.style.backgroundColor = "#00ff00";
					break;
				}
				case 2: {
					dot.style.backgroundColor = "#707070";
					break;
				}
				case 3: {
					dot.style.backgroundColor = "#ff0000";
					break;
				}
			}

			document.body.appendChild(dot);
		}

		const dots = document.getElementsByClassName(`dot${dotsId}`);

		for (let i = 0; i < dots.length; i++) {
			const canvas = document.getElementById("myCanvas");
			const rect = canvas.getBoundingClientRect();

			let initialX = rect.left - 6;
			let initialY = rect.top - 6;

			if (i == 0) {
			} else if (i == 1) {
				initialY += rect.height - 4;
			} else if (i == 2) {
				initialX += rect.width - 4;
			} else if (i == 3) {
				initialX += rect.width - 4;
				initialY += rect.height - 4;
			}

			dots[i].style.left = `${initialX}px`;
			dots[i].style.top = `${initialY}px`;
		}
	}

	snap(point) {
		const rect = document.getElementById("myCanvas").getBoundingClientRect();

		const stepX = rect.width / (window.gridResolution - 1);
		const stepY = rect.width / (window.gridResolution - 1);

		const result = {
			x: Math.round(parseFloat(point.left) / stepX) * stepX,
			y: (Math.round(parseFloat(point.top) / stepY) - 1) * stepY
		}

		return result;
	}

	makeMouseDownHandler(dot) {
		const rect = document.getElementById("myCanvas").getBoundingClientRect();
		const snapMethod = this.snap;

		return function(e) {
			e.preventDefault();
			let clientX = e.clientX, clientY = e.clientY;

			if (e.touches) {
				clientX = e.touches[0].clientX;
				clientY = e.touches[0].clientY;
			}

			const offsetX = clientX - parseInt(window.getComputedStyle(this).left);
			const offsetY = clientY - parseInt(window.getComputedStyle(this).top);

			function mouseMoveHandler(e) {
				e.preventDefault();
				let clientX = e.clientX, clientY = e.clientY;

				if (e.touches) {
					clientX = e.touches[0].clientX;
					clientY = e.touches[0].clientY;
				}

				dot.style.left = `${Math.min(Math.max(clientX - offsetX, rect.left - 6), rect.width + rect.left - 10)}px`;
				dot.style.top = `${Math.min(Math.max(clientY - offsetY, rect.top - 6), rect.height + rect.top - 10)}px`;
			}

			function reset() {
				const snapped = snapMethod(dot.style);

				dot.style.left = `${snapped.x + rect.left - 8}px`;
				dot.style.top = `${snapped.y + rect.top - 8}px`;

				document.removeEventListener("mousemove", mouseMoveHandler);
				document.removeEventListener("mouseup", reset);
				document.removeEventListener("touchmove", mouseMoveHandler);
				document.removeEventListener("touchend", reset);
			}

			document.addEventListener("mousemove", mouseMoveHandler);
			document.addEventListener("mouseup", reset);
			document.addEventListener("touchmove", mouseMoveHandler);
			document.addEventListener("touchend", reset);
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

		const dots = document.getElementsByClassName(`dot${this.dotsId}`);
		for(let i = 0; i < dots.length; i++) {
			dots[i].style.display = "block";

			const handler = this.makeMouseDownHandler(dots[i]);
			dots[i].addEventListener("mousedown", handler);
			dots[i].addEventListener("touchstart", handler);
		}
	}

	deactivate() {
		this.active = false;

		const dots = document.getElementsByClassName(`dot${this.dotsId}`);
		for(let i = 0; i < dots.length; i++) {
			dots[i].style.display = "none";

			const handler = this.makeMouseDownHandler(dots[i]);
			dots[i].removeEventListener("mousedown", handler);
			dots[i].removeEventListener("touchstart", handler);
		}
	}

	draw() {
		const canvas = document.getElementById("myCanvas");
		const ctx = canvas.getContext("2d");
		const rect = canvas.getBoundingClientRect();

		const origin = this.snap(document.getElementsByClassName(`dot${this.dotsId}`)[0].style);
		const bPoint1 = this.snap(document.getElementsByClassName(`dot${this.dotsId}`)[1].style);
		const bPoint2 = this.snap(document.getElementsByClassName(`dot${this.dotsId}`)[2].style);
		const end = this.snap(document.getElementsByClassName(`dot${this.dotsId}`)[3].style);

		ctx.beginPath();
		ctx.lineWidth = this.thickness * ((rect.width + rect.height) * 0.5);

		ctx.moveTo(origin.x, origin.y);

		ctx.bezierCurveTo(
			bPoint1.x, bPoint1.y,
			bPoint2.x, bPoint2.y,
			end.x, end.y
		);

		ctx.stroke();
		ctx.closePath();
	}

	getGriddedPoints() {
		let result = new Array(5);
		result[0] = this.thickness;

		const rect = document.getElementById("myCanvas").getBoundingClientRect();
		const stepX = rect.width / (window.gridResolution - 1);
		const stepY = rect.width / (window.gridResolution - 1);

		for (let i = 0; i < 4; i++) {
			const point = document.getElementsByClassName(`dot${this.dotsId}`)[i].style;

			const snapped = {
				x: Math.round(parseFloat(point.left) / stepX),
				y: (Math.round(parseFloat(point.top) / stepY) - 1)
			}

			result[i + 1] = [ snapped.x, snapped.y ];
		}

		return result;
	}
}

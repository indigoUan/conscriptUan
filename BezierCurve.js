class BezierCurve {
	constructor(dotsId, activeColor) {
		this.thickness = 0.035;
		this.dotsId = dotsId;
		this.activeColor = activeColor;

		const style = document.createElement("style");
		style.innerHTML = `.dot${dotsId} {
			height: 16px;
			width: 16px;
			background-color: #909090;
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

	makeMouseDownHandler(dot) {
		const rect = document.getElementById("myCanvas").getBoundingClientRect();

		return function(e) {
			e.preventDefault();
			let clientX = e.clientX, clientY = e.clientY;

			// If it's a touch event, update the clientX and clientY with the first touch point
			if (e.touches) {
				clientX = e.touches[0].clientX;
				clientY = e.touches[0].clientY;
			}

			const offsetX = clientX - parseInt(window.getComputedStyle(this).left);
			const offsetY = clientY - parseInt(window.getComputedStyle(this).top);

			function mouseMoveHandler(e) {
				e.preventDefault();
				let clientX = e.clientX, clientY = e.clientY;

				// If it's a touch event, update the clientX and clientY with the first touch point
				if (e.touches) {
					clientX = e.touches[0].clientX;
					clientY = e.touches[0].clientY;
				}

				dot.style.left = `${Math.min(Math.max(clientX - offsetX, rect.left - 6), rect.width + rect.left - 10)}px`;
				dot.style.top = `${Math.min(Math.max(clientY - offsetY, rect.top - 6), rect.height + rect.top - 10)}px`;
			}

			function reset() {
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
			dots[i].style.backgroundColor = this.activeColor? this.activeColor : "white";
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
			dots[i].style.backgroundColor = "#909090";
			dots[i].style.display = "none";

			const handler = this.makeMouseDownHandler(dots[i]);
			dots[i].removeEventListener("mousedown", handler);
			dots[i].removeEventListener("touchstart", handler);
		}
	}
	

	draw() {
		const gridRes = window.gridResolution;

		const canvas = document.getElementById("myCanvas");
		const ctx = canvas.getContext("2d");
		const rect = canvas.getBoundingClientRect();

		const origin = document.getElementsByClassName(`dot${this.dotsId}`)[0];
		const bPoint1 = document.getElementsByClassName(`dot${this.dotsId}`)[1];
		const bPoint2 = document.getElementsByClassName(`dot${this.dotsId}`)[2];
		const end = document.getElementsByClassName(`dot${this.dotsId}`)[3];

		const dotRadius = 8;

		ctx.beginPath();
		ctx.lineWidth = this.thickness * ((rect.width + rect.height) * 0.5);

		ctx.moveTo(parseFloat(origin.style.left) - rect.left + dotRadius, parseFloat(origin.style.top) - rect.top + dotRadius);

		ctx.bezierCurveTo(
			parseFloat(bPoint1.style.left) - rect.left + dotRadius, parseFloat(bPoint1.style.top) - rect.top + dotRadius,
			parseFloat(bPoint2.style.left) - rect.left + dotRadius, parseFloat(bPoint2.style.top) - rect.top + dotRadius,
			parseFloat(end.style.left) - rect.left + dotRadius, parseFloat(end.style.top) - rect.top + dotRadius
		);

		ctx.stroke();
		ctx.closePath();
	}
}

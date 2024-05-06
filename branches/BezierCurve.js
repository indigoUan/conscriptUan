class BezierCurve {
	constructor() {
		this.active = false;
		this.thickness = 0.035;
		this.setGriddedPoints([ 0, 0 ], [ 0, window.gridResolution - 1 ], [ window.gridResolution - 1, 0 ], [ window.gridResolution - 1, window.gridResolution - 1 ]);
	}

	snapDot(point) {
		const rect = document.getElementById("myCanvas").getBoundingClientRect();

		const stepX = rect.width / (window.gridResolution - 1);
		const stepY = rect.height / (window.gridResolution - 1);

		const result = {
			x: Math.round((parseFloat(point.left) - rect.left) / stepX) * stepX,
			y: Math.round((parseFloat(point.top) - rect.top) / stepY) * stepY
		}

		return result;
	}

	makeMouseDownHandler(dot) {
		const rect = document.getElementById("myCanvas").getBoundingClientRect();
		const snapMethod = this.snapDot;
		const self = this;

		return function(e) {
			e.preventDefault();
			let clientX = e.clientX, clientY = e.clientY;

			if (e.touches) {
				clientX = e.touches[0].clientX;
				clientY = e.touches[0].clientY;
			}

			const offsetX = clientX - parseInt(window.getComputedStyle(this).left);
			const offsetY = clientY - parseInt(window.getComputedStyle(this).top);

			function snapCurve(X, Y) {
				const stepX = rect.width / (window.gridResolution - 1);
				const stepY = rect.height / (window.gridResolution - 1);

				switch (dot.id) {
					case "controlDot0": {
						self.originPoint.x = Math.round((X - rect.left) / stepX);
						self.originPoint.y = Math.round((Y - rect.top) / stepY);
						break;
					}
					case "controlDot1": {
						self.controlPoint1.x = Math.round((X - rect.left) / stepX);
						self.controlPoint1.y = Math.round((Y - rect.top) / stepY);
						break;
					}
					case "controlDot2": {
						self.controlPoint2.x = Math.round((X - rect.left) / stepX);
						self.controlPoint2.y = Math.round((Y - rect.top) / stepY);
						break;
					}
					case "controlDot3": {
						self.endPoint.x = Math.round((X - rect.left) / stepX);
						self.endPoint.y = Math.round((Y - rect.top) / stepY);
						break;
					}
					default: {
						console.log(dot.id);
					}
				}
			}

			function mouseMoveHandler(e) {
				let clientX = e.clientX, clientY = e.clientY;

				if (e.touches) {
					clientX = e.touches[0].clientX;
					clientY = e.touches[0].clientY;
				}

				const X = Math.min(Math.max(clientX - offsetX, rect.left), rect.width + rect.left);
				const Y = Math.min(Math.max(clientY - offsetY, rect.top), rect.height + rect.top);

				dot.style.left = `${X}px`;
				dot.style.top = `${Y}px`;

				snapCurve(X, Y);
			}

			function reset() {
				const snapped = snapMethod(dot.style);

				dot.style.left = `${snapped.x + rect.left}px`;
				dot.style.top = `${snapped.y + rect.top}px`;

				snapCurve(snapped.x + rect.left, snapped.y + rect.top);

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
		if (this.active) return;
		this.active = true;

		const rect = document.getElementById("myCanvas").getBoundingClientRect();
		const stepX = rect.width / (window.gridResolution - 1);
		const stepY = rect.height / (window.gridResolution - 1);

		const dots = document.getElementsByClassName("controlDots");
		for(let i = 0; i < dots.length; i++) {
			dots[i].style.display = "block";

			if (i == 0) {
				dots[i].style.left = (this.originPoint.x * stepX + rect.left) + "px";
				dots[i].style.top = (this.originPoint.y * stepY + rect.top) + "px";
			} else if (i == 1) {
				dots[i].style.left = (this.controlPoint1.x * stepX + rect.left) + "px";
				dots[i].style.top = (this.controlPoint1.y * stepY + rect.top) + "px";
			} else if (i == 2) {
				dots[i].style.left = (this.controlPoint2.x * stepX + rect.left) + "px";
				dots[i].style.top = (this.controlPoint2.y * stepY + rect.top) + "px";
			} else if (i == 3) {
				dots[i].style.left = (this.endPoint.x * stepX + rect.left) + "px";
				dots[i].style.top = (this.endPoint.y * stepY + rect.top) + "px";
			}

			const handler = this.makeMouseDownHandler(dots[i]);
			dots[i].addEventListener("mousedown", handler);
			dots[i].addEventListener("touchstart", handler);
		}
	}

	deactivate() {
		if (!this.active) return;
		this.active = false;

		const dots = document.getElementsByClassName("controlDots");
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
		const stepX = rect.width / (window.gridResolution - 1);
		const stepY = rect.height / (window.gridResolution - 1);

		ctx.beginPath();
		ctx.lineWidth = this.thickness * ((rect.width + rect.height) * 0.5);

		ctx.moveTo(this.originPoint.x * stepX, this.originPoint.y * stepY);

		ctx.bezierCurveTo(
			this.controlPoint1.x * stepX, this.controlPoint1.y * stepY,
			this.controlPoint2.x * stepX, this.controlPoint2.y * stepY,
			this.endPoint.x * stepX, this.endPoint.y * stepY
		);

		ctx.stroke();
		ctx.closePath();
	}

	getGriddedPoints() {
		return [
			[ this.originPoint.x, this.originPoint.y ],
			[ this.controlPoint1.x, this.controlPoint1.y ],
			[ this.controlPoint2.x, this.controlPoint2.y ],
			[ this.endPoint.x, this.endPoint.y ]
		];
	}

	setGriddedPoints(origin, controlPoint1, controlPoint2, end) {
		this.originPoint = {
			x: origin[0],
			y: origin[1]
		}
		this.controlPoint1 = {
			x: controlPoint1[0],
			y: controlPoint1[1]
		}
		this.controlPoint2 = {
			x: controlPoint2[0],
			y: controlPoint2[1]
		}
		this.endPoint = {
			x: end[0],
			y: end[1]
		}
	}
}

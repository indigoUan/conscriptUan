class BezierCurve {
	constructor() {
		this.classe = "curve";

		this.dragHandlers = new Array(4);
		const dots = document.getElementsByClassName("controlDots");
		for (let i = 0; i < dots.length; i++) {
			this.dragHandlers[i] = this.makeMouseDownHandler(dots[i]);
		}

		this.active = false;
		this.thickness = 0.04;
		this.setGriddedPoints([ 0, 0 ], [ 0, window.gridResolution - 1 ], [ window.gridResolution - 1, 0 ], [ window.gridResolution - 1, window.gridResolution - 1 ]);
	}

	snapDot(point) {
		const rect = document.getElementById("myCanvas").getBoundingClientRect();

		const stepX = rect.width / (window.gridResolution - 1);
		const stepY = rect.height / (window.gridResolution - 1);

		const result = {
			x: Math.round((parseFloat(point.left) - rect.left + window.scrollX) / stepX) * stepX,
			y: Math.round((parseFloat(point.top) - rect.top + window.scrollY) / stepY) * stepY
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

			function controlPoint() {
				switch (dot.id) {
					case "controlDot0": {
						return self.originPoint;
					}
					case "controlDot1": {
						return self.controlPoint1;
					}
					case "controlDot2": {
						return self.controlPoint2;
					}
					case "controlDot3": {
						return self.endPoint;
					}
				}
				return undefined;
			}

			const offsetX = clientX - parseInt(window.getComputedStyle(this).left);
			const offsetY = clientY - parseInt(window.getComputedStyle(this).top);

			function snapCurve(X, Y) {
				const stepX = rect.width / (window.gridResolution - 1);
				const stepY = rect.height / (window.gridResolution - 1);

				const point = controlPoint();
				if (point) {
					point.x = Math.round((X - rect.left) / stepX);
					point.y = Math.round((Y - rect.top) / stepY);
				}
			}

			function mouseMoveHandler(e) {
				window.dirty = true;
				window.scheduledRedraw = true;

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
				if (self.active) {
					self.deactivate();
					self.activate();
				}

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
				dots[i].style.left = (this.originPoint.x * stepX + rect.left + window.scrollX - 8) + "px";
				dots[i].style.top = (this.originPoint.y * stepY + rect.top + window.scrollY - 8) + "px";
			} else if (i == 1) {
				dots[i].style.left = (this.controlPoint1.x * stepX + rect.left + window.scrollX - 8) + "px";
				dots[i].style.top = (this.controlPoint1.y * stepY + rect.top + window.scrollY - 8) + "px";
			} else if (i == 2) {
				dots[i].style.left = (this.controlPoint2.x * stepX + rect.left + window.scrollX - 8) + "px";
				dots[i].style.top = (this.controlPoint2.y * stepY + rect.top + window.scrollY - 8) + "px";
			} else if (i == 3) {
				dots[i].style.left = (this.endPoint.x * stepX + rect.left + window.scrollX - 8) + "px";
				dots[i].style.top = (this.endPoint.y * stepY + rect.top + window.scrollY - 8) + "px";
			}

			dots[i].addEventListener("mousedown", this.dragHandlers[i]);
			dots[i].addEventListener("touchstart", this.dragHandlers[i]);
		}
	}

	deactivate() {
		if (!this.active) return;
		this.active = false;

		const dots = document.getElementsByClassName("controlDots");
		for(let i = 0; i < dots.length; i++) {
			dots[i].style.display = "none";

			dots[i].removeEventListener("mousedown", this.dragHandlers[i]);
			dots[i].removeEventListener("touchstart", this.dragHandlers[i]);
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

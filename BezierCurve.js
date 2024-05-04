class BezierCurve {
	constructor(dotsId, activeColor) {
		this.thickness = 4;
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
		
			let initialX = rect.left + canvas.width / (dots.length - 1) * i - 8; // tried using style.width * 0.5, but idk why it wouldn't work, so we hardcode it 😎 
			let initialY = rect.top + canvas.height / (dots.length - 1) * i - 8; // tried using style.height * 0.5, but idk why it wouldn't work, so we hardcode it 😎 
		
			dots[i].style.top = `${initialX}px`;
			dots[i].style.left = `${initialY}px`;
		
			dots[i].addEventListener('mousedown', function(e) {
				let offsetX = e.clientX - parseInt(window.getComputedStyle(this).left);
				let offsetY = e.clientY - parseInt(window.getComputedStyle(this).top);
		
				function mouseMoveHandler(e) {
					dots[i].style.top = `${e.clientY - offsetY}px`;
					dots[i].style.left = `${e.clientX - offsetX}px`;
				}
		
				function reset() {
					document.removeEventListener('mousemove', mouseMoveHandler);
					document.removeEventListener('mouseup', reset);
				}
		
				document.addEventListener('mousemove', mouseMoveHandler);
				document.addEventListener('mouseup', reset);
			});
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

		let elements = document.getElementsByClassName(`dot${this.dotsId}`);
		for(let i = 0; i < elements.length; i++) {
			elements[i].style.backgroundColor = this.activeColor? this.activeColor : "white";
		}
	}
	deactivate() {
		this.active = false;

		let elements = document.getElementsByClassName(`dot${this.dotsId}`);
		for(let i = 0; i < elements.length; i++) {
			elements[i].style.backgroundColor = "#909090";
		}
	}

	update() {
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
	}
}

class GlyphPart {
	constructor(name, x, y) {
		this.active = false;

		this.classe = "part";
		this.curves = new Array();
		this.name = name;
		this.x = x;
		this.y = y;

		const rect = document.getElementById("myCanvas").getBoundingClientRect();
		const self = this;
		this.dragHandler = function(e) {
			e.preventDefault();
			let clientX = e.clientX, clientY = e.clientY;

			if (e.touches) {
				clientX = e.touches[0].clientX;
				clientY = e.touches[0].clientY;
			}

			const offsetX = clientX - parseInt(window.getComputedStyle(this).left);
			const offsetY = clientY - parseInt(window.getComputedStyle(this).top);

			function mouseMoveHandler(e) {
				window.dirty = true;
				window.scheduledRedraw = true;

				let clientX = e.clientX, clientY = e.clientY;

				if (e.touches) {
					clientX = e.touches[0].clientX;
					clientY = e.touches[0].clientY;
				}

				const stepX = rect.width / (window.gridResolution - 1);
				const stepY = rect.height / (window.gridResolution - 1);

				const X = Math.min(Math.max(clientX - offsetX, rect.left), rect.width + rect.left - self.glyphRectangle.width * stepX);
				const Y = Math.min(Math.max(clientY - offsetY, rect.top), rect.height + rect.top - self.glyphRectangle.height * stepY);

				GlyphPart.dot().style.left = `${X}px`;
				GlyphPart.dot().style.top = `${Y}px`;

				self.x = Math.round((X - rect.left) / stepX);
				self.y = Math.round((Y - rect.top) / stepY);
			}

			function reset() {
				self.deactivate();
				self.activate();

				document.removeEventListener("mousemove", mouseMoveHandler);
				document.removeEventListener("mouseup", reset);
				document.removeEventListener("touchmove", mouseMoveHandler);
				document.removeEventListener("touchend", reset);
			}

			document.addEventListener("mousemove", mouseMoveHandler);
			document.addEventListener("mouseup", reset);
			document.addEventListener("touchmove", mouseMoveHandler);
			document.addEventListener("touchend", reset);
		};

		const parsed = new CsuParser(sessionStorage.getItem("loadedFile"));
		for (const glyph of parsed.glyphs) {
			if (glyph.name === name) {
				this.glyphRectangle = CsuParser.glyphRect(glyph);
				console.log(this.glyphRectangle);
				this.curves = glyph.curves;
				this.grid = glyph.grid;
				break;
			}
		}
	}

	static dot() { return document.getElementsByClassName("controlDots")[0]; }

	activate() {
		if (this.active || !this.glyphRectangle) return;
		this.active = true;

		const rect = document.getElementById("myCanvas").getBoundingClientRect();
		const stepX = rect.width / (window.gridResolution - 1);
		const stepY = rect.height / (window.gridResolution - 1);

		GlyphPart.dot().style.display = "block";

		GlyphPart.dot().style.left = (this.x * stepX + rect.left + window.scrollX - 8) + "px";
		GlyphPart.dot().style.top = (this.y * stepY + rect.top + window.scrollY - 8) + "px";

		GlyphPart.dot().addEventListener("mousedown", this.dragHandler);
		GlyphPart.dot().addEventListener("touchstart", this.dragHandler);
	}

	deactivate() {
		if (!this.active || !this.glyphRectangle) return;
		this.active = false;

		const dots = document.getElementsByClassName("controlDots");
		for(let i = 0; i < dots.length; i++) {
			dots[i].style.display = "none";

			dots[i].removeEventListener("mousedown", this.dragHandler);
			dots[i].removeEventListener("touchstart", this.dragHandler);
		}
	}

	draw() {
		if (this.glyphRectangle) {
			const canvas = document.getElementById("myCanvas");
			const ctx = canvas.getContext("2d");
			const rect = canvas.getBoundingClientRect();
			const stepX = rect.width / (window.gridResolution - 1);
			const stepY = rect.height / (window.gridResolution - 1);

			const offsetX = (this.glyphRectangle.x - this.x) * stepX;
			const offsetY = (this.glyphRectangle.y - this.y) * stepY;

			for (const curve of this.curves) {
				ctx.beginPath();
				ctx.lineWidth = curve.thickness * ((rect.width + rect.height) * 0.5);

				ctx.moveTo(curve.origin[0] * stepX - offsetX, curve.origin[1] * stepY - offsetY);

				ctx.bezierCurveTo(
					curve.controlPoint1[0] * stepX - offsetX, curve.controlPoint1[1] * stepY - offsetY,
					curve.controlPoint2[0] * stepX - offsetX, curve.controlPoint2[1] * stepY - offsetY,
					curve.end[0] * stepX - offsetX, curve.end[1] * stepY - offsetY
				);

				ctx.stroke();
				ctx.closePath();
			}

			if (this.active) {
				const x1 = this.glyphRectangle.x + this.x - 1;
				const x2 = x1 + this.glyphRectangle.width;
				const x3 = x2;
				const x4 = x1;
	
				const y1 = this.glyphRectangle.y + this.y - 2;
				const y2 = y1;
				const y3 = y1 + this.glyphRectangle.height;
				const y4 = y3;
	
				ctx.lineWidth = 5;
				ctx.strokeStyle = "cyan";
	
				ctx.beginPath();
				ctx.moveTo(x1 * stepX, y1 * stepY);
				ctx.lineTo(x2 * stepX, y2 * stepY);
				ctx.stroke();
				ctx.closePath();
	
				ctx.beginPath();
				ctx.moveTo(x3 * stepX, y3 * stepY);
				ctx.lineTo(x2 * stepX, y2 * stepY);
				ctx.stroke();
				ctx.closePath();
	
				ctx.beginPath();
				ctx.moveTo(x3 * stepX, y3 * stepY);
				ctx.lineTo(x4 * stepX, y4 * stepY);
				ctx.stroke();
				ctx.closePath();
	
				ctx.beginPath();
				ctx.moveTo(x1 * stepX, y1 * stepY);
				ctx.lineTo(x4 * stepX, y4 * stepY);
				ctx.stroke();
				ctx.closePath();
	
				ctx.strokeStyle = "black";
			}
		}
	}
}

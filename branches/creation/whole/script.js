let loadedFile = sessionStorage.getItem("loadedFile");
if (loadedFile === null) {
	let inputElement = document.createElement("input");
	inputElement.type = "file";
	inputElement.accept = ".json";

	inputElement.onchange = function(event) {
		let file = event.target.files[0];
		let reader = new FileReader();

		reader.onload = function(event) {
			loadedFile = event.target.result;
			sessionStorage.setItem("loadedFile", loadedFile);
			document.body.removeChild(inputElement);
			justLoaded();
		};

		reader.readAsText(file);
	};

	document.body.appendChild(inputElement);
} else {
	justLoaded();
}

function justLoaded() {
	let parsed = new CsuParser(loadedFile);

	for (let i = 0; i < parsed.glyphs.length; i++) {
		const glyph = parsed.glyphs[i];

		console.log(glyph.name);

		let newCanv = document.createElement("canvas");
		newCanv.id = "subcanvas" + i;
		newCanv.width = newCanv.height = "100";
		newCanv.style = "margin-left: 20px; margin-right: 20px; margin-top: 20px; margin-bottom: 20px;";
		newCanv.style.backgroundColor = "white";
		document.body.appendChild(newCanv);

		newCanv.addEventListener("click", function(e) {
			Redirect.open("branches/creation/glyph", "?loaded=" + i);
		});

		let textElement = document.createElement("span");
		textElement.style = "text-align: center; transform: translateX(-50px);";
		textElement.textContent = glyph.name;
		// document.body.appendChild(textElement);

		const ctx = newCanv.getContext("2d");
		ctx.lineCap = "round";
		for (let curve of glyph.curves) {
			const rect = newCanv.getBoundingClientRect();
			const stepX = rect.width / (glyph.grid - 1);
			const stepY = rect.height / (glyph.grid - 1);

			ctx.beginPath();
			ctx.lineWidth = curve.thickness * 100;

			ctx.moveTo(curve.origin[0] * stepX, curve.origin[1] * stepY);

			ctx.bezierCurveTo(
				curve.controlPoint1[0] * stepX, curve.controlPoint1[1] * stepY,
				curve.controlPoint2[0] * stepX, curve.controlPoint2[1] * stepY,
				curve.end[0] * stepX, curve.end[1] * stepY
			);

			ctx.stroke();
			ctx.closePath();
		}
	}

	// adding the New Glyph canvas 
	{
		let newCanv = document.createElement("canvas");
		newCanv.id = "subcanvasAdd";
		newCanv.width = newCanv.height = "100";
		newCanv.style = "margin-left: 20px; margin-right: 20px; margin-top: 20px; margin-bottom: 20px;";
		document.body.appendChild(newCanv);

		newCanv.addEventListener("click", function(e) {
			parsed.glyphs.push({
				name: "Unnamed Glyph",
				grid: 15,
				curves: new Array()
			});
			sessionStorage.setItem("loadedFile", parsed.toString());

			Redirect.open("branches/creation/glyph", "?loaded=" + (parsed.glyphs.length - 1));
		});

		const ctx = newCanv.getContext("2d");

		{
			ctx.beginPath();
			ctx.lineWidth = 24;
			ctx.strokeStyle = "white";			

			ctx.moveTo(50, 3);
			ctx.lineTo(50, 97);
			ctx.stroke();

			ctx.moveTo(3, 50);
			ctx.lineTo(97, 50);
			ctx.stroke();

			ctx.closePath();
		}
		{
			ctx.beginPath();
			ctx.lineWidth = 20;
			ctx.strokeStyle = "black";			

			ctx.moveTo(50, 5);
			ctx.lineTo(50, 95);
			ctx.stroke();

			ctx.moveTo(5, 50);
			ctx.lineTo(95, 50);
			ctx.stroke();

			ctx.closePath();
		}
	}
}


document.addEventListener("keydown", function(event) {
	if(event.key.toLowerCase() === "s") {
		var blob = new Blob([loadedFile.toString()], {type: "text/plain"});

		var url = URL.createObjectURL(blob);

		var a = document.createElement("a");
		a.href = url;
		a.download = "biruscript.json";
		a.style.display = "none";

		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
});

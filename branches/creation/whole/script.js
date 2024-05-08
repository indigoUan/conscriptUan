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

	const params = new URLSearchParams(window.location.search);
	if (!params.has("justEdited")) {
		const toEdit = 9; // 9 just for testing 

		Redirect.open("branches/creation/glyph", "?loaded=" + toEdit);
	} else {
		console.log(sessionStorage.getItem("loadedFile"));
	}
}

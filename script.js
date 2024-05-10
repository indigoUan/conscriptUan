sessionStorage.removeItem("loadedFile");

function loadScript() {
	let input = document.createElement('input');
	input.type = "file";
	input.accept = ".json";
	input.onchange = e => { 
		let file = e.target.files[0]; 
		let reader = new FileReader();

		reader.onload = function(event) {
			loadedFile = event.target.result;
			sessionStorage.setItem("loadedFile", loadedFile);
			Redirect.open("branches/creation/whole");
		};

		reader.readAsText(file);
	}
	input.click();
}

function createNewScript() {
	sessionStorage.setItem("loadedFile", `{"name":"Unnamed Script","version":"${currentToolVersion}","glyphs":[]}`);
	Redirect.open("branches/creation/whole");
}

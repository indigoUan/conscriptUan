const currentToolVersion = "α.0.2";
const currentCsuVersion = 0;

document.writeln(`
<div id="label-text">
	© îndigoUán 2024 | ToolVer: ${currentToolVersion} - CsuJsonVer: ${currentCsuVersion}${document.title === "conscriptUán - Home" ? "" : ' | <a href="#" onclick="Redirect.home();" style="color: #add8e6;">Return to Homepage</a>'}
</div>`);

class Redirect {
	static open(file, extra) {
		if (extra && extra.length > 2000) {
			throw "`extra` too long!";
		}

		const init = "file:///E:/htmls/conscriptUan";
		// const init = "https://github.com/indigouan/conscriptUan/tree/stable";

		window.location.href = init + "/" + (file.length === 0? "" : (file + "/")) + "index.html" + (extra? extra : "");
	}

	static home() {
		this.open("");
	}
}

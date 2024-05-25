class Redirect {
	static open(file, extra) {
		if (extra && extra.length > 2000) {
			throw "`extra` too long!";
		}

		const devMode = false;
		if (devMode) {
			window.location.href = "file:///E:/htmls/conscriptUan/" + (file.length === 0? "" : (file + "/")) + "index.html" + (extra? extra : "");
		} else {
			window.location.href = "https://indigouan.github.io/conscriptUan/" + (file.length === 0? "" : (file + "/")) + (extra? extra : "");
		}
	}

	static home() {
		this.open("");
	}
}

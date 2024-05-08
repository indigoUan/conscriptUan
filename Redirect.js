class Redirect {
	static open(file, extra) {
		if (extra && extra.length > 2000) {
			throw "`extra` too long!";
		}

		window.location.href = "file:///E:/htmls/conscriptUan/" + file + "/index.html" + (extra? extra : "");
	}
}

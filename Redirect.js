class Redirect {
	static open(file, extra) {
		if (extra && extra.length > 2000) {
			throw "`extra` too long!";
		}

		// const init = "file:///E:/htmls/conscriptUan";
		const init = "C:/Users/Utente/Documents/gioele neri 2apss/conscript";

		window.location.href = init + "/" + file + "/index.html" + (extra? extra : "");
	}
}

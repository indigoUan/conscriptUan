class Redirect {
	static open(file, data) {
		if (data && data.length > 2000) {
			throw "Data too long!";
		}

		window.location.href = "file:///E:/htmls/conscriptUan/" + file + "/index.html" + (data? "?data=" + data : "");
	}
}

function purify (query) {
	var n = query.length;
	for (var i=0; i<n; i++) {
		if (invalid(query.charAt(i))) {
			query = query.slice(0, i) + query.slice(i+1, query.length);
			i--;
			n--;
		}
	}
	return query;
}

function invalid (c) {
	if (c >= 'A' && c <= 'Z') {
		return false;
	} else if (c >= 'a' && c <= 'z') {
		return false;
	} else if (c >= '0' && c <= '9'){
		return false;
	} else if (c == ' ') {
		return false;
	} else if (c == '$') {
		return false;
	} else if (c == '?') {
		return false;
	} else if (c == '!') {
		return false;
	} else if (c == '&') {
		return false;
	} else if (c == '-') {
		return false;
	} else if (c == '_') {
		return false;
	} else if (c == '\'') {
		return false;
	} else {
		return true;
	}
}



console.log(purify('!@#$%^&*()_+'));
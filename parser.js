var fs = require('fs');

/* returns distance to closing brace 
	-1 if closing brace is not found 
	pass original line and index of opening brace*/
function braces(line, obrace) {
	length = line.length
	for (var i = obrace + 1; i < length; i++) {
		if (line.charAt(i) == '}')
			return i;
	}
	return -1;
}

function err(linenum, errno) {

}

/* assuming [chord]lyric format */
// do something with font variable later
function parseLine(oneLine, linenum, font) {
	for (var i = 0 i < len; i++) {
		close = -1;
		if (oneLine[i] == '{') {
			close = braces(oneLine, i);
			if (close == -1)
				//do something
		} else if (oneLine[i] == '}') {
			// front brace missing
		}
		
	}
	/*var newLine = '';

	var chordLine = '';
	var lyricLine = '';

	var lyricCharCount = 0;
	var len = oneLine.length;

	for (var i = 0; i < len; i++) {
		if (oneLine.charAt(i) == '{') {
			if (i + 2 < len) {
				if (oneLine.charAt())
			} else {
				//not valid string. just print the {
			}
		}
	} */

	console.log(oneLine);
}

function readLines(input, font) {
	var remaining = '';

	input.on('data', function(data) {
		remaining += data;
		var index = remaining.indexOf('\n');
		var last = 0;
		while (index > -1) {
			var line = remaining.substring(last, index);
			last = index + 1;
			parseLine(line, font);
			index = remaining.indexOf('\n', last);
		}

		remaining = remaining.substring(last);
	});

	input.on('end', function() {
		if (remaining.length > 0) {
			parseLine(remaining, font);
		}
	});
}

var input = fs.createReadStream('lines.txt');
readLines(input);
var fs = require('fs');


/* assuming {chord}lyric format */
// do something with font variable later
function parseLine(oneLine, font) {
	/* var newLine = '';

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
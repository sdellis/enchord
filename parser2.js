var fs = require('fs');
//var S = require('string');

var sections = {'':''};
var sectionOrder = {0:''};
var currentSection = '';
var orderSet = false;
var sectionNum = 0;

function getSection(section)
{
	return sections[section];
}

function getithSectionName(i)
{
	return sectionOrder[i];
}

function getithSection(i)
{
	return sections[sectionOrder[i]];
}

// function printDoc()
// {
// console.log(getSection(''));
// for( var i = 1; i <=sectionNum;i++) //for testing
// 			console.log('<p><b>' + getithSectionName(i).toUpperCase() + ':</b></p>' + '\n' + (getithSection(i) || '')); //remove later
// }

// Return result as string
function printDoc()
{
	var result = "";
	console.log(getSection(''));
	result += getSection('');
	for( var i = 1; i <=sectionNum;i++) { //for testing
		console.log(getithSectionName(i).toUpperCase() + ':\n' + (getithSection(i) || '')); //remove later
		result += getithSectionName(i).toUpperCase() + ':\n' + (getithSection(i) || '');
	}
	return result;
}

function setOrder(orderLine)
{
	var sectArray = orderLine.substring(6).split(",");
	var sect = '';
	for(var i = 0; i < sectArray.length; i++){
		sectionNum++;
		sect = sectArray[i].trim().toLowerCase();
		sectionOrder[sectionNum] = sect;
	}
	orderSet = true;	
}
function pushToSection(sect)
{
for(var i = 1; i < arguments.length;i++)
	sections[sect] += arguments[i] + '\n';
}

//NEEDS TO BE HTML ESCAPE SANITIZED
function checkBracketErrors(oneLine, linenum){
//check for basic bracket errors
	var state = '';
	var len = oneLine.length;

	for (var i = 0; i < len; i++) {
		switch(state){
		case '':
			switch(oneLine[i]){
			case '{': case '[': case '<':
				state = oneLine[i]; break;
			case '}': case ']': case '>':
				return 'There is an extra \'' + oneLine[i] + '\' on line ' + linenum + '.';
			default:
			}
			break;
		case '[':
			switch(oneLine[i]){
			case ']':
				state = ''; break;
			case '{': case '[': case '<':
			case '}':case '>':
				return 'There is an unexpected \'' + oneLine[i] +  '\' before an expected \']\' in line ' + linenum +  '.';
			default:
			}
			break;
		case '{':
			switch(oneLine[i]){
			case '}':
				state = ''; break;
			case '{': case '[': case '<':
			case ']':case '>':
				return 'There is an unexpected \'' + oneLine[i] +  '\' before an expected \'}\' in line ' + linenum +  '.';
			default:
			}
			break;
		case '<':
			switch(oneLine[i]){
			case '>':
				state = ''; break;
			case '{': case '[': case '<':
			case ']':case '}':
				return 'There is an unexpected \'' + oneLine[i] +  '\' before an expected \'>\' in line ' + linenum +  '.'
			default:
			}
			break;
		}
	}
	if(state !== '') return 'A \'' + state + '\' bracket on line ' + linenum + ' is not closed.';
}
//handle chord in []. i is position of [ on oneLine
function parseChord(oneLine, i, twoLines){
	//pad chord line at least up to length of lyric line
	while(twoLines["chordLine"].length < twoLines["lyricLine"].length)
		twoLines["chordLine"] += ' ';
	j = i;
	var newChord = '';
	while(oneLine[++j] !== ']')
		newChord += oneLine[j];
	//later, narrow what is allowed as a chord
		twoLines["chordLine"] += newChord;
	return j-i;
		
}
//handle chord comment in <>. i is position of < on oneLine
function parseChordComment(oneLine, i, twoLines){
	//pad chord line at least up to length of lyric line
	while(twoLines["chordLine"].length < twoLines["lyricLine"].length)
		twoLines["chordLine"] += ' ';
	j = i;
	while(oneLine[++j] !== '>')
		twoLines["chordLine"] += oneLine[j];
	
	return j-i;
}

//handle options in {}. i is position of [ on oneLine
function parseOption(oneLine, i, twoLines){
	var option = '';
	j = i;
	while(oneLine[++j] !== '}')
		option += oneLine[j];
	option = option.trim().toLowerCase()	
	//is option a section? for now, assume so
	
	if(twoLines["chordLine"] !== ''){ //are there chord things?
		if(/^\s*$/.test(twoLines["lyricLine"])) //just chords?
			pushToSection(currentSection, twoLines["chordLine"]);
		else //words and chords?
			pushToSection(currentSection, twolines.chordLine, twolines.lyricLine);
	}
	else  //just words?
		pushToSection(currentSection, twoLines["lyricLine"]);
		
	
	
	twoLines["chordLine"] = '';
	twoLines["lyricLine"] = '';
		
		currentSection = option;
	if(!sections[currentSection]){
		sections[currentSection] = '';
		if(!orderSet)
			sectionOrder[++sectionNum] = currentSection;
	}
	else
		sections[currentSection] += 'WARNING: Multiple defitions of section ' + currentSection.toUpperCase() + '. Behavior undefined.\n';
	
		
	
	return j-i;
}

/* assuming [chord]lyric format */
// do something with font variable later
function parseLine(oneLine, linenum, font) {
	var twoLines = new Object(); 
	twoLines.chordLine = ''
	twoLines.lyricLine = ''
	
				 
	oneLine = oneLine.replace(/\r/g,"");
	//first line: optional order line
	if(linenum === 1 && /^order:/i.test(oneLine)){
		setOrder(oneLine);
		return;
	}
	
	//check for bracketing errors
	var bErr = checkBracketErrors(oneLine, linenum);
	if(bErr) {
		pushToSection(currentSection, bErr);	return;
	}
	//Presume no bracketing errors from here on out.
	
	if(/^\s*\{.*\}\s*$/.test(oneLine)){ //just single option
		parseOption(oneLine.trim(), 0);
		return;
	}
		
	
	if(!/[\[{<]/.test(oneLine)) { //if bracketless, simply print the line
		pushToSection(currentSection, oneLine); 
		return;
	}
	//Otherwise, read in character by character, usually putting in the lyric line, and handling various cases for brackets.
	var len = oneLine.length;
	for (var i = 0; i < len; i++) {
		switch(oneLine[i]){
		case '[':  
			i+=parseChord(oneLine, i, twoLines);
			break;
		case '<':
			i+=parseChordComment(oneLine, i, twoLines); 
			break;
		case '{':
			i+=parseOption(oneLine, i, twoLines);
			break;
		case '/':
		// '//' rest of line unprinted comment?		
			if(oneLine[i+1] ==='/'){	
				i = len;			
				break;
			}
		default:
			twoLines["lyricLine"]+= oneLine[i];		
		}
		
	} 
	if(twoLines["chordLine"] !== ''){ //are there chord things?
		if(/^\s*$/.test(twoLines["lyricLine"])) //just chords?
			pushToSection(currentSection, twoLines["chordLine"]);
		else //words and chords?
			pushToSection(currentSection, twolines.chordLine, twolines.lyricLine);
	}
	else  //just words?
		pushToSection(currentSection, twoLines["lyricLine"]);
}

// function readLines(input, font) {
function readLines(input, callback) {
	var remaining = '';
	var linenum = 1;
	input.on('data', function(data) {
		remaining += data;
		var index = remaining.indexOf('\n');
		var last = 0;
		while (index > -1) {
			var line = remaining.substring(last, index);
			last = index + 1;
			// parseLine(line, linenum++, font);
			parseLine(line, linenum++);
			index = remaining.indexOf('\n', last);
		}

		remaining = remaining.substring(last);
	});

	input.on('end', function() {
		if (remaining.length > 0) {
			// parseLine(remaining,linenum, font);
			parseLine(remaining,linenum);
		}
		 printDoc();

		// return string
		//callback(printDoc());
	});
	
}

// Integrate parser --> THIS FUNCTION NEEDS TO BE FIXED
// TAKE IN STRING INSTEAD OF WRITING TEMP FILE
exports.parseSong = function(data, callback) {
	fs.writeFile('./tmp.txt', data, function(err) {
		if(err) {
			console.log(err);
			return 'error';
		} else {
			console.log('success!');
			var input = fs.createReadStream('tmp.txt');
			var result = readLines(input, function(result) {
				fs.unlink('./tmp.txt', function (err) {
					if (err) {
						console.log(err);
						return 'error';
					} else {
						console.log('success delete file');
						console.log('In parser: ' + result);	
						callback(result);
					}
				});
			});
		}
	});
}

// Don't use global variables
 var input = fs.createReadStream('lines.txt');

 readLines(input);

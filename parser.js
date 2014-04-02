var fs = require('fs');
//var S = require('string');

var sections = {'':''};
var sectionOrder = {0:''}
var currentSection = '';
var chordLine = '';
var lyricLine = '';
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

function printDoc()
{
console.log(getSection(''));
for( var i = 1; i <=sectionNum;i++) //for testing
			console.log('<p><b>' + getithSectionName(i).toUpperCase() + ':</b></p>' + '\n' + (getithSection(i) || '')); //remove later
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
sections[sect] += ('<p>' + chordLine + '</p>\n' + '<p>' + lyricLine + '</p>\n');
	chordLine = '';
	lyricLine = '';
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
function parseChord(oneLine, i){
	//pad chord line at least up to length of lyric line
	while(chordLine.length < lyricLine.length)
		chordLine += ' ';
	j = i;
	var newChord = '';
	while(oneLine[++j] !== ']')
		newChord += oneLine[j];
	//later, narrow what is allowed as a chord
		chordLine += newChord;
	return j-i;
		
}
//handle chord comment in <>. i is position of < on oneLine
function parseChordComment(oneLine, i){
	//pad chord line at least up to length of lyric line
	while(chordLine.length < lyricLine.length)
		chordLine += ' ';
	j = i;
	while(oneLine[++j] !== '>')
		chordLine += oneLine[j];
	
	return j-i;
}

//handle options in {}. i is position of [ on oneLine
function parseOption(oneLine, i){
	var option = '';
	j = i;
	while(oneLine[++j] !== '}')
		option += oneLine[j];
	option = option.trim().toLowerCase()	
	//is option a section? for now, assume so
	if(chordLine !== ''|| lyricLine !== '')
		pushToSection(currentSection);
	currentSection = option;
	if(!sections[currentSection]){
		sections[currentSection] = '';
		if(!orderSet)
			sectionOrder[++sectionNum] = currentSection;
		}
	else
		sections[currentSection] += '<p>WARNING: Multiple defitions of section ' + currentSection.toUpperCase() + '. Behavior undefined.</p>\n';
	
		
	
	return j-i;
}

/* assuming [chord]lyric format */
// do something with font variable later
function parseLine(oneLine, linenum, font) {
	oneLine = oneLine.replace(/\r/g,"");
	if(linenum === 1 && /^order:/i.test(oneLine)){
		setOrder(oneLine);
		return;
	}
	
	var bErr = checkBracketErrors(oneLine, linenum);
	if(bErr) {
		sections[currentSection] += '<p><i>'+ bErr +'</i></p>\n';
		return;
	}
	//Presume no bracketing errors from here on out.
	
	if(/^\s*\{.*\}\s*$/.test(oneLine)){ //just single option
		parseOption(oneLine.trim(), 0);
		return;
	}
		
	
	if(!/[\[{<]/.test(oneLine)) { //if bracketless, simply print the line
		sections[currentSection] += '<p>' + oneLine + '</p>\n'; 
		return;
	}
	//Otherwise, read in character by character, usually putting in the lyric line, and calling handlers for brackets.
	var len = oneLine.length;
	for (var i = 0; i < len; i++) {
		switch(oneLine[i]){
		case '[':  
			i+=parseChord(oneLine, i);
			break;
		case '<':
			i+=parseChordComment(oneLine, i); 
			break;
		case '{':
			i+=parseOption(oneLine, i);
			break;
		case '/':
		// '//' rest of line unprinted comment?		
			if(oneLine[i+1] ==='/'){	
				i = len;			
				break;
			}
		default:
			lyricLine+= oneLine[i];		
		}
		
	} 
	pushToSection(currentSection);

}

function readLines(input, font) {
	var remaining = '';
	var linenum = 1;
	input.on('data', function(data) {
		remaining += data;
		var index = remaining.indexOf('\n');
		var last = 0;
		while (index > -1) {
			var line = remaining.substring(last, index);
			last = index + 1;
			parseLine(line, linenum++, font);
			index = remaining.indexOf('\n', last);
		}

		remaining = remaining.substring(last);
	});

	input.on('end', function() {
		if (remaining.length > 0) {
			parseLine(remaining,linenum, font);
		}
		printDoc();
	});
	
}

var input = fs.createReadStream('lines.txt');

readLines(input);

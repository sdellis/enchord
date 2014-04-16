var fs = require('fs');
//var S = require('string');

var sections;
var sectionOrder;
var currentSection;
var lyricLine;
var orderSet;
var sectionNum;

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

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

// Return result as html page string
// function printDoc(font,csspath)
function printDoc(font,fontsize)
{
	
	// var result = "<!DOCTYPE html><html>\n<head><link rel=\"stylesheet\" type=\"text/css\" href=\"" + csspath + "\"></head>\n<body>\n";
	//console.log(getSection(''));
	var result = "";
	
	if(!font)
		font = 'sans';
	if(!fontsize)
		fontsize = '12px';
	
	result+= '<style> div.chordSheet {font-family:' + font +';\nfont-size:' + fontsize + ';}</style>';
	
	result += "<p>" + getSection('@')+"</p>\n";
	for( var i = 1; i <=sectionNum;i++) { //for testing
		var s =  getithSection(i);
		if(!s) continue;
		s.replace(/\n+$/,"")
		var sn = getithSectionName(i);
		result += "<p><span class='heading'>"+toTitleCase(sn)+ "</span>\n" + s + "</p>\n"; //class=\"" + sn + "\"
	}
	// result += "</body>\n</html>";
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
function pushToSection(sect,lines)
{
	while((lines+= -1) > 0)
		sections[sect] += "<br>";
	sections[sect] += lyricLine + "\n" ;
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
			case '}': case ']': 
				return 'There is an extra \'' + oneLine[i] + '\' on line ' + linenum + '.';
			case '>':
				return 'There is an extra \'&lt;\' on line ' + linenum + '.';
			default:
			}
			break;
		case '[':
			switch(oneLine[i]){
			case ']':
				state = ''; break;
			case '{': case '[': case '}':
				return 'There is an unexpected \'' + oneLine[i] +  '\' before an expected \']\' in line ' + linenum +  '.';
			case '<':
				return 'There is an unexpected \'&lt;\' before an expected \']\' in line ' + linenum +  '.';
			case '>':
				return 'There is an unexpected \'&gt;\' before an expected \']\' in line ' + linenum +  '.';
			default:
			}
			break;
		case '{':
			switch(oneLine[i]){
			case '}':
				state = ''; break;
			case '{': case '[': case ']':
				return 'There is an unexpected \'' + oneLine[i] +  '\' before an expected \'}\' in line ' + linenum +  '.';
			case '<':
				return 'There is an unexpected \'&lt;\' before an expected \']\' in line ' + linenum +  '.';
			case '>':
				return 'There is an unexpected \'&gt;\' before an expected \']\' in line ' + linenum +  '.';
			default:
			}
			break;
		case '<':
			switch(oneLine[i]){
			case '>':
				state = ''; break;
			case '{': case '[': 
			case ']':case '}':
				return 'There is an unexpected \'' + oneLine[i] +  '\' before an expected \'>\' in line ' + linenum +  '.'
			case '<':
				return 'There is an unexpected \'&lt;\' before an expected \']\' in line ' + linenum +  '.';
			default:
			}
			break;
		}
	}
	if(state !== '') return 'A \'' + state + '\' bracket on line ' + linenum + ' is not closed.';
}
//handle chord in []. i is position of [ on oneLine
function parseChord(oneLine, i){
	j = i;
	var newChord = '';
	while(oneLine[++j] !== ']')
		newChord += oneLine[j];
		lyricLine += "<span chord=\""+ newChord + "\"></span>"
	return j-i;
		
}
//handle chord comment in <>. i is position of < on oneLine
function parseChordComment(oneLine, i){
		j = i;
	var newChordComment = '';
	while(oneLine[++j] !== '>')
		newChordComment += oneLine[j];
		lyricLine += "<span chordcomment=\""+ newChordComment + "\"></span>"
	return j-i;
}

//handle options in {}. i is position of [ on oneLine
function parseOption(oneLine, i){
	var option = '';
	j = i;
	while(oneLine[++j] !== '}')
		option += oneLine[j];
	option = option.trim().toLowerCase()	
	switch(option)
	{
		case 'bold': case 'start bold': case 'startbold':
			lyricLine += "<strong>";
			return j-i;
		case 'endbold':	case 'end bold':
			lyricLine += "</strong>";
			return j-i;
		case 'italic':case 'ital': case 'start italic': case 'start ital': case 'startitalic': case 'startital':
			lyricLine += "<em>";
			return j-i;
		case 'enditalic': case 'end italic': case 'endital': case 'end ital':
			lyricLine += "</em>";	
			return j-i;
		case 'tab': case 'start tab': case 'starttab':
			lyricLine += "<span class='tab'>";
			return j-i;
		case 'end tab': case 'endtab':
			lyricLine += "</span>";
			return j-i;
		case 'heading': case 'start heading': case 'startheading':
			lyricLine += "<span class='heading'>";
			return j-i;
		case 'end heading': case 'endheading':
			lyricLine += "</span>";
			return j-i;
		default:
		
		
	}
		
	
	//option is a section
	if(lyricLine !== '')
		pushToSection(currentSection);
	currentSection = option;
	if(!sections[currentSection]){
		sections[currentSection] = '';
		if(!orderSet)
			sectionOrder[++sectionNum] = currentSection;
		}
	else
		sections[currentSection] += 'WARNING: Multiple defitions of section ' + currentSection + '. Behavior undefined.\n';
	
		
	
	return j-i;
}

/* assuming [chord]lyric format */
// do something with font variable later
function parseLine(oneLine, linenum, font) {
	oneLine = oneLine.replace(/\r/g,"");
	var lines = 0;
	if(linenum === 1 && /^order:/i.test(oneLine)){
		setOrder(oneLine);
		return;
	}
	
	var bErr = checkBracketErrors(oneLine, linenum);
	if(bErr) {
		lyricLine = '<span class="lineerror">' + bErr + '</span>';
		pushToSection(currentSection,1);
		return;
	}
	//Presume no bracketing errors from here on out.
	
	if(/^\s*\{.*\}\s*$/.test(oneLine)){ //just single option
		parseOption(oneLine.trim(), 0);
		return;
	}
		
	
	/*if(!/[\[{<]/.test(oneLine)) { //if bracketless, simply print the line
		lyricLine = oneLine;
		pushToSection(currentSection);
		return;
	}*/
	//if just spaces/newlines, 
	if(/^\s*$/.test(oneLine)){
		lyricLine += oneLine;
		return;
	}
	//Otherwise, read in character by character, usually putting in the lyric line, and calling handlers for brackets.
	var len = oneLine.length;
	for (var i = 0; i < len; i++) {
		switch(oneLine[i]){
		case '[':
			lines = 2;
			i+=parseChord(oneLine, i);
			break;
		case '<':
			lines = 2;
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
	pushToSection(currentSection, lines);

}

// function readLines(input, font) {
// function readLines(input, callback, font, csspath) {
function readLines(input, font, fontsize, callback) {
	//initialize global variables
	sections = {'@':''};
	sectionOrder = {0:'@'}
	currentSection = '@';
	lyricLine = '';
	orderSet = false;
	sectionNum = 0;
	
	var lines = input.split('\n');
	
	for(i = 0; i < lines.length; i++)
		parseLine(lines[i], i + 1);
	//console.log(printDoc(font, csspath));
	// callback(printDoc(font, csspath));
	callback(printDoc(font,fontsize));
	
}
exports.parseSongHTML = readLines;

// Integrate parser --> THIS FUNCTION NEEDS TO BE FIXED
// TAKE IN STRING INSTEAD OF WRITING TEMP FILE
/*exports.parseSong = function(data, callback) {
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
*/
/*
var input = fs.createReadStream('lines.txt');
var remaining = ''
input.on('data', function(data) {
		remaining += data;
	})
input.on('end', function() {
	readLines(remaining,"blah","Georgia","songsheetformat.css");

	})
*/
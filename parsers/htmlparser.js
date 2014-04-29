var sectionNumToText;
var sectionNumToName;
var sectionNameToNum;
var lyricLine;
var orderText;

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function getSection(name)
{
	return sectionNumToText[sectionNameToNum[name]];
}

//Return full document text, styled according to given font and fontsize. Optional argument order, array of  
function printDoc(font,fontsize,orderLine)
{
	var result = "";
	
	//formatting
	if(!font)
		font = 'sans';
	if(!fontsize)
		fontsize = '12px';
	result+= '<style> div.chordSheet {font-family:' + font +';\nfont-size:' + fontsize + ';}</style>\n ';
	
	//Top section
	result += "<p>" + sectionNumToText[0]+"</p>\n";
	
	
	if(orderLine){ //print in order specified
		var sectArray = orderLine.substring(6).split(",");
		for( var i = 0; i <sectArray.length;i++) { 
			var name = sectArray[i].trim().toLowerCase();
			if(name.charAt(0) === '*') //just print the section name
				result += "<p><span class='heading'>"+toTitleCase(name.substring(1))+ "</span><p>\n"
			else //print section name and contents{
				result += "<p><span class='heading'>"+toTitleCase(name)+ "</span>\n" + getSection(name) + "</p>\n"; 
		}
	}
	else //print off sections in order written
		for( var i = 1; i <sectionNumToText.length;i++) { 
		result += "<p><span class='heading'>" + toTitleCase(sectionNumToName[i]) + "</span>\n" + sectionNumToText[i] + "</p>\n";
		}
	
	return result;
}

//push contents of lyricLine to given section
function pushToSection(sectnum,lines)
{
	for(var i =1; i < lines; i++)
		sectionNumToText[sectnum] += "<br>";
	sectionNumToText[sectnum] += lyricLine + "\n" ;
	lyricLine = '';
}

//analyzes line, return error message if any bracket errors
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
function parseChord(oneLine, i,chordAlign){
	j = i;
	var newChord = '';
	while(oneLine[++j] !== ']')
			newChord += oneLine[j];
	if(chordAlign === "float")
		lyricLine += "<span chord=\""+ newChord + "\"></span>"
	else //chordAlign === "inline"
		lyricLine += "<span class=\"linechord\">"+ newChord + "</span>"
	return j-i;
		
}
//handle chord comment in <>. i is position of < on oneLine
function parseChordComment(oneLine, i,chordAlign){
		j = i;
	var newChordComment = '';
	while(oneLine[++j] !== '>')
		newChordComment += oneLine[j];
	if(chordAlign === "float")
		lyricLine += "<span chordcomment=\""+ newChordComment + "\"></span>"
	else //chordAlign === "inline"
		lyricLine += "<span class=\"linechordcomment\">"+ newChordComment + "</span>"
	return j-i;
}

//handle options in {}. i is position of { on oneLine
function parseOption(oneLine, i,lines){
	var option = '';
	j = i;
	while(oneLine[j] !== '}') j++;
	
	option = oneLine.substring(i+1,j).trim().toLowerCase();
	switch(option)
	{
		case '':
			return j-i;
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
		case 'header': case 'start header': case 'startheader':
			lyricLine += "<span class='heading'>";
			return j-i;
		case 'end header': case 'endheader':
			lyricLine += "</span>";
			return j-i;
		default:
		
		
	}
	var headerMatch = option.match(/^(start ?)?head(ing|er) (\d+%)$/i)
	if(headerMatch) //is it an adjustable size header?
		lyricLine += "<span class='heading' style='font-size:" + headerMatch[3]+"'>";
	else{	
		//option is a section
		if(lyricLine !== '')
			pushToSection(sectionNumToText.length - 1,lines);
		sectionNumToText.push('');
		sectionNumToName.push(option);
		sectionNameToNum[option] = sectionNumToText.length - 1;
			//sections[currentSection] += '<span class="lineerror">WARNING: Multiple defitions of section ' + toTitleCase(currentSection) + '. Rename or consolidate sections.\n</span>\n';
	}
	return j-i;
}

//parse a single line from markup language text, pushing to appropriate sections
function parseLine(oneLine, linenum) {
	//oneLine = oneLine.replace(/\r/g,""); //is this necessary
	
	//check for bracket errors
	var bErr = checkBracketErrors(oneLine, linenum);
	if(bErr) {
		lyricLine = '<span class="lineerror">' + bErr + '</span>';
		pushToSection(sectionNumToText.length - 1,1);
		return;
	}
	
	//Presume no bracketing errors from here on out.
	if(/^\s*\{[^\{\}]*\}\s*$/.test(oneLine)){ //just single option
		parseOption(oneLine.trim(), 0);
		return;
	}
		
	
	var chordAlign = "float";
	if(oneLine.charAt(0) === '%')
	{
		chordAlign = "inline";
		oneLine = oneLine.substring(1);
	}
	
	//Read in character by character, usually putting in the lyric line, and calling handlers for brackets.
	var len = oneLine.length;
	var lines = 1;
	for (var i = 0; i < len; i++) {
		switch(oneLine[i]){
		case '[':
			lines = (chordAlign === "float")? 2:1;
			i+=parseChord(oneLine, i,chordAlign);
			break;
		case '<':
			lines = (chordAlign === "float")? 2:1;
			i+=parseChordComment(oneLine, i,chordAlign); 
			break;
		case '{':
			i+=parseOption(oneLine, i,lines);
			break;
		case '/':
		// '//' rest of line unprinted comment?		
			if(oneLine[i+1] ==='/'){	
				i = len;			
				break;
			}
		default:
			if(lines <1) lines = 1;
			lyricLine+= oneLine[i];		
		}
		
	} 
	pushToSection(sectionNumToText.length - 1, lines);

}


function readLines(input, font,  fontsize, callback) {
	//initialize global variables
	sectionNumToText = new Array();
	sectionNumToText[0] = "";
	sectionNumToName = new Array();
	sectionNumToName[0] = "";
	sectionNameToNum = new Array();
	lyricLine = '';
	orderText = '';

	//split and parse each line
	var lines = input.split('\n');
	var i;
	if(/^order:/i.test(lines[0])){ //first line order?
		orderText = lines[0];
		i = 1; //start parsing second line
	}
	else
		i = 0;
		
	for(; i < lines.length; i++)
		parseLine(lines[i], i + 1);
	callback(printDoc(font,fontsize,orderText));
	//console.log(printDoc(font,fontsize,orderText)); //test code
	
}
exports.parseSongHTML = readLines;

/*
var fs = require('fs');

var input = fs.createReadStream('lines2.txt');
var remaining = ''
input.on('data', function(data) {
		remaining += data;
	})
input.on('end', function() {
	readLines(remaining,"Georgia","12px","blah");

	})
*/
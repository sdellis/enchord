/*
*reverseparser.js
*Matthew Wang, jemah
*
* Use: call reverseParse(input) where input is the string of song text, returns the markup-language version of the song text. 
*/

/*
Reverse parsing features
Recognize chord line, lyric line, places chords within following lyric line. (chord comments!) 
If chord line above chord line or empty line, print chord line on its own.
If lyric line without preceding chord line, just print lyric line
Recognize common headers like Verse 1, Chorus, Bridge, Intro, etc.
Recognize tablature, enclose in {tab}
Lines directly above Tab also enclosed in tab
Make beginning of document header font, until first chord line seen or section header seen
If repeated section headers, try to write to "order" (always write to order?)

Kinds of Lines: 
chord: common chord forms, more than one space between them, few words, "x#" or "#x" are def. comments
section header: Common name, ends with colon, all caps, ALONE in line
tab: many contiguous '-', with some numbers, few letters (towards beginning/end)
empty: only spaces -- new section
lyric:default, if not others.

*/

var commonheaders = new Array( /^\s*\[?\s*((\d(th|nd|rd|st)?)|last|final)?\s*(verse(s)?([ _]*\d+)?)\s*:?\s*\]?\s*$/i,/^\s*\[?\s*((\d(th|nd|rd|st)?)|last|final|pre-?)?\s*(chorus(es)?([ _]*\d+)?)\s*:?\s*\]?\s*$/i,/^\s*\[?\s*(\d(th|nd|rd|st)?)?\s*(bridge(s)?([ _]*\d+)?)\s*:?\s*\]?\s*$/i, /^\s*\[?\s*(\d(th|nd|rd|st)?)?\s*(intro(duction)?([ _]*\d+)?)\s*:?\s*\]?\s*$/i,/^\s*\[?\s*(\d(th|nd|rd|st)?)?\s*(outro([ _]*\d+)?)\s*:?\s*\]?\s*$/i,/^\s*\[?\s*(\d(th|nd|rd|st)?)?\s*(instrumental([ _]*\d+)?)\s*:?\s*\]?\s*$/i,/^\s*\[?\s*(\d(th|nd|rd|st)?)?\s*(\d* *solo([ _]*\d+)?)\s*:?\s*\]?\s*$/i,/^\s*\[?\s*(\d(th|nd|rd|st)?)?\s*(end(ing)?([ _]*\d+)?)\s*:?\s*\]?\s*$/i,/^\s*\[?\s*(\d(th|nd|rd|st)?)?\s*(break(down)([ _]*\d+)?)\s*:?\s*\]?\s*$/i,/^\s*\[?\s*(\d(th|nd|rd|st)?)?\s*(tag([ _]*\d+)?)\s*:?\s*\]?\s*$/i)
var emptyLine = /^\s*$/;
var hasChords = /(\s|,|-|\(|^)([A-G][#b]?(m|min|dim|maj|sus|aug|\+)?\d{0,2}(sus|add)?\d{0,2}(\/[A-G][#b]?)?)(\s|,|-|\)|$)/g;
var replaceChords = /(\s|,|-|\(|^)?([A-G][#b]?(m|min|dim|maj|sus|aug|\+)?\d{0,2}\(?(sus|add)?\d{0,2}\)?(\/[A-G][#b]?)?)(\s|,|-|\)|$)?/g;
var replaceCommentedChords = /<(\(?[A-G][#b]?(m|min|dim|maj|sus|aug|\+)?\d{0,2}\(?(sus|add)?\d{0,2}\)?(\/[A-G][#b]?)?\)?)>/g;
var justChords = /^((\s+|\s|,|-|\(|)[A-G][#b]?(m|min|dim|maj|sus|aug|\+)?\d{0,2}\(?(sus|add)?\d{0,2}\)?(\/[A-G][#b]?)?(\s+|,|-|\)|))+$/;
var tabLine = /^([A-G][#b]?)*\s*[\|:]*\s*[x\d]*-+[x\d\|-]+/i;

function lineType(line)
{
	//is it empty?
	if(emptyLine.test(line))
		return "empty";
	//is it a header?
	for(var i = 0; i < commonheaders.length ; i+=1)
		if(commonheaders[i].test(line))
			return "header";	
	//is it a tab line?
		if(tabLine.test(line))
			return "tab";
	//is it a chord line?
	if(justChords.test(line))
		return "chord";
	//if more than half of the words are chords
	var words = line.trim().split(/\s+/g)
	var chords = 0;
	for(var i = 0; i < words.length ; i += 1)
		if(justChords.test(words[i])) chords +=1;
	if(chords >= words.length * 3)
		return "chord";
	//otherwise, a lyric line
	return "lyric";
}

//for chord above lyric lines. Merge into one markup line
function mergeChordLyric(chordLine, lyricLine)
{

	while(chordLine.length > lyricLine.length)
		lyricLine += " ";
	var finalLine = "";
	var i = 0;
	while(i < lyricLine.length){
		if(chordLine.charAt(i) === ""){
			finalLine += lyricLine.substring(i);
			break;
		}
		else if(chordLine.charAt(i).match(/\s/))
		{
			finalLine += lyricLine.charAt(i);
			i +=1;
		}
		else
		{
			var j = i;
			finalLine += '<';
			while(!chordLine.charAt(i).match(/\s/) && i < chordLine.length)
			{
				finalLine += chordLine.charAt(i)
				i+=1;
			}
			finalLine += '>';
			finalLine += lyricLine.substring(j,i);
		}
	}
	return finalLine.replace(replaceCommentedChords,"[$1]");
}
//for chord above lyric lines. Merge into one markup line. Intelligently puts chords at beginning of words
function mergeChordLyricSmart(chordLine, lyricLine)
{

	while(chordLine.length > lyricLine.length)
		lyricLine += " ";
	var finalLine = "";
	var i = 0;
	var word = 0;
	while(i < lyricLine.length){
		if(chordLine.charAt(i) === ""){
			finalLine += lyricLine.substring(i);
			break;
		}
		else if(chordLine.charAt(i).match(/\s/))
		{
			finalLine += lyricLine.charAt(i);
			i +=1;
		}
		else
		{
			var j = i;
			finalLine += '<';
			while(!chordLine.charAt(i).match(/\s/) && i < chordLine.length)
			{
				finalLine += chordLine.charAt(i)
				i+=1;
			}
			finalLine += '>';
			finalLine += lyricLine.substring(j,i);
		}
	}
	return finalLine.replace(replaceCommentedChords,"[$1]");
}
function bracketInlineChords(chordLine)
{
	return "%" + chordLine.replace(replaceChords,"$1[$2]$6");
}


exports.reverseParser = function(input, callback) {
	callback(reverseParse(input));
};

function reverseParse(input)
{
	input = input.replace(/\r/g,"");
	var lines = input.split('\n');
	var currentType;
	var output = "";
	var state; //tab, chord, lyric, empty, header
	var i = 0;
	if(lineType(lines[0]) === "lyric"){ //title 
		output += "{header}" + lines[0] + "{end header}\n";
		i = 1;
	}
	for(; i < lines.length ; i+=1)
	{
		currentType = lineType(lines[i]);
		
		switch(state)
		{
		case "tab": //already printed
			switch(currentType)
			{
			case "empty": //print
				output += "{end tab}\n" + lines[i] + "\n";
				state = "empty";
				break;
			case "header": //print
				output += "{end tab}\n{" + lines[i].replace(":\[\]","").trim() + "}\n";
				state = "header";
				break;
			case "tab": //start tab section, print
				output += lines[i] + "\n";
				state = "tab";
				break;
			case "chord"://DON'T print yet
				output += "{end tab}\n";
				state = "chord";
				break;
			case "lyric"://print
			default:
				output += "{end tab}\n" + lines[i] +"\n";
				state = "lyric";
				break;
			}
			break;
		case "chord"://NOT printed
			switch(currentType)
			{
			case "empty": //print inline chords, print line
				output += bracketInlineChords(lines[i-1]) + "\n\n";
				state = "empty";
				break;
			case "header": //print
				output += bracketInlineChords(lines[i-1]) + "\n{" + lines[i].replace(":\[\]","").trim() + "}\n";
				state = "header";
				break;
			case "tab": //start tab section, print chords in tab section
				output += "{tab}\n" + bracketInlineChords(lines[i-1]) + "\n" + lines[i] + "\n";
				state = "tab";
				break;
			case "chord"://print previous chord line, don't print next line
				output += bracketInlineChords(lines[i-1]) + "\n"
				state = "chord";
				break;
			case "lyric"://merge the lines, print
			default:
				output += mergeChordLyric(lines[i-1],lines[i]) +"\n";
				state = "lyric";
				break;
			}
			break;
		case "empty": //already printed
		case "header": //already printed
		case "lyric"://already printed
		default:
			switch(currentType)
			{
			case "empty": //print
				output += lines[i] + "\n";
				state = "empty";
				break;
			case "header": //print
				output += "{" + lines[i].replace(":\[\]","").trim() + "}\n";
				state = "header";
				break;
			case "tab": //start tab section, print
				output += "{tab}\n" + lines[i] + "\n";
				state = "tab";
				break;
			case "chord"://DON'T print yet
				state = "chord";
				break;
			case "lyric"://print
			default:
				output += lines[i] +"\n";
				state = "lyric";
				break;
			}
		}
		
	}
	//loop done, now what? loose ends
	switch(state)
	{
		case "tab": //end tab section
			output += "{end tab}\n"
			break;
		case "chord"://print final line of chords
		output += bracketInlineChords(lines[i-1]) + "\n";
			break;
		case "lyric"://nothing to be done!
		case "empty":
		case "header":
		default:
			break;
	}

	return output;
}


//TESTING

/*
chordLine = " C G#        	C";
lyricLine = "Lyrics hello";
console.log(mergeChordLyric(chordLine,lyricLine));
*/
/*
var fs = require('fs');

var input = fs.createReadStream('test.txt');
var remaining = '';

input.on('data', function(data) {
		remaining += data;
	})
input.on('end', function() {
	console.log(reverseParse(remaining));
})
*/

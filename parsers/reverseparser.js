/*
*reverseparser.js
*Matthew Wang, jemah
*
* Use: call reverseParse(input) where input is the string of song text, returns the markup-language version of the song text. 
*/
var commonheaders = new Array( /^\s*(\d(th|nd|rd|st)?)?\s*verse(s)?([ _]*\d+)?\s*:?\s*$/i,/^\s*(\d(th|nd|rd|st)?)?\s*chorus(es)?([ _]*\d+)?\s*:?\s*$/i,/^\s*(\d(th|nd|rd|st)?)?\s*bridge(s)?([ _]*\d+)?\s*:?\s*$/i, /^\s*(\d(th|nd|rd|st)?)?\s*intro(duction)?([ _]*\d+)?\s*:?\s*$/i,/^\s*(\d(th|nd|rd|st)?)?\s*outro([ _]*\d+)?\s*:?\s*$/i,/^\s*(\d(th|nd|rd|st)?)?\s*instrumental([ _]*\d+)?\s*:?\s*$/i,/^\s*(\d(th|nd|rd|st)?)?\s*end(ing)?([ _]*\d+)?\s*:?\s*$/i,/^\s*(\d(th|nd|rd|st)?)?\s*break(down)([ _]*\d+)?\s*:?\s*$/i,/^\s*(\d(th|nd|rd|st)?)?\s*tag([ _]*\d+)?\s*:?\s*$/i)
var emptyLine = /^\s*$/;
var hasChords = /(\s|,|-|^)([A-G][#b]?(m|min|dim|maj|sus|aug|\+)?\d{0,2}(sus|add)?\d{0,2}(\/[A-G][#b]?)?)(\s|,|-|$)/g;
var replaceChords = /(\s|,|-|^)?([A-G][#b]?(m|min|dim|maj|sus|aug|\+)?\d{0,2}(sus|add)?\d{0,2}(\/[A-G][#b]?)?)(\s|,|-|$)?/g;
var replaceCommentedChords = /<([A-G][#b]?(m|min|dim|maj|sus|aug|\+)?\d{0,2}(sus|add)?\d{0,2}(\/[A-G][#b]?)?)>/g;
var justChords = /^((\s+|\s|,|-|)[A-G][#b]?(m|min|dim|maj|sus|aug|\+)?\d{0,2}(sus|add)?\d{0,2}(\/[A-G][#b]?)?(\s+|,|-|))+$/;
var tabLine = /^([A-G][#b]?)*\s*\|*\s*\d*-+(\d|-)+/i;

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
	if(chords * 2 > words.length)
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
	console.log(lyricLine.length);
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
		console.log(finalLine);
	}
	return finalLine.replace(replaceCommentedChords,"[$1]");
}

function bracketInlineChords(chordLine)
{
	return "%" + chordLine.replace(replaceChords,"$1[$2]$6");
}

chordLine = " C G# 2x";
lyricLine = "Lyrics hello G";
console.log(mergeChordLyric(chordLine,lyricLine));

function reverseParse(input)
{
var lines = input.split('\n');

//dummy return;
return input;
}


//TESTING

/*
var fs = require('fs');

var input = fs.createReadStream('test.txt');
var remaining = '';

input.on('data', function(data) {
		remaining += data;
	})
input.on('end', function() {
	var lines = remaining.split('\n');
	
	for(i = 0; i < lines.length; i++){
		console.log(lines[i]);
		console.log(bracketInlineChords(lines[i]));
		}
})
*/

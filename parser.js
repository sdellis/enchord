var fs = require('fs');
//var S = require('string');

var sections;
var sectionOrder;
var currentSection;
var chordLine;
var lyricLine;
var orderSet;
var sectionNum;

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
// console.log('<p><b>' + getithSectionName(i).toUpperCase() + ':</b></p>' + '\n' + (getithSection(i) || '')); //remove later
// }

// Return result as string
function printDoc()
{
var result = "";
//console.log(getSection(''));
result += getSection('');
for( var i = 1; i <=sectionNum;i++) { //for testing
//console.log(getithSectionName(i).toUpperCase() + ':\n' + (getithSection(i) || '')); //remove later
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
if(chordLine !== ''){ //are there chord things?
if(/^\s*$/.test(lyricLine)) //just chords?
sections[sect] += chordLine + '\n';
else //words and chords?
sections[sect] += chordLine + '\n' + lyricLine + '\n';
}
else  //just words?
sections[sect] += lyricLine + '\n';
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
sections[currentSection] += bErr +'\n';
return;
}
//Presume no bracketing errors from here on out.

if(/^\s*\{.*\}\s*$/.test(oneLine)){ //just single option
parseOption(oneLine.trim(), 0);
return;
}


if(!/[\[{<]/.test(oneLine)) { //if bracketless, simply print the line
sections[currentSection] += oneLine + '\n';
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

// function readLines(input, font) {
function readLines(input, callback) {
//initialize global variables
sections = {'':''};
sectionOrder = {0:''}
currentSection = '';
chordLine = '';
lyricLine = '';
orderSet = false;
sectionNum = 0;

var lines = input.split('\n');

for(i = 0; i < lines.length; i++)
parseLine(lines[i], i + 1);
//printDoc();
callback(printDoc());

}
exports.parseSong = readLines;

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
readLines(remaining);

})
*/
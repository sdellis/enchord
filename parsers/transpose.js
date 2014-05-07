/*
*tranpose.js
*Matthew Wang, jemah
*First version, needs rigorous testing
*Use: call simpleTranposeString(str,steps,pref,doctype)
*1)str is a String with the chord sheet text; chords are in brackets '[chordhere]'. Accepts single # or b, all kinds of modifiers, and slash chords (even  modifiers on slashed chords, for jazz musicians)
*2) steps is integer number of half steps to transpose. positive is up, negative is down. Any integer, even beyond 12 or -12, is okay.
*3)pref can be either flat ('b','flat','Flat') or sharp ('#', 'sharp','Sharp') to indicate what kinds of chords are preferred in final tranposition. If none of the above or left undefined, defaults to sharp (for guitarists).
*4)doctype can be text ('text','txt') or html ('html','htm'), defaults to text. Will look for chords in the string inside brackets or span tags respectively.
RETURNS: original string with all chords replaced by transposed variants.
*/


//note to pitch class
var lookup = {'A':0,'A#':1,'Bb':1,'B':2,'B#':3,'Cb':2,'C':3,'C#':4,'Db':4,'D':5,'D#':6,'Eb':6,'E':7,'E#':8,'Fb':7,'F':8,'F#':9,'Gb':9,'G':10,'G#':11,'Ab':11}

//pitch class to preferred enharmonic
var sharpscale = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
var flatscale = ['A','Bb','Cb','C','Db','D','Eb','E','F','Gb','G','Ab'];

//for future, more powerful transpose tools
//var keyfullscales = {'C': ['C','C','C#','Db','D','D']}
//Intervals: Unison, augmented unison, diminished second, second,augmented second, minor third, major third, fourth, augmented fourth, diminished fifth, augmented fifth,minor sixth, major sixth, minor seventh, major seventh,

var txtmatcher = new RegExp(/(\[ *\(? *)([A-G][b#]?)([^\[]*?)((\/ *)([A-G][b#]?)([^\[]*?))?(\)? *\])/g);

var htmlmatcher = new RegExp(/(< *span *chord *= *" *\(? *)([A-G][b#]?)([^<]*?)((\/ *)([A-G][b#]?)([^<]*?))?(\)? *" *>)/g);



//takes note and tranposes by steps according to sharp/flat pref
function simpleTransposeNote(note, steps, pref)
		{
			//note should be /[A-G][b#]?/
			//steps any integer
			//pref either 'b' or '#'
			var i;
			if(!(note in lookup))
				return '?'
			i = lookup[note]
			o = i + steps
			while(o >=12) o -= 12;
			while(o<0) o += 12;
			
			switch(pref)
			{
				case 'b':case 'flat':case 'Flat':
				return flatscale[o];break;
				case '#':case 'sharp':case 'Sharp':
				default:
					return sharpscale[o];break;
			}	
		}
   
function test(steps){return steps}   
 
function simpleTransposeString(str,steps,pref,doctype, callback)
{
	var matcher;
	switch(doctype)
	{
		case "html":case "htm":
		matcher = htmlmatcher;
		break;
		case "text":case"txt":
		default:
		matcher = txtmatcher;
	}
	//1st group: bracket/span tag beginning + space
	//2nd group: Chord note
	//3rd group: Chord modifiers
	//4th group: total slash chord
	//5th group: Slash and spaces
	//6th group: Slash chord note
	//7th group: Slash chord modifiers
	//8th group: end bracket/span tag end
	//return str.replace(matcher, function(match,p1,p2,p3,p4,p5,p6,p7,p8){if(p4) return p1 + simpleTransposeNote(p2,steps,pref) + p3 + p5 + simpleTransposeNote(p6,steps,pref) + p7 + p8; else return p1 + simpleTransposeNote(p2,steps,pref) + p3 +  p8;});
	callback(str.replace(matcher, function(match,p1,p2,p3,p4,p5,p6,p7,p8){if(p4) return p1 + simpleTransposeNote(p2,steps,pref) + p3 + p5 + simpleTransposeNote(p6,steps,pref) + p7 + p8; else return p1 + simpleTransposeNote(p2,steps,pref) + p3 +  p8;}));
}

exports.transpose = simpleTransposeString;

//--------------TESTING CODE----------------------

//---Test Parameters---

//for testing
//var fs = require('fs');

/*
var steps = 0;
var pref = 'b';
var doctype = 'html';
*/

//----TestA ----
//String s is tranposed

/*
var s = "This is a chord [G] This is another [ C7] This is yet another [Bbdim] and another [F#maj7] A broken couple [B] A slash chord[C/G][E7/ F#7]";

console.log(simpleTransposeString(s,steps,pref,doctype));
*/

//----TestB---
//Read in from local 'lines.txt' file
/*
var input = fs.createReadStream('linescheck.htm');
var remaining = ''
input.on('data', function(data) {
		remaining += data;
	})
input.on('end', function() {
	console.log(simpleTransposeString(remaining,steps,pref,doctype));

	})
*/


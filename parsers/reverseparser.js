/*
*reverseparser.js
*Matthew Wang, jemah
*
*/
var commonheaders = new Array( /^\s*(\d(th|nd|rd)?)?\s*verse(s)?([ _]*\d+)?\s*:\s*$/m,/^\s*(\d(th|nd|rd)?)?\s*chorus(es)?([ _]*\d+)?\s*:\s*$/m,/^\s*(\d(th|nd|rd)?)?\s*bridge(s)?([ _]*\d+)?\s*:\s*$/m, /^\s*(\d(th|nd|rd)?)?\s*intro(duction)?([ _]*\d+)?\s*:\s*$/m,/^\s*(\d(th|nd|rd)?)?\s*outro([ _]*\d+)?\s*:\s*$/m,/^\s*(\d(th|nd|rd)?)?\s*instrumental([ _]*\d+)?\s*:\s*$/m,/^\s*(\d(th|nd|rd)?)?\s*end(ing)?([ _]*\d+)?\s*:\s*$/m,/^\s*(\d(th|nd|rd)?)?\s*break(down)([ _]*\d+)?\s*:\s*$/m,/^\s*(\d(th|nd|rd)?)?\s*tag([ _]*\d+)?\s*:\s*$/m)


function lineType(line)
{
	//is it a header?
	for(header in commonheaders)
		if(header.test(line))
			return "header";
}

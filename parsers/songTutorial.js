var str = "Order: welcome!,getting started, seeing is believing, exactly where it should go, look here!, sections and ordering,Verse 1, Chorus, Verse 2, *Verse 2, ^Chorus, importing songs from elsewhere, sharing sheets with the world\n{heading 200%}\"How To Write A Song\" Song{end header}\n{bold}By: The Enchord Developers {end bold}\n{ital}(Okay, it's not really a song... but we think it's helpful anyways!){end ital}\n\n{Welcome!}\nHello, and welcome to Enchord! Using our simple yet powerful mark-up language,\nwe make it easy to write easy-to-read chord sheets. This is an overview of what \nyou can do with it. If you hit the 'Edit Song' button, you can see how writing songs work.\nFeel free to mess around and try things for yourself here before you go!\n\n{Getting started}\nWhen you create a new song, start by filling out the {bold}Song Info{end bold} on the left panel.\nTo save, you need a {bold}Title{end bold} and {bold}Artist{end bold} ({bold}Genre{end bold} is optional). For example: \n{bold}Title{end bold}: 10,000 Reasons \n{bold}Artist{end bold}: Matt Redman \n{bold}Genre{end bold}: Worship\n\n{Seeing is believing}\nWhen you type in our mark-up language on the {bold}left{end bold} side,\nyou see what a printed-outsheet looks like on the {bold}right{end bold} side. \nIt's easy to see what you'll get.You can even choose from \ndifferent fonts and font sizes for the output.\n\n{Exactly where it should go}\nLet say you want a chord above a word. Then simply put the chord\nin square brackets before the [Ebmaj7]word like this. Magic! It appears perfectly\nabove where you wanted. You can also make comments<like this comment> on the line above\nusing angled brackets. You can even put chords mid[Csus/G]word.//And if you put words after two forward slashes, it won't show. Sneaky.\n\nIf you have line with just chords, put a '%' at the beginning of the line, like this:\n%   [A]   [D]   [E]   -   ||  [F#m] [Bm7] [Esus] [E]  ||   [A]\nYou can also put other stuff and spaces as you like.\n\n {Transpose away}By putting chords in brackets, you ensure clean tranposition. \nYou can use the \"Transpose\" feature when viewing and editing a song. \nWhile viewing, it will render the new chords temporarily; while editing it \nwill change the markup file itself. \nIn either case, simply choose how many half-steps up or down to \ntranpose, and whether you prefer chords with flats or sharps in them.\n\n{Look here!}\nYou can also format your lyrics with {bold}bold{end bold} tags and {italic}italic{end italic} tags -- even {bold}{ital}both{endbold}{endital}\nif you like. Also, you can make {header}headers{end header} with {header 250%}variable{end header} {header 80%}sizes{end header}.\nNote that {bold}<comment>bold{endbold} and {italic}[C]italic{enditalic} tags don't affect chords or chord comments, which are bolded and italic.\nAlso, not every font supports bold and italics. Sorry!\n\nIf you have a guitar/bass/ukelele/whatever tab, enclose it in tab tags like this:\n{tab}\nE|---0----2---0---|\nB|---0----3---2---|\nG|---1----2---2---|\nD|---2----0---2---|\nA|---2--------0---|\nE|---0------------| (3x)\n{end tab}\nThis will use an appropriate monospaced font on the tab to ensure proper character alignment.\n\n{Sections and ordering}\nLabel the start of a new section with curly braces, like the name of this section.\nSome more typical examples might be Verse 1, Chorus, etc.\n\nIf you want to display these sections in a certain order, perhaps different from \nthe order written, begin the first line of the document like this:\n               Order: Verse 1, Chorus, Verse 2, *Verse 2, ^Chorus\nA caret (*) will cause the name of the section to print, but not the content.\nAn asterisk (*) will cause the contents of a section to print, but not the name. \nAnything before the first labeled section will always be printed at the top.\nTry messing with the \"Order\" line at the top of the document! \n\n{Chorus}My content is only printed the first time\n{Verse 1}I'm printed first but written second\n{Verse 2}I'm printed twice\n{Importing songs from elsewhere}\nHave a favorite chord sheet or tab from another website? Simply copy and paste the \n text into the {bold}Import{end bold} feature and Enchord will do its best to put it\ninto our mark-up language for easy manipulation.\n\n{Sharing sheets with the world}\nAny song you own is either {bold}Public{end bold} or {bold}Private{end bold}, as set on the left panel while editing.\nAny {bold}Public{end bold} song can be searched and viewed by any visitor to the site\nAs a user, you can copy any {bold}Public{end bold} song to your personal library, then edit it as you please!\nUsers can also give sheets they like stars so the others can find the best sheets too!\n";

exports.song = str;
/*jslint vars: true, plusplus: true, continue:true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        EditorManager  = brackets.getModule("editor/EditorManager"),
        Menus          = brackets.getModule("command/Menus");

    function handleTagRemoval() {
        var editor = EditorManager.getFocusedEditor();
        var document = editor.document;
        var selections = editor.getSelections();
        var newsels = [];
        var i, sel, selend, text, newtext, lasttagregex;
        var firsttag, beforefirsttag, beforelasttag, lasttag, restoftext;
        
        if (!editor.hasSelection()) {
            alert("No text selected");
            return;
        }
        
        document.batchOperation(function () {
            for (i = 0; i < selections.length; i++) {
                sel = selections[i];
                text = document.getRange(sel.start, sel.end);
                newtext = text;
                //alert(text);

                firsttag = /<(?!!|\/)[^>]*[^\/]>/.exec(text);
                beforefirsttag = RegExp.leftContext;
                if (firsttag === null) {
                    //alert("Selection " + i + " does not contain an opening tag");
                    newsels.push(sel);
                    continue;
                }
                if (beforefirsttag !== null) {
                    newtext = newtext.substring(beforefirsttag.length);
                } else {
                    beforefirsttag = "";
                }
                firsttag = firsttag[0];
                newtext = newtext.substring(firsttag.length);

                //syntax highlighting failed this regex
                lasttagregex = new RegExp("(.|\n)*(?=</[^>]+>)");
                beforelasttag = lasttagregex.exec(newtext);
                if (beforelasttag === null) {
                    beforelasttag = "";
                } else {
                    beforelasttag = beforelasttag[0];
                }
                newtext = newtext.substring(beforelasttag.length);

                lasttag = /<\/[^>]+>/.exec(newtext);
                if (lasttag === null) {
                    //alert("Selection " + i + " does not contain a closing tag");
                    newsels.push(sel);
                    continue;
                }
                lasttag = lasttag[0];
                newtext = newtext.substring(lasttag.length);

                restoftext = newtext;

                //here's the text with the desired tags removed
                newtext = beforefirsttag + beforelasttag + restoftext;
                
                //time to adjust the end of the selection so
                //it doesn't select too much afterwards
                console.log("sel " + sel.start.line + "," + sel.start.ch + " " + sel.end.line + "," + sel.end.ch);
                selend = {line: sel.end.line,
                          ch: sel.end.ch
                         };
                selend = document.adjustPosForChange(selend, newtext.split("\n"), sel.start, sel.end);
                console.log("selend " + selend.line + "," + selend.ch);
                
                //make the change
                document.replaceRange(newtext, sel.start, sel.end);

                //add adjusted selection range to the list
                newsels.push({start: sel.start, end: selend});
                
                //update current selections
                selections = editor.getSelections();

            }
            //reselect all the things, adjusted
            editor.setSelections(newsels);
        });
    }


    // First, register a command - a UI-less object associating an id to a handler
    var MY_COMMAND_ID = "tagdeletion.stripoutertags";   // package-style naming to avoid collisions
    var command = CommandManager.register("Strip Outermost Tags From Selection", MY_COMMAND_ID, handleTagRemoval);

    //add command to menus, and add shortcut
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(MY_COMMAND_ID, "Ctrl-`");
    
    var editor_cmenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
    if (editor_cmenu) {
        editor_cmenu.addMenuDivider();
        editor_cmenu.addMenuItem(MY_COMMAND_ID);
    }
});
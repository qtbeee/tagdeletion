/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        EditorManager  = brackets.getModule("editor/EditorManager"),
        Menus          = brackets.getModule("command/Menus");

    function handleTagRemoval() {
        var editor = EditorManager.getFocusedEditor();
        var text = editor.getSelectedText();
        
        if (editor.getSelectedText() === "" || editor.getLanguageForSelection().getId() !== "html") { return; }
        
        var newtext = text;
        var insertionPos = editor.getSelection().start;
        var endpos = editor.getSelection().end;
        
        //time to extract what we want from what was selected
        var starttagpat = new RegExp("(.|\n)+?(?=<[^/>]+>)");
        var endtagpat = new RegExp("(.|\n)+(?=<[^>]+>)");
        var beforefirsttag = "";
        
        beforefirsttag = starttagpat.exec(text);
        var firsttag = /<[^\/>]+>/.exec(text);
        
        //testing
        //alert("first tag is: " + firsttag);
        
        if (firsttag === null) { return; }
        if (beforefirsttag !== null) {
            beforefirsttag = beforefirsttag[0];
            newtext = newtext.substring(beforefirsttag.length);
        } else {
            beforefirsttag = "";
        }
        firsttag = firsttag[0];
        newtext = newtext.substring(firsttag.length);
        
        //more testing
        //alert("after first change: " + newtext);
        
        var beforelasttag = endtagpat.exec(newtext);
        var lasttag = /<\/[^>]+>/.exec(newtext);
        if (lasttag === null) { return; }
        lasttag = lasttag[0];
        if (beforelasttag === null) {
            beforelasttag = "";
        } else {
            beforelasttag = beforelasttag[0];
        }
        var restoftext = "";
        if (beforelasttag.length + lasttag.length < newtext.length) {
            restoftext = newtext.substring(beforelasttag.length + lasttag.length);
        }
        
        //test all the things!
        //alert("beforefirsttag: \n" + beforefirsttag);
        //alert("beforelasttag: \n" + beforelasttag);
        //alert("restoftext: \n" + restoftext);
        
        //put everything back together!
        newtext = beforefirsttag + beforelasttag + restoftext;
        editor.document.replaceRange(newtext, insertionPos, endpos);

        
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
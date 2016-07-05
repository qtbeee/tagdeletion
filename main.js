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
        var starttagpat = new RegExp(".+(?=<[^/>]+>)");
        var endtagpat = new RegExp(".+(?=<[^>]+>)");
        var beforefirsttag = "";
        
        beforefirsttag = starttagpat.exec(text);
        var firsttag = /<[^\/>]+>/.exec(text);
        if (firsttag === null) { return; }
        if (beforefirsttag !== null) {
            newtext = newtext.substring(beforefirsttag[0].length);
        } else {
            beforefirsttag = [""];
        }
        newtext = newtext.substring(firsttag[0].length);
        
        var beforelasttag = endtagpat.exec(newtext);
        var lasttag = /<\/[^>]+>/.exec(newtext);
        if (lasttag === null) { return; }
        if (beforelasttag === null) { beforelasttag = [""]; }
        
        var restoftext = "";
        if (beforelasttag[0].length + lasttag[0].length < newtext.length) {
            restoftext = newtext.substring(beforelasttag[0].length + lasttag[0].length);
        }
        
        //for testing!
        //alert(beforefirsttag);
        //alert(beforelasttag);
        //alert(restoftext);
        
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
# tagdeletion
Brackets extension for removing the outermost pair of html tags in a selection.

Designed to remove the first opening tag and last closing tag in each selection of text. Tags don't need to match to be removed. Self-closed tags (like `<br/>`) are ignored. Comments are also ignored.

#### Changelog:
- 1.2.0: Selections stay selected after each operation.

- 1.1.0:  One call removes a pair of tags from each selection where applicable (in other words, now works with multiple cursors/selections)

#### How to Use:

1. Select text so the opening and closing tag you want to remove are surrounded.

2. Either:

    a) From the top menu, Edit->Strip Outermost Tags From Selection
    
    b) Right-click, select Strip Outermost Tags From Selection from dropdown
    
    c) Use keyboard shortcut Ctrl+` (That's the "back quote" or "grave accent")
    
    **Mac users: Use command+` instead.**

#### Known Bugs:
- Behaves erratically when selecting multiple lines of text (Most recent version should have fixed this once and for all, please let me know if something weird still happens)

- Selections remain after operation but sometimes end up selecting more than they should (should be fixed already, but may be subject to user's preference).

# Block Sort

Sort Blocks instead of lines! Works for all major programming languages including JavaScript / TypeScript, C / C++, Java, JSON, XML, etc.

## Features

The extension offers commands, similar to the default "Sort Lines Ascending / Descending" command. But instead of sorting lines, it sorts code blocks.
The selection should automatically expand to the surrounding block if nothing is selected.
If something is already selected, the extension tries it's best to validate and clean up your selection.

The blocks are sorted purely by their content, so while decorators are supported, classes or functions with different decorators will be sorted by their decorators first.

## Commands

This extension contributed the following commands:

`Sort Blocks Ascending`: Sorts the selected code blocks in ascending order. If no code blocks are selected, a selection for the deepest block the cursor is currently positioned in is generated.

`Sort Blocks Descending`: Sorts the selected code blocks in descending order. If no code blocks are selected, a selection for the deepest block the cursor is currently positioned in is generated.

## Extension Settings

This extension currently contributes no settings.

## Known Issues

- The automatic selection validation is farly complicated. Some languages or edge cases might not work yet (feel free to open an issue)
- some spacings between the original blocks may not be preserved
- The extension does NOT check for code erros due to sorting

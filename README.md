# Block Sort

[![Visual Studio Code extension 1nVitr0blocksort](https://vsmarketplacebadge.apphb.com/version/1nVitr0.blocksort.svg)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.blocksort)
[![Installs for Visual Studio Code extension 1nVitr0.blocksort](https://vsmarketplacebadge.apphb.com/installs/1nVitr0.blocksort.svg)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.blocksort)
[![Rating for Visual Studio Code extension 1nVitr0.blocksort](https://vsmarketplacebadge.apphb.com/rating/1nVitr0.blocksort.svg)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.blocksort)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

![Sort Blocks instead of lines!](https://raw.githubusercontent.com/1nVitr0/plugin-vscode-blocksort/main/resources/demo.gif)

Sort Blocks instead of lines! Works for all major programming languages including JavaScript / TypeScript, Java, JSON, XML, etc.

## Features

The extension offers commands, similar to the default "Sort Lines Ascending / Descending" command. But instead of sorting lines, it sorts code blocks.
The selection should automatically expand to the surrounding block if nothing is selected.
If something is already selected, the extension tries it's best to validate and clean up your selection.

Additional features include:

- deep (multilevel) sorting for nested blocks
- "*natural*" sorting for lines containing numbers

The blocks are sorted purely by their content, so while decorators are supported, classes or functions with different decorators will be sorted by their decorators first.

## Commands

This extension contributed the following commands:

`Sort Blocks Ascending`: Sorts the selected code blocks in ascending order. If no code blocks are selected, a selection for the deepest block the cursor is currently positioned in is generated.

`Sort Blocks Descending`: Sorts the selected code blocks in descending order. If no code blocks are selected, a selection for the deepest block the cursor is currently positioned in is generated.

`Sort Blocks Deep Ascending (Multilevel)`: Sorts the selected code blocks in ascending order, including nested blocks up to a specified depth.

`Sort Blocks Deep Descending (Multilevel)`: Sorts the selected code blocks in descending order, including nested blocks up to a specified depth.

## Extension Settings

This extension contributed the following settings:#

`defaultMultilevelDepth`: Default depth used for deep sorting.

`askForMultilevelDepth`: Skip aksing for multilevel depth and always use `defaultMultilevelDepth`.

`indentIgnoreMarkers`: List of regex markers that when matched will result in ignoring the indentation of the current line. This is for example used for c-style `{` in a new line. The markers are always assumed to be at teh start of the line, but can be preceded by spaces and comments.

`completeBlockMarkers`: List of markers that complete a block. They are assumed to be at the end of a line, but can be succeeded by comments or end-of-line markers (`,` or `;`).

`foldingMarkers`: Dictionary of folding markers. They are supplied set a key-value style, the key being a human-readable ultra-short description of the folding markers.

`enableNaturalSorting`: Enables the natural sorting behavior for lines containing numbers.

`naturalSorting`: Options for the natural sorting behavior. Only takes effect if `enableNaturalSorting` is true.

`sortConsecutiveBlockHeaders`: sorts consecutive block headers, such as a list of `case` statements.

## Known Issues

- The automatic selection validation is fairly complicated. Some languages or edge cases might not work yet (feel free to open an issue)
- some spacings between the original blocks may not be preserved
- The extension does NOT check for code errors due to sorting
- The extension assumes valid code, invalid formatting will probably result in invalid sorting
- When comments and / or decorators are involved the results may vary (the extension tries it's best, comments will stick to the lines below them)
- "Natural" sorting may break on UUID strings containing a mix of numbers, letters and/or dashes

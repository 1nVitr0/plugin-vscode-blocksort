# Block Sort

[![Visual Studio Code extension 1nVitr0blocksort](https://vsmarketplacebadge.apphb.com/version/1nVitr0.blocksort.svg)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.blocksort)
[![Installs for Visual Studio Code extension 1nVitr0.blocksort](https://vsmarketplacebadge.apphb.com/installs/1nVitr0.blocksort.svg)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.blocksort)
[![Rating for Visual Studio Code extension 1nVitr0.blocksort](https://vsmarketplacebadge.apphb.com/rating/1nVitr0.blocksort.svg)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.blocksort)
![Tests](https://github.com/1nVitr0/plugin-vscode-blocksort/actions/workflows/tests.yml/badge.svg)
![Release](https://github.com/1nVitr0/plugin-vscode-blocksort/actions/workflows/release.yml/badge.svg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

![Sort Blocks instead of lines!](https://raw.githubusercontent.com/1nVitr0/plugin-vscode-blocksort/main/resources/demo.gif)

Sort Blocks instead of lines! Works for all major programming languages including JavaScript / TypeScript, Java, JSON, XML, etc.

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

- The automatic selection validation is fairly complicated. Some languages or edge cases might not work yet (feel free to open an issue)
- some spacings between the original blocks may not be preserved
- The extension does NOT check for code erros due to sorting
- The extension assumes valid code, invalid formatting will probably result in invalid sorting
- When comments and / or decorators are involved the results may vary (the extension tries it's best, comments will stick to the lines below them)

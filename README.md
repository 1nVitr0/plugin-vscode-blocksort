# Block Sort

[![Visual Studio Code extension 1nVitr0blocksort](https://vsmarketplacebadge.apphb.com/version/1nVitr0.blocksort.svg)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.blocksort)
[![Installs for Visual Studio Code extension 1nVitr0.blocksort](https://vsmarketplacebadge.apphb.com/installs/1nVitr0.blocksort.svg)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.blocksort)
[![Rating for Visual Studio Code extension 1nVitr0.blocksort](https://vsmarketplacebadge.apphb.com/rating/1nVitr0.blocksort.svg)](https://marketplace.visualstudio.com/items?itemName=1nVitr0.blocksort)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

![Sort Blocks instead of lines!](https://raw.githubusercontent.com/1nVitr0/plugin-vscode-blocksort/main/resources/demo.gif)

Sort Blocks instead of lines! Works for all major programming languages including JavaScript / TypeScript, Java, JSON, XML, etc.

### Table of Contents

- [Features](#features)
- [Commands](#commands)
- [Code Actions / Auto Sorting](#code-actions--auto-sorting)
- [Extension Settings](#extension-settings)
- [Known Issues](#known-issues)

## Features

The extension offers commands, similar to the default "Sort Lines Ascending / Descending" command. But instead of sorting lines, it sorts code blocks.
The selection should automatically expand to the surrounding block if nothing is selected.
If something is already selected, the extension tries it's best to validate and clean up your selection.

Additional features include:

- `@blocksort` annotations and `source.fixAll` code actions for auto-sorting on save
- deep (multilevel) sorting for nested blocks
- "*natural*" sorting for lines containing numbers

The blocks are sorted purely by their content, so while decorators are supported, classes or functions with different decorators will be sorted by their decorators first.

## Commands

This extension contributed the following commands:

`Sort Blocks Ascending`: Sorts the selected code blocks in ascending order. If no code blocks are selected, a selection for the deepest block the cursor is currently positioned in is generated.

`Sort Blocks Descending`: Sorts the selected code blocks in descending order. If no code blocks are selected, a selection for the deepest block the cursor is currently positioned in is generated.

`Sort Blocks Deep Ascending (Multilevel)`: Sorts the selected code blocks in ascending order, including nested blocks up to a specified depth.

`Sort Blocks Deep Descending (Multilevel)`: Sorts the selected code blocks in descending order, including nested blocks up to a specified depth.

## Code Actions / Auto Sorting

The extension provides the following code actions:

`source.fixAll.blocksort`: This can be executed on save to auto-sort all blocks following a `@blocksort` marker.

To enable auto Sorting, you must set the `editor.codeActionsOnSave` in your `settings.json`:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.blocksort": true
  }
}
```

This will enable auto-sorting for blocks following a `@blocksort` marker.
The marker can additionally be followed by the options `asc` or `desc` to control the sorting order,
as well as a number for the sorting depth:

```js
// @blocksort asc
switch(value) {
  case 1:
    return 1;
  case 2:
    return 2;
  default:
    return 2;
}
```

```yaml
# @blocksort asc inf
some:
  nested:
    - code
    - (will be
  sorted:
    - up to
    - 9 levels)
```

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

`enableCodeLens`: enables / disables code lenses shown over blocks annotated with `@blocksort`

## Known Issues

- some spacings between the original blocks may not be preserved
- The extension does NOT check for code errors due to sorting
- The extension assumes valid formatting, invalid formatting will probably result in invalid sorting
- "Natural" sorting may break sorting of UUID strings containing a mix of numbers, letters and/or dashes

## Contributors

This theme is maintained by the following person:

[![Aram Becker](https://avatars.githubusercontent.com/u/15647636?v=4&s=72)](https://github.com/1nVitr0) |
:---: |
[Aram Becker](https://github.com/1nVitr0) |

The following users have contributed to the project:

<i></i> | User | Commits
---:|:---|:--
[![karima](https://avatars.githubusercontent.com/u/48662020?v=4&s=48)]() | [karizma](https://github.com/karizma) | 1


The following users have inspired features or noticed important issues:

<i></i> | User | Feature
--:|:--|:--
[![Yamlcase](https://avatars.githubusercontent.com/u/27447701?v=4&s=48)](https://github.com/YAMLcase)) | [Yamlcase](https://github.com/YAMLcase) | Support for indent-style syntax
<i></i> | [lavermil](https://github.com/lavermil) | Multilevel sorting
[![Thomas Becker](https://avatars.githubusercontent.com/u/11942729?v=4&s=48)](https://github.com/centigrade-thomas-becker) | [Thomas Becker](https://github.com/centigrade-thomas-becker) | auto-sort on save

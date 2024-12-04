import { commands, InputBoxOptions, Selection, Range, TextEditor, TextEditorEdit, window } from "vscode";
import ConfigurationProvider, { BlockSortCollatorOptions } from "../providers/ConfigurationProvider";
import BlockSortFormattingProvider from "../providers/BlockSortFormattingProvider";
import { BlockSortOptions } from "../types/BlockSortOptions";
import { showNumberQuickPick } from "../helpers/showNumberQuickPick";

export function blockSort(
  formattingProvider: BlockSortFormattingProvider,
  editor: TextEditor | undefined,
  editBuilder: TextEditorEdit,
  range: Range | null,
  options: BlockSortOptions
) {
  if (!editor) editor = window.activeTextEditor;
  if (!editor) return;

  const {
    collator,
    direction,
    sortChildren = 0,
    skipParents = 0,
    expandSelection = range?.isEmpty
      ? ConfigurationProvider.getExpandCursor()
      : ConfigurationProvider.getExpandSelection(),
  } = options;

  const { document, selection } = editor;

  const edit = formattingProvider.getBlockSortEdit(document, range ?? selection, {
    collator,
    direction,
    sortChildren,
    skipParents,
    expandSelection,
  });
  editBuilder.replace(edit.range, edit.newText);
  editor.selection = new Selection(edit.range.start, edit.range.end);
}

async function blockSortMultilevel(
  collator: BlockSortCollatorOptions,
  direction: "asc" | "desc" = "asc",
  enableSkipParents = false
) {
  const defaultDepth = ConfigurationProvider.getDefaultMultilevelDepth();
  const askForDepth = ConfigurationProvider.getAskForMultilevelDepth();

  const sortChildren = askForDepth
    ? await showNumberQuickPick(-1, 100, 1, {
        placeHolder: "Indentation Depth",
        picked: defaultDepth,
        negativeAsInfinite: true,
      })
    : defaultDepth;

  if (sortChildren === undefined) return;
  if (!enableSkipParents) {
    return commands.executeCommand("blocksort._sortBlocks", null, { collator, direction, sortChildren });
  }

  const defaultSkipParents = ConfigurationProvider.getDefaultSkipParents();
  const askForSkipParents = ConfigurationProvider.getAskForSkipParents();

  const skipParents =
    enableSkipParents && askForSkipParents
      ? await showNumberQuickPick(0, 100, 1, { placeHolder: "Skip Parents", picked: defaultSkipParents })
      : defaultSkipParents;

  if (sortChildren === undefined || skipParents === undefined) return;

  return commands.executeCommand("blocksort._sortBlocks", null, {
    collator,
    direction,
    sortChildren: sortChildren === -1 ? sortChildren : sortChildren + skipParents,
    skipParents,
  });
}

export function blockSortAsc(
  formattingProvider: BlockSortFormattingProvider,
  editor: TextEditor,
  editBuilder: TextEditorEdit
) {
  const collator = ConfigurationProvider.getCollatorOptions();
  blockSort(formattingProvider, editor, editBuilder, null, { collator, direction: "asc" });
}

export function blockSortDesc(
  formattingProvider: BlockSortFormattingProvider,
  editor: TextEditor,
  editBuilder: TextEditorEdit
) {
  const collator = ConfigurationProvider.getCollatorOptions();
  blockSort(formattingProvider, editor, editBuilder, null, { collator, direction: "desc" });
}

export function blockSortMultilevelAsc() {
  const collator = ConfigurationProvider.getCollatorOptions();
  blockSortMultilevel(collator, "asc");
}

export function blockSortMultilevelDesc() {
  const collator = ConfigurationProvider.getCollatorOptions();
  blockSortMultilevel(collator, "desc");
}

export function blockSortInnerBlocksAsc() {
  const collator = ConfigurationProvider.getCollatorOptions();
  blockSortMultilevel(collator, "asc", true);
}

export function blockSortInnerBlocksDesc() {
  const collator = ConfigurationProvider.getCollatorOptions();
  blockSortMultilevel(collator, "desc", true);
}

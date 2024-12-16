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
    collator = ConfigurationProvider.getCollatorOptions(),
    direction = "asc",
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
  formattingProvider: BlockSortFormattingProvider,
  editor: TextEditor | undefined,
  editBuilder: TextEditorEdit,
  direction: "asc" | "desc" = "asc",
  enableSkipParents = false,
  options: Partial<BlockSortOptions> = {}
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
    return blockSort(formattingProvider, editor, editBuilder, null, { direction, sortChildren, ...options });
  }

  const defaultSkipParents = ConfigurationProvider.getDefaultSkipParents();
  const askForSkipParents = ConfigurationProvider.getAskForSkipParents();

  const skipParents =
    enableSkipParents && askForSkipParents
      ? await showNumberQuickPick(0, 100, 1, { placeHolder: "Skip Parents", picked: defaultSkipParents })
      : defaultSkipParents;

  if (sortChildren === undefined || skipParents === undefined) return;

  return blockSort(formattingProvider, editor, editBuilder, null, {
    direction,
    sortChildren: sortChildren === -1 ? sortChildren : sortChildren + skipParents,
    skipParents,
    ...options,
  });
}

export function blockSortAsc(
  formattingProvider: BlockSortFormattingProvider,
  editor: TextEditor,
  editBuilder: TextEditorEdit,
  options: Partial<BlockSortOptions> = {}
) {
  blockSort(formattingProvider, editor, editBuilder, null, { direction: "asc", ...options });
}

export function blockSortDesc(
  formattingProvider: BlockSortFormattingProvider,
  editor: TextEditor,
  editBuilder: TextEditorEdit,
  options: Partial<BlockSortOptions> = {}
) {
  blockSort(formattingProvider, editor, editBuilder, null, { direction: "desc", ...options });
}

export function blockSortMultilevelAsc(
  formattingProvider: BlockSortFormattingProvider,
  editor: TextEditor,
  editBuilder: TextEditorEdit,
  options: Partial<BlockSortOptions> = {}
) {
  blockSortMultilevel(formattingProvider, editor, editBuilder, "asc", false, options);
}

export function blockSortMultilevelDesc(
  formattingProvider: BlockSortFormattingProvider,
  editor: TextEditor,
  editBuilder: TextEditorEdit,
  options: Partial<BlockSortOptions> = {}
) {
  blockSortMultilevel(formattingProvider, editor, editBuilder, "desc", false, options);
}

export function blockSortInnerBlocksAsc(
  formattingProvider: BlockSortFormattingProvider,
  editor: TextEditor,
  editBuilder: TextEditorEdit,
  options: Partial<BlockSortOptions> = {}
) {
  blockSortMultilevel(formattingProvider, editor, editBuilder, "asc", true, options);
}

export function blockSortInnerBlocksDesc(
  formattingProvider: BlockSortFormattingProvider,
  editor: TextEditor,
  editBuilder: TextEditorEdit,
  options: Partial<BlockSortOptions> = {}
) {
  blockSortMultilevel(formattingProvider, editor, editBuilder, "desc", true, options);
}

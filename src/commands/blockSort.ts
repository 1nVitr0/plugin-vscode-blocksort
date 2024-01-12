import { commands, InputBoxOptions, Selection, Range, TextEditor, TextEditorEdit, window } from "vscode";
import ConfigurationProvider, { BlockSortCollatorOptions } from "../providers/ConfigurationProvider";
import BlockSortFormattingProvider from "../providers/BlockSortFormattingProvider";
import { BlockSortOptions } from "../types/BlockSortOptions";

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
    expandSelection = range?.isEmpty
      ? ConfigurationProvider.getExpandCursor()
      : ConfigurationProvider.getExpandSelection(),
  } = options;

  const { document, selection } = editor;

  const edit = formattingProvider.getBlockSortEdit(document, range ?? selection, {
    collator,
    direction,
    sortChildren,
    expandSelection,
  });
  editBuilder.replace(edit.range, edit.newText);
  editor.selection = new Selection(edit.range.start, edit.range.end);
}

function blockSortMultilevel(collator: BlockSortCollatorOptions, direction: "asc" | "desc" = "asc") {
  const defaultDepth = ConfigurationProvider.getDefaultMultilevelDepth();
  if (!ConfigurationProvider.getAskForMultilevelDepth())
    return commands.executeCommand("blocksort._sortBlocks", null, { collator, direction, sortChildren: defaultDepth });

  let options: InputBoxOptions = {
    prompt: "Indentation Depth: ",
    placeHolder: "(number)",
    value: defaultDepth.toString(),
    validateInput: (value) => (/\-?\d+/.test(value) ? null : "Only integer values allowed. Use -1 for infinite depth"),
  };

  window.showInputBox(options).then((value) => {
    if (value === undefined) return;
    commands.executeCommand("blocksort._sortBlocks", null, { collator, direction, sortChildren: parseInt(value) });
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

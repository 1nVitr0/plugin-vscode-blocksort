import { commands, InputBoxOptions, Selection, Range, TextEditor, TextEditorEdit, window } from "vscode";
import BlockSortProvider from "../providers/BlockSortProvider";
import ConfigurationProvider from "../providers/ConfigurationProvider";
import BlockSortFormattingProvider from "../providers/BlockSortFormattingProvider";
import { BlockSortOptions } from "../types/BlockSortOptions";

export function blockSort(
  editor: TextEditor | undefined,
  editBuilder: TextEditorEdit,
  range: Range | null,
  options: BlockSortOptions
) {
  if (!editor) editor = window.activeTextEditor;
  if (!editor) return;

  const {
    sortFunction,
    sortChildren = 0,
    expandSelection = range?.isEmpty
      ? ConfigurationProvider.getExpandCursor()
      : ConfigurationProvider.getExpandSelection(),
  } = options;

  const { document, selection } = editor;

  const edit = BlockSortFormattingProvider.getBlockSortEdit(document, range ?? selection, {
    sortFunction,
    sortChildren,
    expandSelection,
  });
  editBuilder.replace(edit.range, edit.newText);
  editor.selection = new Selection(edit.range.start, edit.range.end);
}

function blockSortMultilevel(sortFunction: (a: string, b: string) => number) {
  const defaultDepth = ConfigurationProvider.getDefaultMultilevelDepth();
  if (!ConfigurationProvider.getAskForMultilevelDepth())
    return commands.executeCommand("blocksort._sortBlocks", null, { sortFunction, sortChildren: defaultDepth });

  let options: InputBoxOptions = {
    prompt: "Indentation Depth: ",
    placeHolder: "(number)",
    value: defaultDepth.toString(),
    validateInput: (value) => (/\-?\d+/.test(value) ? null : "Only integer values allowed. Use -1 for infinite depth"),
  };

  window.showInputBox(options).then((value) => {
    if (value === undefined) return;
    commands.executeCommand("blocksort._sortBlocks", null, { sortFunction, sortChildren: parseInt(value) });
  });
}

export function blockSortAsc(editor: TextEditor, editBuilder: TextEditorEdit) {
  const naturalSorting = ConfigurationProvider.getEnableNaturalSorting();
  const sortFunction = naturalSorting ? BlockSortProvider.sort.ascNatural : BlockSortProvider.sort.asc;
  blockSort(editor, editBuilder, null, { sortFunction });
}

export function blockSortDesc(editor: TextEditor, editBuilder: TextEditorEdit) {
  const naturalSorting = ConfigurationProvider.getEnableNaturalSorting();
  const sortFunction = naturalSorting ? BlockSortProvider.sort.descNatural : BlockSortProvider.sort.desc;
  blockSort(editor, editBuilder, null, { sortFunction });
}

export function blockSortMultilevelAsc() {
  const naturalSorting = ConfigurationProvider.getEnableNaturalSorting();
  const sortFunction = naturalSorting ? BlockSortProvider.sort.ascNatural : BlockSortProvider.sort.asc;
  blockSortMultilevel(sortFunction);
}

export function blockSortMultilevelDesc() {
  const naturalSorting = ConfigurationProvider.getEnableNaturalSorting();
  const sortFunction = naturalSorting ? BlockSortProvider.sort.descNatural : BlockSortProvider.sort.desc;
  blockSortMultilevel(sortFunction);
}

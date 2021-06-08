import { InputBoxOptions, Selection, TextEditor, TextEditorEdit, window } from 'vscode';
import BlockSortProvider from '../providers/BlockSortProvider';

function blockSort(
  editor: TextEditor,
  editBuilder: TextEditorEdit,
  sortFunction: (a: string, b: string) => number,
  sortChildren = 0
) {
  if (!window.activeTextEditor) return;
  const { document, selection } = window.activeTextEditor;

  const blockSort = new BlockSortProvider(document);
  const range = blockSort.expandSelection(selection);
  const blocks = blockSort.getBlocks(range);
  const sorted = blockSort.sortBlocks(blocks, sortFunction, sortChildren);

  editor.selection = new Selection(range.start, range.end);
  editBuilder.replace(range, sorted.join('\n'));
}

export function blockSortMultilevel(
  editor: TextEditor,
  editBuilder: TextEditorEdit,
  sortFunction: (a: string, b: string) => number
) {
  let options: InputBoxOptions = {
    prompt: 'Indentation Depth: ',
    placeHolder: '(number)',
    value: '-1',
    validateInput: (value) => (/-?\d+/.test(value) ? value : null),
  };

  window.showInputBox(options).then((value) => {
    if (!value) return;
    blockSort(editor, editBuilder, sortFunction, parseInt(value));
  });
}

export function blockSortAsc(editor: TextEditor, editBuilder: TextEditorEdit) {
  blockSort(editor, editBuilder, BlockSortProvider.sort.asc);
}

export function blockSortDesc(editor: TextEditor, editBuilder: TextEditorEdit) {
  blockSort(editor, editBuilder, BlockSortProvider.sort.desc);
}

export function blockSortMultilevelAsc(editor: TextEditor, editBuilder: TextEditorEdit) {
  blockSortMultilevel(editor, editBuilder, BlockSortProvider.sort.asc);
}

export function blockSortMultilevelDesc(editor: TextEditor, editBuilder: TextEditorEdit) {
  blockSortMultilevel(editor, editBuilder, BlockSortProvider.sort.desc);
}

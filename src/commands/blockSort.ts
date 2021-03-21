import { Selection, TextEditor, TextEditorEdit, window } from 'vscode';
import BlockSortProvider from '../providers/BlockSortProvider';

function blockSort(editor: TextEditor, editBuilder: TextEditorEdit, sortFunction: (a: string, b: string) => number) {
  if (!window.activeTextEditor) return;
  const { document, selection } = window.activeTextEditor;

  const blockSort = new BlockSortProvider(document);
  const range = blockSort.expandSelection(selection);
  const blocks = blockSort.getBlocks(range);
  const sorted = blockSort.sortBlocks(blocks, sortFunction);

  editor.selection = new Selection(range.start, range.end);
  editBuilder.replace(range, sorted.join('\n'));
}

export function blockSortAsc(editor: TextEditor, editBuilder: TextEditorEdit) {
  blockSort(editor, editBuilder, BlockSortProvider.sort.asc);
}

export function blockSortDesc(editor: TextEditor, editBuilder: TextEditorEdit) {
  blockSort(editor, editBuilder, BlockSortProvider.sort.desc);
}

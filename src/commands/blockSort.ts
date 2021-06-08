import { commands, InputBoxOptions, Selection, TextEditor, TextEditorEdit, window } from 'vscode';
import BlockSortProvider from '../providers/BlockSortProvider';
import ConfigurationProvider from '../providers/ConfigurationProvider';

export function blockSort(
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

function blockSortMultilevel(sortFunction: (a: string, b: string) => number) {
  const defaultDepth = ConfigurationProvider.getDefaultMultilevelDepth();
  if (!ConfigurationProvider.getAskForMultilevelDepth())
    return commands.executeCommand('blocksort._sortBlocks', sortFunction, defaultDepth);

  let options: InputBoxOptions = {
    prompt: 'Indentation Depth: ',
    placeHolder: '(number)',
    value: defaultDepth.toString(),
    validateInput: (value) => (/\-?\d+/.test(value) ? null : 'Only integer values allowed. Use -1 for infinite depth'),
  };

  window.showInputBox(options).then((value) => {
    if (value === undefined) return;
    commands.executeCommand('blocksort._sortBlocks', sortFunction, parseInt(value));
  });
}

export function blockSortAsc(editor: TextEditor, editBuilder: TextEditorEdit) {
  blockSort(editor, editBuilder, BlockSortProvider.sort.asc);
}

export function blockSortDesc(editor: TextEditor, editBuilder: TextEditorEdit) {
  blockSort(editor, editBuilder, BlockSortProvider.sort.desc);
}

export function blockSortMultilevelAsc() {
  blockSortMultilevel(BlockSortProvider.sort.asc);
}

export function blockSortMultilevelDesc() {
  blockSortMultilevel(BlockSortProvider.sort.desc);
}

import { Selection, TextEditor } from "vscode";
import BlockSortFormattingProvider from "../providers/BlockSortFormattingProvider";

export function expandSelectionLocally(formattingProvider: BlockSortFormattingProvider, editor: TextEditor) {
  const range = formattingProvider.expandSelection(editor.document, editor.selection, {
    expandSelection: { expandLocally: true, foldingComplete: true, indentationComplete: true },
  });

  editor.selection = new Selection(range.start, range.end);
}

export function expandSelectionFull(formattingProvider: BlockSortFormattingProvider, editor: TextEditor) {
  const range = formattingProvider.expandSelection(editor.document, editor.selection, {
    expandSelection: {
      expandLocally: true,
      expandOverEmptyLines: true,
      foldingComplete: true,
      indentationComplete: true,
    },
  });

  editor.selection = new Selection(range.start, range.end);
}

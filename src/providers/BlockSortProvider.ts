import { Range, Selection, TextDocument, TextEditorEdit, window, workspace } from 'vscode';
import * as code from 'vscode';

type FoldingMarker = '()' | '[]' | '{}';
type SortingStrategy = 'asc' | 'desc';
type Folding = { [K in FoldingMarker]: number };

export default class BlockSortProvider {
  public static sort: { [K in SortingStrategy]: (a: string, b: string) => number } = {
    asc: (a, b) => (a > b ? 1 : a < b ? -1 : 0),
    desc: (a, b) => (a < b ? 1 : a > b ? -1 : 0),
  };

  // eslint-disable-next-line quotes
  private static stringMarkes: string[] = ['"', "'", '`'];
  private static foldingMarkers: FoldingMarker[] = ['()', '[]', '{}'];

  private document: TextDocument;

  public constructor(document: TextDocument) {
    this.document = document;
  }

  public sortBlocks(blocks: Range[], sort: (a: string, b: string) => number = BlockSortProvider.sort.asc): string[] {
    const textBlocks = blocks.map((block) => this.document.getText(block));

    if (this.isList(blocks) && textBlocks.length) {
      textBlocks[textBlocks.length - 1] += ',';
      textBlocks.sort(sort);
      textBlocks[textBlocks.length - 1] = textBlocks[textBlocks.length - 1].replace(/,\s*$/, '');
    } else {
      textBlocks.sort(sort);
    }

    return textBlocks;
  }

  public getBlocks(range: Range): Range[] {
    const text = this.document.getText(range);
    const lines = text.split(/\r?\n/);
    const firstLine = lines.shift() || '';
    const initialIndent = this.getIndent(firstLine);
    const blocks: Range[] = [];

    let folding = this.getFolding(firstLine);
    let lastStart = 0;
    let currentEnd = 0;
    for (const line of lines) {
      if (this.isValidLine(line) && this.getIndent(line) === initialIndent && !this.hasFolding(folding)) {
        blocks.push(
          this.document.validateRange(
            new Range(range.start.line + lastStart, 0, range.start.line + currentEnd, Infinity)
          )
        );
        lastStart = currentEnd + 1;
        currentEnd = lastStart;
      } else {
        currentEnd++;
      }
      folding = this.getFolding(line, folding);
    }

    if (lines.length) {
      blocks.push(
        this.document.validateRange(new Range(range.start.line + lastStart, 0, range.start.line + currentEnd, Infinity))
      );
    }

    return blocks;
  }

  public getInnerBlocks(block: Range): Range[] {
    const text = this.document.getText(block);
    const lines = text.split(/\r?\n/);
    const indent = this.getIndentRange(text);

    const result: Range[] = [];
    let start = 0;
    let end = 0;
    for (const line of lines) {
      if (this.getIndent(line) > indent.min) {
        end++;
      } else if (start !== end) {
        result.push(
          this.document.validateRange(new Range(block.start.line + start, 0, block.start.line + end, Infinity))
        );
        start = ++end;
      } else {
        start = ++end;
      }
    }

    return result;
  }

  public expandSelection(selection: Selection, indent = 0): Range {
    let range: Range = this.document.validateRange(new Range(selection.start.line, 0, selection.end.line, Infinity));
    let folding: Folding;

    while (
      range.start.line < this.document.lineCount &&
      this.totalOpenFolding((folding = this.getFolding(this.document.getText(range), undefined, true))) > 0
    )
      range = new Range(range.start, range.end.with(range.end.line + 1));
    while (range.start.line > 0 && this.totalOpenFolding((folding = this.getFolding(this.document.getText(range)))) < 0)
      range = new Range(range.start.with(range.start.line - 1), range.end);

    if (!selection.isEmpty) return this.document.validateRange(range);

    let indentRange = this.getIndentRange(this.document.getText(range));
    const { min } = indentRange;

    while (range.start.line > 0 && this.getIndentRange(this.document.getText(range)).min >= min)
      range = new Range(range.start.line - 1, 0, range.end.line, range.end.character);
    range = new Range(range.start.line + 1, 0, range.end.line, range.end.character);

    while (range.end.line < this.document.lineCount && this.getIndentRange(this.document.getText(range)).min >= min)
      range = new Range(range.start.line, 0, range.end.line + 1, Infinity);
    range = new Range(range.start.line, 0, range.end.line - 1, Infinity);

    return this.document.validateRange(range);
  }

  private getIndentRange(text: string): { min: number; max: number } {
    const lines = text.split(/\r?\n/);
    const indentWidth: number = workspace.getConfiguration('editor').get('tabSize') || 4;

    let min = Infinity;
    let max = 0;

    for (const line of lines) {
      const indent = this.getIndent(line, indentWidth);
      if (indent < min) min = indent;
      if (indent > max) max = indent;
    }

    return { min, max };
  }

  private getFolding(line: string, initial: Folding = { '()': 0, '[]': 0, '{}': 0 }, validate = false): Folding {
    const result: Folding = { '()': initial['()'], '[]': initial['[]'], '{}': initial['{}'] };
    const foldingStart = BlockSortProvider.foldingMarkers.map((marker) => marker[0]);
    const foldingEnd = BlockSortProvider.foldingMarkers.map((marker) => marker[1]);

    let escaped = false;
    let inString: string | null = null;
    let foldingIndex: number = -1;
    for (const char of line) {
      if (char === inString && !escaped) {
        inString = null;
      } else if (inString && !escaped && char === '\\') {
        escaped = true;
      } else if (inString) {
        escaped = false;
      } else if ((foldingIndex = foldingStart.indexOf(char)) >= 0) {
        const marker = (foldingStart[foldingIndex] + foldingEnd[foldingIndex]) as FoldingMarker;
        result[marker]++;
      } else if ((foldingIndex = foldingEnd.indexOf(char)) >= 0) {
        const marker = (foldingStart[foldingIndex] + foldingEnd[foldingIndex]) as FoldingMarker;
        if (!validate || result[marker] > 0) result[marker]--;
      }
    }

    return result;
  }

  private hasFolding(folding: Folding): boolean {
    return !!(folding['()'] || folding['[]'] || folding['{}']);
  }

  private totalOpenFolding(folding: Folding): number {
    return folding['()'] + folding['[]'] + folding['{}'];
  }

  private isList(blocks: Range[]): boolean {
    if (!blocks.length) return false;

    const first = this.document.getText(blocks[0]).trim();
    return Array.from(first).pop() === ',';
  }

  private isValidLine(line: string): boolean {
    return !/^\s*$/.test(line) && !/^\s*@/.test(line);
  }

  private getIndent(
    line: string,
    indentWidth: number = workspace.getConfiguration('editor').get('tabSize') || 4
  ): number {
    return (line.match(/^\s*/)?.pop() || '').length / indentWidth;
  }
}

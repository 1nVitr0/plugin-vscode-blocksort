import { Range, Selection, TextDocument } from 'vscode';
import StringProcessingProvider, { Folding } from './StringProcessingProvider';

type SortingStrategy = 'asc' | 'desc';

export default class BlockSortProvider {
  public static sort: Record<SortingStrategy, (a: string, b: string) => number> = {
    asc: (a, b) => (a > b ? 1 : a < b ? -1 : 0),
    desc: (a, b) => (a < b ? 1 : a > b ? -1 : 0),
  };

  private document: TextDocument;
  private stringProcessor: StringProcessingProvider;

  public constructor(document: TextDocument) {
    this.document = document;
    this.stringProcessor = new StringProcessingProvider(document);
  }

  public sortBlocks(blocks: Range[], sort: (a: string, b: string) => number = BlockSortProvider.sort.asc): string[] {
    const textBlocks = blocks.map((block) => this.document.getText(block));

    if (this.stringProcessor.isList(blocks) && textBlocks.length && !/,$/.test(textBlocks[textBlocks.length - 1])) {
      textBlocks[textBlocks.length - 1] += ',';
      this.applySort(textBlocks, sort);
      textBlocks[textBlocks.length - 1] = textBlocks[textBlocks.length - 1].replace(/,\s*$/, '');
    } else {
      this.applySort(textBlocks, sort);
    }

    if (textBlocks.length && !textBlocks[0].trim()) {
      textBlocks.push(textBlocks.shift() || '');
    } else if (textBlocks.length && /^\s*\r?\n/.test(textBlocks[0])) {
      textBlocks[0] = textBlocks[0].replace(/^\s*\r?\n/, '');
      textBlocks[textBlocks.length - 1] += '\n';
    }

    return textBlocks;
  }

  public getBlocks(range: Range): Range[] {
    const startLine = range.start.line;
    const text = this.document.getText(range);
    const lines = text.split(/\r?\n/);
    const firstLine = lines.shift() || '';
    const initialIndent = this.stringProcessor.getIndent(firstLine);
    const blocks: Range[] = [];

    let currentBlock = firstLine;
    let validBlock = this.stringProcessor.isValidLine(firstLine);
    let folding = this.stringProcessor.getFolding(firstLine);
    let lastStart = 0;
    let currentEnd = 0;
    for (const line of lines) {
      if (
        validBlock &&
        this.stringProcessor.stripComments(currentBlock).trim() &&
        (!this.stringProcessor.isIndentIgnoreLine(line) || this.stringProcessor.isClosedBlock(currentBlock)) &&
        this.stringProcessor.getIndent(line) === initialIndent &&
        !this.stringProcessor.hasFolding(folding)
      ) {
        blocks.push(this.document.validateRange(new Range(startLine + lastStart, 0, startLine + currentEnd, Infinity)));
        lastStart = currentEnd + 1;
        currentEnd = lastStart;
        currentBlock = '';
        validBlock = false;
      } else {
        currentEnd++;
      }
      currentBlock += `\n${line}`;
      if (this.stringProcessor.isValidLine(line)) validBlock = true;
      folding = this.stringProcessor.getFolding(line, folding);
    }

    const remaining = this.document.validateRange(
      new Range(startLine + lastStart, 0, startLine + currentEnd, Infinity)
    );
    if (this.document.getText(remaining).trim()) blocks.push(remaining);
    else if (blocks.length) blocks[blocks.length - 1] = new Range(blocks[blocks.length - 1].start, remaining.end);

    return blocks;
  }

  public getInnerBlocks(block: Range): Range[] {
    const text = this.document.getText(block);
    const lines = text.split(/\r?\n/);
    const indent = this.stringProcessor.getIndentRange(text);

    const result: Range[] = [];
    let start = 0;
    let end = 0;
    for (const line of lines) {
      if (this.stringProcessor.getIndent(line) > indent.min) {
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
      this.stringProcessor.totalOpenFolding(
        (folding = this.stringProcessor.getFolding(this.document.getText(range), undefined, true))
      ) > 0
    )
      range = new Range(range.start, range.end.with(range.end.line + 1));

    while (
      range.start.line > 0 &&
      this.stringProcessor.totalOpenFolding((folding = this.stringProcessor.getFolding(this.document.getText(range)))) <
        0
    )
      range = new Range(range.start.with(range.start.line - 1), range.end);

    if (!selection.isEmpty) return this.document.validateRange(range);

    let indentRange = this.stringProcessor.getIndentRange(this.document.getText(range));
    const { min } = indentRange;

    while (range.start.line > 0 && this.stringProcessor.getIndentRange(this.document.getText(range)).min >= min)
      range = new Range(range.start.line - 1, 0, range.end.line, range.end.character);
    if (range.start.line !== 0) range = new Range(range.start.line + 1, 0, range.end.line, range.end.character);

    while (
      range.end.line < this.document.lineCount &&
      this.stringProcessor.getIndentRange(this.document.getText(range)).min >= min
    )
      range = new Range(range.start.line, 0, range.end.line + 1, Infinity);
    range = new Range(range.start.line, 0, range.end.line - 1, Infinity);

    while (
      range.start.line < range.end.line &&
      this.stringProcessor.isIndentIgnoreLine(
        this.document.getText(range.with(range.start, range.start.with(range.start.line, Infinity)))
      )
    )
      range = range.with(range.start.with(range.start.line + 1, 0));

    return this.document.validateRange(range);
  }

  private applySort(blocks: string[], sort: (a: string, b: string) => number = BlockSortProvider.sort.asc) {
    blocks.sort((a, b) =>
      sort(
        this.stringProcessor.stripDecorators(this.stringProcessor.stripComments(a)).trim() || a.trim(),
        this.stringProcessor.stripDecorators(this.stringProcessor.stripComments(b)).trim() || b.trim()
      )
    );
  }
}

import { CancellationToken, Range, TextDocument } from "vscode";
import ConfigurationProvider from "./ConfigurationProvider";
import StringProcessingProvider, { Folding } from "./StringProcessingProvider";

type SortingStrategy = "asc" | "desc" | "ascNatural" | "descNatural";

export default class BlockSortProvider {
  public static sort: Record<SortingStrategy, (a: string, b: string) => number> = {
    asc: (a, b) => (a > b ? 1 : a < b ? -1 : 0),
    desc: (a, b) => (a < b ? 1 : a > b ? -1 : 0),
    ascNatural: (a, b) => BlockSortProvider.sort.asc(BlockSortProvider.padNumbers(a), BlockSortProvider.padNumbers(b)),
    descNatural: (a, b) =>
      BlockSortProvider.sort.desc(BlockSortProvider.padNumbers(a), BlockSortProvider.padNumbers(b)),
  };
  protected static padNumbers(line: string) {
    const { omitUuids, padding, sortNegativeValues } = ConfigurationProvider.getNaturalSortOptions();
    let result = line;
    if (omitUuids)
      result = result.replace(/\d+(?=[^a-zA-z]|$)|(?<=[^a-zA-z]|^)\d+/g, (match) => match.padStart(padding, "0"));
    else result = result.replace(/\d+/g, (match) => match.padStart(padding, "0"));

    if (sortNegativeValues) {
      result = result.replace(
        new RegExp(`-\\d{${padding}}`, "g"),
        (match) => `-${(Math.pow(10, padding) + parseInt(match)).toString()}`
      );
    }

    return result;
  }

  private document: TextDocument;
  private stringProcessor: StringProcessingProvider;

  public constructor(document: TextDocument) {
    this.document = document;
    this.stringProcessor = new StringProcessingProvider(document);
  }

  public sortBlocks(
    blocks: Range[],
    sort: (a: string, b: string) => number = BlockSortProvider.sort.asc,
    sortChildren = 0,
    token?: CancellationToken
  ): string[] {
    let textBlocks = blocks.map((block) => this.sortInnerBlocks(block, sort, sortChildren, token));
    if (ConfigurationProvider.getSortConsecutiveBlockHeaders())
      textBlocks = textBlocks.map((block) => this.sortBlockHeaders(block, sort, token));

    if (token?.isCancellationRequested) return [];

    if (this.stringProcessor.isList(blocks) && textBlocks.length && !/,$/.test(textBlocks[textBlocks.length - 1])) {
      textBlocks[textBlocks.length - 1] += ",";
      this.applySort(textBlocks, sort);
      textBlocks[textBlocks.length - 1] = textBlocks[textBlocks.length - 1].replace(/,\s*$/, "");
    } else {
      this.applySort(textBlocks, sort);
    }

    if (token?.isCancellationRequested) return [];

    if (textBlocks.length && !textBlocks[0].trim()) {
      textBlocks.push(textBlocks.shift() || "");
    } else if (textBlocks.length && /^\s*\r?\n/.test(textBlocks[0])) {
      // For some reason a newline for the second block gets left behind sometimes
      const front = !/\r?\n$/.test(textBlocks[0]) && textBlocks[1] && !/^\r?\n/.test(textBlocks[1]);
      textBlocks[0] = textBlocks[0].replace(/^\s*\r?\n/, "");
      textBlocks[front ? 0 : textBlocks.length - 1] += "\n";
    }

    return textBlocks;
  }

  public getBlocks(range: Range, token?: CancellationToken): Range[] {
    const startLine = range.start.line;
    const text = this.document.getText(range);
    const lines = text.split(/\r?\n/);
    const firstLine = lines.shift() || "";
    const initialIndent = this.stringProcessor.getIndent(firstLine);
    const blocks: Range[] = [];

    let currentBlock = firstLine;
    let validBlock = this.stringProcessor.isValidLine(firstLine);
    let folding = this.stringProcessor.getFolding(firstLine);
    let lastStart = 0;
    let currentEnd = 0;
    for (const line of lines) {
      if (token?.isCancellationRequested) return [];
      if (
        validBlock &&
        this.stringProcessor.stripComments(currentBlock).trim() &&
        !this.stringProcessor.isIncompleteBlock(currentBlock) &&
        (!this.stringProcessor.isIndentIgnoreLine(line) || this.stringProcessor.isCompleteBlock(currentBlock)) &&
        this.stringProcessor.getIndent(line) === initialIndent &&
        !this.stringProcessor.hasFolding(folding)
      ) {
        blocks.push(this.document.validateRange(new Range(startLine + lastStart, 0, startLine + currentEnd, Infinity)));
        lastStart = currentEnd + 1;
        currentEnd = lastStart;
        currentBlock = "";
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

  public getInnerBlocks(block: Range, token?: CancellationToken): Range[] {
    const text = this.document.getText(block);
    const lines = text.split(/\r?\n/);
    const indent = this.stringProcessor.getIndentRange(text);

    let start = 0;
    let end = -1;
    for (const line of lines) {
      if (token?.isCancellationRequested) return [];
      if (this.stringProcessor.getIndent(line) === indent.min) {
        if (end >= start) break;
        start++;
      }
      end++;
    }

    const intersection = block.intersection(new Range(block.start.line + start, 0, block.start.line + end, Infinity));
    if (intersection && !intersection.isEmpty) return this.getBlocks(intersection, token);
    return [];
  }

  public expandRange(selection: Range, indent = 0, token?: CancellationToken): Range {
    const { stringProcessor } = this;
    let range: Range = this.document.validateRange(new Range(selection.start.line, 0, selection.end.line, Infinity));
    let folding: Folding;

    while (
      !token?.isCancellationRequested &&
      range.end.line < this.document.lineCount &&
      this.stringProcessor.totalOpenFolding(
        (folding = stringProcessor.getFolding(this.document.getText(range), undefined, true))
      ) > 0
    )
      range = new Range(range.start, range.end.with(range.end.line + 1));

    while (
      !token?.isCancellationRequested &&
      range.start.line > 0 &&
      stringProcessor.totalOpenFolding((folding = stringProcessor.getFolding(this.document.getText(range)))) < 0
    )
      range = new Range(range.start.with(range.start.line - 1), range.end);

    if (token?.isCancellationRequested || !selection.isEmpty)
      return this.document.validateRange(range);

    let indentRange = stringProcessor.getIndentRange(this.document.getText(range), true, token);
    const { min } = indentRange;

    while (
      !token?.isCancellationRequested &&
      range.start.line > 0 &&
      stringProcessor.getIndentRange(this.document.getText(range), false, token).min >= min
    )
      range = new Range(range.start.line - 1, 0, range.end.line, range.end.character);
    if (stringProcessor.getIndentRange(this.document.getText(range), false, token).min < min)
      range = new Range(range.start.line + 1, 0, range.end.line, range.end.character);

    while (
      !token?.isCancellationRequested &&
      range.end.line < this.document.lineCount &&
      stringProcessor.getIndentRange(this.document.getText(range), false, token).min >= min
    )
      range = new Range(range.start.line, 0, range.end.line + 1, Infinity);
    if (stringProcessor.getIndentRange(this.document.getText(range), false, token).min < min)
      range = new Range(range.start.line, 0, range.end.line - 1, Infinity);

    while (
      !token?.isCancellationRequested &&
      range.start.line < range.end.line &&
      stringProcessor.isIndentIgnoreLine(
        this.document.getText(range.with(range.start, range.start.with(range.start.line, Infinity)))
      )
    )
      range = range.with(range.start.with(range.start.line + 1, 0));

    return this.document.validateRange(range);
  }

  private sortInnerBlocks(
    block: Range,
    sort: (a: string, b: string) => number = BlockSortProvider.sort.asc,
    sortChildren = 0,
    token?: CancellationToken,
  ): string {
    if (sortChildren === 0) return this.document.getText(block);

    let blocks = this.getInnerBlocks(block, token);
    // if (!blocks.length || (blocks.length === 1 && blocks[0].isSingleLine)) return this.document.getText(block);

    const head: Range = new Range(block.start, blocks[0]?.start || block.start);
    const tail: Range = new Range(blocks[blocks.length - 1]?.end || block.end, block.end);

    if (token?.isCancellationRequested) return "";
    if (head.isEmpty && tail.isEmpty) return this.document.getText(block);

    return (
      this.document.getText(head) +
      this.sortBlocks(blocks, sort, sortChildren - 1, token).join("\n") +
      this.document.getText(tail)
    );
  }

  private sortBlockHeaders(
    block: string,
    sort: (a: string, b: string) => number = BlockSortProvider.sort.asc,
    token?: CancellationToken,
  ): string {
    let lines = block.split(/\r?\n/);
    const headers: string[] = [];

    let currentLine;
    while ((currentLine = lines.shift()) && this.stringProcessor.isMultiBlockHeader(currentLine)) {
      if (token?.isCancellationRequested) return "";
      headers.push(currentLine);
      currentLine = undefined;
    }

    if (currentLine !== undefined) lines.unshift(currentLine);
    this.applySort(headers, sort);
    lines = [...headers, ...lines];

    return lines.join("\n");
  }

  private applySort(blocks: string[], sort: (a: string, b: string) => number = BlockSortProvider.sort.asc) {
    blocks.sort((a, b) => {
      const sanitizedA = this.stringProcessor.stripDecorators(this.stringProcessor.stripComments(a)).trim() || a.trim();
      const sanitizedB = this.stringProcessor.stripDecorators(this.stringProcessor.stripComments(b)).trim() || b.trim();
      return this.stringProcessor.isForceFirstBlock(sanitizedA) || this.stringProcessor.isForceLastBlock(sanitizedB)
        ? -1
        : this.stringProcessor.isForceLastBlock(sanitizedA) || this.stringProcessor.isForceFirstBlock(sanitizedB)
        ? 1
        : sort(sanitizedA, sanitizedB);
    });
  }
}

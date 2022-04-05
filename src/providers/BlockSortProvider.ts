import { off } from "process";
import { CancellationToken, Disposable, Range, TextDocument, TextDocumentChangeEvent, workspace } from "vscode";
import ConfigurationProvider from "./ConfigurationProvider";
import StringProcessingProvider, { Folding, LineMeta } from "./StringProcessingProvider";

type SortingStrategy = "asc" | "desc" | "ascNatural" | "descNatural";

export default class BlockSortProvider implements Disposable {
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
  private computedRanges: Range[] = [];
  private documentLineMeta: LineMeta[] | null = null;
  private stringProcessor: StringProcessingProvider;
  private disposables: Disposable[] = [];

  public constructor(document: TextDocument) {
    this.document = document;
    this.stringProcessor = new StringProcessingProvider(document);
  }

  public dispose() {
    this.disposables.forEach((d) => d.dispose());
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

    // Find common block separator, ignoring the last block
    let separator = textBlocks.length > 1 ? this.stringProcessor.getBlockSeparator(textBlocks[0]) : "";
    for (const block of textBlocks.slice(1, -1)) {
      separator = this.stringProcessor.getBlockSeparator(block, separator);
      if (!separator) break;
    }
    // If last block has separator, we don't need to alter anything
    if (textBlocks.length && textBlocks[textBlocks.length - 1].endsWith(separator)) separator = "";

    this.applySort(textBlocks, sort);

    if (separator) {
      // Apply separator to all blocks except the last one
      textBlocks = textBlocks.map((block, i) => {
        if (i == textBlocks.length - 1 && block.endsWith(separator)) return block.slice(0, -separator.length);
        else if (i < textBlocks.length - 1 && !block.endsWith(separator)) return block + separator;
        else return block;
      });
    }

    return textBlocks;
  }

  public getBlocks(range: Range, token?: CancellationToken): Range[] {
    if (!this.isComputed(range)) this.computeLineMeta([range], true, token);
    if (!this.documentLineMeta) return []; //* TS hint, this never actually happens

    const { start, end } = range;
    const offset = start.line;
    const startLineMeta = this.documentLineMeta[offset];
    const blocks: Range[] = [];

    let currentBlock = startLineMeta.text ?? this.document.getText(new Range(start, start.translate(0, Infinity)));
    let validBlock = startLineMeta.valid;
    let hasContent = startLineMeta.hasContent;
    let completeBlock = startLineMeta.complete;
    let incompleteBlock = startLineMeta.incomplete;
    let folding = startLineMeta.folding;
    let lastStart = 0;
    let currentEnd = 0;

    for (let i = offset + 1; i <= end.line; i++) {
      if (token?.isCancellationRequested) return [];

      const lineMeta = this.documentLineMeta[i];
      const text = lineMeta.text ?? this.document.getText(new Range(start, start.translate(0, Infinity)));
      if (
        validBlock &&
        hasContent &&
        text.trim() &&
        !incompleteBlock &&
        (!lineMeta.ignoreIndent || completeBlock) &&
        lineMeta.indent === startLineMeta.indent &&
        !this.stringProcessor.hasFolding(folding)
      ) {
        blocks.push(this.document.validateRange(new Range(offset + lastStart, 0, offset + currentEnd, Infinity)));
        lastStart = currentEnd + 1;
        currentEnd = lastStart;
        currentBlock = "";
        validBlock = false;
        hasContent = false;
        completeBlock = false;
        incompleteBlock = false;
      } else {
        currentEnd++;
      }
      currentBlock += `\n${text}`;
      if (lineMeta.valid) validBlock = true;
      if (lineMeta.hasContent) {
        hasContent = true;
        completeBlock = lineMeta.complete;
        incompleteBlock = lineMeta.incomplete;
      }
      folding = this.stringProcessor.mergeFolding(folding, lineMeta.folding);
    }

    // If the last block contains text, add it to the list
    // Otherwise,  add the remaining range to the last block.
    const remaining = this.document.validateRange(new Range(offset + lastStart, 0, offset + currentEnd, Infinity));
    if (this.document.getText(remaining).trim()) blocks.push(remaining);
    else if (blocks.length) blocks[blocks.length - 1] = new Range(blocks[blocks.length - 1].start, remaining.end);

    return blocks;
  }

  public getInnerBlocks(block: Range, token?: CancellationToken): Range[] {
    if (!this.isComputed(block)) this.computeLineMeta([block], true, token);
    if (!this.documentLineMeta) return []; //* TS hint, this never actually happens

    const indent = this.stringProcessor.getIndentRange(this.documentLineMeta.slice(block.start.line, block.end.line));

    let start = 0;
    let end = -1;
    for (let i = block.start.line; i <= block.end.line; i++) {
      if (token?.isCancellationRequested) return [];

      const lineMeta = this.documentLineMeta[i];

      if (lineMeta.indent === indent.min) {
        if (end >= start) break;
        start++;
      }
      end++;
    }

    const intersection = block.intersection(new Range(block.start.line + start, 0, block.start.line + end, Infinity));
    if (intersection && !intersection.isEmpty) return this.getBlocks(intersection, token);
    return [];
  }

  // TODO: Make this more efficient
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

    if (token?.isCancellationRequested || !selection.isEmpty) return this.document.validateRange(range);

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

  public watch(): void {
    this.disposables.push(workspace.onDidChangeTextDocument(this.computeLineMeta, this, this.disposables));
  }

  private computeLineMeta(ranges?: Range[], withText?: boolean, token?: CancellationToken): void;
  private computeLineMeta(e?: TextDocumentChangeEvent, withText?: boolean, token?: CancellationToken): void;
  private computeLineMeta(e?: TextDocumentChangeEvent | Range[], withText?: boolean, token?: CancellationToken): void {
    if (e && "document" in e && e.document !== this.document) return;
    if (!this.documentLineMeta) this.documentLineMeta = Array(this.document.lineCount).fill(null);

    const ranges: Range[] = e
      ? "document" in e
        ? e.contentChanges.map((c) => c.range)
        : e
      : [new Range(0, 0, this.document.lineCount, Infinity)];

    for (let i = 0; i < ranges.length; i++) {
      if (token?.isCancellationRequested) return;

      const { start, end } = ranges[i];
      const text = e && "document" in e ? e.contentChanges[i].text : this.document.getText(ranges[i]);
      const lines = text.split(/\r?\n/);

      this.documentLineMeta.splice(
        start.line,
        end.line - start.line + 1,
        ...lines.map((line, j) => {
          return {
            line: start.line + j,
            indent: this.stringProcessor.getIndent(line),
            valid: this.stringProcessor.isValidLine(line),
            folding: this.stringProcessor.getFolding(line),
            ignoreIndent: this.stringProcessor.isIndentIgnoreLine(line),
            hasContent: !!this.stringProcessor.stripComments(line).trim(),
            multiBlockHeader: this.stringProcessor.isMultiBlockHeader(line),
            complete: this.stringProcessor.isCompleteBlock(line),
            incomplete: this.stringProcessor.isIncompleteBlock(line),
            text: withText ? line : null,
          };
        })
      );

      this.computedRanges.push(ranges[i]);
    }
  }

  private isComputed(range: Range): boolean {
    return this.computedRanges.some((r) => r.contains(range));
  }

  private sortInnerBlocks(
    block: Range,
    sort: (a: string, b: string) => number = BlockSortProvider.sort.asc,
    sortChildren = 0,
    token?: CancellationToken
  ): string {
    if (sortChildren === 0) return this.document.getText(block);

    let blocks = this.getInnerBlocks(block, token);

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
    token?: CancellationToken
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

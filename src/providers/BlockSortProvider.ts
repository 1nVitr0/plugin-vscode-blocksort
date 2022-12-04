import {
  CancellationToken,
  Disposable,
  Range,
  TextDocument,
  TextDocumentChangeEvent,
  TextEdit,
  workspace,
} from "vscode";
import { ExpandSelectionOptions } from "../types/BlockSortOptions";
import ConfigurationProvider from "./ConfigurationProvider";
import StringProcessingProvider, { Folding, LineMeta } from "./StringProcessingProvider";

type SortingStrategy = "asc" | "desc" | "ascNatural" | "descNatural";
interface ExpandDirectionOptions extends ExpandSelectionOptions {
  direction: 1 | -1;
}

export default class BlockSortProvider implements Disposable {
  protected static expandSelectionFull: ExpandSelectionOptions = {
    expandLocally: true,
    expandOverEmptyLines: true,
    foldingComplete: true,
    indentationComplete: true,
  };

  public static sort: Record<SortingStrategy, (a: string, b: string) => number> = {
    asc: (a, b) => (a > b ? 1 : a < b ? -1 : 0),
    desc: (a, b) => (a < b ? 1 : a > b ? -1 : 0),
    ascNatural: (a, b) => BlockSortProvider.sort.asc(BlockSortProvider.padNumbers(a), BlockSortProvider.padNumbers(b)),
    descNatural: (a, b) =>
      BlockSortProvider.sort.desc(BlockSortProvider.padNumbers(a), BlockSortProvider.padNumbers(b)),
  };

  public static subtractRange(range: Range, subtract: Range): Range[] {
    const ranges: Range[] = [];
    const intersection = range.intersection(subtract);

    if (intersection === undefined) return [range];
    if (intersection?.start.isAfter(range.start)) ranges.push(new Range(range.start, intersection.start));
    if (intersection?.end.isBefore(range.end)) ranges.push(new Range(intersection.end, range.end));

    return ranges;
  }

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

    this.disposables.push(workspace.onDidChangeTextDocument(this.onUpdateDocument, this, this.disposables));
  }

  public dispose() {
    this.disposables.forEach((d) => d.dispose());
  }

  public sortBlocks(
    blocks: Range[],
    sort: (a: string, b: string) => number = BlockSortProvider.sort.asc,
    sortChildren = 0,
    edits?: TextEdit[],
    token?: CancellationToken
  ): string[] {
    let textBlocks = blocks.map((block) => this.sortInnerBlocks(block, sort, sortChildren, edits, token));
    if (ConfigurationProvider.getSortConsecutiveBlockHeaders(this.document))
      textBlocks = textBlocks.map((block) => this.sortBlockHeaders(block, sort, token));

    if (token?.isCancellationRequested) return [];

    let suffixes = [];
    // If appended newlines are kept, remove and save all appended newlines
    if (ConfigurationProvider.getKeepAppendedNewlines()) {
      for (let i = 0; i < textBlocks.length; i++) {
        if (textBlocks[i].endsWith("\r\n")) {
          suffixes.push("\r\n");
          textBlocks[i] = textBlocks[i].slice(0, -2);
        } else if (textBlocks[i].endsWith("\n")) {
          suffixes.push("\n");
          textBlocks[i] = textBlocks[i].slice(0, -1);
        } else {
          suffixes.push("");
        }
      }
    }

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
        if (i === textBlocks.length - 1 && block.endsWith(separator)) return block.slice(0, -separator.length);
        else if (i < textBlocks.length - 1 && !block.endsWith(separator)) return block + separator;
        else return block;
      });
    }

    if (suffixes) {
      for (let i = 0; i < textBlocks.length; i++) {
        if (suffixes[i]) textBlocks[i] += suffixes[i];
      }
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

    const indent = this.stringProcessor.getIndentRange(
      this.documentLineMeta.slice(block.start.line, block.end.line),
      this.document
    );

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

  private expandRangeInDirection(
    range: Range,
    { folding, indent }: { folding: Folding; indent: number },
    { direction, ...expand }: ExpandDirectionOptions,
    token?: CancellationToken
  ): [Range, Folding] {
    const { lineCount } = this.document;
    const getNextLine = (line: number) => (direction > 0 ? Math.min(line + 1, lineCount - 1) : Math.max(line - 1, 0));

    let nextLine = direction > 0 ? getNextLine(range.end.line) : getNextLine(range.start.line);
    if (!this.isComputed(range)) this.computeLineMeta([range], true, token);
    if (!this.isComputed(nextLine)) this.computeLineMeta(nextLine, true, token);
    if (!this.documentLineMeta) return [range, folding]; //* TS hint, this never actually happens

    const { stringProcessor } = this;
    let previousRange = range;
    let previousFolding = folding;

    let line = direction > 0 ? range.end.line : range.start.line;
    let lastIndent = this.documentLineMeta[line].indent;
    while (
      (direction > 0 ? line < lineCount - 1 : line > 0) &&
      this.isExpandLine(this.documentLineMeta[line + direction], { folding, indent, lastIndent }, expand)
    ) {
      if (token?.isCancellationRequested) return [range, folding];
      previousRange = range;
      previousFolding = folding;

      line += direction;
      const addedRange = new Range(line, 0, line, Infinity);
      range = range.union(addedRange);

      nextLine = getNextLine(line);
      if (!this.isComputed(nextLine)) this.computeLineMeta(nextLine, true, token);

      const { folding: currentFolding, indent, hasContent } = this.documentLineMeta[line];
      folding = stringProcessor.mergeFolding(folding, currentFolding);
      if (hasContent) lastIndent = indent;
    }

    if (line === 0 && stringProcessor.totalOpenFolding(folding) > 0) {
      range = previousRange;
      folding = previousFolding;
    }

    return [range, folding];
  }

  private isExpandLine(
    { hasContent, indent }: LineMeta,
    { folding, indent: minIndent, lastIndent }: { folding: Folding; indent: number; lastIndent: number },
    { expandLocally, expandOverEmptyLines, foldingComplete, indentationComplete }: ExpandSelectionOptions
  ): boolean {
    return !!(
      (expandLocally && hasContent && indent >= minIndent) ||
      (expandOverEmptyLines && !hasContent) ||
      (indentationComplete && (indent > minIndent || (lastIndent > minIndent && !hasContent))) ||
      (foldingComplete && this.stringProcessor.totalOpenFolding(folding) != 0)
    );
  }

  public expandRange(selection: Range, expand: boolean | ExpandSelectionOptions, token?: CancellationToken): Range {
    const { stringProcessor } = this;
    let range: Range = this.document.validateRange(new Range(selection.start.line, 0, selection.end.line, Infinity));
    if (!this.isComputed(range)) this.computeLineMeta([range], true, token);
    if (!this.documentLineMeta) return range; //* TS hint, this never actually happens

    if (expand === false) return range;

    const expandOptions: ExpandSelectionOptions = expand === true ? BlockSortProvider.expandSelectionFull : expand;
    const up: ExpandDirectionOptions = { ...expandOptions, direction: -1 };
    const down: ExpandDirectionOptions = { ...expandOptions, direction: 1 };
    const { min: indent } = stringProcessor.getIndentRange(
      this.documentLineMeta.slice(range.start.line, range.end.line + 1),
      this.document
    );

    let folding: Folding = {};
    for (let i = range.start.line; i <= range.end.line; i++) {
      if (token?.isCancellationRequested) return range;

      const lineMeta = this.documentLineMeta[i];
      folding = stringProcessor.mergeFolding(folding, lineMeta.folding);
    }

    if (stringProcessor.totalOpenFolding(folding) > 0) {
      [range, folding] = this.expandRangeInDirection(range, { folding, indent }, down, token);
      [range, folding] = this.expandRangeInDirection(range, { folding, indent }, up, token);
    } else {
      [range, folding] = this.expandRangeInDirection(range, { folding, indent }, up, token);
      [range, folding] = this.expandRangeInDirection(range, { folding, indent }, down, token);
    }

    return this.document.validateRange(range);
  }

  public trimRange(selection: Range): Range {
    let start = selection.start.line;
    let end = selection.end.line;

    while (start < end && this.document.lineAt(start).isEmptyOrWhitespace) start++;
    while (end > start && this.document.lineAt(end).isEmptyOrWhitespace) end--;

    return this.document.validateRange(new Range(start, 0, end, Infinity));
  }

  public computeLineMeta(line: number, withText?: boolean, token?: CancellationToken): LineMeta;
  public computeLineMeta(ranges?: Range[], withText?: boolean, token?: CancellationToken): LineMeta[];
  public computeLineMeta(e?: TextDocumentChangeEvent, withText?: boolean, token?: CancellationToken): LineMeta[];
  public computeLineMeta(
    e?: TextDocumentChangeEvent | Range[] | number,
    withText?: boolean,
    token?: CancellationToken
  ): LineMeta[] | LineMeta {
    if (e && typeof e === "object" && "document" in e && e.document !== this.document) return [];
    if (!this.documentLineMeta) this.documentLineMeta = Array(this.document.lineCount).fill(null);

    const tabSize: number = ConfigurationProvider.getTabSize(this.document);
    const ranges: Range[] = e
      ? typeof e === "number"
        ? [new Range(e, 0, e, Infinity)]
        : "document" in e
        ? e.contentChanges.map((c) => c.range)
        : e
      : [new Range(0, 0, this.document.lineCount, Infinity)];

    const result = [];
    for (let i = 0; i < ranges.length; i++) {
      if (token?.isCancellationRequested) return result;

      const { start, end } = ranges[i];
      const text =
        e && typeof e === "object" && "document" in e ? e.contentChanges[i].text : this.document.getText(ranges[i]);
      const lines = text.split(/\r?\n/);

      const lineMetas = lines.map((line, j) => {
        return {
          line: start.line + j,
          indent: this.stringProcessor.getIndent(line, tabSize),
          valid: this.stringProcessor.isValidLine(line, this.document),
          folding: this.stringProcessor.getFolding(line, this.document),
          ignoreIndent: this.stringProcessor.isIndentIgnoreLine(line, this.document),
          hasContent: !!this.stringProcessor.stripComments(line).trim(),
          complete: this.stringProcessor.isCompleteBlock(line, this.document),
          incomplete: this.stringProcessor.isIncompleteBlock(line),
          text: withText ? line : null,
        };
      });

      this.documentLineMeta.splice(start.line, end.line - start.line + 1, ...lineMetas);
      result.push(...lineMetas);

      this.addComputedRange(ranges[i]);
    }

    return typeof e === "number" ? result[0] : result;
  }

  private onUpdateDocument(e: TextDocumentChangeEvent): void {
    if (e.document !== this.document || !this.documentLineMeta) return;

    const edits = [...e.contentChanges].sort((a, b) => b.range.start.line - a.range.start.line);

    for (const edit of edits) {
      const lineChange = edit.text.split(/\r?\n/).length - (edit.range.end.line - edit.range.start.line);

      for (let i = this.computedRanges.length - 1; i >= 0; i--) {
        let range = this.computedRanges[i];
        if (range.start.isAfter(edit.range.end)) {
          // Adjust all ranges after the edit
          range = new Range(
            range.start.with(range.start.line + lineChange),
            range.end.with(range.end.line + lineChange)
          );
          continue;
        }

        const intersection = range.intersection(edit.range);

        if (!intersection) {
          // Skip if no intersection with edit range
          continue;
        }
        if (edit.range.contains(range)) {
          // Remove computed range if it is completely contained in the edit
          this.computedRanges.splice(i--, 1);
          continue;
        }

        if (intersection?.end.isBefore(range.end)) {
          // Split computed range, if intersection is contained in range
          const newRange = new Range(
            intersection.end.with(intersection.end.line + lineChange),
            range.end.with(range.end.line + lineChange)
          );
          this.computedRanges.splice(i + 1, 0, newRange);
        }

        if (intersection?.start.isAfter(range.start)) {
          // Adjust computed range, or remove if intersection starts at range start
          this.computedRanges[i] = new Range(range.start, intersection.start);
        } else {
          this.computedRanges.splice(i--, 1);
        }
      }

      if (lineChange > 0) this.documentLineMeta.splice(edit.range.end.line + 1, 0, ...Array(lineChange).fill(null));
      else if (lineChange < 0) this.documentLineMeta.splice(edit.range.start.line, -lineChange);
    }
  }

  private isComputed(line: number): boolean;
  private isComputed(range: Range): boolean;
  private isComputed(rangeOrLine: Range | number): boolean {
    const range = typeof rangeOrLine === "number" ? new Range(rangeOrLine, 0, rangeOrLine, Infinity) : rangeOrLine;

    return this.computedRanges.some((r) => r.contains(range));
  }

  private addComputedRange(range: Range) {
    for (let i = 0; i < this.computedRanges.length; i++) {
      const r = this.computedRanges[i];
      if (r.contains(range)) return;
      if (r.intersection(range)) {
        const adjacent = i + (r.start.line < range.start.line ? 1 : -1);
        this.computedRanges[i] = r.union(range);
        if (
          adjacent > 0 &&
          adjacent < this.computedRanges.length &&
          this.computedRanges[adjacent].intersection(range)
        ) {
          this.computedRanges[i] = this.computedRanges[i].union(this.computedRanges[adjacent]);
          this.computedRanges.splice(adjacent, 1);
        }
        return;
      }
      if (range.start.line >= r.end.line) {
        this.computedRanges.splice(i + 1, 0, range);
        return;
      }
    }

    this.computedRanges.push(range);
  }

  private sortInnerBlocks(
    block: Range,
    sort: (a: string, b: string) => number = BlockSortProvider.sort.asc,
    sortChildren = 0,
    edits?: TextEdit[],
    token?: CancellationToken
  ): string {
    if (sortChildren === 0) return this.getEditedText(block, edits, token);

    let blocks = this.getInnerBlocks(block, token);

    const head: Range = new Range(block.start, blocks[0]?.start || block.start);
    const tail: Range = new Range(blocks[blocks.length - 1]?.end || block.end, block.end);

    if (token?.isCancellationRequested) return "";
    if (head.isEmpty && tail.isEmpty) return this.document.getText(block);

    return (
      this.document.getText(head) +
      this.sortBlocks(blocks, sort, sortChildren - 1, edits, token).join("\n") +
      this.document.getText(tail)
    );
  }

  private getEditedText(block: Range, edits?: TextEdit[], token?: CancellationToken): string {
    const containedEdits = [];
    for (let i = (edits?.length ?? 0) - 1; i >= 0; i--) {
      if (token?.isCancellationRequested) return "";
      if (block.contains(edits![i].range)) containedEdits.push(...edits!?.splice(i, 1));
    }

    if (!containedEdits.length) return this.document.getText(block);

    const text = this.document.getText(block);
    const lines = text.split(/\r?\n/);
    containedEdits.sort((a, b) => a.range.start.line - b.range.start.line);

    let lineOffset = 0;
    while (containedEdits.length) {
      if (token?.isCancellationRequested) return "";
      const edit = containedEdits.shift()!;
      const { start, end } = edit.range;
      const editLines = edit.newText.split(/\r?\n/);

      lines.splice(start.line - block.start.line, end.line - block.start.line, ...editLines);

      lineOffset += editLines.length - (end.line - start.line);
      containedEdits.forEach((edit) => {
        if (edit.range.start.line > end.line) {
          edit.range = edit.range.with(edit.range.start.translate(lineOffset), edit.range.end.translate(lineOffset));
        }
      });
    }

    return lines.join("\n");
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
    const precomputed = blocks
      .map((original, index) => ({
        index,
        original,
        sanitized:
          this.stringProcessor.stripDecorators(this.stringProcessor.stripComments(original)).trim() || original.trim(),
        forceFirst: this.stringProcessor.isForceFirstBlock(original),
        forceLast: this.stringProcessor.isForceLastBlock(original),
      }))
      .sort((a, b) =>
        a.forceFirst || b.forceLast ? -1 : a.forceLast || b.forceFirst ? 1 : sort(a.sanitized, b.sanitized)
      );

    precomputed.forEach(({ original }, index) => (blocks[index] = original));
  }
}

import { Range, TextDocument, workspace } from 'vscode';
import { commentMarkers, commentRegex } from '../constants/comments';
import { stringMarkers } from '../constants/strings';

type FoldingMarker = '()' | '[]' | '{}';
export type Folding = Partial<Record<FoldingMarker | '<>', number | null>> & Record<FoldingMarker, number | null>;

export default class StringProcessingProvider {
  private static foldingMarkers: FoldingMarker[] = ['()', '[]', '{}'];
  private static useXmlFolding = ['html', 'jsx', 'xml'];

  private document: TextDocument;

  public constructor(document: TextDocument) {
    this.document = document;
  }

  public getIndent(
    line: string,
    indentWidth: number = workspace.getConfiguration('editor').get('tabSize') || 4
  ): number {
    return (line.match(/^\s*/)?.pop() || '').length / indentWidth;
  }

  public getIndentRange(text: string): { min: number; max: number } {
    const lines = text.split(/\r?\n/);
    const indentWidth: number = workspace.getConfiguration('editor').get('tabSize') || 4;

    let min = Infinity;
    let max = 0;

    for (const line of lines) {
      if (this.isIndentIgnoreLine(line)) continue;
      const indent = this.getIndent(line, indentWidth);
      if (indent < min) min = indent;
      if (indent > max) max = indent;
    }

    return { min, max };
  }

  public getFolding(
    line: string,
    initial: Folding = { '()': null, '[]': null, '{}': null },
    validate = false
  ): Folding {
    const result: Folding = {
      '()': initial['()'],
      '[]': initial['[]'],
      '{}': initial['{}'],
      '<>': initial['<>'] || null,
    };
    const foldingStart = StringProcessingProvider.foldingMarkers.map((marker) => marker[0]);
    const foldingEnd = StringProcessingProvider.foldingMarkers.map((marker) => marker[1]);

    let foldingIndex: number = -1;
    for (const char of this.stripStrings(this.stripComments(line)).trim()) {
      if ((foldingIndex = foldingStart.indexOf(char)) >= 0) {
        const marker = (foldingStart[foldingIndex] + foldingEnd[foldingIndex]) as FoldingMarker;
        result[marker] = (result[marker] || 0) + 1;
      } else if ((foldingIndex = foldingEnd.indexOf(char)) >= 0) {
        const marker = (foldingStart[foldingIndex] + foldingEnd[foldingIndex]) as FoldingMarker;
        if (!validate || (result[marker] || 0) > 0) result[marker] = (result[marker] || 1) - 1;
      }
    }

    result['<>'] = this.getXmlFolding(line, result['<>'] || 0, validate);

    return result;
  }

  public hasFolding(folding: Folding): boolean {
    return !!(folding['()'] || folding['[]'] || folding['{}'] || folding['<>']);
  }

  public totalOpenFolding(folding: Folding): number {
    return (folding['()'] || 0) + (folding['[]'] || 0) + (folding['{}'] || 0);
  }

  public isList(blocks: Range[]): boolean {
    if (!blocks.length) return false;

    const first = this.document.getText(blocks[0]).trim();
    return Array.from(first).pop() === ',';
  }

  public isIndentIgnoreLine(line: string): boolean {
    const comment = commentRegex[this.document.languageId || 'default'] || commentRegex.default;
    return new RegExp(`^\\s*{\\s*(?:${comment}\\s*)*\\s*$`).test(line);
  }

  public isClosedBlock(block: string): boolean {
    const comment = commentRegex[this.document.languageId || 'default'] || commentRegex.default;
    return new RegExp(`(}|</[a-zA-Z0-9\-_]+>)(,|;)?\\s*(${comment}\\s*)*\\s*$`, 'g').test(block);
  }

  public isValidLine(line: string): boolean {
    const comment = commentRegex[this.document.languageId || 'default'] || commentRegex.default;
    const hasFolding = this.hasFolding(this.getFolding(line));
    return (
      !/^\s*$/.test(line) &&
      !/^\s*@/.test(line) &&
      !(/^\s*{/.test(line) && hasFolding) &&
      !new RegExp(`^\\s*${comment}\\s*$`).test(line)
    );
  }

  public getFirstValidLine(lines: string[], trim = true): string | null {
    for (const line of lines) if (this.isValidLine(line)) return trim ? line.trim() : line;
    return null;
  }

  public stripComments(text: string): string {
    return this.stripBlocksFromText(
      text,
      commentMarkers[this.document.languageId || 'default'] || commentMarkers.default
    );
  }

  public stripStrings(text: string): string {
    return this.stripBlocksFromText(
      text,
      stringMarkers[this.document.languageId || 'default'] || stringMarkers.default
    );
  }

  public stripDecorators(text: string): string {
    return text.replace(/^\s*@.*/g, '');
  }

  private stripBlocksFromText(text: string, blocks: { start: string; end: string }[]): string {
    let result = text;
    for (const { start, end } of blocks) {
      const regex = new RegExp(`${start}(?:${end === '\\n' ? '.' : '[\\s\\S]'}*?)(?:${end}|$)`);
      let strip: string;
      while ((strip = result.replace(regex, '')) !== result) result = strip;
    }

    return result;
  }

  private getXmlFolding(line: string, initial: number | null = null, validate = false): number {
    const stripped = this.stripComments(this.stripStrings(line));
    const open = stripped.match(/<[a-zA-Z0-9\-_=\s]+/g)?.length || 0;
    const close = stripped.match(/<\/[a-zA-Z0-9\-_=\s]+/g)?.length || 0;

    return (initial || 0) + (validate ? Math.max(open - close, 0) : open - close);
  }
}

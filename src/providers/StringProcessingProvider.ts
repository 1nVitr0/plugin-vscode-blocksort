import { Range, TextDocument, workspace } from 'vscode';
import { commentMarkers, commentRegex } from '../constants/comments';
import { stringMarkers } from '../constants/strings';
import ConfigurationProvider from './ConfigurationProvider';

export type FoldingMarkerDefault = '()' | '[]' | '{}' | '<>';
export type FoldingMarkerList<T extends string = string> = Record<
  T,
  { start: string; end: string; abortOnCurlyBrace?: boolean }
>;
export interface FoldingLevel {
  level: number;
  changed?: boolean;
  committed?: boolean;
  indent?: number;
}
export type Folding<T extends string = string> = { [marker in keyof FoldingMarkerList<T>]: FoldingLevel };

function initialFolding(): Folding {
  const foldingMarkers = ConfigurationProvider.getFoldingMarkers();
  return Object.keys(foldingMarkers).reduce<Folding>((r, key) => {
    r[key] = { level: 0 };
    return r;
  }, {});
}

export default class StringProcessingProvider {
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

  public getIndentRange(text: string, checkIndentIgnore = true): { min: number; max: number } {
    const lines = text.split(/\r?\n/);
    const indentWidth: number = workspace.getConfiguration('editor').get('tabSize') || 4;

    let min = Infinity;
    let max = 0;

    for (const line of lines) {
      if (checkIndentIgnore && this.isIndentIgnoreLine(line)) continue;
      const indent = this.getIndent(line, indentWidth);
      if (indent < min) min = indent;
      if (indent > max) max = indent;
    }

    return { min, max };
  }

  public getFolding(text: string, initial: Folding = initialFolding(), validate = false): Folding {
    const foldingMarkers = ConfigurationProvider.getFoldingMarkers();
    const result: Folding = { ...initial };

    const lines = text.split(/\r?\n/);
    let markerKeys = Object.keys(foldingMarkers);
    markerKeys.splice(markerKeys.indexOf('{}'), 1);
    markerKeys.push('{}'); // ensure '{}' is last to make abort on curly braces possible

    for (const line of lines) {
      const sanitized = this.stripStrings(this.stripComments(line)).trim();
      for (const key of Object.keys(foldingMarkers)) {
        const folding = result[key] || { level: 0 };
        const { start, end } = foldingMarkers[key];

        const open = sanitized.split(new RegExp(start)).length - 1;
        const close = sanitized.split(new RegExp(end)).length - 1;

        folding.level += open - close;
      }
    }
    return result;
  }

  public hasFolding(folding: Folding): boolean {
    for (const key of Object.keys(folding)) if (folding[key].level) return true;

    return false;
  }

  public totalOpenFolding(folding: Folding): number {
    return Object.keys(folding).reduce((total, key) => total + folding[key].level, 0);
  }

  public isList(blocks: Range[]): boolean {
    if (!blocks.length) return false;

    const first = this.document.getText(blocks[0]).trim();
    return Array.from(first).pop() === ',';
  }

  public isIndentIgnoreLine(line: string): boolean {
    const indentIgnoreMarkers = ConfigurationProvider.getIndentIgnoreMarkers();
    const comment = commentRegex[this.document.languageId || 'default'] || commentRegex.default;
    const indentIgnoreRegex = `^\\s*(?:${indentIgnoreMarkers.join('|')})(?:${comment}|\\s*)*$`;
    return new RegExp(indentIgnoreRegex).test(line);
  }

  public isCompleteBlock(block: string): boolean {
    const completeBlockMarkers = ConfigurationProvider.getCompleteBlockMarkers();
    const comment = commentRegex[this.document.languageId || 'default'] || commentRegex.default;
    const completeBlockRegex = `(?:${completeBlockMarkers.join('|')})(?:,|;)?(?:${comment}|\\s*)*(?:,|;)?$`;
    return new RegExp(completeBlockRegex, 'g').test(block);
  }

  public isIncompleteBlock(block: string): boolean {
    const comment = commentRegex[this.document.languageId || 'default'] || commentRegex.default;
    const incompleteBlockRegex = ConfigurationProvider.getIncompleteBlockRegex()
      .replace(/\$$/, `(?:${comment}|\\s*)*$`)
      .replace(/^\^/, `^(?:${comment}|\\s*)*`);
    return new RegExp(incompleteBlockRegex, 'g').test(block);
  }

  public isMultiBlockHeader(block: string): boolean {
    const comment = commentRegex[this.document.languageId || 'default'] || commentRegex.default;
    const blockHeaderRegex = ConfigurationProvider.getMultiBlockHeaderRegex()
      .replace(/\$$/, `(?:${comment}|\\s*)*$`)
      .replace(/^\^/, `^(?:${comment}|\\s*)*`);
    return new RegExp(blockHeaderRegex, 'g').test(block);
  }

  public isForceFirstBlock(block: string): boolean {
    const comment = commentRegex[this.document.languageId || 'default'] || commentRegex.default;
    const firstRegex = ConfigurationProvider.getForceBlockHeaderFirstRegex()
      .replace(/\$$/, `(?:${comment}|\\s*)*\\n`)
      .replace(/^\^/, `^(?:${comment}|\\s*)*`);
    return new RegExp(firstRegex, 'g').test(block);
  }

  public isForceLastBlock(block: string): boolean {
    const comment = commentRegex[this.document.languageId || 'default'] || commentRegex.default;
    const lastRegex = ConfigurationProvider.getForceBlockHeaderLastRegex()
      .replace(/\$$/, `(?:${comment}|\\s*)*\\n`)
      .replace(/^\^/, `^(?:${comment}|\\s*)*`);
    return new RegExp(lastRegex, 'g').test(block);
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
}

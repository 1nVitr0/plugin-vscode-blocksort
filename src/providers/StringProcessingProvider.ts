import { CancellationToken, Range, TextDocument, workspace } from "vscode";
import { commentMarkers, commentRegex } from "../constants/comments";
import { stringMarkers } from "../constants/strings";
import ConfigurationProvider from "./ConfigurationProvider";

export type FoldingMarkerDefault = "()" | "[]" | "{}" | "<>";
export type FoldingMarkerList<T extends string = string> = Record<
  T,
  { start: string; end: string; abortOnCurlyBrace?: boolean } | null
>;
export interface FoldingLevel {
  level: number;
  changed?: boolean;
  committed?: boolean;
  indent?: number;
}
export type Folding<T extends string = string> = { [marker in keyof FoldingMarkerList<T>]: FoldingLevel };

export interface LineMeta {
  line: number;
  indent: number;
  valid: boolean;
  folding: Folding;
  ignoreIndent: boolean;
  hasContent: boolean;
  multiBlockHeader: boolean;
  complete: boolean;
  incomplete: boolean;
  text?: string | null;
}

function initialFolding(document: TextDocument): Folding {
  const foldingMarkers = ConfigurationProvider.getFoldingMarkers(document);
  return Object.entries(foldingMarkers).reduce<Folding>((folding, [key, marker]) => {
    if (marker) folding[key] = { level: 0 };
    return folding;
  }, {});
}

export default class StringProcessingProvider {
  private document: TextDocument;

  public constructor(document: TextDocument) {
    this.document = document;
  }

  public getIndent(
    line: string | LineMeta,
    indentWidth: number = workspace.getConfiguration("editor").get("tabSize") || 4
  ): number {
    return typeof line == "string" ? (line.match(/^\s*/)?.pop() || "").length / indentWidth : line.indent;
  }

  public getIndentRange(
    text: string | LineMeta[],
    document: TextDocument,
    checkIndentIgnore = true,
    token?: CancellationToken
  ): { min: number; max: number } {
    const lines = typeof text == "string" ? text.split(/\r?\n/) : text;
    const indentWidth: number = workspace.getConfiguration("editor", document).get("tabSize") || 4;

    let min = Infinity;
    let max = 0;

    for (const line of lines) {
      if (token?.isCancellationRequested) return { min, max };
      if (checkIndentIgnore && this.isIndentIgnoreLine(line, document)) continue;
      const indent = this.getIndent(line, indentWidth);
      if (indent < min) min = indent;
      if (indent > max) max = indent;
    }

    return { min, max };
  }

  public getFolding(text: string, document: TextDocument, initial: Folding = initialFolding(document)): Folding {
    const foldingMarkers = ConfigurationProvider.getFoldingMarkers(document);
    const result: Folding = { ...initial };

    const lines = text.split(/\r?\n/);
    let markerKeys = Object.keys(foldingMarkers);
    markerKeys.splice(markerKeys.indexOf("{}"), 1);
    markerKeys.push("{}"); // ensure '{}' is last to make abort on curly braces possible

    for (const line of lines) {
      const sanitized = this.stripStrings(this.stripComments(line)).trim();
      for (const [key, marker] of Object.entries(foldingMarkers)) {
        if (!marker) continue;

        const folding = result[key] || { level: 0 };
        const { start, end } = marker;

        const open = sanitized.split(new RegExp(start)).length - 1;
        const close = sanitized.split(new RegExp(end)).length - 1;

        folding.level += open - close;
      }
    }
    return result;
  }

  public mergeFolding(...folding: Folding[]): Folding {
    const result: Folding = {};

    for (const f of folding) {
      for (const key of Object.keys(f)) {
        const folding = result[key] || { level: 0 };
        folding.level += f[key].level;
        result[key] = folding;
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
    return Array.from(first).pop() === ",";
  }

  public isIndentIgnoreLine(line: string | LineMeta, document: TextDocument): boolean {
    if (typeof line != "string") return line.ignoreIndent;

    const indentIgnoreMarkers = ConfigurationProvider.getIndentIgnoreMarkers(document);
    const comment = commentRegex[this.document.languageId || "default"] || commentRegex.default;
    const indentIgnoreRegex = `^\\s*(?:${indentIgnoreMarkers.join("|")})(?:${comment}|\\s*)*$`;
    return new RegExp(indentIgnoreRegex).test(line);
  }

  public isCompleteBlock(block: string, document: TextDocument): boolean {
    const completeBlockMarkers = ConfigurationProvider.getCompleteBlockMarkers(document);
    const comment = commentRegex[this.document.languageId || "default"] || commentRegex.default;
    const completeBlockRegex = `(?:${completeBlockMarkers.join("|")})(?:,|;)?(?:${comment}|\\s*)*(?:,|;)?$`;
    return new RegExp(completeBlockRegex, "g").test(block);
  }

  public isIncompleteBlock(block: string): boolean {
    const comment = commentRegex[this.document.languageId || "default"] || commentRegex.default;
    const incompleteBlockRegex = ConfigurationProvider.getIncompleteBlockRegex()
      .replace(/\$$/, `(?:${comment}|\\s*)*$`)
      .replace(/^\^/, `^(?:${comment}|\\s*)*`);
    return new RegExp(incompleteBlockRegex, "g").test(block);
  }

  public isMultiBlockHeader(block: string): boolean {
    const comment = commentRegex[this.document.languageId || "default"] || commentRegex.default;
    const blockHeaderRegex = ConfigurationProvider.getMultiBlockHeaderRegex()
      .replace(/\$$/, `(?:${comment}|\\s*)*$`)
      .replace(/^\^/, `^(?:${comment}|\\s*)*`);
    return new RegExp(blockHeaderRegex, "g").test(block);
  }

  public isForceFirstBlock(block: string): boolean {
    const comment = commentRegex[this.document.languageId || "default"] || commentRegex.default;
    const firstRegex = ConfigurationProvider.getForceBlockHeaderFirstRegex()
      .replace(/\$$/, `(?:${comment}|\\s*)*\\n`)
      .replace(/^\^/, `^(?:${comment}|\\s*)*`);
    return new RegExp(firstRegex, "g").test(block);
  }

  public isForceLastBlock(block: string): boolean {
    const comment = commentRegex[this.document.languageId || "default"] || commentRegex.default;
    const lastRegex = ConfigurationProvider.getForceBlockHeaderLastRegex()
      .replace(/\$$/, `(?:${comment}|\\s*)*\\n`)
      .replace(/^\^/, `^(?:${comment}|\\s*)*`);
    return new RegExp(lastRegex, "g").test(block);
  }

  public isValidLine(line: string | LineMeta, document: TextDocument): boolean {
    if (typeof line != "string") return line.valid;

    const comment = commentRegex[this.document.languageId || "default"] || commentRegex.default;
    const hasFolding = this.hasFolding(this.getFolding(line, document));
    return (
      !/^\s*$/.test(line) &&
      !/^\s*@/.test(line) &&
      !(/^\s*{/.test(line) && hasFolding) &&
      !new RegExp(`^\\s*${comment}\\s*$`).test(line)
    );
  }

  public getFirstValidLine(lines: string[], document: TextDocument, trim = true): string | null {
    for (const line of lines) if (this.isValidLine(line, document)) return trim ? line.trim() : line;
    return null;
  }

  public getBlockSeparator(line: string, currentSeparator?: string): string {
    if (typeof currentSeparator !== "string") return /[,\r\n]+$/g.exec(line)?.pop() || "";
    if (!currentSeparator) return "";

    const separator = /[,;\r\n]+$/g.exec(line)?.pop() || "";
    const index = currentSeparator.indexOf(separator);

    if (index < 0) return "";

    return currentSeparator.slice(index);
  }

  public stripComments(text: string): string {
    return this.stripBlocksFromText(
      text,
      commentMarkers[this.document.languageId || "default"] || commentMarkers.default
    );
  }

  public stripStrings(text: string): string {
    return this.stripBlocksFromText(
      text,
      stringMarkers[this.document.languageId || "default"] || stringMarkers.default
    );
  }

  public stripDecorators(text: string): string {
    return text.replace(/^\s*@.*/g, "");
  }

  private stripBlocksFromText(text: string, blocks: { start: string; end: string }[]): string {
    let result = text;
    for (const { start, end } of blocks) {
      const regex = new RegExp(`${start}(?:${end === "\\n" ? "." : "[\\s\\S]"}*?)(?:${end}|$)`);
      let strip: string;
      while ((strip = result.replace(regex, "")) !== result) result = strip;
    }

    return result;
  }
}

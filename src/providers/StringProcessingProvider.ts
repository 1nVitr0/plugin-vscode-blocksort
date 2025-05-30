import { CancellationToken, Range, TextDocument, workspace } from "vscode";
import { commentMarkers, commentRegex } from "../constants/comments";
import { stringMarkers } from "../constants/strings";
import ConfigurationProvider from "./ConfigurationProvider";
import { decoratorMarkers, decoratorRegex } from "../constants/decorators";

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

export interface TextBlockDefinition {
  start: string;
  end?: string;
  escape?: string;
}

export interface LineMeta {
  line: number;
  indent: number;
  valid: boolean;
  folding: Folding;
  ignoreIndent: boolean;
  hasContent: boolean;
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
    return typeof line === "string" ? (line.match(/^\s*/)?.pop() || "").length / indentWidth : line.indent;
  }

  public getIndentRange(
    text: string | LineMeta[],
    document: TextDocument,
    checkIndentIgnore = true,
    token?: CancellationToken
  ): { min: number; max: number } {
    const lines = typeof text === "string" ? text.split(/\r?\n/) : text;
    const indentWidth: number = workspace.getConfiguration("editor", document).get("tabSize") || 4;

    let min = Infinity;
    let max = 0;

    for (const [i, line] of lines.entries()) {
      const isBoundaryLine = i === 0 || i === lines.length - 1;

      if (token?.isCancellationRequested) return { min, max };
      if (checkIndentIgnore && !isBoundaryLine && this.isIndentIgnoreLine(line, document)) continue;
      const indent = this.getIndent(line, indentWidth);
      if (indent < min) min = indent;
      if (indent > max) max = indent;
    }

    return { min, max };
  }

  public getFolding(
    text: string,
    document: TextDocument,
    initial: Folding = initialFolding(document),
    isSanitized?: boolean
  ): Folding {
    const foldingMarkers = ConfigurationProvider.getFoldingMarkers(document);
    const result: Folding = { ...initial };

    const lines = text.split(/\r?\n/);
    let markerKeys = Object.keys(foldingMarkers);
    markerKeys.splice(markerKeys.indexOf("{}"), 1);
    markerKeys.push("{}"); // ensure '{}' is last to make abort on curly braces possible

    for (const line of lines) {
      const sanitized = isSanitized ? line : this.stripStrings(this.stripComments(line)).trim();
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
    for (const { level } of Object.values(folding)) if (level) return true;

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
    if (typeof line !== "string") return line.ignoreIndent || !line.hasContent;

    const indentIgnoreMarkers = ConfigurationProvider.getIndentIgnoreMarkers(document);
    const comment = commentRegex[this.document.languageId || "default"] || commentRegex.default;
    const indentIgnoreRegex = `^\\s*(?:${indentIgnoreMarkers.join("|")})(?:${comment}|\\s*)*$`;
    return new RegExp(indentIgnoreRegex).test(line);
  }

  public isCompleteBlock(block: string, document: TextDocument): boolean {
    const completeBlockMarkers = ConfigurationProvider.getCompleteBlockMarkers(document);
    const completeBlockRegex = `(?:${completeBlockMarkers.join("|")})\\s*(?:,|;)?$`;
    return new RegExp(completeBlockRegex, "g").test(block);
  }

  public isIncompleteBlock(block: string): boolean {
    const incompleteBlockRegex = this.extendLineAnchors(ConfigurationProvider.getIncompleteBlockRegex(this.document));
    return new RegExp(incompleteBlockRegex, "g").test(block);
  }

  public isMultiBlockHeader(block: string): boolean {
    const blockHeaderRegex = this.extendLineAnchors(ConfigurationProvider.getMultiBlockHeaderRegex(this.document));
    return new RegExp(blockHeaderRegex, "g").test(block);
  }

  public isForceFirstBlock(block: string): boolean {
    const firstRegex = this.extendLineAnchors(
      ConfigurationProvider.getForceBlockHeaderFirstRegex(this.document),
      false
    );
    return new RegExp(firstRegex, "g").test(block);
  }

  public isForceLastBlock(block: string): boolean {
    const lastRegex = this.extendLineAnchors(ConfigurationProvider.getForceBlockHeaderLastRegex(this.document), false);
    return new RegExp(lastRegex, "g").test(block);
  }

  public isValidLine(line: string | LineMeta, document: TextDocument, folding?: Folding): boolean {
    if (typeof line !== "string") return line.valid;

    const comment = commentRegex[this.document.languageId || "default"] || commentRegex.default;
    const decorator = decoratorRegex[this.document.languageId || "default"] || decoratorRegex.default;
    const hasFolding = this.hasFolding(folding ?? this.getFolding(line, document));
    return (
      !/^\s*$/.test(line) &&
      !(/^\s*{/.test(line) && hasFolding) &&
      !(decorator && new RegExp(`^\\s*${decorator}`).test(line)) &&
      !(comment && new RegExp(`^\\s*${comment}\\s*$`).test(line))
    );
  }

  public getFirstValidLine(lines: string[], document: TextDocument, trim = true): string | null {
    for (const line of lines) if (this.isValidLine(line, document)) return trim ? line.trim() : line;
    return null;
  }

  public getBlockSeparator(lines: string | string[], allowed: string = ",;", ignoreLast = true): string {
    if (!allowed) return "";

    const separatorRegex = new RegExp(`[${allowed}](?=[\\s\\r\\n]+)?$`, "g");
    const separators = (typeof lines === "string" ? [lines] : lines).map((line) => line.match(separatorRegex)?.pop());

    let separator = separators.shift();
    for (const sep of separators.slice(0, ignoreLast ? -1 : separators.length)) if (sep !== separator) return "";

    return separator || "";
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
    return this.stripBlocksFromText(
      text,
      decoratorMarkers[this.document.languageId || "default"] || decoratorMarkers.default
    );
  }

  private extendLineAnchors(regex: string, keepEndLine = true): string {
    const comment = commentRegex[this.document.languageId || "default"] || commentRegex.default;
    return regex
      .replace(/\$$/, `(?:${comment}|\\s*)*${keepEndLine ? "$" : "\\r?\\n"}`)
      .replace(/^\^/, `^(?:${comment}|\\s*)*`);
  }

  private stripBlocksFromText(text: string, blocks: TextBlockDefinition[]): string {
    let result = text;
    for (const { start, end, escape = "\\\\" } of blocks) {
      const startRegex = new RegExp(`(?:${escape})?${start}`, "g");
      const endRegex = new RegExp(end ? `(?:${escape})?${end}` : "\\r?\\n", "g");
      let startMatch: RegExpExecArray | null;
      let endMatch: RegExpExecArray | null;
      let innerResult = result;

      while ((startMatch = startRegex.exec(result))) {
        endMatch = endRegex.exec(result);
        while (endMatch && endMatch.index < startMatch.index) endMatch = endRegex.exec(result);
        if (endMatch)
          innerResult = result.slice(0, startMatch.index) + result.slice(endMatch.index + endMatch[0].length);
      }

      result = innerResult;
    }

    return result;
  }
}

import {
  CancellationToken,
  DocumentFormattingEditProvider,
  Position,
  ProviderResult,
  Range,
  TextDocument,
  TextEdit,
  TextLine,
  FormattingOptions,
  DocumentRangeFormattingEditProvider,
} from "vscode";
import { commentMarkers } from "../constants/comments";
import BlockSortProvider from "./BlockSortProvider";
import ConfigurationProvider from "./ConfigurationProvider";

type BlockSortOptions = {
  sortFunction: (a: string, b: string) => number;
  sortChildren: number;
};

export default class FormattingProvider implements DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider {
  public static blockSortMarker = "@blocksort";

  public static getBlockSortMarkers(document: TextDocument, range?: Range, token?: CancellationToken): TextLine[] {
    const markers: TextLine[] = [];
    const comments = commentMarkers[document.languageId] ?? commentMarkers.default;
    const markerPrefixes = comments.map((comment) => `${comment.start} ${FormattingProvider.blockSortMarker}`);

    for (let i = range?.start.line ?? 0; i < (range?.end.line ?? document.lineCount); i++) {
      if (token && token.isCancellationRequested) return markers;

      const line = document.lineAt(i);
      if (markerPrefixes.some((prefix) => line.text.trim().startsWith(prefix))) markers.push(line);
    }

    return markers;
  }

  public static getBlockSortMarkerOptions(document: TextDocument, position: Position): BlockSortOptions {
    const line = document.lineAt(position.line).text;
    const matches = line.match(/@blocksort ?(asc|desc)? ?(\d+|inf(?:inite)?)?/) ?? [];
    const [_, direction = "asc", depth = "0"] = matches;
    const naturalSorting = ConfigurationProvider.getEnableNaturalSorting();

    const sortFunction = naturalSorting
      ? direction === "asc"
        ? BlockSortProvider.sort.ascNatural
        : BlockSortProvider.sort.descNatural
      : direction === "asc"
      ? BlockSortProvider.sort.asc
      : BlockSortProvider.sort.desc;

    return { sortFunction, sortChildren: depth.includes("inf") ? Infinity : parseInt(depth, 10) };
  }

  public static getNextBlockPosition(document: TextDocument, position: Position): Position {
    let line = document.lineAt(position.line);
    const initialIndent = line.firstNonWhitespaceCharacterIndex;

    while (line.firstNonWhitespaceCharacterIndex <= initialIndent) {
      line = document.lineAt(line.lineNumber + 1);
    }

    return new Position(line.lineNumber, line.firstNonWhitespaceCharacterIndex);
  }

  public static getBlockSortEdit(
    document: TextDocument,
    position: Position | Range,
    options: BlockSortOptions
  ): TextEdit {
    const blockSort = new BlockSortProvider(document);
    const initialRange = "start" in position ? position : new Range(position, position);
    const range = blockSort.expandRange(initialRange);
    const blocks = blockSort.getBlocks(range);
    const sorted = blockSort.sortBlocks(blocks, options.sortFunction, options.sortChildren);

    return TextEdit.replace(range, sorted.join("\n"));
  }

  public static mapBlockSortHeaders<T>(
    document: TextDocument,
    headers: (TextLine | Position)[],
    callback: (position: Position, options: BlockSortOptions) => T
  ): T[] {
    return headers.map((line) => {
      const position = "range" in line ? line.range.start : line;
      const nextBlockPosition = FormattingProvider.getNextBlockPosition(document, position);
      const options = FormattingProvider.getBlockSortMarkerOptions(document, position);
      return callback(nextBlockPosition, options);
    });
  }

  public provideDocumentFormattingEdits(
    document: TextDocument,
    options?: FormattingOptions,
    token?: CancellationToken
  ): ProviderResult<TextEdit[]> {
    return this.provideDocumentRangeFormattingEdits(document, undefined, options, token);
  }

  public provideDocumentRangeFormattingEdits(
    document: TextDocument,
    range: Range | undefined,
    options?: FormattingOptions,
    token?: CancellationToken
  ): ProviderResult<TextEdit[]> {
    const markers = FormattingProvider.getBlockSortMarkers(document, range, token);
    return this.provideBlockMarkerFormattingEdits(document, ...markers);
  }

  public provideBlockMarkerFormattingEdits(document: TextDocument, ...positions: (Position | TextLine)[]): TextEdit[] {
    return FormattingProvider.mapBlockSortHeaders(
      document,
      positions,
      FormattingProvider.getBlockSortEdit.bind(this, document)
    );
  }
}

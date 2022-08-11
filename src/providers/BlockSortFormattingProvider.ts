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
  /**
   * Mutable array of previous edits.
   * Edits that are merged into the current edit are removed from this array.
   */
  edits?: TextEdit[];
};

export default class BlockSortFormattingProvider
  implements DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider
{
  public static blockSortMarker = "@blocksort";

  public static getBlockSortMarkers(document: TextDocument, range?: Range, token?: CancellationToken): TextLine[] {
    const markers: TextLine[] = [];
    const comments = commentMarkers[document.languageId] ?? commentMarkers.default;
    const markerPrefixes = comments.map((comment) => `${comment.start} ${BlockSortFormattingProvider.blockSortMarker}`);

    for (let i = range?.start.line ?? 0; i <= (range?.end.line ?? document.lineCount - 1); i++) {
      if (token?.isCancellationRequested) return markers;

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

  public static getNextBlockPosition(
    document: TextDocument,
    position: Position,
    token?: CancellationToken
  ): Position | null {
    let line = document.lineAt(position.line);
    const initialIndent = line.firstNonWhitespaceCharacterIndex;

    while (line.firstNonWhitespaceCharacterIndex <= initialIndent) {
      if (token?.isCancellationRequested) return null;
      if (line.lineNumber >= document.lineCount - 1) return null;
      line = document.lineAt(line.lineNumber + 1);
    }

    return new Position(line.lineNumber, line.firstNonWhitespaceCharacterIndex);
  }

  public static getBlockSortEdit(
    document: TextDocument,
    position: Position | Range,
    options: BlockSortOptions,
    token?: CancellationToken
  ): TextEdit {
    const blockSort = new BlockSortProvider(document);
    const initialRange = "start" in position ? position : new Range(position, position);
    const range = blockSort.trimRange(blockSort.expandRange(initialRange, token));
    const blocks = blockSort.getBlocks(range, token);
    const sorted = blockSort.sortBlocks(blocks, options.sortFunction, options.sortChildren, options.edits, token);

    return TextEdit.replace(range, sorted.join("\n"));
  }

  public static mapFilterBlockSortHeaders<T>(
    document: TextDocument,
    headers: (TextLine | Position)[],
    callback: (position: Position, options: BlockSortOptions, token?: CancellationToken) => T,
    edits?: TextEdit[],
    token?: CancellationToken
  ): T[] {
    const result = [];
    for (const line of headers) {
      if (token?.isCancellationRequested) return result;
      const position = "range" in line ? line.range.start : line;
      const nextBlockPosition = BlockSortFormattingProvider.getNextBlockPosition(document, position, token);
      const options = BlockSortFormattingProvider.getBlockSortMarkerOptions(document, position);
      if (edits) options.edits = edits;
      if (nextBlockPosition) result.push(callback(nextBlockPosition, options, token));
    }

    return result;
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
    const markers = BlockSortFormattingProvider.getBlockSortMarkers(document, range, token);
    return this.provideBlockMarkerFormattingEdits(document, markers, [], token);
  }

  public provideBlockMarkerFormattingEdits(
    document: TextDocument,
    positions: (Position | TextLine)[],
    edits?: TextEdit[],
    token?: CancellationToken
  ): TextEdit[] {
    return BlockSortFormattingProvider.mapFilterBlockSortHeaders(
      document,
      positions,
      BlockSortFormattingProvider.getBlockSortEdit.bind(this, document),
      edits,
      token
    );
  }
}

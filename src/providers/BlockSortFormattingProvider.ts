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
  Uri,
  TextDocumentContentChangeEvent,
} from "vscode";
import { commentMarkers } from "../constants/comments";
import { BlockSortOptions } from "../types/BlockSortOptions";
import BlockSortProvider from "./BlockSortProvider";
import ConfigurationProvider from "./ConfigurationProvider";
import AbstractDocumentProvider from "./AbstractDocumentProvider";
import { StringSortProvider } from "./StringSortProvider";

export interface BlockSortMarker {
  line: TextLine;
  position?: Position;
  options: BlockSortOptions;
  range?: Range;
}

export default class BlockSortFormattingProvider
  extends AbstractDocumentProvider
  implements DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider
{
  public static blockSortMarker = "@blocksort";

  private blockSortMarkers: Map<Uri, BlockSortMarker[]> = new Map();
  private blockSortProviders: Map<Uri, BlockSortProvider> = new Map();

  public static getBlockSortMarkerOptions(document: TextDocument, position: Position): BlockSortOptions {
    const line = document.lineAt(position.line).text;
    const matches = line.match(/@blocksort ?(asc|desc)? ?(\d+|inf(?:inite)?)?/) ?? [];
    const [_, direction = "asc", depth = "0"] = matches as [string, "asc" | "desc", string];
    const collator = ConfigurationProvider.getCollatorOptions();

    return {
      collator,
      direction,
      sortChildren: depth.includes("inf") ? Infinity : parseInt(depth, 10),
      expandSelection: true,
    };
  }

  private static getNextBlockPosition(document: TextDocument, position: Position): Position | undefined {
    let line = document.lineAt(position.line);
    const initialIndent = line.firstNonWhitespaceCharacterIndex;

    while (line.firstNonWhitespaceCharacterIndex <= initialIndent) {
      if (line.lineNumber >= document.lineCount - 1) return undefined;
      line = document.lineAt(line.lineNumber + 1);
    }

    return new Position(line.lineNumber, line.firstNonWhitespaceCharacterIndex);
  }

  public getBlockSortMarkers(document: TextDocument, token?: CancellationToken): BlockSortMarker[] {
    if (!this.isAttached(document)) this.attachDocument(document, token);
    if (this.blockSortMarkers.has(document.uri)) return this.blockSortMarkers.get(document.uri)!;

    const markers = this.getRangedBlockSortMarkers(
      document,
      document.validateRange(new Range(0, 0, Infinity, Infinity)),
      token
    );
    this.blockSortMarkers.set(document.uri, markers);
    return markers;
  }

  public getBlockSortEdit(
    document: TextDocument,
    selection: Position | Range,
    options: BlockSortOptions,
    token?: CancellationToken
  ): TextEdit {
    if (!this.isAttached(document)) this.attachDocument(document, token);
    const blockSort = this.blockSortProviders.get(document.uri)!;
    const sortProvider = new StringSortProvider(options.collator, options.direction);
    const range = this.expandSelection(document, selection, options, token);
    const blocks = blockSort.getBlocks(range, token);
    const sorted = blockSort.sortBlocks(
      blocks,
      sortProvider,
      options.sortChildren,
      options.skipParents,
      options.edits,
      token
    );

    return TextEdit.replace(range, sorted.join("\n"));
  }

  public getBlockSortMarkerAtRange(document: TextDocument, range: Range): BlockSortMarker | undefined {
    const markers = this.getBlockSortMarkers(document);

    return markers.find(
      ({ range: markerRange }) => markerRange && markerRange.intersection(range) !== undefined
    );
  }

  public preComputeLineMeta(document: TextDocument, ranges?: Range[], token?: CancellationToken) {
    if (!this.isAttached(document)) this.attachDocument(document);
    const blockSort = this.blockSortProviders.get(document.uri)!;

    blockSort.computeLineMeta(ranges, true, token);
  }

  public expandSelection(
    document: TextDocument,
    selection: Position | Range,
    options: Pick<BlockSortOptions, "expandSelection">,
    token?: CancellationToken
  ): Range {
    if (!this.isAttached(document)) this.attachDocument(document, token);
    const blockSort = this.blockSortProviders.get(document.uri)!;
    const initialRange = "start" in selection ? selection : new Range(selection, selection);

    if (options.expandSelection === false) return initialRange;

    return blockSort.trimRange(blockSort.expandRange(initialRange, options.expandSelection!, token));
  }

  public provideDocumentFormattingEdits(
    document: TextDocument,
    options?: FormattingOptions,
    token?: CancellationToken
  ): ProviderResult<TextEdit[]> {
    return this.provideDocumentRangeFormattingEdits(document, undefined, options, token);
  }

  public enableDocumentFormattingEdits(
    document: TextDocument,
    options?: FormattingOptions,
    token?: CancellationToken
  ): ProviderResult<TextEdit[]> {
    return this.provideDocumentFormattingEdits(document, options, token);
  }

  public provideDocumentRangeFormattingEdits(
    document: TextDocument,
    range: Range | undefined,
    options?: FormattingOptions,
    token?: CancellationToken
  ): ProviderResult<TextEdit[]> {
    const markers = this.getBlockSortMarkers(document, token).filter(
      ({ position }) => position && range?.contains(position)
    );
    return this.provideBlockMarkerFormattingEdits(document, markers, [], token);
  }

  public provideBlockMarkerFormattingEdits(
    document: TextDocument,
    markers: BlockSortMarker[],
    edits?: TextEdit[],
    token?: CancellationToken
  ): TextEdit[] {
    return markers
      .filter(({ position }) => !!position)
      .map((marker) => {
        const options = { ...marker.options, edits };
        return this.getBlockSortEdit(document, marker.position!, options, token);
      });
  }

  public attachDocument(document: TextDocument, token?: CancellationToken) {
    this.blockSortProviders.set(document.uri, new BlockSortProvider(document));
    super.attachDocument(document, token);
  }

  public disposeDocument(document: TextDocument) {
    this.blockSortMarkers.delete(document.uri);
    this.blockSortProviders.delete(document.uri);
    super.disposeDocument(document);
  }

  protected updateDocument(
    document: TextDocument,
    token: CancellationToken,
    ...changes: TextDocumentContentChangeEvent[]
  ) {
    const markers = this.blockSortMarkers.get(document.uri) ?? this.getBlockSortMarkers(document, token);

    if (!this.blockSortMarkers.has(document.uri)) {
      this.blockSortMarkers.set(document.uri, markers);
      return markers;
    } else if (changes.length === 0) {
      return markers;
    }

    let lineOffset = 0;
    for (const change of changes.sort((a, b) => a.range.start.compareTo(b.range.start))) {
      if (token.isCancellationRequested) return markers;
      const { range, text } = change;
      const { start, end } = range;
      const lineCountBefore = end.line - start.line + 1;
      const lines = text.split("\n");

      // If line count changes, update all markers after the change
      const lineCountChange = lines.length - lineCountBefore;
      if (lineCountChange) {
        for (let i = 0; i < markers.length; i++) {
          if (markers[i].line.range.start.isAfter(end))
            markers[i].line = document.lineAt(markers[i].line.lineNumber + lineCountChange);
          if (markers[i].position?.isAfter(end)) {
            markers[i].position = BlockSortFormattingProvider.getNextBlockPosition(
              document,
              markers[i].line.range.start
            );
          }
        }
      }

      // Delete and recreate all markers inside the changed range
      for (let i = markers.length - 1; i >= 0; i--) if (range.intersection(markers[i].line.range)) markers.splice(i, 1);

      markers.push(
        ...this.getRangedBlockSortMarkers(
          document,
          range.with(start.translate(lineOffset), end.translate(lineCountChange)),
          token
        )
      );

      lineOffset += lineCountChange;
    }

    markers.sort((a, b) => a.line.range.start.compareTo(b.line.range.start));
    this.blockSortMarkers.set(document.uri, markers);
  }

  private getRangedBlockSortMarkers(
    document: TextDocument,
    range: Range,
    token?: CancellationToken
  ): BlockSortMarker[] {
    const markers: TextLine[] = [];
    const comments = commentMarkers[document.languageId] ?? commentMarkers.default;
    const escapedBlockSortMarker = this.escapeRegExp(BlockSortFormattingProvider.blockSortMarker);
    const markerPrefixes = comments.map((comment) => new RegExp(`^${comment.start} ${escapedBlockSortMarker}`));

    for (let i = range.start.line; i <= range.end.line; i++) {
      if (token?.isCancellationRequested) return [];

      const line = document.lineAt(i);
      if (markerPrefixes.some((prefix) => prefix.test(line.text.trim()))) markers.push(line);
    }

    const expandRange = this.expandSelection.bind(this, document);
    const result = markers.map((line) => ({
      line,
      position: BlockSortFormattingProvider.getNextBlockPosition(document, line.range.start),
      options: BlockSortFormattingProvider.getBlockSortMarkerOptions(document, line.range.start),
      get range() {
        return this.position && expandRange(this.position, this.options);
      },
    }));

    return result;
  }

  private escapeRegExp(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }
}

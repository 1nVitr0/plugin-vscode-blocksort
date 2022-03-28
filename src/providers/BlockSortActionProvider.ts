import {
  CancellationToken,
  CodeAction,
  CodeActionContext,
  CodeActionKind,
  CodeActionProvider,
  CodeLens,
  CodeLensProvider,
  Disposable,
  Event,
  Position,
  ProviderResult,
  Range,
  Selection,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
  TextEdit,
  Uri,
  workspace,
  WorkspaceEdit,
} from "vscode";
import BlockSortProvider from "./BlockSortProvider";
import BlockSortFormattingProvider from "./BlockSortFormattingProvider";

interface CodeActionWithEditBuilder extends CodeAction {
  uri: Uri;
  editBuilder: () => TextEdit[];
}

// @ts-ignore We need to override this to create custom CodeAction kinds
export class BlockSortCodeActionKind extends CodeActionKind {
  public static readonly identifier = "blocksort";

  /* eslint-disable @typescript-eslint/naming-convention */
  public static readonly SourceFixAll = new BlockSortCodeActionKind(CodeActionKind.SourceFixAll);
  public static readonly QuickFix = new BlockSortCodeActionKind(CodeActionKind.QuickFix);
  public static readonly Refactor = new BlockSortCodeActionKind(CodeActionKind.Refactor);
  public static readonly RefactorExtract = new BlockSortCodeActionKind(CodeActionKind.RefactorExtract);
  public static readonly RefactorInline = new BlockSortCodeActionKind(CodeActionKind.RefactorInline);
  public static readonly RefactorRewrite = new BlockSortCodeActionKind(CodeActionKind.RefactorRewrite);
  public static readonly Source = new BlockSortCodeActionKind(CodeActionKind.Source);
  public static readonly SourceOrganizeImports = new BlockSortCodeActionKind(CodeActionKind.SourceOrganizeImports);

  public constructor(kind: CodeActionKind, ...specifiers: string[]) {
    super(`${kind.value}.${[BlockSortCodeActionKind.identifier, ...specifiers].join(".")}`);
  }
}

export default class BlockSortActionProvider
  implements CodeLensProvider, CodeActionProvider<CodeActionWithEditBuilder>, Disposable
{
  public onDidChangeCodeLenses?: Event<void> | undefined;

  private blockSortMarkers: Map<Uri, Position[]> = new Map();
  private blockSortProviders: Map<Uri, BlockSortProvider> = new Map();
  private documentListeners: Map<Uri, Disposable[]> = new Map();

  public constructor(private BlockSortFormattingProvider: BlockSortFormattingProvider) {}

  public provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
    if (!this.documentListeners.has(document.uri)) this.attachDocument(document, token);

    if (token.isCancellationRequested) return [];

    const codeLenses: CodeLens[] = [];
    const markers = this.blockSortMarkers.get(document.uri);
    if (markers && markers.length > 0) {
      markers.forEach((position) => {
        const range = this.getBlockMarkerRange(document, position, token);
        const options = BlockSortFormattingProvider.getBlockSortMarkerOptions(document, position);
        if (range) {
          codeLenses.push(
            new CodeLens(range, {
              tooltip: "Apply blocksort action",
              title: "Sort block",
              command: "blocksort._sortBlocks",
              arguments: [range, options.sortFunction, options.sortChildren],
            })
          );
        }
      });
    }
    return codeLenses;
  }

  public provideCodeActions(
    document: TextDocument,
    range: Range | Selection | undefined,
    context: CodeActionContext | undefined,
    token: CancellationToken
  ): CodeActionWithEditBuilder[] {
    if (!this.documentListeners.has(document.uri)) this.attachDocument(document, token);
    const markers = this.blockSortMarkers.get(document.uri);

    if (!markers) return [];
    const filteredMarkers: Position[] = [];

    for (const marker of markers) {
      const markerRange = this.getBlockMarkerRange(document, marker, token);

      if (!range || (markerRange && range.contains(markerRange) && !markerRange.isEqual(range))) {
        filteredMarkers.push(marker);
      } else if (markerRange?.contains(range)) {
        if (context?.only?.contains(CodeActionKind.SourceFixAll)) return [];
        return [
          {
            title: "Sort Block",
            kind: BlockSortCodeActionKind.QuickFix,
            uri: document.uri,
            editBuilder: () => this.BlockSortFormattingProvider.provideBlockMarkerFormattingEdits(document, [marker], token),
          },
        ];
      } else if (markerRange?.start.isAfter(range.end)) {
        // Abort if marker is after range
        break;
      }
    }

    if (!filteredMarkers.length) return [];

    return [
      {
        title: "Sort all annotated Blocks",
        kind: BlockSortCodeActionKind.SourceFixAll,
        uri: document.uri,
        editBuilder: () =>
          filteredMarkers.reduce<TextEdit[]>((edits, marker) => {
            const options = BlockSortFormattingProvider.getBlockSortMarkerOptions(document, marker);
            return [...edits, ...this.BlockSortFormattingProvider.provideBlockMarkerFormattingEdits(document, [marker], token)];
          }, []),
      },
    ];
  }

  public resolveCodeAction(codeAction: CodeActionWithEditBuilder, token: CancellationToken): CodeActionWithEditBuilder {
    const edit = new WorkspaceEdit();
    edit.set(codeAction.uri, codeAction.editBuilder());
    return { ...codeAction, edit };
  }

  public attachDocument(document: TextDocument, token: CancellationToken) {
    const disposable = [
      workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) =>
        this.updateBlockSortMarkers(e.document, token, ...e.contentChanges)
      ),
      workspace.onDidCloseTextDocument((e: TextDocument) => {
        if (e.uri === document.uri) this.disposeDocument(e);
      }),
      token.onCancellationRequested(() => this.disposeDocument(document)),
    ];

    if (this.documentListeners.has(document.uri)) this.documentListeners.get(document.uri)?.push(...disposable);
    else this.documentListeners.set(document.uri, disposable);

    this.blockSortProviders.set(document.uri, new BlockSortProvider(document));

    // Update markers once on load
    this.updateBlockSortMarkers(document, token);
  }

  public disposeDocument(document: TextDocument) {
    this.blockSortMarkers.delete(document.uri);
    this.blockSortProviders.delete(document.uri);
    if (this.documentListeners.has(document.uri)) {
      const disposables = this.documentListeners.get(document.uri)!;
      for (const disposable of disposables) disposable.dispose();
      this.documentListeners.delete(document.uri);
    }
  }

  public dispose() {
    for (const [uri, disposables] of this.documentListeners) for (const disposable of disposables) disposable.dispose();

    this.documentListeners.clear();
  }

  private getBlockMarkerRange(document: TextDocument, position: Position, token?: CancellationToken): Range | undefined {
    const blockSortProvider = this.blockSortProviders.get(document.uri);
    const blockPosition = BlockSortFormattingProvider.getNextBlockPosition(document, position, token);
    return blockPosition ? blockSortProvider?.expandRange(new Selection(blockPosition, blockPosition), 0, token) : undefined;
  }

  private updateBlockSortMarkers(
    document: TextDocument,
    token: CancellationToken,
    ...changes: TextDocumentContentChangeEvent[]
  ): Position[] {
    const markers = this.blockSortMarkers.get(document.uri) ?? [];

    if (changes.length === 0) {
      if (markers.length) return markers;

      markers.push(
        ...BlockSortFormattingProvider.getBlockSortMarkers(document, undefined, token).map(({ range: { start } }) => start)
      );
      this.blockSortMarkers.set(document.uri, markers);
      return markers;
    }

    for (const change of changes) {
      if (token.isCancellationRequested) return markers;
      const { range, text } = change;
      const lineCountBefore = range.end.line - range.start.line + 1;
      const lines = text.split("\n");

      // If line count changes, update all markers after the change
      if (lineCountBefore !== lines.length) {
        const lineCountChange = lines.length - lineCountBefore;
        for (let i = 0; i < markers.length; i++)
          if (markers[i].isAfter(range.end)) markers[i] = markers[i].translate(lineCountChange, 0);
      }

      // Delete and recreate all markers inside the changed range
      for (let i = markers.length - 1; i >= 0; i--) if (range.contains(markers[i])) markers.splice(i, 1);

      markers.push(
        ...BlockSortFormattingProvider.getBlockSortMarkers(document, range, token).map(({ range: { start } }) => start)
      );
    }

    markers.sort((a, b) => a.compareTo(b));
    this.blockSortMarkers.set(document.uri, markers);
    return markers;
  }
}

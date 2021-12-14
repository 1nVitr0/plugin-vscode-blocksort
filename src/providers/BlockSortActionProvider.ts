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
import FormattingProvider from "./FormattingProvider";

interface CodeActionWithEditBuilder extends CodeAction {
  uri: Uri;
  editBuilder: () => TextEdit[];
}

export default class BlockSortActionProvider
  implements CodeLensProvider, CodeActionProvider<CodeActionWithEditBuilder>, Disposable
{
  // @ts-ignore Documentation for this is 💩. The `kind` is what can be used in `codeActionsOnSave`
  public static BlocksortFixAllKind: CodeActionKind = new CodeActionKind("source.fixAll.blocksort");
  public onDidChangeCodeLenses?: Event<void> | undefined;

  private blockSortMarkers: Map<Uri, Position[]> = new Map();
  private blockSortProviders: Map<Uri, BlockSortProvider> = new Map();
  private documentListeners: Map<Uri, Disposable[]> = new Map();

  public constructor(private formattingProvider: FormattingProvider) {}

  public provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
    if (!this.documentListeners.has(document.uri)) this.attachDocument(document, token);

    if (token.isCancellationRequested) return [];

    const codeLenses: CodeLens[] = [];
    const blockSortProvider = this.blockSortProviders.get(document.uri);
    const markers = this.blockSortMarkers.get(document.uri);
    if (blockSortProvider && markers && markers.length > 0) {
      markers.forEach((position) => {
        const blockPosition = FormattingProvider.getNextBlockPosition(document, position);
        const range = blockSortProvider.expandRange(new Selection(blockPosition, blockPosition));
        const options = FormattingProvider.getBlockSortMarkerOptions(document, position);
        codeLenses.push(
          new CodeLens(range, {
            tooltip: "Apply blocksort action",
            title: "Sort block",
            command: "blocksort._sortBlocks",
            arguments: [range, options.sortFunction, options.sortChildren],
          })
        );
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
    const filteredMarkers = range ? markers.filter((position) => range.contains(position)) : markers;

    return filteredMarkers.map((marker) => ({
      title: "Sort block",
      range: new Range(marker, marker),
      kind: BlockSortActionProvider.BlocksortFixAllKind,
      uri: document.uri,
      editBuilder: () => this.formattingProvider.provideBlockMarkerFormattingEdits(document, marker),
    }));
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
        if (e.uri == document.uri) this.disposeDocument(e);
      }),
      token.onCancellationRequested(() => this.disposeDocument(document)),
    ];

    if (this.documentListeners.has(document.uri)) {
      this.documentListeners.get(document.uri)?.push(...disposable);
    } else {
      this.documentListeners.set(document.uri, disposable);
    }

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
    for (const [uri, disposables] of this.documentListeners) {
      for (const disposable of disposables) {
        disposable.dispose();
      }
    }
    this.documentListeners.clear();
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
        ...FormattingProvider.getBlockSortMarkers(document, undefined, token).map(({ range: { start } }) => start)
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
        for (let i = 0; i < markers.length; i++) {
          if (markers[i].isAfter(range.end)) markers[i] = markers[i].translate(lineCountChange, 0);
        }
      }

      // Delete and recreate all markers inside the changed range
      for (let i = markers.length - 1; i >= 0; i--) {
        if (range.contains(markers[i])) markers.splice(i, 1);
      }

      markers.push(
        ...FormattingProvider.getBlockSortMarkers(document, range, token).map(({ range: { start } }) => start)
      );
    }

    this.blockSortMarkers.set(document.uri, markers);
    return markers;
  }
}

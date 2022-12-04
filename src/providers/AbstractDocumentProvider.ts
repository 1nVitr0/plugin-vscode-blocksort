import {
  CancellationToken,
  Disposable,
  Position,
  TextDocument,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
  Uri,
  workspace,
} from "vscode";

export default abstract class AbstractDocumentProvider {
  private documentListeners: Map<Uri, Disposable[]> = new Map();

  public isAttached(document: TextDocument) {
    return this.documentListeners.has(document.uri);
  }

  public attachDocument(document: TextDocument, token?: CancellationToken) {
    const disposable = [
      workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) =>
        this.updateDocument(e.document, token, ...e.contentChanges)
      ),
      workspace.onDidCloseTextDocument((e: TextDocument) => {
        if (e.uri === document.uri) this.disposeDocument(e);
      }),
    ];

    if (token) disposable.push(token.onCancellationRequested(() => this.disposeDocument(document)));

    if (this.documentListeners.has(document.uri)) this.documentListeners.get(document.uri)?.push(...disposable);
    else this.documentListeners.set(document.uri, disposable);

    // Update markers once on load
    this.updateDocument(document, token);
  }

  public disposeDocument(document: TextDocument) {
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

  protected abstract updateDocument(
    document: TextDocument,
    token?: CancellationToken,
    ...changes: TextDocumentContentChangeEvent[]
  ): void;
}

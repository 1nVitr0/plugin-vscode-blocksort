import {
  CancellationToken,
  CodeAction,
  CodeActionContext,
  CodeActionKind,
  CodeActionProvider,
  CodeLens,
  CodeLensProvider,
  Event,
  ProviderResult,
  Range,
  Selection,
  TextDocument,
  TextEdit,
  Uri,
  WorkspaceEdit,
} from "vscode";
import BlockSortFormattingProvider, { BlockSortMarker } from "./BlockSortFormattingProvider";

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
  implements CodeLensProvider, CodeActionProvider<CodeActionWithEditBuilder>
{
  public onDidChangeCodeLenses?: Event<void> | undefined;

  public constructor(private blockSortFormattingProvider: BlockSortFormattingProvider) {}

  public provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
    if (token.isCancellationRequested) return [];

    const codeLenses: CodeLens[] = [];
    const markers = this.blockSortFormattingProvider.getBlockSortMarkers(document, token);

    for (const marker of markers) {
      const { position } = marker;
      if (!position) continue;

      const codeLens = new CodeLens(new Range(position, position));
      (codeLens as any).document = document;
      codeLenses.push(codeLens);
    }

    return codeLenses;
  }

  public async resolveCodeLens(codeLens: CodeLens, token: CancellationToken): Promise<CodeLens> {
    const { document } = codeLens as unknown as CodeLens & { document?: TextDocument };
    if (!document) return codeLens;

    const { range, options } =
      this.blockSortFormattingProvider.getBlockSortMarkerAtRange(document, codeLens.range) ?? {};

    if (!range || !options) return codeLens;

    codeLens.command = {
      tooltip: "Apply blocksort action",
      title: "Sort block",
      command: "blocksort._sortBlocks",
      arguments: [range, options],
    };
    return codeLens;
  }

  public provideCodeActions(
    document: TextDocument,
    range: Range | Selection | undefined,
    context: CodeActionContext | undefined,
    token: CancellationToken
  ): CodeActionWithEditBuilder[] {
    const markers = this.blockSortFormattingProvider.getBlockSortMarkers(document, token);

    if (markers.length === 0) return [];
    const filteredMarkers: Required<BlockSortMarker>[] = [];

    let before: Required<BlockSortMarker> | null = null;
    for (const marker of markers) {
      const { position: markerPosition } = marker;

      if (!markerPosition) continue;

      if (!range || range.contains(markerPosition)) {
        filteredMarkers.push(marker as Required<BlockSortMarker>);
      } else if (markerPosition?.isBefore(range.start)) {
        // Will hold the last marker before the range
        before = marker as Required<BlockSortMarker>;
      } else if (markerPosition?.isAfter(range.end)) {
        // Abort if marker is after range
        break;
      }
    }

    // Calling `marker.range` is expensive, so we only do it if we need to
    if (before && filteredMarkers.indexOf(before) < 0) {
      const markerRange = before.range;
      if (range?.contains(markerRange)) filteredMarkers.push(before);
    }

    const result: CodeActionWithEditBuilder[] = [];

    if (!context?.only || context.only.contains(CodeActionKind.QuickFix))
      result.push(this.buildQuickFixCodeAction(filteredMarkers, document, range, token));
    if (!context?.only || context.only.contains(BlockSortCodeActionKind.SourceFixAll))
      result.push(this.buildFixAllCodeAction(filteredMarkers, document, range, token));

    return result;
  }

  public resolveCodeAction(codeAction: CodeActionWithEditBuilder, token: CancellationToken): CodeActionWithEditBuilder {
    const edit = new WorkspaceEdit();
    edit.set(codeAction.uri, codeAction.editBuilder());
    return { ...codeAction, edit };
  }

  private buildQuickFixCodeAction(
    markers: Required<BlockSortMarker>[],
    document: TextDocument,
    range?: Range,
    token?: CancellationToken
  ): CodeActionWithEditBuilder {
    return {
      title: "Sort Block",
      kind: BlockSortCodeActionKind.QuickFix,
      uri: document.uri,
      editBuilder: () => {
        this.blockSortFormattingProvider.preComputeLineMeta(document, range && [range], token);
        return this.blockSortFormattingProvider.provideBlockMarkerFormattingEdits(document, markers, [], token);
      },
    };
  }

  private buildFixAllCodeAction(
    markers: Required<BlockSortMarker>[],
    document: TextDocument,
    range?: Range,
    token?: CancellationToken
  ): CodeActionWithEditBuilder {
    return {
      title: "Sort all annotated Blocks",
      kind: BlockSortCodeActionKind.SourceFixAll,
      uri: document.uri,
      editBuilder: () => {
        this.blockSortFormattingProvider.preComputeLineMeta(document, range && [range], token);
        return markers
          .sort((a, b) => b.position.character - a.position.character)
          .reduce<TextEdit[]>((edits, marker) => {
            const newEdits = this.blockSortFormattingProvider.provideBlockMarkerFormattingEdits(
              document,
              [marker],
              edits,
              token
            );
            return [...edits, ...newEdits];
          }, []);
      },
    };
  }
}

import { Disposable, languages } from "vscode";
import BlockSortActionProvider from "../providers/BlockSortActionProvider";
import BlockSortFormattingProvider from "../providers/BlockSortFormattingProvider";
import ConfigurationProvider from "../providers/ConfigurationProvider";
import { DocumentSelector } from "vscode";

function getDocumentSelector(selector: DocumentSelector | true): DocumentSelector {
  return selector === true ? "*" : selector;
}

export default function contributeFormattingActions(formattingProvider: BlockSortFormattingProvider) {
  const codeActionsProvider = new BlockSortActionProvider(formattingProvider);

  const enableDocumentFormatting = ConfigurationProvider.getEnableDocumentFormatting();
  const enableRangeFormatting = ConfigurationProvider.getEnableRangeFormatting();
  const enableCodeActions = ConfigurationProvider.getEnableCodeActions();
  const enableCodeLens = ConfigurationProvider.getEnableCodeLens();

  const disposables: Disposable[] = [];
  if (enableDocumentFormatting) {
    disposables.push(
      languages.registerDocumentFormattingEditProvider(
        getDocumentSelector(enableDocumentFormatting),
        formattingProvider
      )
    );
  }
  if (enableRangeFormatting) {
    disposables.push(
      languages.registerDocumentFormattingEditProvider(getDocumentSelector(enableRangeFormatting), formattingProvider)
    );
  }
  if (enableCodeActions) {
    languages.registerCodeActionsProvider(getDocumentSelector(enableCodeActions), codeActionsProvider);
  }
  if (enableCodeLens) {
    disposables.push(languages.registerCodeLensProvider(getDocumentSelector(enableCodeLens), codeActionsProvider));
    if (!enableCodeActions) {
      // Override enableCodeActions if enableCodeLens is enabled
      disposables.push(languages.registerCodeActionsProvider(getDocumentSelector(enableCodeLens), codeActionsProvider));
    }
  }

  return disposables;
}

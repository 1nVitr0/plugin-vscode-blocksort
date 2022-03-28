import { languages } from "vscode";
import BlockSortActionProvider from "../providers/BlockSortActionProvider";
import BlockSortFormattingProvider from "../providers/BlockSortFormattingProvider";
import ConfigurationProvider from "../providers/ConfigurationProvider";

export default function contributeFormattingActions() {
  const formattingProvider = new BlockSortFormattingProvider();
  const codeActionsProvider = new BlockSortActionProvider(formattingProvider);

  const disposables = [
    languages.registerDocumentFormattingEditProvider("*", formattingProvider),
    languages.registerDocumentRangeFormattingEditProvider("*", formattingProvider),
    languages.registerCodeActionsProvider("*", codeActionsProvider),
  ];
  if (ConfigurationProvider.getEnableCodeLens()) 
    disposables.push(languages.registerCodeLensProvider("*", codeActionsProvider));
  

  return disposables;
}

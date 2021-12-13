import { languages } from "vscode";
import BlockSortActionProvider from "../providers/BlockSortActionProvider";
import FormattingProvider from "../providers/FormattingProvider";

export default function contributeFormattingActions() {
  const formattingProvider = new FormattingProvider();
  const codeActionsProvider = new BlockSortActionProvider(formattingProvider);
  return [
    languages.registerDocumentFormattingEditProvider("*", formattingProvider),
    languages.registerDocumentRangeFormattingEditProvider("*", formattingProvider),
    languages.registerCodeLensProvider("*", codeActionsProvider),
    languages.registerCodeActionsProvider("*", codeActionsProvider),
  ];
}

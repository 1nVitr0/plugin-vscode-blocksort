import { ExtensionContext, workspace } from "vscode";
import contributeFormattingActions from "./contribute/formattingActions";
import contributeCommands from "./contribute/commands";
import ConfigurationProvider from "./providers/ConfigurationProvider";
import BlockSortFormattingProvider from "./providers/BlockSortFormattingProvider";

export function activate(context: ExtensionContext) {
  const formattingProvider = new BlockSortFormattingProvider();
  context.subscriptions.push(formattingProvider);
  context.subscriptions.push(
    ...contributeCommands(formattingProvider),
    ...contributeFormattingActions(formattingProvider)
  );
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((change) => {
      for (const key of ConfigurationProvider.invalidatingConfigurationKeys) {
        if (change.affectsConfiguration(`blocksort.${key}`)) {
          deactivate(context);
          activate(context);
          break;
        } else {
          ConfigurationProvider.onConfigurationChanged();
        }
      }
    })
  );
}

function deactivate(context: ExtensionContext) {
  context.subscriptions.forEach((subscription) => subscription.dispose());
}

import { ConfigurationChangeEvent, ExtensionContext, workspace } from "vscode";
import contributeFormattingActions from "./contribute/formattingActions";
import contributeCommands from "./contribute/commands";
import ConfigurationProvider from "./providers/ConfigurationProvider";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(...contributeCommands(), ...contributeFormattingActions());
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((change) => {
      for (const key of ConfigurationProvider.invalidatingConfigurationKeys) {
        if (change.affectsConfiguration(`blocksort.${key}`)) {
          deactivate(context);
          activate(context);
          break;
        }
      }
    })
  );
}

function deactivate(context: ExtensionContext) {
  context.subscriptions.forEach((subscription) => subscription.dispose());
}

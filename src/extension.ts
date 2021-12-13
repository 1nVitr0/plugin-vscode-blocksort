import { ExtensionContext } from "vscode";
import contributeFormattingActions from "./contribute/formattingActions";
import contributeCommands from "./contribute/commands";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(...contributeCommands(), ...contributeFormattingActions());
}

import { commands, ExtensionContext } from 'vscode';
import contributeCommands from './contribute/commands';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(...contributeCommands());
}

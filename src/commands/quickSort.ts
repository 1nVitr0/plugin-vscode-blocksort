import { commands, window } from "vscode";
import ConfigurationProvider from "../providers/ConfigurationProvider";

export async function quickSort() {
  const options = ConfigurationProvider.getQuickSortCommands();
  const { command, args = [] } = (await window.showQuickPick(options)) ?? {};

  if (command) commands.executeCommand(command, ...args);
}

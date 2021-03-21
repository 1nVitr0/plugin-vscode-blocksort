import { commands } from 'vscode';
import { blockSortAsc, blockSortDesc } from '../commands/blockSort';

export default function contributeCommands() {
  return [
    commands.registerTextEditorCommand('blocksort.sortBlocksAsc', blockSortAsc),
    commands.registerTextEditorCommand('blocksort.sortBlocksDesc', blockSortDesc),
  ];
}

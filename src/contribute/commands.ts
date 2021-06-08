import { commands } from 'vscode';
import { blockSortAsc, blockSortDesc, blockSortMultilevelAsc, blockSortMultilevelDesc } from '../commands/blockSort';

export default function contributeCommands() {
  return [
    commands.registerTextEditorCommand('blocksort.sortBlocksAsc', blockSortAsc),
    commands.registerTextEditorCommand('blocksort.sortBlocksDesc', blockSortDesc),
    commands.registerTextEditorCommand('blocksort.sortBlocksMultilevelAsc', blockSortMultilevelAsc),
    commands.registerTextEditorCommand('blocksort.sortBlocksMultilevelDesc', blockSortMultilevelDesc),
  ];
}

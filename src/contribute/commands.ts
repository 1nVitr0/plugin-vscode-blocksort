import { commands } from 'vscode';
import { expandSelectionLocally, expandSelectionFull } from "../commands/expandSelection";
import {
  blockSort,
  blockSortAsc,
  blockSortDesc,
  blockSortMultilevelAsc,
  blockSortMultilevelDesc,
} from "../commands/blockSort";

export default function contributeCommands() {
  return [
    commands.registerTextEditorCommand("blocksort._sortBlocks", blockSort), // private command for direct access to blocksort
    commands.registerTextEditorCommand("blocksort.sortBlocksAsc", blockSortAsc),
    commands.registerTextEditorCommand("blocksort.sortBlocksDesc", blockSortDesc),
    commands.registerTextEditorCommand("blocksort.sortBlocksMultilevelAsc", blockSortMultilevelAsc),
    commands.registerTextEditorCommand("blocksort.sortBlocksMultilevelDesc", blockSortMultilevelDesc),
    commands.registerTextEditorCommand("blocksort.expandSelectionLocally", expandSelectionLocally),
    commands.registerTextEditorCommand("blocksort.expandSelectionFull", expandSelectionFull),
  ];
}

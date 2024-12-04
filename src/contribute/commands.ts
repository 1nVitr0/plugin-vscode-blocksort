import { commands } from "vscode";
import { expandSelectionLocally, expandSelectionFull } from "../commands/expandSelection";
import {
  blockSort,
  blockSortAsc,
  blockSortDesc,
  blockSortInnerBlocksAsc,
  blockSortInnerBlocksDesc,
  blockSortMultilevelAsc,
  blockSortMultilevelDesc,
} from "../commands/blockSort";
import BlockSortFormattingProvider from "../providers/BlockSortFormattingProvider";

export default function contributeCommands(b: BlockSortFormattingProvider) {
  return [
    commands.registerTextEditorCommand("blocksort._sortBlocks", blockSort.bind(null, b)), // private command for direct access to blocksort
    commands.registerTextEditorCommand("blocksort.sortBlocksAsc", blockSortAsc.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.sortBlocksDesc", blockSortDesc.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.sortBlocksMultilevelAsc", blockSortMultilevelAsc),
    commands.registerTextEditorCommand("blocksort.sortBlocksMultilevelDesc", blockSortMultilevelDesc),
    commands.registerTextEditorCommand("blocksort.sortInnerBlocksAsc", blockSortInnerBlocksAsc),
    commands.registerTextEditorCommand("blocksort.sortInnerBlocksDesc", blockSortInnerBlocksDesc),
    commands.registerTextEditorCommand("blocksort.expandSelectionLocally", expandSelectionLocally.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.expandSelectionFull", expandSelectionFull.bind(null, b)),
  ];
}

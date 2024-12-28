import { commands } from "vscode";
import {
  blockSort,
  blockSortAsc,
  blockSortDesc,
  blockSortInnerBlocksAsc,
  blockSortInnerBlocksDesc,
  blockSortMultilevelAsc,
  blockSortMultilevelDesc,
  blockSortShuffle,
} from "../commands/blockSort";
import { expandSelectionFull, expandSelectionLocally } from "../commands/expandSelection";
import BlockSortFormattingProvider from "../providers/BlockSortFormattingProvider";

export default function contributeCommands(b: BlockSortFormattingProvider) {
  return [
    commands.registerTextEditorCommand("blocksort._sortBlocks", blockSort.bind(null, b)), // private command for direct access to blocksort
    commands.registerTextEditorCommand("blocksort.sortBlocksAsc", blockSortAsc.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.sortBlocksDesc", blockSortDesc.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.sortBlocksShuffle", blockSortShuffle.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.sortBlocksMultilevelAsc", blockSortMultilevelAsc.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.sortBlocksMultilevelDesc", blockSortMultilevelDesc.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.sortBlocksMultilevelShuffle", blockSortShuffle.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.sortInnerBlocksAsc", blockSortInnerBlocksAsc.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.sortInnerBlocksDesc", blockSortInnerBlocksDesc.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.sortInnerBlocksShuffle", blockSortShuffle.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.expandSelectionLocally", expandSelectionLocally.bind(null, b)),
    commands.registerTextEditorCommand("blocksort.expandSelectionFull", expandSelectionFull.bind(null, b)),
  ];
}

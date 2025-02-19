import { DocumentSelector, QuickPickItem } from "vscode";
import { FoldingMarkerList } from "../providers/StringProcessingProvider";

/** @deprecated Will no longer be applied. Use collatorOptions instead  */
export interface NaturalSortOptions {
  padding: number;
  omitUuids: boolean;
  sortNegativeValues: boolean;
}

export interface BlockSortCollatorOptions extends Omit<Intl.CollatorOptions, "usage"> {
  locales?: string;
  customSortOrder?: string;
  customIgnoreCharacters?: string;
}

export interface SortCommandOptions extends QuickPickItem {
  command: string;
  args: any[];
}

export interface BlockSortConfiguration {
  defaultMultilevelDepth: number;
  defaultSkipParents: number;
  askForMultilevelDepth: boolean;
  askForSkipParents: boolean;
  indentIgnoreMarkers: string[];
  completeBlockMarkers: string[];
  foldingMarkers: FoldingMarkerList;
  /** @deprecated Use collatorOptions.numeric instead */
  enableNaturalSorting: boolean;
  /** @deprecated Will no longer be applied. Use collatorOptions instead */
  naturalSorting: NaturalSortOptions;
  collatorOptions: BlockSortCollatorOptions;
  sortConsecutiveBlockHeaders: boolean;
  enableCodeLens: DocumentSelector | boolean;
  enableCodeActions: DocumentSelector | boolean;
  enableDocumentFormatting: DocumentSelector | boolean;
  enableRangeFormatting: DocumentSelector | boolean;
  forceBlockHeaderFirstRegex: string;
  forceBlockHeaderLastRegex: string;
  multiBlockHeaderRegex: string;
  incompleteBlockRegex: string;
  quickSortCommands: SortCommandOptions[];
}

import { TextEdit } from "vscode";

export interface ExpandSelectionOptions {
  expandOverEmptyLines?: boolean;
  foldingComplete?: boolean;
  indentationComplete?: boolean;
}

export type BlockSortOptions = {
  sortFunction: (a: string, b: string) => number;
  sortChildren?: number;
  // `false` for no expansion, `true` for all options enabled
  expandSelection?: boolean | ExpandSelectionOptions;
  /**
   * Mutable array of previous edits.
   * Edits that are merged into the current edit are removed from this array.
   */
  edits?: TextEdit[];
};
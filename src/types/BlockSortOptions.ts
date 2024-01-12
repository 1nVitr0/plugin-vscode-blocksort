import { TextEdit } from "vscode";
import { BlockSortCollatorOptions } from "../providers/ConfigurationProvider";

export interface ExpandSelectionOptions {
  expandLocally?: boolean;
  expandOverEmptyLines?: boolean;
  foldingComplete?: boolean;
  indentationComplete?: boolean;
}

export type BlockSortOptions = {
  collator?: BlockSortCollatorOptions;
  direction?: "asc" | "desc";
  sortChildren?: number;
  // `false` for no expansion, `true` for all options enabled
  expandSelection?: boolean | ExpandSelectionOptions;
  /**
   * Mutable array of previous edits.
   * Edits that are merged into the current edit are removed from this array.
   */
  edits?: TextEdit[];
};
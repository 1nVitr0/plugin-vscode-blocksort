import { CodeActionKind, Position, Range } from "vscode";
import { ExpandSelectionOptions } from "../../types/BlockSortOptions";
import { BlockSortCollatorOptions } from "../../providers/ConfigurationProvider";

export interface BaseTest {
  file: string;
  ranges: Range[];
  only?: boolean;
  skip?: boolean;
}

export interface CompareTest extends BaseTest {
  compareFile: string;
}

export interface CustomSortTest extends CompareTest {
  collatorOptions?: BlockSortCollatorOptions;
  direction?: "asc" | "desc";
}

export interface RangeTest extends BaseTest {
  targetRanges: Range[];
  expand?: boolean | ExpandSelectionOptions;
}

export interface PositionTest extends BaseTest {
  ranges: Range[];
  targetPositions: Position[];
  ignoreCharacterOffset?: boolean;
}

export interface ListOfKindTest<T> extends BaseTest {
  onlyCodeAction?: CodeActionKind;
  targetKinds: T[];
  strict?: boolean;
}

export interface BlockSortOptionsTest extends BaseTest {
  targetOptions: { sort: string[]; targetSort: string[]; targetDepth: number };
}

export interface CancellationTest extends BaseTest {
  performanceThreshold: number;
}

import { Position, Range } from "vscode";

export interface BaseTest {
  file: string;
  ranges: Range[];
  only?: boolean;
  skip?: boolean;
}

export interface CompareTest extends BaseTest {
  compareFile: string;
}

export interface RangeTest extends BaseTest {
  targetRanges: Range[];
}

export interface PositionTest extends BaseTest {
  ranges: Range[];
  targetPositions: Position[];
  ignoreCharacterOffset?: boolean;
}

export interface ListOfKindTest<T> extends BaseTest {
  targetKinds: T[];
  strict?: boolean;
}

export interface BlockSortOptionsTest extends BaseTest {
  targetOptions: { sort: string[]; targetSort: string[]; targetDepth: number };
}

export interface CancellationTest extends BaseTest {
  performanceThreshold: number;
}

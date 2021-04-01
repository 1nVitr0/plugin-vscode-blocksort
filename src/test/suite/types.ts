import { Range } from 'vscode';

interface BaseTest {
  file: string;
  ranges: Range[];
}

export interface SortTest extends BaseTest {
  compareFile: string;
}

export interface ExpandTest extends BaseTest {
  targetRanges: Range[];
}

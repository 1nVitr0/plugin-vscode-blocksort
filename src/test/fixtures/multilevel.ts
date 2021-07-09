import { Range } from 'vscode';
import { SortTest } from '../suite/types';

export const multilevelSortTests: SortTest[] = [
  {
    file: 'multilevel.txt.fixture',
    compareFile: 'multilevel.txt.expect',
    ranges: [new Range(0, 0, 16, 8)],
  },
  {
    file: 'multilevel.ts.fixture',
    compareFile: 'multilevel.ts.expect',
    ranges: [new Range(1, 0, 18, 20)],
  },
];

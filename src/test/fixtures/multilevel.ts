import { Range } from 'vscode';
import { SortTest } from '../suite/types';

export const multilevelSortTests: SortTest[] = [
  {
    file: 'multilevel.txt.fixture',
    compareFile: 'multilevel.txt.expect',
    ranges: [new Range(0, 0, 16, 8)],
  },
];

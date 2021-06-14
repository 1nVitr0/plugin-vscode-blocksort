import { Range } from 'vscode';
import { SortTest } from '../suite/types';

export const naturalSortTests: SortTest[] = [
  {
    file: 'natural.txt.fixture',
    compareFile: 'natural.txt.expect',
    ranges: [new Range(0, 0, 4, 4), new Range(6, 0, 9, 9)],
  },
];

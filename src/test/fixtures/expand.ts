import { Range } from 'vscode';
import { ExpandTest } from '../suite/types';

export const expandTests: ExpandTest[] = [
  {
    file: 'expand.ts.fixture',
    ranges: [new Range(3, 9, 3, 9)],
    targetRanges: [new Range(3, 0, 16, 20)],
  },
  {
    file: 'expand.cpp.fixture',
    ranges: [new Range(2, 6, 2, 6), new Range(19, 4, 19, 4), new Range(0, 1, 0, 1)],
    targetRanges: [new Range(2, 0, 4, 13), new Range(19, 0, 21, 11), new Range(0, 0, 32, 2)],
  },
  {
    file: 'expand.rb.fixture',
    ranges: [new Range(1, 5, 1, 5)],
    targetRanges: [new Range(1, 0, 8, 48)],
  },
];

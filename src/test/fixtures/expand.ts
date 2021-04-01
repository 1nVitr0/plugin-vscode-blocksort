import { Range } from 'vscode';
import { ExpandTest } from '../suite/types';

export const expandTests: ExpandTest[] = [
  {
    file: 'expand.ts.fixture',
    ranges: [new Range(3, 9, 3, 9)],
    targetRanges: [new Range(3, 0, 16, 20)],
  },
];

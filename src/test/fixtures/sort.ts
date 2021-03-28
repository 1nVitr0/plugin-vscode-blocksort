import { join } from 'path';
import { Range } from 'vscode';
import { ExpandTest, SortTest } from './types';

export const sortTests: SortTest[] = [
  {
    file: 'block.ts.fixture',
    compareFile: 'block.ts.expect',
    ranges: [new Range(3, 0, 11, 22), new Range(17, 0, 31, 8), new Range(37, 0, 45, 8)],
  },
  {
    file: 'toplevel.ts.fixture',
    compareFile: 'toplevel.ts.expect',
    ranges: [new Range(0, 0, 59, 0)],
  },
  {
    file: 'comments.ts.fixture',
    compareFile: 'comments.ts.expect',
    ranges: [new Range(1, 0, 27, 3)],
  },
];

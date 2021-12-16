import { BlockSortOptionsTest } from "../suite/types";
import { Range } from "vscode";

export const formattingOptionsTest: BlockSortOptionsTest[] = [
  {
    file: "marker.ts.fixture",
    ranges: [new Range(0, 0, 0, 0), new Range(1, 0, 1, 0)],
    targetOptions: { sort: ["3", "0", "1", "2"], targetSort: ["0", "1", "2", "3"], targetDepth: 0 },
  },
  {
    file: "marker.ts.fixture",
    ranges: [new Range(2, 0, 2, 0)],
    targetOptions: { sort: ["3", "0", "1", "2"], targetSort: ["3", "2", "1", "0"], targetDepth: 0 },
  },
  {
    file: "marker.ts.fixture",
    ranges: [new Range(3, 0, 3, 0)],
    targetOptions: { sort: ["3", "0", "1", "2"], targetSort: ["0", "1", "2", "3"], targetDepth: 2 },
  },
  {
    file: "marker.ts.fixture",
    ranges: [new Range(4, 0, 4, 0)],
    targetOptions: { sort: ["3", "0", "1", "2"], targetSort: ["3", "2", "1", "0"], targetDepth: 2 },
  },
  {
    file: "marker.ts.fixture",
    ranges: [new Range(5, 0, 5, 0), new Range(7, 0, 7, 0)],
    targetOptions: { sort: ["3", "0", "1", "2"], targetSort: ["0", "1", "2", "3"], targetDepth: Infinity },
  },
  {
    file: "marker.ts.fixture",
    ranges: [new Range(6, 0, 6, 0), new Range(8, 0, 8, 0)],
    targetOptions: { sort: ["3", "0", "1", "2"], targetSort: ["3", "2", "1", "0"], targetDepth: Infinity },
  },
];

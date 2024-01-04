import { Range } from "vscode";
import { RangeTest } from "../suite/types";

export const expandTests: RangeTest[] = [
  {
    file: "expand.typescript.fixture",
    ranges: [new Range(3, 9, 3, 9), new Range(22, 0, 24, 0), new Range(30, 2, 30, 2)],
    targetRanges: [new Range(3, 0, 16, 20), new Range(22, 0, 26, 3), new Range(30, 0, 36, 63)],
  },
  {
    file: "expand.cpp.fixture",
    ranges: [new Range(2, 6, 2, 6), new Range(19, 4, 19, 4), new Range(0, 1, 0, 1)],
    targetRanges: [new Range(2, 0, 4, 13), new Range(19, 0, 21, 11), new Range(0, 0, 15, 2)],
  },
  {
    file: "expand.ruby.fixture",
    ranges: [new Range(1, 5, 1, 5)],
    targetRanges: [new Range(1, 0, 8, 48)],
  },
  {
    file: "expandLocal.typescript.fixture",
    ranges: [new Range(1, 0, 2, 19)],
    targetRanges: [new Range(1, 0, 3, 19)],
    expand: { expandLocally: true },
  },
  {
    file: "expandFull.typescript.fixture",
    ranges: [new Range(1, 0, 2, 19)],
    targetRanges: [new Range(1, 0, 15, 3)],
    expand: true,
  },
];

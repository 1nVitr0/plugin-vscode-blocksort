import { Range } from "vscode";
import { CompareTest } from "../suite/types";

export const sortTests: CompareTest[] = [
  {
    file: "block.ts.fixture",
    compareFile: "block.ts.expect",
    ranges: [new Range(3, 0, 13, 22), new Range(19, 0, 33, 8), new Range(39, 0, 47, 8)],
  },
  {
    file: "block.cpp.fixture",
    compareFile: "block.cpp.expect",
    ranges: [new Range(2, 0, 4, 17), new Range(21, 0, 23, 15)],
  },
  {
    file: "block.rb.fixture",
    compareFile: "block.rb.expect",
    ranges: [new Range(3, 0, 10, 46), new Range(15, 0, 25, 3), new Range(29, 0, 39, 3), new Range(43, 0, 55, 11)],
  },
  {
    file: "toplevel.ts.fixture",
    compareFile: "toplevel.ts.expect",
    ranges: [new Range(0, 0, 59, 0)],
  },
  {
    file: "comments.ts.fixture",
    compareFile: "comments.ts.expect",
    ranges: [new Range(1, 0, 17, 3)],
  },
  {
    file: "formatting.ts.fixture",
    compareFile: "formatting.ts.expect",
    ranges: [new Range(1, 0, 14, 68)],
  },
  {
    file: "nested.json.fixture",
    compareFile: "nested.json.expect",
    ranges: [new Range(1, 0, 68, 3), new Range(89, 0, 95, 60)],
  },
  {
    file: "nested.html.fixture",
    compareFile: "nested.html.expect",
    ranges: [new Range(3, 0, 34, 11), new Range(45, 0, 48, 64)],
  },
  {
    file: "case.ts.fixture",
    compareFile: "case.ts.expect",
    ranges: [new Range(1, 0, 12, 18)],
  },
  {
    file: "block.txt.fixture",
    compareFile: "block.txt.expect",
    ranges: [new Range(0, 0, 16, 8)],
  },
];

import { Range } from "vscode";
import { CompareTest } from "../suite/types";

export const multilevelSortTests: CompareTest[] = [
  {
    file: "multilevel.plaintext.fixture",
    compareFile: "multilevel.plaintext.expect",
    ranges: [new Range(0, 0, 16, 8)],
  },
  {
    file: "multilevel.typescript.fixture",
    compareFile: "multilevel.typescript.expect",
    ranges: [new Range(1, 0, 18, 20)],
  },
];

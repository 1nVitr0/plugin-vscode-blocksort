import { Range } from "vscode";
import { CompareTest } from "../suite/types";

export const naturalSortTests: CompareTest[] = [
  {
    file: "natural.plaintext.fixture",
    compareFile: "natural.plaintext.expect",
    ranges: [new Range(0, 0, 4, 4), new Range(6, 0, 9, 9), new Range(11, 0, 17, 5)],
  },
];

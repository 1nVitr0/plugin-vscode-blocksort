import { Range } from "vscode";
import { CompareTest } from "../suite/types";

export const customSortTests: CompareTest[] = [
  {
    file: "custom.plaintext.fixture",
    compareFile: "custom.plaintext.expect",
    ranges: [new Range(0, 0, 5, 4)],
  },
];

import { Range } from "vscode";
import { CompareTest, CustomSortTest } from "../suite/types";

export const customSortTests: CustomSortTest[] = [
  {
    file: "custom.plaintext.fixture",
    compareFile: "custom.plaintext.expect",
    ranges: [new Range(0, 0, 5, 4)],
    collatorOptions: { customSortOrder: "abcdefghijklmnopqrstuvwxyz:#" },
  },
  {
    file: "custom.plaintext.fixture",
    compareFile: "custom.plaintext.expect",
    ranges: [new Range(7, 0, 21, 1)],
    collatorOptions: { customSortOrder: '"-_' },
  },
];

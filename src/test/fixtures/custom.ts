import { Range } from "vscode";
import { CompareTest, CustomSortTest } from "../suite/types";

export const customSortTests: CustomSortTest[] = [
  {
    file: "custom.plaintext.fixture",
    compareFile: "custom.plaintext.expect",
    ranges: [new Range(0, 0, 7, 4)],
    collatorOptions: { customSortOrder: "abcdefghijklmnopqrstuvwxyz#:@" },
  },
  {
    file: "custom.plaintext.fixture",
    compareFile: "custom.plaintext.expect",
    ranges: [new Range(9, 0, 23, 1)],
    collatorOptions: { customSortOrder: '"-_' },
  },
  {
    file: "custom.plaintext.fixture",
    compareFile: "custom.plaintext.expect",
    ranges: [new Range(25, 0, 39, 1)],
    collatorOptions: { customSortOrder: "-_", customIgnoreCharacters: "'\"()[]{}<>" },
  },
  {
    file: "custom.plaintext.fixture",
    compareFile: "custom.plaintext.expect",
    ranges: [new Range(25, 0, 39, 1)],
    collatorOptions: { customSortOrder: '"-_' },
  },
  {
    file: "custom.html.fixture",
    compareFile: "custom.html.expect",
    ranges: [new Range(1, 0, 6, 15)],
    collatorOptions: { customSortOrder: "abcdefghijklmnopqrstuvwxyz#:@" },
  },
];

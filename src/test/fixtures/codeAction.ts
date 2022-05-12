import { Range } from "vscode";
import { BlockSortCodeActionKind } from "../../providers/BlockSortActionProvider";
import { CompareTest, ListOfKindTest, RangeTest } from "../suite/types";

export const codeActionKindTest: ListOfKindTest<BlockSortCodeActionKind>[] = [
  {
    file: "marker.ts.fixture",
    ranges: [new Range(0, 0, 79, 0)],
    targetKinds: [BlockSortCodeActionKind.SourceFixAll],
    strict: true,
  },
  {
    file: "marker.ts.fixture",
    ranges: [new Range(2, 0, 30, 0)],
    targetKinds: [BlockSortCodeActionKind.SourceFixAll],
    strict: true,
  },
  {
    file: "marker.ts.fixture",
    ranges: [new Range(49, 0, 75, 7)],
    targetKinds: [BlockSortCodeActionKind.QuickFix],
    strict: true,
  },
];

export const codeActionResultTest: CompareTest[] = [
  {
    file: "marker.ts.fixture",
    compareFile: "marker.ts.expect",
    ranges: [new Range(0, 0, 79, 0)],
  },
  {
    file: "marker.ts.fixture",
    compareFile: "marker.ts.expect",
    ranges: [new Range(2, 0, 30, 0)],
  },
  {
    file: "marker.ts.fixture",
    compareFile: "marker.ts.expect",
    ranges: [new Range(49, 0, 75, 7)],
  },
];

export const codeLensTest: RangeTest[] = [
  {
    file: "marker.ts.fixture",
    ranges: [new Range(0, 0, 79, 0)],
    targetRanges: [new Range(4, 0, 12, 7), new Range(19, 0, 27, 7), new Range(34, 0, 42, 7), new Range(49, 0, 75, 7)],
  },
];

export const fixAllTest: CompareTest[] = [
  {
    file: "markers-nested.yml.fixture",
    compareFile: "markers-nested.yml.expect",
    ranges: [new Range(0, 0, 88, 0)],
  },
];

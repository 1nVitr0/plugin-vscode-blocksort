import { Range } from "vscode";
import { BlockSortCodeActionKind } from "../../providers/BlockSortActionProvider";
import { CompareTest, ListOfKindTest, RangeTest } from "../suite/types";

export const codeActionKindTest: ListOfKindTest<BlockSortCodeActionKind>[] = [
  {
    file: "marker.typescript.fixture",
    ranges: [new Range(0, 0, 79, 0)],
    targetKinds: [BlockSortCodeActionKind.SourceFixAll],
    strict: true,
  },
  {
    file: "marker.typescript.fixture",
    ranges: [new Range(2, 0, 30, 0)],
    targetKinds: [BlockSortCodeActionKind.SourceFixAll],
    strict: true,
  },
  {
    file: "marker.typescript.fixture",
    ranges: [new Range(49, 0, 75, 7)],
    targetKinds: [BlockSortCodeActionKind.QuickFix],
    strict: true,
  },
];

export const codeActionResultTest: CompareTest[] = [
  {
    file: "marker.typescript.fixture",
    compareFile: "marker.typescript.expect",
    ranges: [new Range(0, 0, 79, 0)],
  },
  {
    file: "marker.typescript.fixture",
    compareFile: "marker.typescript.expect",
    ranges: [new Range(2, 0, 30, 0)],
  },
  {
    file: "marker.typescript.fixture",
    compareFile: "marker.typescript.expect",
    ranges: [new Range(49, 0, 75, 7)],
  },
];

export const codeLensTest: RangeTest[] = [
  {
    file: "marker.typescript.fixture",
    ranges: [new Range(0, 0, 79, 0)],
    targetRanges: [new Range(4, 0, 12, 7), new Range(19, 0, 27, 7), new Range(34, 0, 42, 7), new Range(49, 0, 75, 7)],
  },
];

export const fixAllTest: CompareTest[] = [
  {
    file: "markers-nested.yaml.fixture",
    compareFile: "markers-nested.yaml.expect",
    ranges: [new Range(0, 0, 88, 0)],
  },
  {
    file: "blocksort.typescript.fixture",
    compareFile: "blocksort.typescript.expect",
    ranges: [new Range(0, 0, 25, 0)],
  },
];

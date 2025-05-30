import { CodeActionKind, Range } from "vscode";
import { BlockSortCodeActionKind } from "../../providers/BlockSortActionProvider";
import { CompareTest, ListOfKindTest, RangeTest } from "../suite/types";

export const codeActionKindTest: ListOfKindTest<BlockSortCodeActionKind>[] = [
  {
    file: "marker.typescript.fixture",
    ranges: [new Range(0, 0, 79, 0)],
    targetKinds: [BlockSortCodeActionKind.QuickFix, BlockSortCodeActionKind.SourceFixAll],
    strict: true,
  },
  {
    file: "marker.typescript.fixture",
    ranges: [new Range(2, 0, 30, 0)],
    targetKinds: [BlockSortCodeActionKind.QuickFix, BlockSortCodeActionKind.SourceFixAll],
    strict: true,
  },
  {
    file: "marker.typescript.fixture",
    ranges: [new Range(49, 0, 75, 7)],
    targetKinds: [BlockSortCodeActionKind.QuickFix, BlockSortCodeActionKind.SourceFixAll],
    strict: true,
  },
  {
    file: "marker.typescript.fixture",
    ranges: [new Range(49, 0, 75, 7)],
    targetKinds: [BlockSortCodeActionKind.SourceFixAll],
    onlyCodeAction: CodeActionKind.SourceFixAll,
    strict: true,
  },
  {
    file: "marker.python.fixture",
    ranges: [new Range(0, 0, 8, 0)],
    targetKinds: [BlockSortCodeActionKind.QuickFix, BlockSortCodeActionKind.SourceFixAll],
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

  {
    file: "marker.python.fixture",
    compareFile: "marker.python.expect",
    ranges: [new Range(0, 0, 8, 0)],
  },
];

export const codeLensTest: RangeTest[] = [
  {
    file: "marker.typescript.fixture",
    ranges: [new Range(0, 0, 79, 0)],
    targetRanges: [new Range(4, 6, 4, 6), new Range(19, 6, 19, 6), new Range(34, 6, 34, 6), new Range(49, 6, 49, 6)],
  },
  {
    file: "marker.python.fixture",
    ranges: [new Range(0, 0, 8, 0)],
    targetRanges: [new Range(2, 2, 2, 2)],
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

  {
    file: "marker.python.fixture",
    compareFile: "marker.python.expect",
    ranges: [new Range(0, 0, 8, 0)],
  },
];

import { Range } from "vscode";
import { BlockSortCodeActionKind } from "../../providers/BlockSortActionProvider";
import { ListOfKindTest } from "../suite/types";

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

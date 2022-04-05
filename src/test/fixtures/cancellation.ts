import { Range } from "vscode";
import { CancellationTest } from "../suite/types";

export const cancelSortTests: CancellationTest[] = [
  {
    file: "cancellation.json.fixture",
    ranges: [new Range(3, 0, 149, 7)],
    performanceThreshold: 10,
  },
];

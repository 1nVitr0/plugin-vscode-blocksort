import * as assert from "assert";
import { join } from "path";
import { window, workspace, Selection } from "vscode";
import BlockSortProvider from "../../providers/BlockSortProvider";
import { expandTests, fixtureDir, sortTests, multilevelSortTests } from "../fixtures";
import { SortTest } from "./types";
import { naturalSortTests } from "../fixtures/natural";

function sortTest(
  tests: SortTest[],
  title = "Sort Blocks",
  sort: (a: string, b: string) => number = BlockSortProvider.sort.asc,
  sortChildren = 0
) {
  tests.forEach(({ file, compareFile, ranges }) => {
    ranges.forEach((range, i) => {
      const descriptor = file.match(/(.*)\.(.*)\.fixture/);
      const [_, type, lang] = descriptor || ["", "generic", "generic"];
      test(`Sort Blocks (${type}, lang ${lang}) #${i}`, async () => {
        const compareDocument = await workspace.openTextDocument(join(fixtureDir, compareFile));
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        const blockSortProvider = new BlockSortProvider(document);

        const blocks = blockSortProvider.getBlocks(range);
        const sorted = blockSortProvider.sortBlocks(blocks, sort, sortChildren).join("\n");
        const compareSorted = compareDocument.getText(range);

        assert.strictEqual(sorted, compareSorted, "sorted ranges are not equal");
      });
    });
  });
}

suite("Unit Suite for BlockSortProvider", async () => {
  window.showInformationMessage("Start tests for BlockSortProvider.");

  expandTests.forEach(({ file, ranges, targetRanges }) => {
    ranges
      .map((range, i) => ({ position: range, target: targetRanges[i] }))
      .forEach(({ position, target }, i) => {
        const [_, lang] = file.match(/\.(.*)\.fixture/) || ["", "generic"];
        test(`Expands selection (lang ${lang}) #${i}`, async () => {
          const document = await workspace.openTextDocument(join(fixtureDir, file));
          const blockSortProvider = new BlockSortProvider(document);
          const selection = new Selection(position.start, position.end);
          const expanded = blockSortProvider.expandRange(selection);

          assert.deepStrictEqual(expanded, target, "range did not expand correctly");
        });
      });
  });

  sortTest(sortTests, "Sort Blocks");
  sortTest(multilevelSortTests, "Deep Sort Blocks", BlockSortProvider.sort.asc, -1);
  sortTest(naturalSortTests, "Natural Sort Blocks", BlockSortProvider.sort.ascNatural, 0);
});

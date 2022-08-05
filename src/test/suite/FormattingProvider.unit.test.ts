import * as assert from "assert";
import { join } from "path";
import { window, workspace } from "vscode";
import BlockSortFormattingProvider from "../../providers/BlockSortFormattingProvider";
import { fixtureDir } from "../fixtures";
import { formattingOptionsTest } from "../fixtures/formatting";

suite("Unit Suite for BlockSortFormattingProvider", async () => {
  window.showInformationMessage("Start tests for BlockSortFormattingProvider.");

  formattingOptionsTest.forEach(({ file, ranges, targetOptions, only, skip }, i) => {
    ranges.forEach((range, j) => {
      const descriptor = file.match(/\.(.*)\.fixture/);
      const [_, lang] = descriptor || ["", "generic", "generic"];
      const testFunc = only ? test.only : skip ? test.skip : test;
      testFunc(`Formatting test(lang ${lang}) #${i}.${j}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));

        const options = BlockSortFormattingProvider.getBlockSortMarkerOptions(document, range.start);
        const sorted = targetOptions.sort.sort(options.sortFunction);

        assert.strictEqual(options.sortChildren, targetOptions.targetDepth, "sortChildren does not match");
        assert.deepStrictEqual(sorted, targetOptions.targetSort, "sort does not match");
      });
    });
  });
});

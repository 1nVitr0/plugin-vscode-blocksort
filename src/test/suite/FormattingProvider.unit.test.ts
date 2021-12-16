import * as assert from "assert";
import { join } from "path";
import { window, workspace } from "vscode";
import FormattingProvider from "../../providers/FormattingProvider";
import { fixtureDir } from "../fixtures";
import { formattingOptionsTest } from "../fixtures/formatting";

suite("Unit Suite for FormattingProvider", async () => {
  window.showInformationMessage("Start tests for FormattingProvider.");

  formattingOptionsTest.forEach(({ file, ranges, targetOptions }, i) => {
    ranges.forEach((range, j) => {
      const descriptor = file.match(/\.(.*)\.fixture/);
      const [_, lang] = descriptor || ["", "generic", "generic"];
      test(`Formatting test(lang ${lang}) #${i}.${j}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));

        const options = FormattingProvider.getBlockSortMarkerOptions(document, range.start);
        const sorted = targetOptions.sort.sort(options.sortFunction);

        assert.strictEqual(options.sortChildren, targetOptions.targetDepth, "sortChildren does not match");
        assert.deepStrictEqual(sorted, targetOptions.targetSort, "sort does not match");
      });
    });
  });
});

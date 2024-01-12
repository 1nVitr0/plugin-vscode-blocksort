import * as assert from "assert";
import { join } from "path";
import { languages, window, workspace } from "vscode";
import BlockSortFormattingProvider from "../../providers/BlockSortFormattingProvider";
import { fixtureDir } from "../fixtures";
import { formattingOptionsTest } from "../fixtures/formatting";
import { StringSortProvider } from "../../providers/StringSortProvider";

suite("Unit Suite for BlockSortFormattingProvider", async () => {
  window.showInformationMessage("Start tests for BlockSortFormattingProvider.");

  const blockSortFormattingProvider = new BlockSortFormattingProvider();

  formattingOptionsTest.forEach(({ file, ranges, targetOptions, only, skip }, i) => {
    ranges.forEach((range, j) => {
      const descriptor = file.match(/\.(.*)\.fixture/);
      const [_, lang] = descriptor || ["", "generic", "generic"];
      const testFunc = only ? test.only : skip ? test.skip : test;
      testFunc(`Formatting test(lang ${lang}) #${i + 1}.${j}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        await languages.setTextDocumentLanguage(document, lang);

        const options = BlockSortFormattingProvider.getBlockSortMarkerOptions(document, range.start);
        const sortProvider = new StringSortProvider(options.collator, options.direction);
        const compare = sortProvider.compare.bind(sortProvider);
        const sorted = targetOptions.sort.sort(compare);

        assert.strictEqual(options.sortChildren, targetOptions.targetDepth, "sortChildren does not match");
        assert.deepStrictEqual(sorted, targetOptions.targetSort, "sort does not match");
      });
    });
  });
});

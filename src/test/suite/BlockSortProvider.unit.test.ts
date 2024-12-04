import { strict as assert } from "assert";
import { join } from "path";
import { window, workspace, Selection, CancellationTokenSource, CancellationToken, languages } from "vscode";
import BlockSortProvider from "../../providers/BlockSortProvider";
import { expandTests, fixtureDir, sortTests, multilevelSortTests, cancelSortTests } from "../fixtures";
import { CompareTest, CustomSortTest } from "./types";
import { naturalSortTests } from "../fixtures/natural";
import { ExpandSelectionOptions } from "../../types/BlockSortOptions";
import { StringSortProvider } from "../../providers/StringSortProvider";
import { customSortTests } from "../fixtures/custom";

const defaultExpandOptions: ExpandSelectionOptions = {
  expandLocally: true,
  expandOverEmptyLines: false,
  foldingComplete: true,
  indentationComplete: true,
};

function sortTest(tests: CustomSortTest[], title = "Sort Blocks", sortChildren = 0) {
  tests.forEach(({ file, compareFile, ranges, only, skip, collatorOptions, direction }) => {
    ranges.forEach((range, i) => {
      const descriptor = file.match(/(.*)\.(.*)\.fixture/);
      const [_, type, lang] = descriptor || ["", "generic", "generic"];
      const sortProvider = new StringSortProvider(collatorOptions, direction);
      const testFunc = only ? test.only : skip ? test.skip : test;
      testFunc(`${title} (${type}, lang ${lang}) #${i + 1}`, async () => {
        const compareDocument = await workspace.openTextDocument(join(fixtureDir, compareFile));
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        await languages.setTextDocumentLanguage(document, lang);
        const blockSortProvider = new BlockSortProvider(document);

        const blocks = blockSortProvider.getBlocks(range);
        const sorted = blockSortProvider.sortBlocks(blocks, sortProvider, sortChildren).join("\n");
        const compareSorted = compareDocument.getText(range);

        assert.strictEqual(sorted, compareSorted, "sorted ranges are not equal");
      });
    });
  });
}

async function timeCancellation<T>(call: (token?: CancellationToken) => T, cancel: boolean) {
  const start = Date.now();
  const tokenSource = new CancellationTokenSource();
  tokenSource.cancel();

  await call(cancel ? tokenSource.token : undefined);

  return Date.now() - start;
}

async function assertRaceCancellation<T>(
  call: (token?: CancellationToken) => T,
  name: string,
  performanceThreshold: number
) {
  const fullTime = await timeCancellation(call, false);
  const cancelledTime = await timeCancellation(call, true);
  const performance = fullTime / cancelledTime;

  assert.ok(
    performance > performanceThreshold,
    `Cancellation of ${name} performance increase ${performance} not above ${performanceThreshold}x`
  );
}

suite("Unit Suite for BlockSortProvider", async () => {
  window.showInformationMessage("Start tests for BlockSortProvider.");

  expandTests.forEach(({ file, ranges, targetRanges, expand, only, skip }) => {
    ranges
      .map((range, i) => ({ position: range, target: targetRanges[i] }))
      .forEach(({ position, target }, i) => {
        const [_, lang] = file.match(/\.(.*)\.fixture/) || ["", "generic"];
        const testFunc = only ? test.only : skip ? test.skip : test;
        testFunc(`Expands selection (lang ${lang}) #${i + 1}`, async () => {
          const document = await workspace.openTextDocument(join(fixtureDir, file));
          await languages.setTextDocumentLanguage(document, lang);
          const blockSortProvider = new BlockSortProvider(document);
          const selection = new Selection(position.start, position.end);
          const expanded = blockSortProvider.trimRange(
            blockSortProvider.expandRange(selection, expand ?? defaultExpandOptions)
          );

          assert.deepStrictEqual(
            {
              start: expanded.start,
              end: expanded.end,
              text: document.getText(expanded),
            },
            {
              start: target.start,
              end: target.end,
              text: document.getText(target),
            },
            "range did not expand correctly"
          );
        });
      });
  });

  sortTest(sortTests, "Sort Blocks");
  sortTest(multilevelSortTests, "Deep Sort Blocks", -1);
  sortTest(
    naturalSortTests.map((test) => ({ ...test, collatorOptions: { numeric: true } })),
    "Natural Sort Blocks",
    0
  );
  sortTest(customSortTests, "Custom Sort Blocks", 0);

  cancelSortTests.forEach(({ file, ranges, performanceThreshold, only, skip }) => {
    ranges.forEach((range, i) => {
      const [_, lang] = file.match(/\.(.*)\.fixture/) || ["", "generic"];
      const testFunc = only ? test.only : skip ? test.skip : test;
      testFunc(`Cancels getting Inner Blocks (lang ${lang}) #${i + 1}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        await languages.setTextDocumentLanguage(document, lang);
        const blockSortProvider = new BlockSortProvider(document);

        const callback = blockSortProvider.getInnerBlocks.bind(blockSortProvider, range);
        await assertRaceCancellation(callback, "getInnerBlocks", performanceThreshold);
      });

      testFunc(`Cancels getting Blocks (lang ${lang}) #${i + 1}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        await languages.setTextDocumentLanguage(document, lang);
        const blockSortProvider = new BlockSortProvider(document);

        const callback = blockSortProvider.getBlocks.bind(blockSortProvider, range);
        await assertRaceCancellation(callback, "getBlocks", performanceThreshold);
      });

      testFunc(`Cancels sorting Blocks (lang ${lang}) #${i + 1}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        await languages.setTextDocumentLanguage(document, lang);
        const blockSortProvider = new BlockSortProvider(document);
        const blocks = blockSortProvider.getBlocks(range);

        const callback = blockSortProvider.sortBlocks.bind(
          blockSortProvider,
          blocks,
          new StringSortProvider(),
          Infinity,
          0,
          []
        );
        await assertRaceCancellation(callback, "sortBlocks", performanceThreshold);
      });
    });
  });
});

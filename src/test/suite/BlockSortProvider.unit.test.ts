import { strict as assert } from "assert";
import { join } from "path";
import { window, workspace, Selection, CancellationTokenSource, CancellationToken } from "vscode";
import BlockSortProvider from "../../providers/BlockSortProvider";
import { expandTests, fixtureDir, sortTests, multilevelSortTests, cancelSortTests } from "../fixtures";
import { CompareTest } from "./types";
import { naturalSortTests } from "../fixtures/natural";

function sortTest(
  tests: CompareTest[],
  title = "Sort Blocks",
  sort: (a: string, b: string) => number = BlockSortProvider.sort.asc,
  sortChildren = 0
) {
  tests.forEach(({ file, compareFile, ranges }) => {
    ranges.forEach((range, i) => {
      const descriptor = file.match(/(.*)\.(.*)\.fixture/);
      const [_, type, lang] = descriptor || ["", "generic", "generic"];
      test(`${title} (${type}, lang ${lang}) #${i}`, async () => {
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
    `Cancellation of ${name} did not increase performance above ${performanceThreshold}x`
  );
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

  cancelSortTests.forEach(({ file, ranges, performanceThreshold }) => {
    ranges.forEach((range, i) => {
      const [_, lang] = file.match(/\.(.*)\.fixture/) || ["", "generic"];
      test(`Cancels getting Inner Blocks (lang ${lang}) #${i}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        const blockSortProvider = new BlockSortProvider(document);

        const callback = blockSortProvider.getInnerBlocks.bind(blockSortProvider, range);
        await assertRaceCancellation(callback, "getInnerBlocks", performanceThreshold);
      });

      test(`Cancels getting Blocks (lang ${lang}) #${i}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        const blockSortProvider = new BlockSortProvider(document);

        const callback = blockSortProvider.getBlocks.bind(blockSortProvider, range);
        await assertRaceCancellation(callback, "getBlocks", performanceThreshold);
      });

      test(`Cancels sorting Blocks (lang ${lang}) #${i}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        const blockSortProvider = new BlockSortProvider(document);
        const blocks = blockSortProvider.getBlocks(range);

        const callback = blockSortProvider.sortBlocks.bind(
          blockSortProvider,
          blocks,
          BlockSortProvider.sort.asc,
          Infinity,
          []
        );
        await assertRaceCancellation(callback, "sortBlocks", performanceThreshold);
      });
    });
  });
});

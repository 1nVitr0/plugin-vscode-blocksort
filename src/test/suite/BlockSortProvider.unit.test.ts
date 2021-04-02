import * as assert from 'assert';
import { join } from 'path';
import { Range, TextDocument, window, workspace, Selection } from 'vscode';
import BlockSortProvider from '../../providers/BlockSortProvider';
import { expandTests, fixtureDir, sortTests } from '../fixtures';

suite('Unit Suite for BlockSortProvider', async () => {
  let document: TextDocument;
  let compareDocument: TextDocument;
  let blockSortProvider: BlockSortProvider;

  window.showInformationMessage('Start tests for BlockSortProvider.');

  expandTests.map(({ file, ranges, targetRanges }) => {
    ranges
      .map((range, i) => ({ position: range, target: targetRanges[i] }))
      .forEach(({ position, target }, i) => {
        const [_, lang] = file.match(/\.(.*)\.fixture/) || ['', 'generic'];
        test(`Expands selection (lang ${lang}) #${i}`, async () => {
          document = await workspace.openTextDocument(join(fixtureDir, file));
          blockSortProvider = new BlockSortProvider(document);
          const selection = new Selection(position.start, position.end);
          const expanded = blockSortProvider.expandSelection(selection);

          assert.deepStrictEqual(expanded, target, 'range did not expand correctly');
        });
      });
  });

  sortTests.map(({ file, compareFile, ranges }) => {
    ranges.forEach((range, i) => {
      const descriptor = file.match(/(.*)\.(.*)\.fixture/);
      const [_, type, lang] = descriptor || ['', 'generic', 'generic'];
      test(`Sort Blocks (${type}, lang ${lang}) #${i}`, async () => {
        compareDocument = await workspace.openTextDocument(join(fixtureDir, compareFile));
        document = await workspace.openTextDocument(join(fixtureDir, file));
        blockSortProvider = new BlockSortProvider(document);

        const blocks = blockSortProvider.getBlocks(range);
        const sorted = blockSortProvider.sortBlocks(blocks).join('\n');
        const compareSorted = compareDocument.getText(range);

        assert.strictEqual(sorted, compareSorted, 'sorted ranges are not equal');
      });
    });
  });
});

import * as assert from "assert";
import { join } from "path";
import { CancellationTokenSource, CodeActionKind, languages, window, workspace } from "vscode";
import BlockSortActionProvider from "../../providers/BlockSortActionProvider";
import BlockSortFormattingProvider from "../../providers/BlockSortFormattingProvider";
import { codeActionKindTest, codeActionResultTest, codeLensTest, fixAllTest, fixtureDir } from "../fixtures";

suite("Unit Suite for BlockSortActionProvider", async () => {
  window.showInformationMessage("Start tests for BlockSortProvider.");

  const formattingProvider = new BlockSortFormattingProvider();
  const codeActionProvider = new BlockSortActionProvider(formattingProvider);
  const token = new CancellationTokenSource();

  codeActionKindTest.forEach(({ file, ranges, targetKinds, strict, only, skip, onlyCodeAction }, i) => {
    ranges.forEach((range, j) => {
      const [_, lang] = file.match(/\.(.*)\.fixture/) || ["", "generic"];
      const testFunc = only ? test.only : skip ? test.skip : test;
      testFunc(`Code Action Kind Tests (lang ${lang}) #${i + 1}.${j}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        await languages.setTextDocumentLanguage(document, lang);

        const codeActions = codeActionProvider.provideCodeActions(
          document,
          range,
          { diagnostics: [], only: onlyCodeAction },
          token.token
        );

        const kinds = codeActions.map((action) => action.kind).sort();
        if (strict) assert.deepStrictEqual(kinds, targetKinds.sort(), "code actions do not match strictly");
        else assert.deepStrictEqual([...new Set(kinds)], targetKinds.sort(), "code actions do not match");
      });
    });
  });

  codeActionResultTest.forEach(({ file, ranges, compareFile, only, skip }, i) => {
    ranges.forEach((range, j) => {
      const descriptor = file.match(/\.(.*)\.fixture/);
      const [_, lang] = descriptor || ["", "generic", "generic"];
      const testFunc = only ? test.only : skip ? test.skip : test;
      testFunc(`Code Action Compare test(lang ${lang}) #${i + 1}.${j}`, async () => {
        const compareDocument = await workspace.openTextDocument(join(fixtureDir, compareFile));
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        await languages.setTextDocumentLanguage(document, lang);

        const codeActions = codeActionProvider.provideCodeActions(
          document,
          range,
          { diagnostics: [], only: undefined },
          token.token
        );
        const resolvedActions = codeActions.map((action) => codeActionProvider.resolveCodeAction(action, token.token));

        for (const { edit } of resolvedActions) if (edit) await workspace.applyEdit(edit);

        const sorted = document.getText(range);
        const compareSorted = compareDocument.getText(range);

        assert.strictEqual(sorted, compareSorted, "sorted ranges are not equal");
      });
    });
  });

  codeLensTest.forEach(({ file, ranges, targetRanges, only, skip }) => {
    ranges.forEach((range, i) => {
      const descriptor = file.match(/\.(.*)\.fixture/);
      const [_, lang] = descriptor || ["", "generic", "generic"];
      const testFunc = only ? test.only : skip ? test.skip : test;
      testFunc(`Code Lens test(lang ${lang}) #${i + 1}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));
        await languages.setTextDocumentLanguage(document, lang);

        const codeLenses = await codeActionProvider.provideCodeLenses(document, token.token);
        const codeLensRanges = codeLenses?.map((codeLens) => codeLens.range);

        assert.deepStrictEqual(codeLensRanges, targetRanges, "code lenses do not match");
      });
    });
  });

  fixAllTest.forEach(({ file, compareFile, only, skip }, i) => {
    const descriptor = file.match(/\.(.*)\.fixture/);
    const [_, lang] = descriptor || ["", "generic", "generic"];
    const testFunc = only ? test.only : skip ? test.skip : test;
    testFunc(`FixAll Code Action Compare test(lang ${lang}) #${i + 1}`, async () => {
      const compareDocument = await workspace.openTextDocument(join(fixtureDir, compareFile));
      const document = await workspace.openTextDocument(join(fixtureDir, file));
      await languages.setTextDocumentLanguage(document, lang);

      const codeActions = codeActionProvider.provideCodeActions(
        document,
        undefined,
        { diagnostics: [], only: CodeActionKind.SourceFixAll },
        token.token
      );
      const resolvedActions = codeActions.map((action) => codeActionProvider.resolveCodeAction(action, token.token));

      for (const { edit } of resolvedActions) if (edit) await workspace.applyEdit(edit);

      const sorted = document.getText();
      const compareSorted = compareDocument.getText();

      assert.strictEqual(sorted, compareSorted, "sorted ranges are not equal");
    });
  });
});

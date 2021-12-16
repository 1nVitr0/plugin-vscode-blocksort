import * as assert from "assert";
import { join } from "path";
import { CancellationTokenSource, CodeActionKind, Diagnostic, window, workspace } from "vscode";
import BlockSortActionProvider from "../../providers/BlockSortActionProvider";
import FormattingProvider from "../../providers/FormattingProvider";
import { codeActionKindTest, codeActionResultTest, codeLensTest, fixtureDir } from "../fixtures";

suite("Unit Suite for BlockSortProvider", async () => {
  window.showInformationMessage("Start tests for BlockSortProvider.");

  const formattingProvider = new FormattingProvider();
  const codeActionProvider = new BlockSortActionProvider(formattingProvider);
  const token = new CancellationTokenSource();

  codeActionKindTest.forEach(({ file, ranges, targetKinds, strict }, i) => {
    ranges.forEach((range, j) => {
      const [_, lang] = file.match(/\.(.*)\.fixture/) || ["", "generic"];
      test(`Code Action Kind Tests (lang ${lang}) #${i}.${j}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));

        const codeActions = codeActionProvider.provideCodeActions(
          document,
          range,
          { diagnostics: [] as Diagnostic[] },
          token.token
        );
        const codeActionsFixAll = codeActionProvider.provideCodeActions(
          document,
          range,
          { diagnostics: [] as Diagnostic[], only: CodeActionKind.SourceFixAll },
          token.token
        );

        const kinds = codeActions.map((action) => action.kind).sort();
        if (strict) assert.deepStrictEqual(kinds, targetKinds.sort(), "code actions do not match strictly");
        else assert.deepStrictEqual([...new Set(kinds)], targetKinds.sort(), "code actions do not match");

        const kindsFixAll = codeActionsFixAll.map((action) => action.kind).sort();
        const targetKindsFixAll = targetKinds
          .filter((kind) => kind.value.includes(CodeActionKind.SourceFixAll.value))
          .sort();
        if (strict)
          assert.deepStrictEqual(kindsFixAll, targetKindsFixAll, "sourceFixAll code actions do not match strictly");
        else
          assert.deepStrictEqual(
            [...new Set(kindsFixAll)],
            targetKindsFixAll,
            "sourceFixAll code actions do not match"
          );
      });
    });
  });

  codeActionResultTest.forEach(({ file, ranges, compareFile }, i) => {
    ranges.forEach((range, j) => {
      const descriptor = file.match(/\.(.*)\.fixture/);
      const [_, lang] = descriptor || ["", "generic", "generic"];
      test(`Code Action Compare test(lang ${lang}) #${i}.${j}`, async () => {
        const compareDocument = await workspace.openTextDocument(join(fixtureDir, compareFile));
        const document = await workspace.openTextDocument(join(fixtureDir, file));

        const codeActions = codeActionProvider.provideCodeActions(
          document,
          range,
          { diagnostics: [] as Diagnostic[] },
          token.token
        );
        const resolvedActions = codeActions.map((action) => codeActionProvider.resolveCodeAction(action, token.token));

        for (const { edit } of resolvedActions) {
          if (edit) await workspace.applyEdit(edit);
        }

        const sorted = document.getText(range);
        const compareSorted = compareDocument.getText(range);

        assert.strictEqual(sorted, compareSorted, "sorted ranges are not equal");
      });
    });
  });

  codeLensTest.forEach(({ file, ranges, targetRanges }) => {
    ranges.forEach((range, i) => {
      const descriptor = file.match(/\.(.*)\.fixture/);
      const [_, lang] = descriptor || ["", "generic", "generic"];
      test(`Code Lens test(lang ${lang}) #${i}`, async () => {
        const document = await workspace.openTextDocument(join(fixtureDir, file));

        const codeLenses = await codeActionProvider.provideCodeLenses(document, token.token);
        const codeLensRanges = codeLenses?.map((codeLens) => codeLens.range);

        assert.deepStrictEqual(codeLensRanges, targetRanges, "code lenses do not match");
      });
    });
  });
});

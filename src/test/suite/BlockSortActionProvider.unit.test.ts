import * as assert from "assert";
import { join } from "path";
import { CancellationTokenSource, CodeActionKind, window, workspace } from "vscode";
import BlockSortActionProvider from "../../providers/BlockSortActionProvider";
import FormattingProvider from "../../providers/FormattingProvider";
import { codeActionKindTest, fixtureDir } from "../fixtures";

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

        const codeActions = codeActionProvider.provideCodeActions(document, range, { diagnostics: [] }, token.token);
        const codeActionsFixAll = codeActionProvider.provideCodeActions(
          document,
          range,
          { diagnostics: [], only: CodeActionKind.SourceFixAll },
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
});

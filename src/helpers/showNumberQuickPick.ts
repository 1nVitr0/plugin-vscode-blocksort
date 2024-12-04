import { CancellationToken, QuickPickItem, QuickPickOptions, window } from "vscode";

export interface NumberQuickPickOptions extends QuickPickOptions {
  alwaysShow?: number[];
  picked?: number | number[];
  negativeAsInfinite?: boolean;
}

export async function showNumberQuickPick(
  numbers: number[],
  options: NumberQuickPickOptions & { canPickMany: true },
  token?: CancellationToken
): Promise<number[] | undefined>;
export async function showNumberQuickPick(
  min: number,
  max: number,
  step: number,
  options: NumberQuickPickOptions & { canPickMany: true },
  token?: CancellationToken
): Promise<number[] | undefined>;
export async function showNumberQuickPick(
  min: number,
  max: number,
  step: number,
  options?: NumberQuickPickOptions,
  token?: CancellationToken
): Promise<number | undefined>;
export async function showNumberQuickPick(
  minOrNumbers: number | number[],
  maxOrOptions: number | NumberQuickPickOptions,
  stepOrTokens?: number | CancellationToken,
  _options?: NumberQuickPickOptions,
  _token?: CancellationToken
): Promise<number | number[] | undefined> {
  const min = typeof minOrNumbers === "number" ? minOrNumbers : 0;
  const max = typeof maxOrOptions === "number" ? maxOrOptions : 0;
  const step = typeof stepOrTokens === "number" ? stepOrTokens : 1;
  const { alwaysShow = [], ...options } = typeof maxOrOptions === "object" ? maxOrOptions : _options ?? {};
  const token = typeof stepOrTokens === "object" ? stepOrTokens : _token;
  const selected = Array.isArray(options.picked) ? options.picked : [options.picked];

  const numbers = Array.isArray(minOrNumbers)
    ? minOrNumbers
    : Array.from({ length: (max - min) / step + 1 }, (_, i) => min + i * step);

  const items = numbers.map<QuickPickItem>((n) => ({
    label: n.toString(),
    alwaysShow: alwaysShow.includes(n),
    picked: selected.includes(n),
    detail: n < 0 && options.negativeAsInfinite ? "Ifinite" : undefined,
  }));

  return window.showQuickPick(items, options, token).then((value) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value.map((v) => parseInt(v.label)) : parseInt(value.label);
  });
}

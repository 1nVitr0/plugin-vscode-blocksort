import { BlockSortCollatorOptions } from "../types/BlockSortConfiguration";

export class StringSortProvider extends Intl.Collator {
  public readonly customSortOrder?: string;
  public readonly customIgnoreCharacters?: RegExp;
  public readonly ignoreCase?: boolean;
  public readonly direction?: "asc" | "desc" | "rand";

  constructor(options?: BlockSortCollatorOptions, direction: "asc" | "desc" | "rand" = "asc") {
    const locales = options?.locales?.includes(",") ? options?.locales?.split(",") : options?.locales;
    super(locales, options);

    const { customSortOrder, caseFirst } = options || {};
    if (customSortOrder && caseFirst === "upper") {
      // Sort uppercase letters first
      this.customSortOrder = customSortOrder.replace(/./g, (c) => {
        const upper = c.toUpperCase();
        const lower = c.toLowerCase();
        return upper === lower ? c : upper + lower;
      });
    } else if (customSortOrder && caseFirst === "lower") {
      // Sort lowercase letters first
      this.customSortOrder = customSortOrder.replace(/./g, (c) => {
        const upper = c.toUpperCase();
        const lower = c.toLowerCase();
        return upper === lower ? c : lower + upper;
      });
    } else {
      // Use customSortOrder as-is
      this.customSortOrder = customSortOrder;
    }

    this.customIgnoreCharacters = options?.customIgnoreCharacters
      ? new RegExp(
          `[${options.customIgnoreCharacters.replace(/\\/, "\\\\").replace(/]/g, "\\]").replace(/-/g, "\\-")}]`,
          "g"
        )
      : undefined;
    this.ignoreCase = caseFirst === "false" ? true : false;
    this.direction = direction ?? "asc";
  }

  public compare(a: string, b: string): number {
    const { customSortOrder, customIgnoreCharacters, direction, ignoreCase } = this;
    const sign = direction === "asc" ? 1 : -1;

    if (direction === "rand") return 0; // Shouldn't be used

    if (customIgnoreCharacters) {
      a = a.replace(customIgnoreCharacters, "");
      b = b.replace(customIgnoreCharacters, "");
    }

    if (customSortOrder) {
      const minLength = Math.min(a.length, b.length);
      for (let i = 0; i < minLength; i++) {
        const aIndex = customSortOrder.indexOf(ignoreCase ? a[i].toLowerCase() : a[i]);
        const bIndex = customSortOrder.indexOf(ignoreCase ? b[i].toLowerCase() : b[i]);

        if (aIndex === -1 || bIndex === -1) {
          const diff = super.compare(a[i], b[i]);
          if (diff !== 0) return diff * sign;
          else continue;
        }

        if (aIndex !== bIndex) return (aIndex - bIndex) * sign;
        else if (i === minLength - 1) return (a.length - b.length) * sign;
      }
    }

    return super.compare(a, b) * sign;
  }
}

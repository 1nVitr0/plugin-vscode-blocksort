import {
  ConfigurationScope,
  DocumentSelector,
  TextDocument,
  TextEditorOptions,
  workspace,
  WorkspaceConfiguration,
} from "vscode";
import { ExpandSelectionOptions } from "../types/BlockSortOptions";
import { FoldingMarkerDefault, FoldingMarkerList } from "./StringProcessingProvider";

const defaultFoldingMarkers: FoldingMarkerList<FoldingMarkerDefault> = {
  "()": { start: "\\(", end: "\\)" },
  "[]": { start: "\\[", end: "\\]" },
  "{}": { start: "\\{", end: "\\}" },
  "<>": { start: "<", end: "(?<!\\=)>" },
};

const defaultCompleteBlockMarkers = ["\\}", "<\\/[a-zA-Z0-9\\-_=\\s]+"];

const defaultIndentIgnoreMarkers = [
  "{",
  // eslint-disable-next-line quotes
  "end(?:for(?:each)?|if|while|case|def)?\\s*?([\\.\\[\\->\\|\\s]\\s*(?:[$A-Za-z0-9_+\\-\\*\\/\\^\\%\\<\\>\\=\\!\\?\\:]*|'[^']*?'|'[']*?'|\"[^\"]*?\"|`[^`]*?`)\\s*[\\]\\|]?\\s*)*",
  "esac|fi",
];

export interface NaturalSortOptions {
  enabled: boolean;
  padding: number;
  omitUuids: boolean;
  sortNegativeValues: boolean;
}

export interface BlockSortConfiguration {
  defaultMultilevelDepth: number;
  askForMultilevelDepth: boolean;
  indentIgnoreMarkers: string[];
  completeBlockMarkers: string[];
  foldingMarkers: FoldingMarkerList;
  enableNaturalSorting: boolean;
  naturalSorting: NaturalSortOptions;
  sortConsecutiveBlockHeaders: boolean;
  enableCodeLens: DocumentSelector | boolean;
  enableCodeActions: DocumentSelector | boolean;
  enableDocumentFormatting: DocumentSelector | boolean;
  enableRangeFormatting: DocumentSelector | boolean;
  forceBlockHeaderFirstRegex: string;
  forceBlockHeaderLastRegex: string;
  multiBlockHeaderRegex: string;
  incompleteBlockRegex: string;
}

export default class ConfigurationProvider {
  public static readonly invalidatingConfigurationKeys: string[] = [
    "enableNaturalSorting",
    "enableCodeLens",
    "provideFormatting",
  ];

  private static configuration: Map<ConfigurationScope | undefined, WorkspaceConfiguration & BlockSortConfiguration> =
    new Map();
  private static editorConfiguration: Map<ConfigurationScope | undefined, WorkspaceConfiguration & TextEditorOptions> =
    new Map();

  public static getFoldingMarkers(document?: TextDocument): FoldingMarkerList {
    const additional: FoldingMarkerList = ConfigurationProvider.getConfiguration(document).foldingMarkers || {};
    return { ...defaultFoldingMarkers, ...additional };
  }

  public static getCompleteBlockMarkers(document?: TextDocument): string[] {
    const additional: string[] = ConfigurationProvider.getConfiguration(document).completeBlockMarkers || [];
    return [...additional, ...defaultCompleteBlockMarkers];
  }

  public static getSortConsecutiveBlockHeaders(document?: TextDocument): boolean {
    const configuration: boolean | undefined =
      ConfigurationProvider.getConfiguration(document).sortConsecutiveBlockHeaders;
    return configuration === undefined ? true : configuration;
  }

  public static getDefaultMultilevelDepth(): number {
    const configuration: number | undefined = ConfigurationProvider.getConfiguration().defaultMultilevelDepth;
    return configuration === undefined ? -1 : configuration;
  }

  public static getAskForMultilevelDepth(): boolean {
    const configuration: boolean | undefined = ConfigurationProvider.getConfiguration().askForMultilevelDepth;
    return configuration === undefined ? true : configuration;
  }

  public static getForceBlockHeaderFirstRegex(document?: TextDocument): string {
    return ConfigurationProvider.getConfiguration(document).forceBlockHeaderFirstRegex || "$^";
  }

  public static getForceBlockHeaderLastRegex(document?: TextDocument): string {
    return (
      ConfigurationProvider.getConfiguration(document).forceBlockHeaderLastRegex ||
      "^(\\s*(when|case)\\s*('([^']|(?<=\\\\)')*'|\"([^\"]|(?<=\\\\)\")*\"|`([^`]|(?<=\\\\)`)*`|[A-Za-z_+\\-*/%<>d.,s]*)*\\s*(.*:)?\\n?\\r?)*\\s*default|else(?!\\s?if)\\s*:?$"
    );
  }

  public static getMultiBlockHeaderRegex(document?: TextDocument): string {
    return (
      ConfigurationProvider.getConfiguration(document).multiBlockHeaderRegex ||
      "^(when|case|default|else)\\s*('([^']|(?<=\\\\)')*'|\"([^\"]|(?<=\\\\)\")*\"|`([^`]|(?<=\\\\)`)*`|[A-Za-z_+\\-*/%<>d.,s]*)*\\s*(.*:)?$"
    );
  }

  public static getIncompleteBlockRegex(document?: TextDocument): string {
    return (
      ConfigurationProvider.getConfiguration(document).incompleteBlockRegex ||
      "(if|when|else|case|for|foreach|else|elsif|while|def|then|default)\\s*('([^']|(?<=\\\\)')*'|\"([^\"]|(?<=\\\\)\")*\"|`([^`]|(?<=\\\\)`)*`|[A-Za-z_+\\-*/%<>d.,s]*)*\\s*(.*:)?$"
    );
  }

  public static getIndentIgnoreMarkers(document?: TextDocument): string[] {
    const additional: string[] = ConfigurationProvider.getConfiguration(document).indentIgnoreMarkers || [];
    return [...additional, ...defaultIndentIgnoreMarkers];
  }

  public static getNaturalSortOptions(): NaturalSortOptions {
    const configuration: Partial<NaturalSortOptions> = ConfigurationProvider.getConfiguration().naturalSorting || {};
    return {
      enabled: false,
      padding: 9,
      omitUuids: false,
      sortNegativeValues: true,
      ...configuration,
    };
  }

  public static getKeepAppendedNewlines(): boolean {
    return ConfigurationProvider.getConfiguration().keepAppendedNewlines;
  }

  public static getExpandSelection(): boolean | ExpandSelectionOptions {
    return ConfigurationProvider.getConfiguration().expandSelection;
  }

  public static getExpandCursor(): boolean | ExpandSelectionOptions {
    return ConfigurationProvider.getConfiguration().expandCursor;
  }

  public static getEnableNaturalSorting(): boolean {
    return ConfigurationProvider.getConfiguration().enableNaturalSorting;
  }

  public static getEnableCodeLens(): DocumentSelector | boolean {
    const codeLens = ConfigurationProvider.getConfiguration().enableCodeLens;
    if (codeLens === true) {
      return ConfigurationProvider.getConfiguration().enableCodeActions || codeLens;
    }

    return codeLens;
  }

  public static getEnableCodeActions(): DocumentSelector | boolean {
    return ConfigurationProvider.getConfiguration().enableCodeActions;
  }

  public static getenableDocumentFormatting(): DocumentSelector | boolean {
    return ConfigurationProvider.getConfiguration().enableDocumentFormatting;
  }

  public static getenableRangeFormatting(): DocumentSelector | boolean {
    const formatting = ConfigurationProvider.getConfiguration().enableRangeFormatting;
    if (formatting === true) {
      return ConfigurationProvider.getConfiguration().enableRangeFormatting || formatting;
    }

    return formatting;
  }

  public static getTabSize(document?: TextDocument): number {
    const tabSize = ConfigurationProvider.getEditorConfiguration(document).tabSize;
    return typeof tabSize === "string" ? 4 : tabSize ?? 4;
  }

  public static onConfigurationChanged(): void {
    ConfigurationProvider.configuration.clear();
  }

  private static getConfiguration(scope?: ConfigurationScope): BlockSortConfiguration & WorkspaceConfiguration {
    if (ConfigurationProvider.configuration.has(scope)) {
      return ConfigurationProvider.configuration.get(scope) as BlockSortConfiguration & WorkspaceConfiguration;
    } else {
      const configuration = workspace.getConfiguration("blocksort", scope) as BlockSortConfiguration &
        WorkspaceConfiguration;
      ConfigurationProvider.configuration.set(scope, configuration);

      return configuration;
    }
  }

  private static getEditorConfiguration(scope?: ConfigurationScope): TextEditorOptions & WorkspaceConfiguration {
    if (ConfigurationProvider.editorConfiguration.has(scope)) {
      return ConfigurationProvider.editorConfiguration.get(scope) as TextEditorOptions & WorkspaceConfiguration;
    } else {
      const editorConfiguration = workspace.getConfiguration("editor", scope) as TextEditorOptions &
        WorkspaceConfiguration;
      ConfigurationProvider.editorConfiguration.set(scope, editorConfiguration);

      return editorConfiguration;
    }
  }
}

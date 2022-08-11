import { ConfigurationScope, TextDocument, workspace, WorkspaceConfiguration } from "vscode";
import { FoldingMarkerDefault, FoldingMarkerList } from "./StringProcessingProvider";

const defaultFoldingMarkers: FoldingMarkerList<FoldingMarkerDefault> = {
  "()": { start: "\\(", end: "\\)" },
  "[]": { start: "\\[", end: "\\]" },
  "{}": { start: "\\{", end: "\\}" },
  "<>": { start: "<", end: ">" },
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
  enableCodeLens: boolean;
}

export default class ConfigurationProvider {
  public static readonly invalidatingConfigurationKeys: string[] = ["enableNaturalSorting", "enableCodeLens"];

  private static configuration: Map<ConfigurationScope | undefined, WorkspaceConfiguration & BlockSortConfiguration> =
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

  public static getForceBlockHeaderFirstRegex(): string {
    return "$^";
  }

  public static getForceBlockHeaderLastRegex(): string {
    return "^(\\s*(when|case)\\s*('([^']|(?<=\\\\)')*'|\"([^\"]|(?<=\\\\)\")*\"|`([^`]|(?<=\\\\)`)*`|[A-Za-z_+\\-*/%<>d.,s]*)*\\s*(.*:)?\\n?\\r?)*\\s*default|else(?!\\s?if)\\s*:?$";
  }

  public static getMultiBlockHeaderRegex(): string {
    return "^(when|case|default|else)\\s*('([^']|(?<=\\\\)')*'|\"([^\"]|(?<=\\\\)\")*\"|`([^`]|(?<=\\\\)`)*`|[A-Za-z_+\\-*/%<>d.,s]*)*\\s*(.*:)?$";
  }

  public static getIncompleteBlockRegex(): string {
    return "(if|when|else|case|for|foreach|else|elsif|while|def|then|default)\\s*('([^']|(?<=\\\\)')*'|\"([^\"]|(?<=\\\\)\")*\"|`([^`]|(?<=\\\\)`)*`|[A-Za-z_+\\-*/%<>d.,s]*)*\\s*(.*:)?$";
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

  public static getEnableNaturalSorting(): boolean {
    return ConfigurationProvider.getConfiguration().enableNaturalSorting;
  }

  public static getEnableCodeLens(): boolean {
    return ConfigurationProvider.getConfiguration().enableCodeLens;
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
}

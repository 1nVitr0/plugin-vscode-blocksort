import { workspace } from 'vscode';
import { FoldingMarkerDefault, FoldingMarkerList } from './StringProcessingProvider';

const defaultFoldingMarkers: FoldingMarkerList<FoldingMarkerDefault> = {
  '()': { start: '\\(', end: '\\)' },
  '[]': { start: '\\[', end: '\\]' },
  '{}': { start: '\\{', end: '\\}' },
  '<>': { start: '<[a-zA-Z0-9\\-_=\\s]+', end: '<\\/[a-zA-Z0-9\\-_=\\s]+' },
};

const defaultCompleteBlockMarkers = ['\\}', '<\\/[a-zA-Z0-9\\-_=\\s]+'];

const defaultIndentIgnoreMarkers = [
  '{',
  // eslint-disable-next-line quotes
  "end(?:for(?:each)?|if|while|case|def)?\\s*?([\\.\\[\\->\\|\\s]\\s*(?:[$A-Za-z0-9_+\\-\\*\\/\\^\\%\\<\\>\\=\\!\\?\\:]*|'[^']*?'|'[']*?'|\"[^\"]*?\"|`[^`]*?`)\\s*[\\]\\|]?\\s*)*",
  'esac|fi',
];

export default class ConfigurationProvider {
  public static getFoldingMarkers(): FoldingMarkerList {
    const additional: FoldingMarkerList = workspace.getConfiguration('blocksort').get('foldingMarkers') || {};
    return { ...additional, ...defaultFoldingMarkers };
  }

  public static getCompleteBlockMarkers(): string[] {
    const additional: string[] = workspace.getConfiguration('blocksort').get('completeBlockMarkers') || [];
    return [...additional, ...defaultCompleteBlockMarkers];
  }

  public static getSortConsecutiveBlockHeaders(): boolean {
    const configuration: boolean | undefined = workspace
      .getConfiguration('blocksort')
      .get('sortConsecutiveBlockHeaders');
    return configuration === undefined ? true : configuration;
  }

  public static getForceBlockHeaderFirstRegex(): string {
    return '$^';
  }

  public static getForceBlockHeaderLastRegex(): string {
    return '(default|else)\\s*(\'([^\']|(?<=\\\\)\')*\'|"([^"]|(?<=\\\\)")*"|`([^`]|(?<=\\\\)`)*`|[A-Za-z_+\\-*/%<>d.,s]*)*\\s*(.*:)?(\r?\n|$)';
  }

  public static getMultiBlockHeaderRegex(): string {
    return '(when|case|else|default)\\s*(\'([^\']|(?<=\\\\)\')*\'|"([^"]|(?<=\\\\)")*"|`([^`]|(?<=\\\\)`)*`|[A-Za-z_+\\-*/%<>d.,s]*)*\\s*(.*:)?$';
  }

  public static getIncompleteBlockRegex(): string {
    return '(if|when|else|case|for|foreach|else|elsif|while|def|then)\\s*(\'([^\']|(?<=\\\\)\')*\'|"([^"]|(?<=\\\\)")*"|`([^`]|(?<=\\\\)`)*`|[A-Za-z_+\\-*/%<>d.,s]*)*\\s*(.*:)?$';
  }

  public static getIndentIgnoreMarkers(): string[] {
    const additional: string[] = workspace.getConfiguration('blocksort').get('indentIgnoreMarkers') || [];
    return [...additional, ...defaultIndentIgnoreMarkers];
  }
}

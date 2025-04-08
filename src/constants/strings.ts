/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quotes */
import { TextBlockDefinition } from "../providers/StringProcessingProvider";

export const stringMarkers: Record<string, TextBlockDefinition[]> = {
  default: [
    { start: '"', end: '"' },
    { start: "'", end: "'" },
    { start: "`", end: "`" },
  ],
  // abap: [],
  // bat: [],
  // bibtex: [],
  // clojure: [],
  coffeescript: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  c: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  cpp: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  csharp: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  css: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  // dockerfile: [],
  // fsharp: [],
  // 'git-commit': [],
  // 'git-rebase': [],
  // go: [],
  // groovy: [],
  // handlebars: [],
  // haml: [],
  html: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
  ],
  // ini: [],
  java: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  javascript: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  javascriptreact: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  jsx: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
  ],
  json: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  jsonc: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  // latex: [],
  less: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  // lua: [],
  // makefile: [],
  // markdown: [],
  "objective-c": [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  "objective-cpp": [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  // perl: [],
  // perl6: [],
  php: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  // plaintext: [],
  // powershell: [],
  // jade: [],
  // pug: [],
  python: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  // r: [],
  // razor: [],
  ruby: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  // rust: [],
  scss: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  sass: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  // shaderlab: [],
  // shellscript: [],
  // slim: [],
  sql: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
  ],
  stylus: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  // swift: [],
  typescript: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  typescriptreact: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  // tex: [],
  // vb: [],
  vue: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
    { start: "`", end: "`" },
  ],
  "vue-html": [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
  ],
  xml: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
  ],
  // xsl: [],
  yaml: [
    { start: '"', end: '"' },
    { start: "'", end: '"' },
  ],
};

import type { Highlighter, ILanguageRegistration, IThemeRegistration, IThemedToken, HtmlRendererOptions } from 'shiki'
import type MarkdownIt from 'markdown-it'
import { createRequire } from 'node:module'
import { createSyncFn } from 'synckit'

export interface Options {
  theme?: IThemeRegistration
  langs?: ILanguageRegistration[]
  timeout?: number
  highlighter?: Highlighter
  highlightLines?: boolean
}

interface AttrsLineOptions {
  lineNumbers: boolean
  isDiff?: boolean
  isFocus?: boolean
}

export const RE_HIGHLIGHT: RegExp = /(?<=\/\*|#|\/\/|<%#)\s*shada:highlight\b/;
export const RE_DIFF_ADD: RegExp = /(?<=\/\*|#|\/\/|<%#)\s*shada:add\b/;
export const RE_DIFF_REMOVE: RegExp = /(?<=\/\*|#|\/\/|<%#)\s*shada:remove\b/;
export const RE_FOCUS: RegExp = /(?<=\/\*|#|\/\/|<%#)\s*shada:focus\b/;

function attrsLineOptions(attrs: string): AttrsLineOptions {
  let lineNumbers = false

  attrs.replace(/[{}]/g, '')
    .split(",")
    .forEach(v => {
      const [key, value] = v.split(":")
      if (key === "lineNumbers" && (value === "true" || value === "1"))
        lineNumbers = true
    });

  return { lineNumbers }
}

function buidLineOptions(tokens: IThemedToken[][]) {
  const lineOptions: HtmlRendererOptions["lineOptions"] = []
  let isDiff = false
  let isFocus = false

  for (let lineIndex = 0; lineIndex < tokens.length; lineIndex++) {
    const line = tokens[lineIndex]
    for (let tokenIndex = 0; tokenIndex < line.length; tokenIndex++) {
      const token = line[tokenIndex]
      if (RE_HIGHLIGHT.exec(token.content)) {
        // add line options to highlight
        lineOptions.push({
          line: lineIndex + 1,
          classes: ["line-highlight"]
        })
      }

      if (RE_DIFF_ADD.exec(token.content)) {
        // add line options to diff add
        lineOptions.push({
          line: lineIndex + 1,
          classes: ["line-add"]
        })
        isDiff = true
      }

      if (RE_DIFF_REMOVE.exec(token.content)) {
        // add line options to diff remove
        lineOptions.push({
          line: lineIndex + 1,
          classes: ["line-remove"]
        })
        isDiff = true
      }

      if (RE_FOCUS.exec(token.content)) {
        // add line options to focus
        lineOptions.push({
          line: lineIndex + 1,
          classes: ["line-focus"]
        })
        isFocus = true
      }
    }
  }

  return { lineOptions, isDiff, isFocus }
}

const ShadaIt: MarkdownIt.PluginWithOptions<Options> = (markdownit, options = {}) => {
  const _highlighter = options.highlighter
  const themes: (string | undefined)[] = []
  if (!options.theme) {
    themes.push('nord')
  } else if (typeof options.theme === 'string') {
    themes.push(options.theme)
  }

  let syncRun: any
  if (!_highlighter) {
    const require = createRequire(import.meta.url)
    syncRun = createSyncFn(require.resolve('./worker'))
    syncRun('getHighlighter', { themes })
  }

  const tokenizeCode = (code: string, lang: string): IThemedToken[][] => {
    if (_highlighter)
      return _highlighter.codeToThemedTokens(code, lang)

    return syncRun("codeToThemedTokens", {
      code,
      lang,
    })
  }

  const renderToHtml = (tokens: IThemedToken[][], theme: HtmlRendererOptions["themeName"], lineOptions: HtmlRendererOptions["lineOptions"], attrsOptions: AttrsLineOptions) => {
    return syncRun('renderToHtml', {
      tokens,
      theme,
      lineOptions,
      attrsOptions
    })
  }

  markdownit.options.highlight = (code, lang = 'text', attrs) => {
    const tokens = tokenizeCode(code, lang)
    const { lineOptions, isDiff, isFocus } = buidLineOptions(tokens);
    const attrsOptions: AttrsLineOptions = { ...attrsLineOptions(attrs), isDiff, isFocus };

    return renderToHtml(tokens, themes.at(0), lineOptions, attrsOptions);
  }
}

export default ShadaIt

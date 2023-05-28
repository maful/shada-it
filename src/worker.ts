import type { Highlighter } from 'shiki'
import { getHighlighter, renderToHtml } from 'shiki'
import { runAsWorker } from 'synckit'
import { RE_DIFF_ADD, RE_DIFF_REMOVE, RE_HIGHLIGHT, RE_FOCUS } from "./index"

let h: Highlighter

async function handler(command: 'getHighlighter' | 'renderToHtml' | 'codeToThemedTokens', options: any) {
  if (command === 'getHighlighter') {
    h = await getHighlighter(options)
  } else if (command === 'renderToHtml') {
    const { tokens, theme, lineOptions, attrsOptions } = options
    return renderToHtml(tokens, {
      fg: h.getForegroundColor(theme),
      bg: h.getBackgroundColor(theme),
      lineOptions,
      elements: {
        code({ children }) {
          const classNames = []
          if (attrsOptions.isFocus) {
            classNames.push("has-focus-lines")
          }
          const classStr = classNames.join(" ")
          return `<code class="${classStr}">${children}</code>`
        },
        line({ className, children, index }) {
          let codeLine = ""
          let lineNumber = index + 1;
          const lineNumberStr = lineNumber > 9 ? lineNumber : ` ${lineNumber}`
          const lineNumberElm = `<span style="color:#ffffff; -webkit-user-select: none; user-select: none;" class="line-number">${lineNumberStr}</span>`;

          if (attrsOptions.lineNumbers) {
            codeLine = lineNumberElm
          }

          if (attrsOptions.isDiff) {
            if (className.includes("line-add")) {
              codeLine = `<span style="color:#f07178; text-align: right; -webkit-user-select: none; user-select: none;" class="line-number"> +</span>`;
            } else if (className.includes("line-remove")) {
              codeLine = `<span style="color:#f07178; text-align: right; -webkit-user-select: none; user-select: none;" class="line-number"> -</span>`;
            } else {
              if (attrsOptions.lineNumbers) {
                codeLine = lineNumberElm
              } else {
                codeLine = `<span style="color:#f07178; text-align: right; -webkit-user-select: none; user-select: none;" class="line-number"> </span>`;
              }
            }
          }

          codeLine += children
          return `<div class="${className}">${codeLine}</div>`;
        },
        token({ style, children }) {
          if (RE_DIFF_ADD.exec(children) || RE_DIFF_REMOVE.exec(children) || RE_HIGHLIGHT.exec(children) || RE_FOCUS.exec(children)) {
            return ``;
          }
          return `<span style="${style}">${children}</span>`
        }
      }
    })
  } else if (command === 'codeToThemedTokens') {
    const { code, lang } = options
    const tokens = h.codeToThemedTokens(code, lang);
    // remove last token if empty
    const lastTokenIsEmpty = tokens[tokens.length - 1].length == 0
    if (lastTokenIsEmpty) {
      tokens.splice(-1)
    }

    return tokens.map((line) => {
      // add empty content if line is empty
      if (line.length == 0) return [{ content: " " }]

      return line
    })
  }
}

runAsWorker(handler)
